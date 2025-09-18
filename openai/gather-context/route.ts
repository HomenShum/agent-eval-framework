// mew/src/app/api/llm/openai/gather-context/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- Types & Schemas ---
type ContextNodeInfo = { id: string; text: string; children: ContextNodeInfo[] };
const ContextNodeInfoSchema: z.ZodType<ContextNodeInfo> = z.lazy(() =>
  z.object({ id: z.string(), text: z.string(), children: z.array(ContextNodeInfoSchema) }),
);

const GatherContextRequestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty."),
  rawContext: z.object({
    conversational: z.array(ContextNodeInfoSchema),
    retrieved: z.array(ContextNodeInfoSchema),
  }),
  // Optional: hints about source origin to support mixed-source balancing
  sourcesMeta: z
    .array(z.object({ id: z.string(), origin: z.enum(["user", "global"]) }))
    .optional()
    .default([]),
});

// --- Utils ---
function firstLine(text: string): string {
  return (text || "").split("\n")[0]?.trim() || "";
}
function serializeNodeToMarkdown(node: ContextNodeInfo, depth = 0): string {
  const indent = "  ".repeat(depth);
  let md = `${indent}- ${node.text} (ID: ${node.id})\n`;
  for (const c of node.children || []) md += serializeNodeToMarkdown(c, depth + 1);
  return md;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = GatherContextRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "BAD_REQUEST", message: "Invalid request body", hint: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { query: userQuery, rawContext, sourcesMeta } = parsed.data;
    const { conversational: conversationalContext, retrieved: allRetrievedContext } = rawContext;

    // Re-ranking: Ask OpenAI to select the most useful retrieved roots for this query
    let prunedRetrievedNodes: ContextNodeInfo[] = allRetrievedContext;
    if (allRetrievedContext.length > 0) {
      const markdownDocs = allRetrievedContext.map((doc) => serializeNodeToMarkdown(doc)).join("\n---\n");
      const reRankingPrompt =
        `You are a relevance filtering expert. Analyze retrieved documents and select the most valuable subset to answer the user's query.\n` +
        `User's Query:\n${userQuery}\n` +
        `Retrieved Documents (Markdown):\n${markdownDocs.slice(0, 10000)}\n` +
        `Output strictly as JSON: { "selected_ids": ["id1", "id2", ...] }`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          { role: "system", content: "Respond with strict JSON only." },
          { role: "user", content: reRankingPrompt },
        ],
        response_format: { type: "json_object" },
      });

      const text = completion.choices?.[0]?.message?.content || '{"selected_ids":[]}';
      let selected = new Set<string>();
      try {
        const json = JSON.parse(text);
        if (Array.isArray(json?.selected_ids)) selected = new Set(json.selected_ids);
      } catch {}

      if (selected.size > 0) {
        prunedRetrievedNodes = allRetrievedContext.filter((n) => selected.has(n.id));
        if (prunedRetrievedNodes.length === 0) prunedRetrievedNodes = allRetrievedContext;
      }
    }

    // Mixed-source balancing when hints are provided
    if (Array.isArray(sourcesMeta) && sourcesMeta.length > 0) {
      const byId = new Map<string, "user" | "global">();
      for (const m of sourcesMeta) byId.set(m.id, m.origin);
      const hasUser = prunedRetrievedNodes.some((n) => byId.get(n.id) === "user");
      const hasGlobal = prunedRetrievedNodes.some((n) => byId.get(n.id) === "global");
      const anyUser = allRetrievedContext.find((n) => byId.get(n.id) === "user");
      const anyGlobal = allRetrievedContext.find((n) => byId.get(n.id) === "global");
      if (!hasUser && anyUser) prunedRetrievedNodes = [anyUser, ...prunedRetrievedNodes];
      if (!hasGlobal && anyGlobal) prunedRetrievedNodes = [anyGlobal, ...prunedRetrievedNodes];
      // Dedup on id while preserving order
      const seen = new Set<string>();
      prunedRetrievedNodes = prunedRetrievedNodes.filter((n) => (seen.has(n.id) ? false : (seen.add(n.id), true)));
    }

    // Final context assembly (retrieved first, then conversational chips)
    const finalContextNodes = [...prunedRetrievedNodes, ...conversationalContext];
    const finalContextString = finalContextNodes.map((doc) => serializeNodeToMarkdown(doc)).join("\n---\n");

    const allRetrievedIds = new Set(allRetrievedContext.map((n) => n.id));
    const finalIds = new Set(finalContextNodes.map((n) => n.id));
    const prunedIds = Array.from(allRetrievedIds).filter((id) => !finalIds.has(id));

    const sources = prunedRetrievedNodes.map((n, idx) => ({
      index: idx + 1,
      id: n.id,
      title: firstLine(n.text),
      preview: firstLine(n.text),
    }));

    const allowedCitationIds = Array.from(new Set(finalContextNodes.map((n) => n.id)));

    return NextResponse.json({ finalContext: finalContextString, prunedIds, sources, allowedCitationIds });
  } catch (error) {
    console.error("Error in /api/llm/openai/gather-context:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Server error", hint: msg }, { status: 500 });
  }
}

