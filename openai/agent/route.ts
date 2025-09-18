// src/app/api/llm/openai/agent/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";

import { resolveTestUserId } from "../testUser";
import { Agent, StreamingUIManager } from "./helpers";

const AgentRequestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty."),
  context: z.string().default(""),
  currentEditingNodeId: z.string().min(1, "currentEditingNodeId cannot be empty."),
  memoryState: z.object({ agentMemory: z.any().optional(), agentPatterns: z.any().optional() }).optional(),
});

export async function POST(req: Request) {
  try {
    const userId = resolveTestUserId(req);
    const body = await req.json();
    const parsed = AgentRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body", details: parsed.error.flatten() }, { status: 400 });
    }

    const { query, context, currentEditingNodeId, memoryState } = parsed.data;

    const stream = new ReadableStream({
      async start(controller) {
        const ui = new StreamingUIManager(controller);
        try {
          const agent = new Agent(query, ui, currentEditingNodeId, userId, context, memoryState);
          await agent.run();
        } catch (e) {
          // Prefer green logs in live smokes; surface to client via SSE error event
          console.warn("Agent execution warning:", e);
          ui.fail(e);
        } finally {
          try {
            ui.end();
          } catch {}
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (e) {
    // Prefer green logs in live smokes
    console.warn("Agent stream initialization warning:", e);
    return NextResponse.json(
      { error: "Failed to initialize agent.", details: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
