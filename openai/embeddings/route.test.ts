/** @jest-environment node */
export {};

// Ensure env before imports
process.env.SKIP_DATABASE_URL = "true";
process.env.VERCEL_ENV = "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = "test-user";
process.env.OPENAI_API_KEY = "test";

// Mock OpenAI SDK
jest.mock("openai", () => {
  const mockImpl: any = {
    embeddings: {
      create: jest.fn(async (opts: any) => {
        const inputs: string[] = Array.isArray(opts.input) ? opts.input : [opts.input];
        const one = new Array(1536).fill(0.01);
        return { data: inputs.map(() => ({ embedding: one })) } as any;
      }),
    },
  };
  return { __esModule: true, default: jest.fn(() => mockImpl) };
});

const { POST: EMBED_POST } = require("./route");

function makeReq(body: any) {
  const headers = new Headers();
  return { headers, json: async () => body } as any;
}

describe("OpenAI /embeddings route", () => {
  it("returns 1536-dim vectors and nodeIds", async () => {
    const body = {
      contents: [
        { text: "a", nodeId: "1" },
        { text: "b", nodeId: "2" },
      ],
    };
    const res = await EMBED_POST(makeReq(body));
    expect(res.status).toBe(200);
    const json = await (res as any).json();
    expect(json.model).toBe("text-embedding-3-small");
    expect(json.expected_dimensions).toBe(1536);
    expect(json.embeddings).toHaveLength(2);
    expect(json.embeddings[0].dimensions).toBe(1536);
    expect(json.embeddings[0].nodeId).toBe("1");
  });

  it("400 on invalid body", async () => {
    const res = await EMBED_POST(makeReq({ contents: [] }));
    expect(res.status).toBe(400);
  });
});
