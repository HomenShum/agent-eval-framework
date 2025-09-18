/** @jest-environment node */

/**
 * Evaluation-only test: parse the latest live smoke test log and run GPT-5-mini
 * structured-output judge over each scenario. This allows us to:
 *  - run the live smoke once to generate a timestamped Markdown log
 *  - run this eval independently to score quality and metrics
 *
 * Usage:
 *  - Set OPENAI_REAL_TESTS=1 and OPENAI_API_KEY to execute the judge
 *  - Optionally set:
 *      JUDGE_ENFORCE=1 to fail if pass-rate < JUDGE_MIN_PASS_RATE (default 0.5)
 *      JUDGE_MIN_PASS_RATE=0.8 for stricter threshold
 */

// Minimal env hints used by some imports
process.env.SKIP_DATABASE_URL = "true";
process.env.VERCEL_ENV = process.env.VERCEL_ENV || "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = process.env.NEXT_PUBLIC_HARDCODED_USER_ID || "test-user";

const LIVE = !!process.env.OPENAI_REAL_TESTS;
const HAS_KEY = !!process.env.OPENAI_API_KEY;

import fs from "fs";
import path from "path";

const LOG_DIR = path.join(__dirname, "test_logs", "smoke");
const JUDGE_ENABLED = LIVE && HAS_KEY;
const JUDGE_MIN_PASS_RATE = Number(process.env.JUDGE_MIN_PASS_RATE || "0.5");
const JUDGE_ENFORCE = process.env.JUDGE_ENFORCE === "1";

// ---------------- Helpers: locate latest log, parsing ----------------

function findLatestLogFile(): string | null {
  try {
    const files = fs.readdirSync(LOG_DIR).filter((f) => f.startsWith("live.smoke.") && f.endsWith(".log.md"));
    if (!files.length) return null;
    // Sort by filename (ISO-like timestamp in name) descending
    files.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
    return path.join(LOG_DIR, files[0]);
  } catch {
    return null;
  }
}

// Parse SSE-style lines from a chunk of text: returns finalSummary and toolCalls
function parseSSE(text: string): { finalSummary: string; toolCalls: { name: string; args: any }[] } {
  const lines = text.split("\n");
  const toolCalls: { name: string; args: any }[] = [];
  let finalSummary = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;
    const jsonPart = trimmed.slice(5).trim();
    try {
      const evt = JSON.parse(jsonPart);
      if (evt?.type === "tool_call" && evt.data) {
        let argsVal: any = evt.data.args;
        if (typeof argsVal === "string") {
          const s = argsVal.trim();
          try {
            argsVal = JSON.parse(s.startsWith('"') ? JSON.parse(s) : s);
          } catch {}
        }
        toolCalls.push({ name: evt.data.name, args: argsVal });
      } else if (evt?.type === "final_summary") {
        finalSummary = typeof evt.data === "string" ? evt.data : evt.data?.message || JSON.stringify(evt.data);
      }
    } catch {}
  }
  return { finalSummary, toolCalls };
}

// Extract a contiguous SSE text segment for a given scenario marker from the log content
function extractScenarioSSEFromLog(content: string, markerSubstrs: string[]): string {
  const lines = content.split("\n");
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (markerSubstrs.every((m) => L.includes(m))) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) return "";
  const chunk: string[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const L = lines[i];
    if (i > startIdx && L.startsWith("[live] ")) break; // stop at next scenario/log section
    // include the line; judge parser will read only data: lines
    chunk.push(L);
  }
  return chunk.join("\n");
}

// ---------------- Judge via GPT-5-mini (structured JSON) ----------------

type JudgeResult = {
  scenario: string;
  rating: "low" | "medium" | "high" | "professional";
  pass: boolean;
  metrics: {
    toolSelectionAccuracy: "poor" | "okay" | "good" | "excellent";
    argumentQuality: "poor" | "okay" | "good" | "excellent";
    taskCompletion: "failed" | "partial" | "complete";
    citationQuality?: "poor" | "okay" | "good" | "excellent";
    responseCoherence: "poor" | "okay" | "good" | "excellent";
    errorHandling: "poor" | "okay" | "good" | "excellent";
    retrieval: {
      applicable: boolean;
      precision: number;
      recall: number;
      f1: number;
      hitRate: number;
      mrr: number;
    };
  };
  feedback: { whatWorked: string[]; improvements: string[] };
  timingMs: number;
};

const PASS_RATINGS = new Set(["high", "professional"]);
const JUDGE_RESULTS: JudgeResult[] = [];

async function judgeEvaluateScenario(params: {
  scenario: string;
  prompt: string;
  context?: string;
  sseText: string;
  timingMs: number;
}): Promise<JudgeResult | null> {
  if (!JUDGE_ENABLED) return null;
  const { scenario, prompt, context = "", sseText, timingMs } = params;
  const { finalSummary, toolCalls } = parseSSE(sseText);
  try {
    const OpenAI = (await import("openai")).default as any;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const schema = {
      name: "JudgeResult",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          scenario: { type: "string" },
          rating: { type: "string", enum: ["low", "medium", "high", "professional"] },
          pass: { type: "boolean" },
          metrics: {
            type: "object",
            additionalProperties: false,
            properties: {
              toolSelectionAccuracy: { type: "string", enum: ["poor", "okay", "good", "excellent"] },
              argumentQuality: { type: "string", enum: ["poor", "okay", "good", "excellent"] },
              taskCompletion: { type: "string", enum: ["failed", "partial", "complete"] },
              citationQuality: { type: "string", enum: ["poor", "okay", "good", "excellent"], nullable: true },
              responseCoherence: { type: "string", enum: ["poor", "okay", "good", "excellent"] },
              errorHandling: { type: "string", enum: ["poor", "okay", "good", "excellent"] },
              retrieval: {
                type: "object",
                additionalProperties: false,
                properties: {
                  applicable: { type: "boolean" },
                  precision: { type: "number" },
                  recall: { type: "number" },
                  f1: { type: "number" },
                  hitRate: { type: "number" },
                  mrr: { type: "number" },
                },
                required: ["applicable", "precision", "recall", "f1", "hitRate", "mrr"],
              },
            },
            required: [
              "toolSelectionAccuracy",
              "argumentQuality",
              "taskCompletion",
              "responseCoherence",
              "errorHandling",
              "retrieval",
            ],
          },
          feedback: {
            type: "object",
            additionalProperties: false,
            properties: {
              whatWorked: { type: "array", items: { type: "string" } },
              improvements: { type: "array", items: { type: "string" } },
            },
            required: ["whatWorked", "improvements"],
          },
          timingMs: { type: "number" },
        },
        required: ["scenario", "rating", "pass", "metrics", "feedback", "timingMs"],
      },
      strict: true,
    } as const;

    const resp = await client.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 200,
      response_format: { type: "json_schema", json_schema: schema },
      messages: [
        { role: "system", content: "You are an automated judge. Be deterministic." },
        {
          role: "user",
          content: JSON.stringify({ scenario, prompt, context, finalSummary, toolCalls }, null, 2),
        },
      ],
    });
    const content = resp.choices?.[0]?.message?.content || "{}";
    const data = JSON.parse(content) as Omit<JudgeResult, "timingMs">;
    const result: JudgeResult = { ...data, timingMs };
    JUDGE_RESULTS.push(result);
    return result;
  } catch (e) {
    // Log but do not fail the test unless JUDGE_ENFORCE is on and pass rate falls below threshold
    // eslint-disable-next-line no-console
    console.warn("[judge] evaluation failed", { scenario, error: String(e) });
    return null;
  }
}

function appendToLog(file: string, lines: string[]) {
  try {
    fs.appendFileSync(file, lines.join("\n") + "\n", "utf8");
  } catch {}
}

// ---------------- Test suite ----------------

const evalIt = (name: string, fn: jest.ProvidesCallback, timeout?: number) =>
  (JUDGE_ENABLED ? it : it.skip)(name, fn, timeout);

describe("live smoke eval (judge)", () => {
  const latest = findLatestLogFile();

  evalIt("find latest log file", () => {
    expect(latest).toBeTruthy();
  });

  const content = latest && fs.readFileSync(latest, "utf8");

  const scenarios: { key: string; prompt: string; markers: string[] }[] = [
    {
      key: "organize_meetings",
      prompt:
        "Using ONLY the provided tools (no web_search), create a folder named 'Meetings' under parent 'project-alpha-id', then move 'note-123-id' and 'note-456-id' under it. Finally call finish_work with a short summary.",
      markers: ["route /agent SSE mock-tools", "organize meetings"],
    },
    {
      key: "batch_doc_ops",
      prompt:
        "Create a 'Prospecting Report — Sam Altman' under user 'Reports/Prospecting'. Use global info if needed but do NOT modify global nodes. Append new nodes ONLY under user. Then finish_work.",
      markers: ["scenario batch_doc_ops SSE_RAW"],
    },
    {
      key: "add_relation",
      prompt:
        "Using ONLY tools (no web_search), add_relation from 'existing-thoughts-id' to 'ai-risk-note-id' of type 'relatedTo', then call finish_work with a brief summary.",
      markers: ["route /agent SSE mock-tools", "add_relation"],
    },
    {
      key: "web_search",
      prompt:
        "Mandatory: Use the web_search tool with query 'latest quantum computing news'. Do NOT answer directly. After web_search returns, call finish_work with a short summary.",
      markers: ["route /agent SSE mock-tools", "web_search"],
    },
    {
      key: "update_node_content",
      prompt:
        "Must call update_node_content on nodeId 'draft-note-1' with a brief summary about quantum chips. Do not create a new node. Then call finish_work.",
      markers: ["route /agent SSE mock-tools", "update_node_content"],
    },
    {
      key: "research_person_deep_dive",
      prompt:
        "Call research_person_deep_dive with full_name 'Sam Altman' and aspects ['investments','background'], optionally call find_related_nodes_via_graph, then finish_work with a summary and mention 'sources'.",
      markers: ["route /agent SSE mock-tools", "research_person_deep_dive"],
    },
    {
      key: "search_academic",
      prompt:
        "Mandatory: Call search_academic with query 'AGI safety site:arxiv.org'. Then call finish_work with a brief summary.",
      markers: ["route /agent SSE mock-tools", "search_academic"],
    },
    {
      key: "superconnector_prepare_outreach",
      prompt:
        "Call superconnector_prepare_outreach with contact_name 'Jane Doe', company 'Acme Ventures', channel 'email', context 'seed funding discussion'. Then finish_work.",
      markers: ["route /agent SSE mock-tools", "superconnector_prepare_outreach"],
    },
  ];

  for (const s of scenarios) {
    evalIt(
      `judge: ${s.key}`,
      async () => {
        const sseText = content ? extractScenarioSSEFromLog(content, s.markers) : "";
        const t0 = Date.now();
        const res = await judgeEvaluateScenario({
          scenario: s.key,
          prompt: s.prompt,
          context: "",
          sseText,
          timingMs: Date.now() - t0,
        });
        // Append to the same latest log file
        if (latest)
          appendToLog(latest, [
            `\n## Eval — ${s.key}`,
            res ? JSON.stringify(res, null, 2) : '{ "error": "judge unavailable or failed" }',
          ]);
        // Do not assert on individual judge results; aggregate gating is below
      },
      120000,
    );
  }

  // JSON variants (A–E) evaluated without relying on log; these are judge-only stress tests
  const jsonVariants: { key: string; prompt: string }[] = [
    {
      key: "json_vA_extract_contacts",
      prompt: `You are given JSON. Task: extract contact name+email for company 'Acme'. Do NOT call tools. End with finish_work and a concise structured summary. JSON=\\n${JSON.stringify(
        {
          companies: [
            { name: "Acme", contacts: [{ name: "Alice", email: "alice@acme.com" }] },
            { name: "BetaCorp", contacts: [{ name: "Bob", email: "bob@beta.com" }] },
          ],
        },
      )}`,
    },
    {
      key: "json_vB_financial_analysis",
      prompt: `Given JSON, compute total revenue and margin for all years. Do NOT call tools. End with finish_work and a brief calculation. JSON=\\n${JSON.stringify(
        {
          company: "Acme",
          financials: {
            years: [
              { y: 2023, revenue: 12.5, costs: 8.1 },
              { y: 2024, revenue: 15.2, costs: 9.3 },
            ],
          },
        },
      )}`,
    },
    {
      key: "json_vC_transform_schema",
      prompt: `Given JSON, propose a target schema {users:[{user_id,name}]} and transform the data conceptually (no code). Do NOT call tools. End with finish_work and a concise mapping. JSON=\\n${JSON.stringify(
        {
          employees: [
            { id: 1, fullName: "Jane Doe" },
            { id: 2, fullName: "John Roe" },
          ],
        },
      )}`,
    },
    {
      key: "json_vD_validation_errors",
      prompt: `Identify any inconsistencies (e.g., negative shares or duplicate tickers). Do NOT call tools. End with finish_work summarizing detected issues. JSON=\\n${JSON.stringify(
        {
          portfolio: [
            { ticker: "ACME", shares: 100 },
            { ticker: "ACME", shares: -5 },
          ],
        },
      )}`,
    },
    {
      key: "json_vE_multi_step",
      prompt: `You will process two JSON docs. Step 1: extract totals per region. Step 2: merge by region. Step 3: summarize combined totals. Do NOT call tools. End with finish_work. JSON1=\\n${JSON.stringify(
        {
          sales: [
            { region: "NA", amount: 100 },
            { region: "EU", amount: 80 },
          ],
        },
      )}\\nJSON2=\\n${JSON.stringify({
        sales: [
          { region: "NA", amount: 60 },
          { region: "APAC", amount: 70 },
        ],
      })}`,
    },
  ];

  for (const v of jsonVariants) {
    evalIt(
      `judge JSON: ${v.key}`,
      async () => {
        const t0 = Date.now();
        const res = await judgeEvaluateScenario({
          scenario: v.key,
          prompt: v.prompt,
          context: "offline JSON",
          sseText: "",
          timingMs: Date.now() - t0,
        });
        if (latest)
          appendToLog(latest, [
            `\n## Eval — ${v.key}`,
            res ? JSON.stringify(res, null, 2) : '{ "error": "judge unavailable or failed" }',
          ]);
      },
      120000,
    );
  }

  evalIt("aggregate pass rate threshold", () => {
    const total = JUDGE_RESULTS.length;
    const passCount = JUDGE_RESULTS.filter((r) => r && PASS_RATINGS.has(r.rating)).length;
    const rate = total > 0 ? passCount / total : 0;
    // eslint-disable-next-line no-console
    console.log("[judge] aggregate", {
      passCount,
      total,
      rate,
      threshold: JUDGE_MIN_PASS_RATE,
      enforce: JUDGE_ENFORCE,
    });
    if (JUDGE_ENFORCE) {
      expect(rate).toBeGreaterThanOrEqual(JUDGE_MIN_PASS_RATE);
    }
  });
});
