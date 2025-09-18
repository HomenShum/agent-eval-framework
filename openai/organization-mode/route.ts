// src/app/api/llm/openai/organization-mode/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import { ErrorCode } from "../errors";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Organization Mode: Given a list of notes (id, text), propose a hierarchical organization outline.
const OrgSchema = z.object({
  notes: z.array(z.object({ id: z.string(), text: z.string().min(1) })).min(1),
  num_clusters: z.number().int().min(2).max(50).optional(),
  model: z.enum(["gpt-5-mini"]).optional().default("gpt-5-mini"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = OrgSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: ErrorCode.BAD_REQUEST, message: "Invalid request", hint: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { notes, num_clusters } = parsed.data;
    const modelId = "gpt-5-mini";

    const prompt =
      `You are a knowledge architect. Organize the user's notes into a clean hierarchy.\n\n` +
      `NOTES (JSON):\n${JSON.stringify(notes.slice(0, 200))}\n\n` +
      `Rules:\n` +
      `- Create 2-4 levels deep hierarchy.\n` +
      `- Each node must include: title (3-6 words).\n` +
      `- When summarizing, include a 'content' field with a concise summary.\n` +
      `- For each new node, add a 'sources' array with objects of original note id+text used.\n` +
      (num_clusters ? `- Target about ${num_clusters} top-level categories if sensible.\n` : ``) +
      `Output strict JSON for the root object: { "title": "📊 Reorganized Knowledge Base", "children": [...] }`;

    const completion = await openai.chat.completions.create({
      model: modelId,
      messages: [
        { role: "system", content: "Return valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content || "{}";
    let json: any = {};
    try {
      json = JSON.parse(content);
    } catch (e) {
      // quick repair attempt
      const fix = await openai.chat.completions.create({
        model: modelId,
        messages: [
          { role: "system", content: "Fix and return valid JSON ONLY." },
          { role: "user", content },
        ],
        response_format: { type: "json_object" },
      });
      json = JSON.parse(fix.choices?.[0]?.message?.content || "{}");
    }

    return NextResponse.json({ outline: json }, { status: 200 });
  } catch (e) {
    console.error("Error in /api/llm/openai/organization-mode:", e);
    return NextResponse.json(
      {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Organization mode failed",
        hint: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}

