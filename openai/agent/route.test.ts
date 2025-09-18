/** @jest-environment node */
export {};

// Ensure env before imports
process.env.SKIP_DATABASE_URL = "true";
process.env.VERCEL_ENV = "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = "test-user";
process.env.OPENAI_API_KEY = "test";

// Sophisticated OpenAI mock that supports streaming tool calls and non-stream completions
jest.mock("openai", () => {
  const openaiAgentMockInternal = {
    __setStream: (genFactory: () => AsyncIterable<any>) => {
      openaiAgentMockInternal._streamFactory = genFactory;
    },
    __setNonStreamResponse: (resp: any) => {
      openaiAgentMockInternal._nonStreamResp = resp;
    },
    _streamFactory: () => ({
      [Symbol.asyncIterator]: async function* () {
        yield { choices: [{ delta: {} }] };
      } as any,
    }),
    _nonStreamResp: { choices: [{ message: { content: "Direct answer" } }] },
    chat: {
      completions: {
        create: jest.fn(async (opts: any) => {
          if (opts.stream) {
            return openaiAgentMockInternal._streamFactory();
          }
          return openaiAgentMockInternal._nonStreamResp;
        }),
      },
    },
  } as any;
  return { __esModule: true, default: jest.fn(() => openaiAgentMockInternal), mock: openaiAgentMockInternal } as any;
});

const { mock: openaiAgentMock } = jest.requireMock("openai");
const agentRoute = require("./route");
const AGENT_POST = agentRoute.POST;
const { TEST_USER_HEADER, DEFAULT_TEST_USER_ID } = require("../testUser");

function makeReq(body: any, userId: string = DEFAULT_TEST_USER_ID) {
  const headers = new Headers([[TEST_USER_HEADER, userId]]);
  return { headers, json: async () => body } as any;
}

describe("OpenAI /agent route", () => {
  it("streams tool_call arguments and final_summary events", async () => {
    // Stream that calls execute_direct_request with args
    openaiAgentMock.__setStream(
      () =>
        ({
          [Symbol.asyncIterator]: async function* () {
            // announce function name
            yield {
              choices: [
                { delta: { tool_calls: [{ index: 0, function: { name: "execute_direct_request", arguments: "" } }] } },
              ],
            };
            // stream args
            yield { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '{"user_query":' } }] } }] };
            yield { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '"Test Q"' } }] } }] };
            yield {
              choices: [
                { delta: { tool_calls: [{ index: 0, function: { arguments: ',"parent_node_id":"current_node"}' } }] } },
              ],
            };
          },
        }) as any,
    );

    // Non-stream completion for the tool implementation
    openaiAgentMock.__setNonStreamResponse({ choices: [{ message: { content: "Direct answer" } }] });

    const res = await AGENT_POST(
      makeReq({
        query: "Please help",
        context: "- Context (ID: x)",
        currentEditingNodeId: "current_node",
      }),
    );

    expect(res.headers.get("Content-Type")).toMatch(/text\/event-stream/);
    const text = await (res as any).text();
    expect(text).toMatch(/"type":"tool_call"/);
    expect(text).toMatch(/execute_direct_request/);
    expect(text).toMatch(/"type":"final_summary"/);
  });
});
