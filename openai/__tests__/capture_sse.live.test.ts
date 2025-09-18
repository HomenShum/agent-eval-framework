/** @jest-environment node */

// Live capture toggled by OPENAI_API_KEY; skips safely if not present.
process.env.SKIP_DATABASE_URL = "true";
process.env.VERCEL_ENV = process.env.VERCEL_ENV || "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = process.env.NEXT_PUBLIC_HARDCODED_USER_ID || "test-user";
process.env.AGENT_PREFLIGHT = "0"; // disable preflight for live

import fs from "fs";
import path from "path";

const hasKey = !!process.env.OPENAI_API_KEY;
const maybeIt = hasKey ? it : it.skip;

function redact(text: string): string {
  // Basic URL/domain redaction
  return text
    .replace(/https?:\/\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]+/g, "https://redacted")
    .replace(/\b([A-Za-z0-9-]+\.)+[A-Za-z]{2,}\b/g, "redacted.tld");
}

describe("Live SSE capture (non-preflight)", () => {
  const outDir = path.join(process.cwd(), "Interview", "sse_samples");
  beforeAll(() => {
    try { fs.mkdirSync(outDir, { recursive: true }); } catch {}
  });

  maybeIt("organize_meetings (live)", async () => {
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
    const redacted = redact(text);
    const outPath = path.join(outDir, "organize_meetings.live.sse.log");
    fs.writeFileSync(outPath, redacted, "utf8");

    // Live can be variable; just sanity-check that we streamed something
    expect(redacted.length).toBeGreaterThan(0);
  });
});

