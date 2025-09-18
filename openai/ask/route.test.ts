/** @jest-environment node */
export {};

// Ensure required env is set BEFORE importing modules
process.env.SKIP_DATABASE_URL = "true";
process.env.VERCEL_ENV = "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = "test-user";
process.env.OPENAI_API_KEY = "test";

// Mock OpenAI SDK
jest.mock("openai", () => {
  const mockImpl: any = {
    chat: {
      completions: {
        create: jest.fn(async (opts: any) => {
          if (opts.stream) {
            // Return an async iterable stream yielding two chunks
            const chunk1 = { choices: [{ delta: { content: "Hello" } }] };
            const chunk2 = { choices: [{ delta: { content: " world" } }] };
            return {
              [Symbol.asyncIterator]: async function* () {
                yield chunk1;
                yield chunk2;
              },
            } as any;
          }
          // Non-stream path not used in this test
          return { choices: [{ message: { content: "" } }] } as any;
        }),
      },
    },
  };
  return { __esModule: true, default: jest.fn(() => mockImpl) };
});

const { POST: ASK_POST } = require("./route");

function makeReq(body: any) {
  // Minimal request object: headers + json() for the handler
  const headers = new Headers();
  return { headers, json: async () => body } as any;
}

describe("OpenAI /ask route", () => {
  it("streams plain text from OpenAI chat", async () => {
    const req = makeReq({ prompt: "Say hi" });
    const res = await ASK_POST(req as any);
    expect(res.headers.get("Content-Type")).toMatch(/text\/plain/);
    const text = await (res as any).text();
    expect(text).toBe("Hello world");
  });

  it("400 on invalid body", async () => {
    const req = makeReq({ prompt: "" });
    const res = await ASK_POST(req as any);
    expect(res.status).toBe(400);
  });
});
