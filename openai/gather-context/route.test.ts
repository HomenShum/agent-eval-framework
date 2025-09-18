/** @jest-environment node */
export {};

// Ensure env before imports
process.env.SKIP_DATABASE_URL = "true";
process.env.VERCEL_ENV = "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = "test-user";
process.env.OPENAI_API_KEY = "test";

const { POST: GC_POST } = require("./route");

jest.mock("openai", () => {
  const mockImpl: any = {
    chat: {
      completions: {
        create: jest.fn(async () => ({
          choices: [{ message: { content: '{"selected_ids":["a"]}' } }],
        })),
      },
    },
  };
  return { __esModule: true, default: jest.fn(() => mockImpl) };
});

function makeReq(body: any) {
  const headers = new Headers();
  return { headers, json: async () => body } as any;
}

describe("OpenAI /gather-context route", () => {
  it("prunes retrieved nodes based on model-selected ids and appends conversational context", async () => {
    const body = {
      query: "Tell me about X",
      rawContext: {
        conversational: [{ id: "conv1", text: "hi", children: [] }],
        retrieved: [
          { id: "a", text: "Alpha", children: [] },
          { id: "b", text: "Bravo", children: [] },
        ],
      },
    };
    const res = await GC_POST(makeReq(body));
    expect(res.status).toBe(200);
    const json = await (res as any).json();
    expect(json.prunedIds).toContain("b");
    expect(json.finalContext).toMatch(/Alpha/);
    expect(json.finalContext).not.toMatch(/Bravo/);
    expect(json.finalContext).toMatch(/hi/);
  });
});
