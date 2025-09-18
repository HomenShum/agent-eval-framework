/** @jest-environment node */
export {};

/**
 * End-to-end style test for Agent that exercises:
 * - Server-Sent Events (SSE) from the /api/llm/openai/agent route
 * - Tool invocation flow (streaming function-call args → tool execution)
 * - Client actions emitted by the agent (create_node, add_relation, etc.)
 * - Applying those client actions to an in-memory Graph to verify final state
 *
 * This test does NOT call the real OpenAI API. It provides a streaming mock
 * that emulates the orchestrator producing function calls for a realistic
 * multi-step task. For live tests against OpenAI, see the plan in the
 * conversation: add a separate, env-gated smoke test.
 */

// Minimal env so auth + envBackend don't fail
process.env.SKIP_DATABASE_URL = "true";
process.env.VERCEL_ENV = "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = "test-user";
process.env.OPENAI_API_KEY = "test-key"; // not used live in this test

// --- OpenAI mock that supports per-test scenarios --------------------------------
// We use a single mock with overridable factories so each test can choose a stream
// and non-stream completion behavior without re-mocking the module.
jest.mock("openai", () => {
  const mock = {
    __setStream: (factory: () => AsyncIterable<any>) => {
      mock._streamFactory = factory;
    },
    __setNonStreamResponse: (resp: any) => {
      mock._nonStreamResp = resp;
    },
    _streamFactory: () => ({
      [Symbol.asyncIterator]: async function* () {
        // default no-op stream
        yield { choices: [{ delta: {} }] };
      },
    }),
    _nonStreamResp: { choices: [{ message: { content: "OK" } }] },
    chat: {
      completions: {
        create: jest.fn(async (opts: any) => {
          if (opts.stream) {
            return mock._streamFactory();
          }
          return mock._nonStreamResp;
        }),
      },
    },
  } as any;
  return { __esModule: true, default: jest.fn(() => mock), mock } as any;
});
const { mock: openaiMock } = jest.requireMock("openai");

// Route import AFTER env + mocks
const agentRoute = require("./route");
const AGENT_POST = agentRoute.POST as (req: any) => Promise<Response>;

// --- Simple in-memory graph to apply client actions --------------------------------
class Graph {
  nodes = new Map<string, { id: string; text: string; parentId?: string }>();
  children = new Map<string, string[]>();
  relations: Array<{ from: string; to: string; type: string }> = [];

  createNode(parentId: string | undefined, id: string, text: string) {
    this.nodes.set(id, { id, text, parentId });
    if (parentId) {
      const arr = this.children.get(parentId) || [];
      arr.push(id);
      this.children.set(parentId, arr);
    }
  }
  updateNodeContent(id: string, text: string) {
    const n = this.nodes.get(id);
    if (n) this.nodes.set(id, { ...n, text });
  }
  moveNode(id: string, newParentId: string) {
    const n = this.nodes.get(id);
    if (!n) return;
    // remove from old parent
    if (n.parentId) {
      const arr = (this.children.get(n.parentId) || []).filter((x) => x !== id);
      this.children.set(n.parentId, arr);
    }
    // add to new parent
    const arr2 = this.children.get(newParentId) || [];
    arr2.push(id);
    this.children.set(newParentId, arr2);
    this.nodes.set(id, { ...n, parentId: newParentId });
  }
  addRelation(from: string, to: string, type: string) {
    this.relations.push({ from, to, type });
  }
}

function parseSSEToEvents(sseText: string): Array<{ type: string; data: any }> {
  const events: Array<{ type: string; data: any }> = [];
  for (const line of sseText.split(/\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith("data:")) {
      const json = trimmed.slice(5).trim();
      try {
        const obj = JSON.parse(json);
        events.push(obj);
      } catch {
        // ignore parse errors from partial lines
      }
    }
  }
  return events;
}

function applyClientAction(graph: Graph, action: { name: string; args: any }) {
  const { name, args } = action;
  switch (name) {
    case "create_node":
      graph.createNode(args.parentId, args.nodeId, args.content || "");
      break;
    case "update_node_content":
      graph.updateNodeContent(args.nodeId, args.newContent || "");
      break;
    case "move_node":
      graph.moveNode(args.nodeIdToMove, args.newParentId);
      break;
    case "add_relation":
      graph.addRelation(
        args.fromNodeId || args.fromId || args.from,
        args.toNodeId || args.toId || args.to,
        args.relationType || args.relationTypeId || "relatedTo",
      );
      break;
    default:
      // other actions (delete_node etc.) can be added as needed
      break;
  }
}

function makeReq(body: any) {
  const headers = new Headers();
  return { headers, json: async () => body } as any;
}

/**
 * Scenario: "Create Knowledge Connections"
 *
 * Command (conceptually):
 *   /agent Find connections between my notes on "climate change" and "renewable energy" and link them
 *
 * What we emulate here:
 * - Orchestrator streams a sequence of tool calls:
 *    1) create_node (content: "My Existing Thoughts") under current node
 *    2) add_relation (from: existing-thoughts-id, to: climate-note-id, type: relatedTo)
 *    3) finish_work (summary)
 * - The agent executes tools, and emits client_action events we apply to our Graph
 * - We assert final Graph has the created node and a relation recorded
 */
test("E2E: Agent creates a node and links two notes via add_relation", async () => {
  const CURRENT = "root-node";
  const CREATED = "created-node-1";
  const EXISTING = "existing-thoughts-id";
  const CLIMATE = "climate-note-id";

  // Program the streaming mock: stream tool_calls with arguments in chunks
  openaiMock.__setStream(
    () =>
      ({
        [Symbol.asyncIterator]: async function* () {
          // 1) create_node name announcement
          yield {
            choices: [{ delta: { tool_calls: [{ index: 0, function: { name: "create_node", arguments: "" } }] } }],
          };
          // accumulate args for create_node
          yield { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '{"parentId":"' } }] } }] };
          yield { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: CURRENT } }] } }] };
          yield {
            choices: [
              { delta: { tool_calls: [{ index: 0, function: { arguments: '","content":"My Existing Thoughts"}' } }] } },
            ],
          };

          // 2) add_relation name announcement
          yield {
            choices: [{ delta: { tool_calls: [{ index: 1, function: { name: "add_relation", arguments: "" } }] } }],
          };
          // accumulate args for add_relation
          yield { choices: [{ delta: { tool_calls: [{ index: 1, function: { arguments: '{"fromNodeId":"' } }] } }] };
          yield { choices: [{ delta: { tool_calls: [{ index: 1, function: { arguments: EXISTING } }] } }] };
          yield { choices: [{ delta: { tool_calls: [{ index: 1, function: { arguments: '","toNodeId":"' } }] } }] };
          yield { choices: [{ delta: { tool_calls: [{ index: 1, function: { arguments: CLIMATE } }] } }] };
          yield {
            choices: [
              { delta: { tool_calls: [{ index: 1, function: { arguments: '","relationType":"relatedTo"}' } }] } },
            ],
          };

          // 3) finish_work
          yield {
            choices: [
              {
                delta: {
                  tool_calls: [
                    {
                      index: 2,
                      function: {
                        name: "finish_work",
                        arguments: '{"summary_of_work_done":"Linked notes and created helper node"}',
                      },
                    },
                  ],
                },
              },
            ],
          };
        },
      }) as any,
  );

  // Non-stream completion used by execute_direct_request if invoked. Not used here but safe to set.
  openaiMock.__setNonStreamResponse({ choices: [{ message: { content: "OK" } }] });

  const res = await AGENT_POST(
    makeReq({
      query: "Find connections between my notes on climate change and renewable energy and link them",
      context: "- Climate note (ID: climate-note-id)\n- Energy note (ID: renewable-note-id)",
      currentEditingNodeId: CURRENT,
    }),
  );

  expect(res.headers.get("Content-Type")).toMatch(/text\/event-stream/);
  const sse = await (res as any).text();
  const events = parseSSEToEvents(sse);

  // Apply only client_action events to our in-memory graph
  const graph = new Graph();
  for (const e of events) {
    if (e.type === "client_action") applyClientAction(graph, e.data);
  }

  // Assertions: Created node and the relation should exist
  // Created node text should be "My Existing Thoughts" with parent CURRENT (provided via client_action payload)
  const createdNode = Array.from(graph.nodes.values()).find((n) => n.text === "My Existing Thoughts");
  expect(createdNode).toBeTruthy();
  expect(createdNode?.parentId).toBe(CURRENT);

  // Relation: relatedTo from EXISTING → CLIMATE
  expect(graph.relations).toEqual(
    expect.arrayContaining([expect.objectContaining({ from: EXISTING, to: CLIMATE, type: "relatedTo" })]),
  );

  // Final summary event should be present
  const final = events.find((e) => e.type === "final_summary");
  expect(final).toBeTruthy();
  expect(final?.data?.summary).toMatch(/Agent session finished|Linked notes/);
});

/**
 * Scenario (bonus): "Research and Create Notes" (trimmed)
 * - Demonstrates multiple create_node actions. We keep it short and deterministic.
 */
test("E2E: Agent creates a small hierarchy of notes", async () => {
  const CURRENT = "root-x";

  openaiMock.__setStream(
    () =>
      ({
        [Symbol.asyncIterator]: async function* () {
          // create_node A
          yield {
            choices: [{ delta: { tool_calls: [{ index: 0, function: { name: "create_node", arguments: "" } }] } }],
          };
          yield {
            choices: [
              {
                delta: {
                  tool_calls: [
                    {
                      index: 0,
                      function: { arguments: '{"parentId":"root-x","content":"AGI Safety - A Structured Overview"}' },
                    },
                  ],
                },
              },
            ],
          };
          // create_node B
          yield {
            choices: [{ delta: { tool_calls: [{ index: 1, function: { name: "create_node", arguments: "" } }] } }],
          };
          yield {
            choices: [
              {
                delta: {
                  tool_calls: [
                    { index: 1, function: { arguments: '{"parentId":"root-x","content":"Technical Approaches"}' } },
                  ],
                },
              },
            ],
          };
          // finish
          yield {
            choices: [
              {
                delta: {
                  tool_calls: [
                    {
                      index: 2,
                      function: { name: "finish_work", arguments: '{"summary_of_work_done":"Created outline"}' },
                    },
                  ],
                },
              },
            ],
          };
        },
      }) as any,
  );

  const res = await AGENT_POST(
    makeReq({ query: 'Research "AGI safety" comprehensively...', context: "", currentEditingNodeId: CURRENT }),
  );
  const sse = await (res as any).text();
  const events = parseSSEToEvents(sse);

  const graph = new Graph();
  for (const e of events) if (e.type === "client_action") applyClientAction(graph, e.data);

  const titles = Array.from(graph.nodes.values()).map((n) => n.text);
  expect(titles).toEqual(expect.arrayContaining(["AGI Safety - A Structured Overview", "Technical Approaches"]));
});
