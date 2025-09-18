/** @jest-environment node */

process.env.SKIP_DATABASE_URL = "true";
process.env.VERCEL_ENV = process.env.VERCEL_ENV || "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = process.env.NEXT_PUBLIC_HARDCODED_USER_ID || "test-user";
process.env.AGENT_PREFLIGHT = "1"; // deterministic

import fs from "fs";
import path from "path";

describe("Capture real SSE (preflight) for interview samples", () => {
  const outDir = path.join(process.cwd(), "Interview", "sse_samples");
  beforeAll(() => {
    try { fs.mkdirSync(outDir, { recursive: true }); } catch {}
  });

  it("organize_meetings: create Meetings and move notes", async () => {
    const route = require("../agent/route");
    const POST = route.POST as (req: any) => Promise<Response>;

    const body = {
      query:
        "Using ONLY the provided tools (no web_search), create a folder named 'Meetings' under parent 'project-alpha-id', then move 'note-123-id' and 'note-456-id' under it. Finally call finish_work with a short summary.",
      context: "",
      currentEditingNodeId: "root-node",
    };

    const req = new Request("http://local/api/llm/openai/agent", {
      method: "POST",
      headers: { "content-type": "application/json", "x-test-user-id": "test-user" },
      body: JSON.stringify(body),
    });

    const res = await POST(req as any);
    const text = await (res as any).text();
    const outPath = path.join(outDir, "organize_meetings.preflight.sse.log");
    fs.writeFileSync(outPath, text, "utf8");
    expect(text).toMatch(/"type":"final/);
  });


  it("banking: Prospecting Report — Sam Altman", async () => {
    const route = require("../agent/route");
    const POST = route.POST as (req: any) => Promise<Response>;

    const body = {
      query:
        "Prospecting Report — Sam Altman. Create a user report under Reports/Prospecting and relate to Sam Altman. Then finish_work.",
      context: "",
      currentEditingNodeId: "root-node",
    };

    const req = new Request("http://local/api/llm/openai/agent", {
      method: "POST",
      headers: { "content-type": "application/json", "x-test-user-id": "test-user" },
      body: JSON.stringify(body),
    });

    const res = await POST(req as any);
    const text = await (res as any).text();
    const outPath = path.join(outDir, "banking.preflight.sse.log");
    fs.writeFileSync(outPath, text, "utf8");
    expect(text).toMatch(/"type":"final/); // final or final_summary
  });

  it("ai_research: search_academic AGI safety arxiv", async () => {
    const route = require("../agent/route");
    const POST = route.POST as (req: any) => Promise<Response>;

    const body = {
      query:
        "Mandatory: Call search_academic with query 'AGI safety site:arxiv.org'. Do not answer directly. Then call finish_work with a brief summary.",
      context: "Academic focus; cite sources.",
      currentEditingNodeId: "root-node",
    };

    const req = new Request("http://local/api/llm/openai/agent", {
      method: "POST",
      headers: { "content-type": "application/json", "x-test-user-id": "test-user" },
      body: JSON.stringify(body),
    });

    const res = await POST(req as any);
    const text = await (res as any).text();
    const outPath = path.join(outDir, "ai_research.preflight.sse.log");
    fs.writeFileSync(outPath, text, "utf8");
    expect(text).toMatch(/"type":"final/);
  });
});

