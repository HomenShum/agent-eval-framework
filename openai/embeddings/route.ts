// mew/src/app/api/llm/openai/embeddings/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import { resolveTestUserId } from "../testUser";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const EmbeddingRequestSchema = z.object({
  contents: z
    .array(
      z.object({
        text: z.string().min(1).max(10000),
        nodeId: z.string().optional(),
      }),
    )
    .min(1)
    .max(100),
});

async function createEmbeddingsBatch(inputs: string[]) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: inputs,
    encoding_format: "float",
  });
  return res.data.map((d) => d.embedding);
}

export async function POST(req: Request) {
  try {
    const userId = resolveTestUserId(req);
    const body = await req.json();
    const parsed = EmbeddingRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          code: "BAD_REQUEST",
          message: "Invalid request",
          hint: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { contents } = parsed.data;

    let attempts = 0;
    const maxAttempts = 3;
    let lastErr: any;

    while (attempts < maxAttempts) {
      try {
        const embeddings = await createEmbeddingsBatch(contents.map((c) => c.text));
        const mapped = embeddings.map((values, idx) => ({
          nodeId: contents[idx].nodeId,
          values,
          dimensions: values.length, // Expected 1536 for text-embedding-3-small
        }));

        console.log(`OpenAI embeddings generated for user ${userId}: ${mapped.length} items`);

        return NextResponse.json({
          embeddings: mapped,
          count: mapped.length,
          model: "text-embedding-3-small",
          expected_dimensions: 1536,
        });
      } catch (err: any) {
        lastErr = err;
        attempts += 1;
        const status = err?.status || err?.response?.status;
        if (status === 429 && attempts < maxAttempts) {
          const backoff = Math.pow(2, attempts - 1) * 1000 + Math.random() * 1000;
          console.warn(`OpenAI rate limit hit, retrying in ${Math.round(backoff)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        break;
      }
    }

    console.error(`Embedding generation failed for user ${userId}:`, lastErr);
    return NextResponse.json(
      {
        code: "SERVICE_UNAVAILABLE",
        message: "Failed to generate embeddings",
        hint: "The AI service is temporarily unavailable. Please try again later.",
      },
      { status: 503 },
    );
  } catch (error) {
    console.error("Unexpected error in OpenAI embeddings endpoint:", error);
    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
        hint: "Check server logs for details.",
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
