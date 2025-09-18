/** @jest-environment node */

// Eval for Agent SSE live smoke: reads latest agent.smoke.<ts>.log.md and runs LLM judge

process.env.SKIP_DATABASE_URL = "true";
process.env.VERCEL_ENV = process.env.VERCEL_ENV || "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = process.env.NEXT_PUBLIC_HARDCODED_USER_ID || "test-user";

import fs from "fs";
import path from "path";

import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const HAS_OPENAI = !!process.env.OPENAI_API_KEY;
const evalIt = (name: string, fn: jest.ProvidesCallback, timeout?: number) =>
  (HAS_OPENAI ? it : it.skip)(name, fn, timeout);

const LOG_DIR = path.join(__dirname, "test_logs", "agent");

function findLatest(): string | null {
  try {
    const files = fs.readdirSync(LOG_DIR).filter((f) => f.startsWith("agent.smoke.") && f.endsWith(".log.md"));
    if (!files.length) return null;
    files.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
    return path.join(LOG_DIR, files[0]);
  } catch {
    return null;
  }
}

function extractSection(content: string, key: string, label: string): string {
  const lines = content.split("\n");
  const start = lines.findIndex((L) => L.includes(`[agent] scenario ${key} ${label}`));
  if (start === -1) return "";
  const out: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const L = lines[i];
    if (L.startsWith("[agent] scenario ")) break;
    out.push(L);
  }
  return out.join("\n");
}

async function judge(params: { scenario: string; sse: string; req: any }) {
  const fallback = () => {
    const { scenario, sse } = params;
    const hasFinal = /"final_summary"/.test(sse);
    const hasToolCall = /"tool_call"/.test(sse);
    return {
      scenario,
      rating: hasFinal && hasToolCall ? "professional" : "low",
      toolUse: hasToolCall ? "good" : "poor",
      toolSelectionAccuracy: hasToolCall ? "good" : "poor",
      argumentQuality: hasFinal ? "good" : "poor",
      taskCompletion: hasFinal ? "complete" : "incomplete",
      responseCoherence: hasFinal ? "good" : "poor",
      errorHandling: /"success":false/.test(sse) ? "okay" : "good",
      followedInstructions: hasFinal && hasToolCall,
      summaryQuality: hasFinal ? "good" : "poor",
      feedback: hasFinal
        ? "Heuristic judge: agent produced a final summary and tool calls."
        : "Heuristic judge: missing final summary or tool usage.",
    };
  };
  if (!process.env.OPENAI_API_KEY) {
    return fallback();
  }
  const OpenAI = (await import("openai")).default as any;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const JudgeSchema = z.object({
    scenario: z.string(),
    rating: z.enum(["low", "medium", "high", "professional"]),
    toolUse: z.enum(["poor", "okay", "good", "excellent"]),
    toolSelectionAccuracy: z.enum(["poor", "okay", "good", "excellent"]),
    argumentQuality: z.enum(["poor", "okay", "good", "excellent"]),
    taskCompletion: z.enum(["incomplete", "partial", "complete"]),
    responseCoherence: z.enum(["poor", "okay", "good", "excellent"]),
    errorHandling: z.enum(["poor", "okay", "good", "excellent"]),
    followedInstructions: z.boolean(),
    summaryQuality: z.enum(["poor", "okay", "good", "excellent"]),
    feedback: z.string(),
  });
  const resp = await client.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 200,
    response_format: zodResponseFormat(JudgeSchema, "AgentJudge"),
    messages: [
      { role: "system", content: "Evaluate the agent run from SSE text. Be deterministic." },
      {
        role: "user",
        content: JSON.stringify({ scenario: params.scenario, request: params.req, sse: params.sse }, null, 2),
      },
    ],
  });
  const message = resp.choices?.[0]?.message as any;
  const parsedField = message?.parsed;
  if (parsedField) {
    if (typeof parsedField === "object") {
      return parsedField as z.infer<typeof JudgeSchema>;
    }
    if (typeof parsedField === "string") {
      try {
        return JSON.parse(parsedField) as z.infer<typeof JudgeSchema>;
      } catch {}
    }
  }
  const rawContent = message?.content;
  let content = "";
  if (typeof rawContent === "string") {
    content = rawContent;
  } else if (Array.isArray(rawContent)) {
    content = rawContent
      .map((part: any) => {
        if (!part) return "";
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        return "";
      })
      .join("");
  }
  if (!content) return fallback();
  try {
    return JSON.parse(content);
  } catch (e) {
    return fallback();
  }
}

function append(file: string, lines: string[]) {
  try {
    fs.appendFileSync(file, lines.join("\n") + "\n", "utf8");
  } catch {}
}

evalIt(
  "Agent eval over latest log",
  async () => {
    const file = findLatest();
    if (!file) {
      // eslint-disable-next-line no-console
      console.warn("[agent-eval] No latest log file found; skipping evaluation test.");
      return;
    }
    if (!file) return;
    const content = fs.readFileSync(file, "utf8");

    // Write eval outputs to a dedicated folder separate from source logs
    const EVAL_DIR = path.join(__dirname, "test_logs", "eval", "agent");
    try {
      fs.mkdirSync(EVAL_DIR, { recursive: true });
    } catch {}
    const EVAL_PATH = path.join(EVAL_DIR, path.basename(file).replace(".log.md", ".eval.md"));
    append(EVAL_PATH, [
      "# Agent Smoke Evaluation Output",
      `SourceLog: ${path.basename(file)}`,
      `EvaluatedAt: ${new Date().toISOString()}`,
      "",
    ]);

    const scenarios = ["organize_meetings", "batch_doc_ops"] as const;

    for (const s of scenarios) {
      const reqStr = extractSection(content, s, "REQUEST");
      const sse = extractSection(content, s, "SSE_RAW");
      let req: any = {};
      try {
        req = JSON.parse(reqStr);
      } catch {}
      const result = await judge({ scenario: s, sse, req });
      append(EVAL_PATH, ["\n## Agent Eval  " + s, JSON.stringify(result, null, 2)]);
      append(EVAL_PATH, ["\n## Agent Eval — " + s, JSON.stringify(result, null, 2)]);
    }

    // Metrics + CI gating summary
    {
      const perScenario: any[] = [];
      const scenarios2 = ["organize_meetings", "batch_doc_ops"] as const;
      for (const s of scenarios2) {
        const t0 = Date.now();
        const sse2 = extractSection(content, s, "SSE_RAW");
        const hasFinal = sse2.includes('"final_summary"');
        const finalCount = (sse2.match(/"final_summary"/g) || []).length;
        const hasToolCall = sse2.includes('"tool_call"');
        const hasSelfEval = sse2.includes('"self_eval"');
        const hasDraftPhase = sse2.includes('"phase":"draft"');
        const hasSelfEvalPhase = sse2.includes('"phase":"self_eval"');
        const hasRevisePhase = sse2.includes('"phase":"revise"');
        const citationCount2 = (sse2.match(/\[id=[^\]]+\]/g) || []).length;
        const REQUIRE_AGENT_CITES = process.env.AGENT_REQUIRE_CITATIONS === "1";
        // Order check for draft -> self_eval -> revise
        let phasesOk = true;
        try {
          const iDraft = sse2.indexOf('"phase":"draft"');
          const iEval = sse2.indexOf('"phase":"self_eval"');
          const iRev = sse2.indexOf('"phase":"revise"');
          if (iDraft === -1 || iEval === -1 || iRev === -1 || !(iDraft < iEval && iEval < iRev)) phasesOk = false;
        } catch {}
        // Approximate improvement check: improved length >= draft length; if citations present, ensure not worse
        let improvementOk = true;
        if (hasSelfEval) {
          try {
            const mImp = sse2.match(/"self_eval"[\s\S]*?"improved":"([\s\S]*?)"\}/);
            const improvedRaw = mImp ? mImp[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : "";
            const mDraft = sse2.match(/"tool_call"[\s\S]*?"name":"finish_work"[\s\S]*?"args":"([\s\S]*?)"\}/);
            let draftRaw = "";
            if (mDraft) {
              const decoded = JSON.parse(mDraft[1].replace(/\\"/g, '"'));
              draftRaw = String(decoded?.summary_of_work_done || "");
            }
            const impCites = (improvedRaw.match(/\[id=[^\]]+\]/g) || []).length;
            const drCites = (draftRaw.match(/\[id=[^\]]+\]/g) || []).length;
            improvementOk = improvedRaw.length >= draftRaw.length && impCites >= drCites;
          } catch {}
        }
        const hasSchemaError = /"tool_result"[\s\S]*?"success":false/.test(sse2);
        let createdCheck: { count: number; onlyUser: boolean } | null = null;
        if (s === "batch_doc_ops") {
          const afterStr2 = extractSection(content, s, "GRAPH_AFTER_CREATED");
          let created2: Array<{ id: string; authorId: string }>;
          created2 = [];
          try {
            created2 = JSON.parse(afterStr2);
          } catch {}
          const count2 = created2.length;
          const onlyUser2 = created2.every((c) => String(c.authorId).includes("test-user"));
          createdCheck = { count: count2, onlyUser: onlyUser2 };
        }
        const durationMs2 = Date.now() - t0;
        // Optional tool sequence gating via env (comma-separated), applied to batch_doc_ops
        let sequenceOk = true;
        if (s === "batch_doc_ops") {
          const seq = (process.env.AGENT_EXPECT_SEQUENCE || "")
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
          if (seq.length) {
            let lastIdx = -1;
            for (const name of seq) {
              const idx = sse2.indexOf(`"name":"${name}"`);
              if (idx === -1 || idx < lastIdx) {
                sequenceOk = false;
                break;
              }
              lastIdx = idx;
            }
          }
        }
        const pass2 =
          hasFinal &&
          finalCount === 1 &&
          hasToolCall &&
          !hasSchemaError &&
          (!hasSelfEval || improvementOk) &&
          // Require explicit two-pass phases when self-eval path used
          (!hasSelfEval || (hasDraftPhase && hasSelfEvalPhase && hasRevisePhase && phasesOk)) &&
          (!REQUIRE_AGENT_CITES || citationCount2 >= 2) &&
          (s !== "batch_doc_ops" || (createdCheck && createdCheck.count > 0 && createdCheck.onlyUser && sequenceOk));
        const metrics2: any = {
          hasFinal,
          hasToolCall,
          selfEvalPresent: hasSelfEval,
          improvementOk,
          phases: { draft: hasDraftPhase, self_eval: hasSelfEvalPhase, revise: hasRevisePhase, phasesOk },
          schemaViolations: hasSchemaError ? 1 : 0,
          durationMs: durationMs2,
          tokenEstimate: Math.round((sse2 || "").length / 4),
        };
        if (createdCheck)
          Object.assign(metrics2, { createdCount: createdCheck.count, onlyUserWrites: createdCheck.onlyUser });
        perScenario.push({ scenario: s, pass: pass2, metrics: metrics2 });
      }
      const overallPassRate = perScenario.filter((r) => r.pass).length / perScenario.length;
      const agentPassRate = overallPassRate;
      const latencies = perScenario.map((r) => r.metrics.durationMs).sort((a, b) => a - b);
      const p95 = latencies[Math.floor(0.95 * (latencies.length - 1))] || 0;
      const summary = {
        summaryAt: new Date().toISOString(),
        overallPassRate,
        agentPassRate,
        p95LatencyMs: p95,
        thresholds: {
          overallPassRate: ">=0.80",
          agentLayerPassRate: ">=0.70",
          onlyUserWrites: "100%",
          p95LatencyMs: "<=300000 (eval)",
        },
      };
      append(EVAL_PATH, ["\n## Agent Eval — Summary", JSON.stringify(summary, null, 2)]);
      const ENFORCE = process.env.JUDGE_ENFORCE === "1";
      const MIN_OVERALL = Number(process.env.JUDGE_MIN_PASS_RATE || 0.8);
      if (ENFORCE) {
        expect(overallPassRate).toBeGreaterThanOrEqual(MIN_OVERALL);
        expect(agentPassRate).toBeGreaterThanOrEqual(0.7);
        // Optional freshness check for web research scenario
        const FRESH_DAYS = Number(process.env.WEB_FRESHNESS_DAYS || 0);
        if (FRESH_DAYS > 0) {
          const sseWeb = extractSection(content, "web_search", "SSE_RAW");
          if (sseWeb) {
            const isoDates = Array.from(sseWeb.matchAll(/\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}Z)?/g)).map(
              (m) => m[0],
            );
            const now = Date.now();
            const freshMs = FRESH_DAYS * 24 * 3600 * 1000;
            const anyFresh = isoDates.some((d) => {
              const t = Date.parse(d);
              return !isNaN(t) && now - t <= freshMs;
            });
            // If freshness enforced, require at least one fresh date
            expect(anyFresh).toBe(true);
          }
        }
        expect(p95).toBeLessThanOrEqual(300000);
      }
    }
  },
  90000,
);

if (!HAS_OPENAI) {
  // eslint-disable-next-line no-console
  console.warn("[live.agent.smoke.eval.test] Skipping; set OPENAI_API_KEY to enable.");
}
