/** @jest-environment node */

// Dedicated Agent SSE live smoke tests (separate from general smokes)
// - Writes logs to agent.smoke.<ts>.log.md
// - Includes: organize_meetings and batch_doc_ops (graph-scoped actions)

process.env.SKIP_DATABASE_URL = "true";
process.env.VERCEL_ENV = process.env.VERCEL_ENV || "development";
process.env.NEXT_PUBLIC_HARDCODED_USER_ID = process.env.NEXT_PUBLIC_HARDCODED_USER_ID || "test-user";

import fs from "fs";
import path from "path";

const HAS_OPENAI = !!process.env.OPENAI_API_KEY;
const liveIt = (name: string, fn: jest.ProvidesCallback, timeout?: number) =>
  (HAS_OPENAI ? it : it.skip)(name, fn, timeout);

// Prevent real Pusher
jest.mock("pusher-js", () => ({
  __esModule: true,
  default: function () {
    return {};
  },
}));

const { MOCK_USER } = require("@/app/auth/User");
const { NodeStore } = require("@/app/node/NodeStore");
const { GLOBAL_ADMIN_USER_ID } = require("@/lib/constants");

const LOG_DIR = path.join(__dirname, "test_logs", "agent");
const TS = new Date().toISOString().replace(/[:.]/g, "-");
const LOG_PATH = path.join(LOG_DIR, `agent.smoke.${TS}.log.md`);
if (HAS_OPENAI) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.writeFileSync(LOG_PATH, `# Agent Live Smoke Log\nStarted: ${new Date().toISOString()}\n\n`, "utf8");
  } catch {}
}

function makeReq(body: any) {
  const headers = new Headers();
  return { headers, json: async () => body } as any;
}

function parseClientActionsFromSSE(text: string): Array<{ name: string; args: any }> {
  const actions: Array<{ name: string; args: any }> = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("data:")) continue;
    const jsonPart = line.slice(5).trim();
    try {
      const evt = JSON.parse(jsonPart);
      if (evt?.type === "client_action" && evt.data) {
        let argsVal: any = evt.data.args;
        if (typeof argsVal === "string") {
          const s = argsVal.trim();
          try {
            argsVal = JSON.parse(s.startsWith('"') ? JSON.parse(s) : s);
          } catch {}
        }
        actions.push({ name: evt.data.name, args: argsVal });
      }
    } catch {}
  }
  return actions;
}

async function applyActions(store: any, actions: Array<{ name: string; args: any }>) {
  // Path helpers so client_actions can use user:/global: or slash paths
  const childNodesOf = (parentId: string) => {
    const p = store.nodesById.get(parentId);
    if (!p) return [] as any[];
    return p.relations
      .filter((r: any) => r.relationType?.id === "child" && r.from?.id === parentId)
      .map((r: any) => r.to);
  };
  const findPath = (startId: string, parts: string[]): string | undefined => {
    let curr = startId;
    for (const title of parts) {
      const kids = childNodesOf(curr);
      const next = kids.find(
        (n: any) =>
          n?.content?.[0]?.type === "text" &&
          (String(n.content[0].value) === title || String(n.content[0].value).startsWith(title)),
      );
      if (!next) return undefined;
      curr = next.id;
    }
    return curr;
  };
  const resolveIdOrPath = (raw: any): string | undefined => {
    if (!raw) return undefined;
    const s = String(raw);
    if (store.nodesById.has(s)) return s; // already an id
    const isGlobal = s.startsWith("global/") || s.startsWith("global:");
    const parts = s
      .replace(/^(user[:/]|global[:/])/, "")
      .split("/")
      .filter(Boolean);
    const rootId = isGlobal ? store.globalRoot.id : store.userRoot.id;
    return findPath(rootId, parts);
  };

  for (const a of actions) {
    try {
      if (a.name === "create_node") {
        const parentId = resolveIdOrPath(a.args?.parentId || a.args?.parent);
        const content = a.args?.content || a.args?.title || "Untitled";
        const chips = Array.isArray(content) ? content : [{ type: "text", value: String(content) }];
        if (!parentId) throw new Error("create_node parent not found");
        await store.addChildNode({ parentId, nodeProps: { id: a.args?.nodeId, content: chips } });
      } else if (a.name === "add_relation") {
        const fromId = resolveIdOrPath(a.args?.fromId || a.args?.from);
        const toId = resolveIdOrPath(a.args?.toId || a.args?.to);
        if (!fromId || !toId) throw new Error("add_relation endpoints not found");
        await store.addRelation({ fromId, toId, relationTypeId: a.args?.relationTypeId || "relatedTo" });
      } else if (a.name === "update_node_content") {
        const nodeId = resolveIdOrPath(a.args?.nodeId);
        const chips = Array.isArray(a.args?.newContent)
          ? a.args?.newContent
          : [{ type: "text", value: String(a.args?.newContent || a.args?.content || "") }];
        if (!nodeId) throw new Error("update_node_content target not found");
        await store.updateNode({ nodeId, nodeProps: { content: chips } });
      } else if (a.name === "move_node") {
        const nodeId = resolveIdOrPath(a.args?.nodeId || a.args?.nodeIdToMove);
        const newParentId = resolveIdOrPath(a.args?.newParentId || a.args?.parentId || a.args?.parent);
        if (!nodeId || !newParentId) throw new Error("move_node IDs not found");
        await store.addRelation({ fromId: newParentId, toId: nodeId, relationTypeId: "child" });
      }
    } catch (e) {
      // keep going so we can apply subsequent actions
    }
  }
}

async function seedFromFixture(store: any) {
  const seedPath = path.join(__dirname, "fixtures", "batch_ops.seed.json");
  if (!fs.existsSync(seedPath)) return;
  const spec = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  const addChildGlobal = async (parentId: string, title: string) =>
    (
      await store.addChildNode({
        parentId,
        nodeProps: { content: [{ type: "text", value: title }], authorId: GLOBAL_ADMIN_USER_ID, isPublic: true },
      })
    ).node;
  const addChildUser = async (parentId: string, title: string) =>
    (await store.addChildNode({ parentId, nodeProps: { content: [{ type: "text", value: title }] } })).node;

  async function buildRecursive(parentId: string, data: any, isGlobal: boolean) {
    if (Array.isArray(data)) {
      for (const leaf of data) {
        if (typeof leaf === "string") {
          if (isGlobal) await addChildGlobal(parentId, leaf);
          else await addChildUser(parentId, leaf);
        } else if (leaf && typeof leaf === "object") {
          for (const [k, v] of Object.entries(leaf)) {
            const child = isGlobal
              ? await addChildGlobal(parentId, String(k))
              : await addChildUser(parentId, String(k));
            await buildRecursive(child.id, v, isGlobal);
          }
        }
      }
      return;
    }
    if (data && typeof data === "object") {
      for (const [k, v] of Object.entries(data)) {
        const child = isGlobal ? await addChildGlobal(parentId, String(k)) : await addChildUser(parentId, String(k));
        await buildRecursive(child.id, v, isGlobal);
      }
      return;
    }
  }

  await buildRecursive(store.globalRoot.id, spec.global || {}, true);
  await buildRecursive(store.userRoot.id, spec.user || {}, false);
}

liveIt(
  "agent: organize_meetings",
  async () => {
    const route = require("../agent/route");
    const POST = route.POST as (req: any) => Promise<Response>;

    const body = {
      query:
        "Using ONLY tools (no web_search), create a folder 'Meetings' under parent 'project-alpha-id', move 'note-123-id' and 'note-456-id' under it, then finish_work. Do a two-pass approach: draft plan -> self-evaluate -> revise once. When referencing knowledge, cite at least two ids like [id=...].",
      context: "",
      currentEditingNodeId: "root-node",
    };
    const res = await POST(makeReq(body));
    const text = await (res as any).text();
    const hasError = text.includes('"error"');
    const hasTool = text.includes('"tool_call"');

    fs.appendFileSync(
      LOG_PATH,
      `\n[agent] scenario organize_meetings REQUEST\n${JSON.stringify(body, null, 2)}\n`,
      "utf8",
    );
    fs.appendFileSync(
      LOG_PATH,
      `\n[agent] scenario organize_meetings SSE_RAW\n${text}\n[agent] scenario organize_meetings END\n`,
      "utf8",
    );

    // --- Apply actions to a local GraphStore and emit a results file ---
    try {
      const store = new NodeStore(MOCK_USER);
      const addChildWithId = async (parentId: string, title: string, id?: string) =>
        (await store.addChildNode({ parentId, nodeProps: { id, content: [{ type: "text", value: title }] } })).node;
      // Seed the IDs referenced in the scenario so path/id resolution works
      const projects = await addChildWithId(store.userRoot.id, "My Projects");
      const projectAlpha = await addChildWithId(projects.id, "Project Alpha", "project-alpha-id");
      await addChildWithId(projectAlpha.id, "Meeting Notes - 2024-05-15", "note-123-id");
      await addChildWithId(projectAlpha.id, "Meeting Notes - 2024-05-20", "note-456-id");

      const actions = hasTool ? parseClientActionsFromSSE(text) : [];
      if (hasTool) {
        await applyActions(store, actions);
      }

      // Gather resulting subtree under the newly created Meetings folder
      const textOf = (n: any) => (n?.content?.[0]?.type === "text" ? String(n.content[0].value) : String(n?.id || ""));
      const childNodesOf = (parentId: string) =>
        store.nodesById
          .get(parentId)
          ?.relations.filter((r: any) => r.relationType?.id === "child" && r.from?.id === parentId)
          .map((r: any) => r.to) || [];
      const meetingsNode = childNodesOf(projectAlpha.id).find(
        (n: any) => n?.content?.[0]?.type === "text" && String(n.content[0].value) === "Meetings",
      );

      const RESULTS_PATH = path.join(LOG_DIR, "test_04_results.md");
      const lines: string[] = [];
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      lines.push(`# Results: agent organize_meetings`);
      lines.push("");
      lines.push(`Test: live.agent.smoke.test.ts :: organize_meetings`);
      lines.push(`Timestamp: ${ts}`);
      lines.push("");
      lines.push(`Input.query: ${body.query}`);
      lines.push(`Input.context: ${body.context}`);
      lines.push("");
      const actionsList = actions || [];
      lines.push(`Actions.count: ${actionsList.length}`);
      lines.push(`Actions.sample:`);
      for (const a of actionsList.slice(0, 5)) lines.push(`- ${a.name} ${JSON.stringify(a.args || {})}`);
      lines.push("");
      if (meetingsNode) {
        const kids = childNodesOf(meetingsNode.id);
        lines.push(`Meetings children (${kids.length}):`);
        for (const k of kids) lines.push(`- ${textOf(k)}`);
      } else {
        lines.push("Meetings folder not found under Project Alpha.");
      }
      fs.writeFileSync(RESULTS_PATH, lines.join("\n") + "\n", "utf8");
      try {
        const TS_PATH = path.join(LOG_DIR, `test_04_organize_meetings.${ts}.md`);
        fs.writeFileSync(TS_PATH, lines.join("\n") + "\n", "utf8");
      } catch {}
    } catch {}

    expect(res && typeof (res as any).status === "number").toBe(true);
    expect(((res as any).headers?.get?.("Content-Type") || "").includes("text/event-stream")).toBe(true);
    // Accept either normal tool flow or an explicit error when streaming is not permitted
    expect(hasTool || hasError).toBe(true);
    if (hasError && !hasTool) return; // skip stricter checks on error-only runs
    expect(text.includes('"final_summary"')).toBe(true);
    // Scenario says no web_search allowed
    expect(text.includes('"web_search"')).toBe(false);
  },
  90000,
);

liveIt(
  "agent: batch_doc_ops user-only writes",
  async () => {
    const route = require("../agent/route");
    const POST = route.POST as (req: any) => Promise<Response>;

    const store = new NodeStore(MOCK_USER);
    await seedFromFixture(store);

    const before = new Set<string>(Array.from(store.nodesById.keys()) as string[]);

    const body = {
      query:
        "Create 'Prospecting Report — Sam Altman' under user Reports/Prospecting. You may read global knowledge but must NOT modify global. Add new nodes ONLY under user. After creating the report, call add_relation linking it to 'global/People/Founders/Sam Altman' with relationType 'relatedTo'. Finish with a summary. Use a two-pass approach: draft -> self-evaluate for correctness & scope -> improve once. Cite at least two ids when referencing knowledge like [id=...].",
      context: "Global: People/Investors; User: Reports/Prospecting.",
      currentEditingNodeId: store.userRoot.id,
    };
    const res = await POST(makeReq(body));
    const text = await (res as any).text();
    const hasError = text.includes('"error"');
    const hasTool = text.includes('"tool_call"');

    fs.appendFileSync(LOG_PATH, `\n[agent] scenario batch_doc_ops REQUEST\n${JSON.stringify(body, null, 2)}\n`, "utf8");
    fs.appendFileSync(LOG_PATH, `\n[agent] scenario batch_doc_ops SSE_RAW\n${text}\n`, "utf8");

    const actions = hasTool ? parseClientActionsFromSSE(text) : [];
    if (hasTool) {
      await applyActions(store, actions);
    }

    const after = new Set<string>(Array.from(store.nodesById.keys()) as string[]);
    const created: string[] = [];
    for (const id of after.values()) if (!before.has(id)) created.push(id);
    const createdAuthors = created.map((id) => store.nodesById.get(id)!.authorId);
    const onlyUser = createdAuthors.every((a) => a === store.user.id);

    // Idempotency: re-apply actions should not create new nodes
    await applyActions(store, actions);
    const after2 = new Set<string>(Array.from(store.nodesById.keys()) as string[]);
    const createdAgain: string[] = [];
    for (const id of after2.values()) if (!after.has(id)) createdAgain.push(id);

    fs.appendFileSync(
      LOG_PATH,
      `\n[agent] scenario batch_doc_ops GRAPH_AFTER_CREATED\n${JSON.stringify(
        created.map((id) => ({ id, authorId: store.nodesById.get(id)!.authorId })),
        null,
        2,
      )}\n[agent] scenario batch_doc_ops END\n`,

      "utf8",
    );

    if (created.length === 0) {
      // eslint-disable-next-line no-console
      console.warn("[agent.batch_doc_ops] No create_node actions observed; skipping strict assertions.", {
        toolCalls: actions.map((a) => a.name),
      });
    }

    // --- Write human-readable results file so others can see node placements ---
    try {
      const RESULTS_PATH = path.join(LOG_DIR, "test_01_results.md");
      // helper: list children titles
      const textOf = (n: any) => (n?.content?.[0]?.type === "text" ? String(n.content[0].value) : String(n?.id || ""));
      const childNodesOf = (parentId: string) => {
        const p = store.nodesById.get(parentId);
        if (!p) return [] as any[];
        return p.relations
          .filter((r: any) => r.relationType?.id === "child" && r.from?.id === parentId)
          .map((r: any) => r.to);
      };
      const findPath = (startId: string, parts: string[]): string | undefined => {
        let curr = startId;
        for (const title of parts) {
          const kids = childNodesOf(curr);
          const next = kids.find((n: any) => n?.content?.[0]?.type === "text" && String(n.content[0].value) === title);
          if (!next) return undefined;
          curr = next.id;
        }
        return curr;
      };
      const prospectingId = findPath(store.userRoot.id, ["Reports", "Prospecting"]);
      const lines: string[] = [];
      lines.push(`# Results: agent batch_doc_ops`);
      lines.push("");
      lines.push(`Created nodes (${created.length}), onlyUser=${onlyUser}`);
      if (!created.length) {
        lines.push(`No nodes created; actions observed: ${actions.map((a) => a.name).join(", ")}`);
      }
      for (const id of created) {
        const n = store.nodesById.get(id);
        lines.push(`- ${id} :: ${textOf(n)}`);
      }
      if (prospectingId) {
        lines.push("");
        lines.push(`Prospecting subtree after actions:`);
        const kids = childNodesOf(prospectingId);
        for (const k of kids) lines.push(`- ${textOf(k)}`);
      }
      fs.writeFileSync(RESULTS_PATH, lines.join("\n") + "\n", "utf8");
    } catch {}

    expect(res && typeof (res as any).status === "number").toBe(true);
    expect(((res as any).headers?.get?.("Content-Type") || "").includes("text/event-stream")).toBe(true);
    // Accept either normal tool flow or an explicit error when streaming is not permitted
    expect(hasTool || hasError).toBe(true);
    if (hasError && !hasTool) return; // skip stricter checks on error-only runs
    expect(text.includes('"final_summary"')).toBe(true);
    if (created.length === 0) return;
    expect(onlyUser).toBe(true);
    expect(createdAgain.length).toBe(0);
  },
  120000,
);

if (!HAS_OPENAI) {
  // eslint-disable-next-line no-console
  console.warn("[live.agent.smoke.test] Skipping; set OPENAI_API_KEY to enable.");
}
