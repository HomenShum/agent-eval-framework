/** @jest-environment node */
export {};

// Ensure env before imports
process.env.SKIP_DATABASE_URL = "true";
process.env.VERCEL_ENV = "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = "test-user";
process.env.OPENAI_API_KEY = "test";

jest.mock("openai", () => {
  let next = { choices: [{ message: { content: '{"title":"📊 Reorganized Knowledge Base","children":[]}' } }] } as any;
  const mockImpl: any = {
    __set: (r: any) => (next = r),
    chat: {
      completions: {
        create: jest.fn(async () => next),
      },
    },
  };
  return { __esModule: true, default: jest.fn(() => mockImpl), mockImpl } as any;
});
const { mockImpl: openaiMockOrg } = jest.requireMock("openai");
const orgRoute = require("./route");
const ORG_POST = orgRoute.POST;

function makeReq(body: any) {
  const headers = new Headers();
  return { headers, json: async () => body } as any;
}

describe("OpenAI /organization-mode route", () => {
  it("returns a valid outline JSON", async () => {
    const notes = [
      { id: "1", text: "A" },
      { id: "2", text: "B" },
    ];
    const res = await ORG_POST(makeReq({ notes }));
    const json = await (res as any).json();
    expect(json.outline.title).toMatch(/Reorganized/);
  });

  it("repairs bad JSON when needed", async () => {
    openaiMockOrg.__set({ choices: [{ message: { content: "not json" } }] });
    const notes = [{ id: "1", text: "A" }];
    // second call (repair) returns valid
    let calls = 0;
    openaiMockOrg.chat.completions.create.mockImplementation(async () => {
      calls++;
      if (calls === 1) return { choices: [{ message: { content: "oops" } }] };
      return { choices: [{ message: { content: '{"title":"ok","children":[]}' } }] };
    });
    const res = await ORG_POST(makeReq({ notes }));
    const json = await (res as any).json();
    expect(json.outline.title).toBe("ok");
  });
});
