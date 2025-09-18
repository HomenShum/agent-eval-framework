/** @jest-environment node */

// Eval for RAG pipeline smoke: reads latest rag.smoke.<ts>.log.md and runs LLM judge

process.env.SKIP_DATABASE_URL = "true";
process.env.VERCEL_ENV = process.env.VERCEL_ENV || "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = process.env.NEXT_PUBLIC_HARDCODED_USER_ID || "test-user";

import fs from "fs";
import path from "path";

const HAS_OPENAI = !!process.env.OPENAI_API_KEY;
const evalIt = (name: string, fn: jest.ProvidesCallback, timeout?: number) =>
  (HAS_OPENAI ? it : it.skip)(name, fn, timeout);

const LOG_DIR = path.join(__dirname, "test_logs", "rag");

function hasScenario(content: string, key: string): boolean {
  return content.includes(`[rag] scenario ${key} REQUEST`);
}

function findLatest(): string | null {
  try {
    const files = fs.readdirSync(LOG_DIR).filter((f) => f.startsWith("rag.smoke.") && f.endsWith(".log.md"));
    if (!files.length) return null;
    files.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
    return path.join(LOG_DIR, files[0]);
  } catch {
    return null;
  }
}

function extractBlock(content: string, key: string, label: string): string {
  const lines = content.split("\n");
  const start = lines.findIndex((L) => L.includes(`[rag] scenario ${key} ${label}`));
  if (start === -1) return "";
  const out: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const L = lines[i];
    if (L.startsWith("[rag] scenario ")) break;
    out.push(L);
  }
  return out.join("\n");
}

function loadGold(): Record<string, string[]> {
  try {
    const seedPath = path.join(__dirname, "fixtures", "batch_ops.seed.json");
    if (!fs.existsSync(seedPath)) return {};
    const spec = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    const ts = spec?.testScenarios || {};
    const out: Record<string, string[]> = {};
    for (const k of ["combined", "user_only", "global_only", "cross_graph_search", "knowledge_synthesis"]) {
      const node = ts[k] || ts[`rag_${k}`];
      const rel = node?.relevantIds || node?.goldRelevant || node?.gold_ids;
      if (Array.isArray(rel)) out[k] = rel.map(String);
    }
    return out;
  } catch {
    return {};
  }
}

async function judge(params: {
  scenario: string;
  prompt: string;
  docs: any[];

  answer: string;
  expectations: "user" | "global" | "mixed" | "none";
}) {
  const OpenAI = (await import("openai")).default as any;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const schema = {
    name: "RagJudge",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        scenario: { type: "string" },
        rating: { type: "string", enum: ["low", "medium", "high", "professional"] },
        citesDocIds: { type: "boolean" },
        retrievalQuality: { type: "string", enum: ["poor", "okay", "good", "excellent"] },
        scopeMatch: { type: "string", enum: ["user", "global", "mixed", "unknown"] },
        feedback: { type: "string" },
      },
      required: ["scenario", "rating", "citesDocIds", "retrievalQuality", "scopeMatch", "feedback"],
    },
    strict: true,
  } as const;
  const resp = await client.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 200,
    response_format: { type: "json_schema", json_schema: schema },
    messages: [
      { role: "system", content: "Judge the RAG result based on docs and answer. Be deterministic." },
      {
        role: "user",
        content: JSON.stringify(
          {
            scenario: params.scenario,
            expectations: params.expectations,
            prompt: params.prompt,
            topDocs: params.docs,
            answer: params.answer,
          },
          null,
          2,
        ),
      },
    ],
  });
  const content = resp.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

function append(file: string, lines: string[]) {
  try {
    fs.appendFileSync(file, lines.join("\n") + "\n", "utf8");
  } catch {}
}

evalIt(
  "RAG eval over latest log",
  async () => {
    const file = findLatest();
    expect(file).toBeTruthy();
    if (!file) return;
    const content = fs.readFileSync(file, "utf8");
    const gold = loadGold();

    // Write RAG eval outputs to dedicated folder separate from source logs
    const EVAL_DIR = path.join(__dirname, "test_logs", "eval", "rag");
    try {
      fs.mkdirSync(EVAL_DIR, { recursive: true });
    } catch {}
    const EVAL_PATH = path.join(EVAL_DIR, path.basename(file).replace(".log.md", ".eval.md"));
    append(EVAL_PATH, [
      "# RAG Smoke Evaluation Output",
      `SourceLog: ${path.basename(file)}`,
      `EvaluatedAt: ${new Date().toISOString()}`,
      "",
    ]);

    const all = [
      { key: "combined", expectations: "mixed" as const },
      { key: "user_only", expectations: "user" as const },
      { key: "global_only", expectations: "global" as const },

      { key: "cross_graph_search", expectations: "mixed" as const },
      { key: "knowledge_synthesis", expectations: "mixed" as const },
      { key: "personalized_recommendations", expectations: "mixed" as const },
    ];
    const scenarios = all.filter((s) => hasScenario(content, s.key));

    const perScenario: any[] = [];
    for (const s of scenarios) {
      const t0 = Date.now();
      const reqStr = extractBlock(content, s.key, "REQUEST");
      const docsStr = extractBlock(content, s.key, "DOCS");
      const ansStr = extractBlock(content, s.key, "ANSWER");
      const usageStr = extractBlock(content, s.key, "USAGE");
      const structuredStr = extractBlock(content, s.key, "STRUCTURED");
      let prompt = "";
      try {
        const obj = JSON.parse(reqStr.replace(/^\{/m, "{").replace(/\}$/m, "}"));
        prompt = obj?.prompt || "";
      } catch {}
      let docs: any[] = [];
      try {
        docs = JSON.parse(docsStr);
      } catch {}
      let usage: any = null;
      try {
        usage = JSON.parse(usageStr || "null");
      } catch {}
      let structured: any = null;
      try {
        structured = structuredStr ? JSON.parse(structuredStr) : null;
      } catch {}

      // Compute retrieval diagnostics
      const cited = Array.from(ansStr.matchAll(/\[id=([^\]]+)\]/g)).map((m) => String(m[1]));
      const citedBase = Array.from(new Set(cited.map((id) => id.split("#c")[0])));
      const top3 = docs.slice(0, 3).map((d) => String(d.id).split("#c")[0]);
      const top3Base = new Set(top3);
      // Map baseId -> authorId for doc set
      const authorByBaseId = new Map<string, string>();
      docs.forEach((d) => authorByBaseId.set(String(d.id).split("#c")[0], String(d.authorId || "")));
      const intersection = citedBase.filter((id) => top3Base.has(id)).length;
      const hit3 = citedBase.length ? intersection / Math.min(3, citedBase.length) : 0;
      const localHit = citedBase.some((id) => (authorByBaseId.get(id) || "") !== "global-admin-user-id");
      const citationCount = citedBase.length;
      const requiredCites = s.expectations === "mixed" ? 2 : 1;
      const precision = citationCount ? intersection / citationCount : 0;
      const recall = top3.length ? intersection / top3.length : 0;
      const ranks = new Map<string, number>();
      top3.forEach((id, idx) => ranks.set(id, idx + 1));
      const rrVals = citedBase.map((id) => (ranks.has(id) ? 1 / (ranks.get(id) as number) : 0));
      const mrr = rrVals.length ? rrVals.reduce((a, b) => a + b, 0) / rrVals.length : 0;

      // Gold metrics (true precision/recall/MRR) when provided in fixture
      const goldSet = new Set<string>((gold[s.key] || []).map(String));
      const goldHits = citedBase.filter((id) => goldSet.has(id)).length;
      const goldPrecision = citationCount ? goldHits / citationCount : 0;
      const goldRecall = goldSet.size ? goldHits / goldSet.size : 0;
      const ranksFull = new Map<string, number>();
      docs.forEach((d, idx) => ranksFull.set(String(d.id).split("#c")[0], idx + 1));
      let goldFirstRank = Infinity as number;
      for (const id of goldSet) {
        const r = ranksFull.get(id);
        if (r && r < goldFirstRank) goldFirstRank = r;
      }
      const goldMRR = Number.isFinite(goldFirstRank) ? 1 / (goldFirstRank as number) : 0;

      // Claims-backed enforcement when structured present
      let claimsBacked100 = true;
      if (structured && structured.bullets && structured.claims_to_citations) {
        const claimIds = new Set<string>((structured.bullets || []).map((b: any) => String(b.id)));
        const mapping = new Map<string, string[]>();
        for (const m of structured.claims_to_citations || [])
          mapping.set(String(m.id), Array.isArray(m.cites) ? m.cites : []);
        for (const id of claimIds)
          if (!mapping.has(id) || (mapping.get(id) || []).length === 0) {
            claimsBacked100 = false;
            break;
          }
      }

      const judgeResult = await judge({ scenario: s.key, prompt, docs, answer: ansStr, expectations: s.expectations });
      const durationMs = Date.now() - t0;
      const pass =
        hit3 >= 0.6 && citationCount >= requiredCites && (s.expectations !== "user" || localHit) && claimsBacked100;

      const metrics = {
        hit3,
        precision,
        recall,
        mrr,
        goldPrecision,
        goldRecall,
        goldMRR,
        citationCount,
        localHit,
        claimsBacked100,
        durationMs,
        tokens: usage?.total_tokens ?? null,
      };
      const record = { scenario: s.key, expectations: s.expectations, pass, metrics, judge: judgeResult };
      perScenario.push(record);

      append(EVAL_PATH, ["\n## RAG Eval — " + s.key, JSON.stringify(record, null, 2)]);
    }

    // Aggregate + thresholds
    const overallPassRate = perScenario.filter((r) => r.pass).length / perScenario.length;
    const layerPassRate = overallPassRate; // single layer here (RAG)
    const p95 = (() => {
      const arr = perScenario.map((r) => r.metrics.durationMs).sort((a, b) => a - b);
      const idx = Math.floor(0.95 * (arr.length - 1));
      return arr[idx] || 0;
    })();
    const summary = {
      summaryAt: new Date().toISOString(),
      overallPassRate,
      ragPassRate: layerPassRate,
      p95LatencyMs: p95,
      thresholds: {
        overallPassRate: ">=0.80",
        ragLayerPassRate: ">=0.70",
        hitAt3: ">=0.60",
        p95LatencyMs: "<=60000 (eval)",
      },
    };
    append(EVAL_PATH, ["\n## RAG Eval — Summary", JSON.stringify(summary, null, 2)]);

    // CI gating if enabled
    const ENFORCE = process.env.JUDGE_ENFORCE === "1";
    const MIN_OVERALL = Number(process.env.JUDGE_MIN_PASS_RATE || 0.8);
    if (ENFORCE) {
      expect(overallPassRate).toBeGreaterThanOrEqual(MIN_OVERALL);
      expect(layerPassRate).toBeGreaterThanOrEqual(0.7);
      // Optional token budgets via env; if not set, skip
      const PB = Number(process.env.RAG_PROMPT_BUDGET || 0);
      const CB = Number(process.env.RAG_COMPLETION_BUDGET || 0);
      if (PB > 0) expect(perScenario.every((r) => (r.metrics.tokens?.prompt_tokens ?? PB) <= PB)).toBe(true);
      if (CB > 0) expect(perScenario.every((r) => (r.metrics.tokens?.completion_tokens ?? CB) <= CB)).toBe(true);
      expect(p95).toBeLessThanOrEqual(60000);
    }
  },
  90000,
);

if (!HAS_OPENAI) {
  // eslint-disable-next-line no-console
  console.warn("[live.rag.smoke.eval.test] Skipping; set OPENAI_API_KEY to enable.");
}
