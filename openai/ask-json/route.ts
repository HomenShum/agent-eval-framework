// mew/src/app/api/llm/openai/ask-json/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function invokeWithSchema<T extends z.ZodTypeAny>(
  schema: T,
  schemaName: string,
  params: Omit<Parameters<(typeof openai.chat.completions)['create']>[0], 'response_format'>,
) : Promise<any> {
  const payload = { ...params, response_format: zodResponseFormat(schema, schemaName) } as any;
  const completionsAny = openai.chat.completions as any;
  if (typeof completionsAny.parse === "function") {
    return await completionsAny.parse(payload);
  }
  const completion = await openai.chat.completions.create(payload);
  const first = completion.choices?.[0];
  let parsed: any = {};
  const content = first?.message?.content;
  if (typeof content === "string" && content.trim()) {
    try {
      parsed = JSON.parse(content);
    } catch {}
  }
  return {
    ...completion,
    choices: [
      {
        ...first,
        message: {
          ...(first?.message || {}),
          parsed,
        },
      },
    ],
  } as any;
}

// Accepts a prompt and an optional response type. For generic, we enforce json_object output.
const JsonRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty."),
  responseType: z
    .enum(["keywords", "generic", "context_analysis", "rag_synthesis"]) // new strict RAG JSON mode
    .optional()
    .default("generic"),
  // Optional RAG inputs for strict synthesis
  finalContext: z.string().optional().default(""),
  allowedCitationIds: z.array(z.string()).optional().default([]),
  sourcesMeta: z
    .array(z.object({ id: z.string(), origin: z.enum(["user", "global"]) }))
    .optional()
    .default([]),
  model: z.enum(["gpt-5", "gpt-5-mini"]).optional().default("gpt-5-mini"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = JsonRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          code: "BAD_REQUEST",
          message: "Invalid request body",
          hint: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { prompt, responseType, finalContext, allowedCitationIds, sourcesMeta, model } = parsed.data;

    if (responseType === "rag_synthesis") {
      const RagSchema = z.object({
        bullets: z.array(z.object({ id: z.string(), text: z.string() })).min(1),
        citations: z.array(z.string()).min(1),
        claims_to_citations: z.array(z.object({ id: z.string(), cites: z.array(z.string()).min(1) })).min(1),
      });

      const byId = new Map<string, "user" | "global">();
      for (const m of sourcesMeta) byId.set(m.id, m.origin);
      const localIds = Array.from(new Set(allowedCitationIds.filter((id) => byId.get(id) === "user")));
      const globalIds = Array.from(new Set(allowedCitationIds.filter((id) => byId.get(id) === "global")));
      const hasMixed = localIds.length > 0 && globalIds.length > 0;

      const sys = [
        "You must output STRICT JSON that conforms to the provided JSON Schema.",
        "Answer ONLY using the provided Context.",
        "Every claim (bullet.id) MUST be backed by at least one citation id in claims_to_citations.",
        "Citations MUST be drawn ONLY from AllowedCitationIds, using their base ids (no chunk suffix).",
        hasMixed
          ? "You MUST include at least two distinct citations overall and include at least one from LocalIds and at least one from GlobalIds."
          : "You MUST include at least one citation from the available AllowedCitationIds.",
      ].join(" ");

      const user = [
        `Query:\n${prompt}`,
        `Context:\n${finalContext}`,
        `AllowedCitationIds:\n${JSON.stringify(allowedCitationIds)}`,
        `LocalIds:\n${JSON.stringify(localIds)}`,
        `GlobalIds:\n${JSON.stringify(globalIds)}`,
      ].join("\n\n");

      const completion = await invokeWithSchema(RagSchema, "RagSynthesis", {
        model,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
      });

      let json: any = completion.choices?.[0]?.message?.parsed || {};
      if (typeof json === "string") {
        try {
          json = JSON.parse(json);
        } catch {
          json = {};
        }
      }

      const looksValid = () => {
        if (!json || typeof json !== "object") return false;
        if (!Array.isArray(json.bullets) || json.bullets.length === 0) return false;
        if (!Array.isArray(json.citations) || json.citations.length === 0) return false;
        if (!Array.isArray(json.claims_to_citations) || json.claims_to_citations.length === 0) return false;
        const allowed = new Set(allowedCitationIds);
        // whitelist enforcement
        if (!json.citations.every((id: string) => allowed.has(String(id)))) return false;
        const mapping = new Map<string, string[]>();
        for (const m of json.claims_to_citations) mapping.set(String(m.id), (m.cites || []).map(String));
        for (const b of json.bullets) {
          const id = String(b.id);
          if (!mapping.has(id)) return false;
          const cites = mapping.get(id) || [];
          if (cites.length < 1) return false;
          if (!cites.every((cid) => allowed.has(cid))) return false;
        }
        // mixed-source balance when applicable
        if (hasMixed) {
          const byId = new Map<string, "user" | "global">();
          for (const m of sourcesMeta) byId.set(m.id, m.origin);
          const cited: string[] = Array.from(new Set((json.citations as any[]).map((c: any) => String(c))));
          const hasLocal = cited.some((id: string) => byId.get(id) === "user");
          const hasGlobal = cited.some((id: string) => byId.get(id) === "global");
          if (!(hasLocal && hasGlobal && cited.length >= 2)) return false;
        }
        return true;
      };

      if (!looksValid()) {
        // Fallback: ask model to emit strict JSON via json_object with schema embedded
        const schemaText = `Return ONLY valid JSON with this schema: {"bullets":[{"id":string,"text":string},...],"citations":[string,...],"claims_to_citations":[{"id":string,"cites":[string,...]},...]}. Every bullet.id MUST appear in claims_to_citations with >=1 cite. Citations MUST be ONLY from AllowedCitationIds. ${hasMixed ? "Include at least two citations overall with at least one LocalId and one GlobalId." : "Include at least one citation."}`;
        const completion2 = await invokeWithSchema(RagSchema, "RagSynthesisFallback", {
          model,
          messages: [
            { role: "system", content: schemaText },
            { role: "user", content: user },
          ],
        });
        json = completion2.choices?.[0]?.message?.parsed || {};
        if (typeof json === "string") {
          try {
            json = JSON.parse(json);
          } catch {
            json = {};
          }
        }
      }

      return NextResponse.json(json, { status: 200 });
    }

    // Hint the model for stricter JSON depending on the type
    let system = "You must respond with strict, valid JSON only. No prose.";
    if (responseType === "keywords") {
      system += ' Schema: {"keywords":[string,...]}';
    } else if (responseType === "context_analysis") {
      system +=
        ' Schema: {"chain_of_thought":string,"context_summary":string,"top_nodes":[{"id":string,"text":string}]}';
    }

    if (responseType === "generic") {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });
      let jsonResponse: any = {};
      const content = completion.choices?.[0]?.message?.content;
      if (typeof content === "string" && content.trim()) {
        try {
          jsonResponse = JSON.parse(content);
        } catch {
          const fix = await openai.chat.completions.create({
            model,
            messages: [
              { role: "system", content: "Fix and return valid JSON ONLY." },
              { role: "user", content },
            ],
            response_format: { type: "json_object" },
          });
          try {
            jsonResponse = JSON.parse(fix.choices?.[0]?.message?.content || "{}");
          } catch {
            jsonResponse = {};
          }
        }
      }
      return NextResponse.json(jsonResponse, { status: 200 });
    }

    const baseSchema =
      responseType === "keywords"
        ? z.object({ keywords: z.array(z.string()) })
        : z.object({
            chain_of_thought: z.string(),
            context_summary: z.string(),
            top_nodes: z.array(z.object({ id: z.string(), text: z.string() })),
          });

    const completion = await invokeWithSchema(baseSchema, "AskJson", {
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    });

    let jsonResponse: any = completion.choices?.[0]?.message?.parsed || {};
    if (typeof jsonResponse === "string") {
      try {
        jsonResponse = JSON.parse(jsonResponse);
      } catch {
        jsonResponse = {};
      }
    }
    if (!jsonResponse || (typeof jsonResponse === "object" && Object.keys(jsonResponse).length === 0)) {
      const fallback = await invokeWithSchema(baseSchema, "AskJsonFix", {
        model,
        messages: [
          { role: "system", content: "Fix and return valid JSON ONLY." },
          { role: "user", content: prompt },
        ],
      });
      jsonResponse = fallback.choices?.[0]?.message?.parsed || {};
      if (typeof jsonResponse === "string") {
        try {
          jsonResponse = JSON.parse(jsonResponse);
        } catch {
          jsonResponse = {};
        }
      }
    }

    return NextResponse.json(jsonResponse, { status: 200 });
  } catch (error) {
    console.error("Error in /api/llm/openai/ask-json:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "Failed to get JSON from LLM",
        hint: msg,
      },
      { status: 500 },
    );
  }
}

