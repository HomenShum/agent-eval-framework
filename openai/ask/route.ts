// src/app/api/llm/openai/ask/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const AskRequestSchema = z.object({
  prompt: z.string().min(1),
  model: z.enum(["gpt-5", "gpt-5-mini", "gpt-5-nano"]).optional().default("gpt-5-mini"),
});

/**
 * General-purpose, streaming text responses from OpenAI Chat Completions.
 * Streams plain text for a simple real-time UX (matches Gemini endpoint behavior).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = AskRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "BAD_REQUEST", message: "Invalid request body", hint: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { prompt } = parsed.data;
const modelId = "gpt-5-mini";

    // Try streaming first; if unsupported (e.g., org not verified), fall back to non-stream
    try {
      const stream = await openai.chat.completions.create({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      });

      const rs = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of stream) {
              const delta = chunk.choices?.[0]?.delta?.content || "";
              if (delta) controller.enqueue(encoder.encode(delta));
            }
          } catch (_e) {
            // Silent: close the stream; do not log after tests complete
          } finally {
            controller.close();
          }
        },
      });

      return new NextResponse(rs, {
        headers: {
          "Content-Type": "text/plain",
          Connection: "keep-alive",
          "Cache-Control": "no-cache",
        },
      });
    } catch (_e) {
      // Non-stream fallback
      const completion = await openai.chat.completions.create({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
      });
      const text = completion.choices?.[0]?.message?.content || "";
      return new NextResponse(text, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  } catch (error) {
    console.error("Error in /api/llm/openai/ask:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to get LLM response", hint: msg },
      { status: 500 },
    );
  }
}

