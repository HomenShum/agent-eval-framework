/** @jest-environment node */
export {};

// Ensure env before imports
process.env.SKIP_DATABASE_URL = "true";
process.env.VERCEL_ENV = "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = "test-user";
process.env.OPENAI_API_KEY = "test";

jest.mock("openai", () => {
  const mockImpl: any = {
    chat: {
      completions: {
        create: jest.fn(async (opts: any) => {
          if (opts.stream) {
            const chunk1 = { choices: [{ delta: { content: "Answer " } }] };
            const chunk2 = { choices: [{ delta: { content: "[1]" } }] };
            return {
              [Symbol.asyncIterator]: async function* () {
                yield chunk1;
                yield chunk2;
              },
            } as any;
          }
          return { choices: [{ message: { content: "" } }] } as any;
        }),
      },
    },
  };
  return { __esModule: true, default: jest.fn(() => mockImpl) };
});

const { POST: ASK_MODE_POST } = require("./route");

function makeReq(body: any) {
  const headers = new Headers();
  return { headers, json: async () => body } as any;
}

describe("OpenAI /ask-mode route", () => {
  it("streams synthesized answer with citations", async () => {
    const res = await ASK_MODE_POST(
      makeReq({
        query: "What are the key risks?",
        finalContext: "- Risk A (ID: a)\n- Risk B (ID: b)",
        sources: [{ index: 1, id: "a", title: "A" }],
      }),
    );
    const text = await (res as any).text();
    expect(text).toBe("Answer [1]");
  });
});
