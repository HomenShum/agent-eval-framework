// mew/src/app/api/llm/openai/ask-mode/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Ask Mode: synthesize answer with citations from provided context
const AskModeSchema = z.object({
  query: z.string().min(1),
  finalContext: z.string().default(""),
  sources: z
    .array(
      z.object({ index: z.number(), id: z.string(), title: z.string().optional(), preview: z.string().optional() }),
    )
    .optional()
    .default([]),
  // Optional: meta for mixed-source balance in synthesis
  sourcesMeta: z
    .array(z.object({ id: z.string(), origin: z.enum(["user", "global"]) }))
    .optional()
    .default([]),
  // Optional: whitelist of allowed citation IDs (e.g., from gather-context)
  allowedCitationIds: z.array(z.string()).optional().default([]),
  model: z.enum(["gpt-5", "gpt-5-mini"]).optional().default("gpt-5"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = AskModeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "BAD_REQUEST", message: "Invalid request", hint: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { query, finalContext, sources, sourcesMeta, allowedCitationIds, model } = parsed.data;

    const byId = new Map<string, "user" | "global">();
    for (const m of sourcesMeta) byId.set(m.id, m.origin);
    const localIds = Array.from(new Set(sources.filter((s) => byId.get(s.id) === "user").map((s) => s.id)));
    const globalIds = Array.from(new Set(sources.filter((s) => byId.get(s.id) === "global").map((s) => s.id)));
    const hasMixed = localIds.length > 0 && globalIds.length > 0;

    const system = [
      "You must answer using ONLY the provided CONTEXT.",
      "Cite sources inline using [id=SOURCE_ID] where SOURCE_ID is one of AllowedCitationIds.",
      hasMixed
        ? "Include at least two distinct citations overall and include at least one from LocalIds and at least one from GlobalIds."
        : "Include at least one citation from the available AllowedCitationIds.",
      "If insufficient info exists, say what is missing and suggest next steps.",
      "Keep the answer structured and concise; include a brief bullet summary at top.",
      "Return plain text; do not include JSON.",
      "--- CONTEXT START ---",
      finalContext,
      "--- CONTEXT END ---",
      "--- AllowedCitationIds ---",
      JSON.stringify(allowedCitationIds.length ? allowedCitationIds : sources.map((s) => s.id)),
      "--- LocalIds ---",
      JSON.stringify(localIds),
      "--- GlobalIds ---",
      JSON.stringify(globalIds),
      "--- SOURCES (for reference) ---",
      JSON.stringify(sources),
    ].join("\n");

    const stream = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: query },
      ],
      stream: true,
    });

    const rs = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content || "";
            if (delta) controller.enqueue(enc.encode(delta));
          }
        } catch (e) {
          console.error("ask-mode stream error:", e);
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
  } catch (e) {
    console.error("Error in /api/llm/openai/ask-mode:", e);
    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "Ask-mode failed",
        hint: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}

