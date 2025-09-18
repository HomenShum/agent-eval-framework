import fs from "fs";
import path from "path";
import { Agent, StreamingUIManager } from "../openai/agent/helpers";


process.env.AGENT_PREFLIGHT = "1"; // deterministic behaviors
process.env.VERCEL_ENV = process.env.VERCEL_ENV || "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = process.env.NEXT_PUBLIC_HARDCODED_USER_ID || "test-user";
async function runAgentToSSEText(query: string, context: string) {
  const chunks: Uint8Array[] = [];
  const controller = { enqueue: (u: Uint8Array) => { chunks.push(u); } } as any;
  const ui = new StreamingUIManager(controller);
  const agent = new Agent(query, ui, "root-node", "test-user", context, {});
  await agent.run();
  ui.end();
  const decoder = new TextDecoder();
  return decoder.decode(Buffer.concat(chunks as any));
}


async function capture(label: string, query: string, context: string) {
  const text = await runAgentToSSEText(query, context);
  const outDir = path.join(process.cwd(), "Interview", "sse_samples");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${label}.preflight.sse.log`);
  fs.writeFileSync(outPath, text, "utf8");
  console.log(`Wrote ${outPath} (${text.split("\n").length} lines)`);
}

(async () => {
  // Banking prospecting-like: Prospecting Report — Sam Altman
  await capture(
    "banking",
    "Prospecting Report — Sam Altman. Create a user report under Reports/Prospecting and relate to Sam Altman. Then finish_work.",
    "",
  );

  // AI research-like: search_academic scenario
  await capture(
    "ai_research",
    "Mandatory: Call search_academic with query 'AGI safety site:arxiv.org'. Do not answer directly. Then call finish_work with a brief summary.",
    "Academic focus; cite sources.",
  );
})();

