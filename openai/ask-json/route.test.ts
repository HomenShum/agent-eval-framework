/** @jest-environment node */
export {};

// Ensure env before imports
process.env.SKIP_DATABASE_URL = "true";
process.env.VERCEL_ENV = "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = "test-user";
process.env.OPENAI_API_KEY = "test";

// Mock OpenAI SDK
jest.mock("openai", () => {
  let nextResponse: any = { choices: [{ message: { content: '{"keywords":["a","b"]}' } }] };
  const mockImpl: any = {
    __setResponse: (r: any) => (nextResponse = r),
    chat: {
      completions: {
        create: jest.fn(async () => nextResponse),
      },
    },
  };
  return { __esModule: true, default: jest.fn(() => mockImpl), mockImpl } as any;
});

const { mockImpl: openaiMockAskJson } = jest.requireMock("openai");
const { POST: ASK_JSON_POST } = require("./route");

function makeReq(body: any) {
  const headers = new Headers();
  return { headers, json: async () => body } as any;
}

describe("OpenAI /ask-json route", () => {
  it("returns parsed JSON for keywords", async () => {
    openaiMockAskJson.__setResponse({ choices: [{ message: { content: '{"keywords":["x","y"]}' } }] });
    const res = await ASK_JSON_POST(makeReq({ prompt: "Extract keywords", responseType: "keywords" }));
    expect(res.status).toBe(200);
    const json = await (res as any).json();
    expect(json.keywords).toEqual(["x", "y"]);
  });

  it("repairs invalid JSON via fallback", async () => {
    // First call returns invalid JSON
    let callCount = 0;
    openaiMockAskJson.chat.completions.create.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return { choices: [{ message: { content: "oops" } }] } as any;
      return { choices: [{ message: { content: '{"fixed":true}' } }] } as any;
    });
    const res = await ASK_JSON_POST(makeReq({ prompt: "Return JSON" }));
    const json = await (res as any).json();
    expect(json.fixed).toBe(true);
  });
});
