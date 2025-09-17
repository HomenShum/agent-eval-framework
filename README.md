# OpenAI Eval Backend

A public-friendly backend that exposes the same LLM routes we use internally to prototype agentic workflows, JSON extractions, embeddings, and RAG context gathering. The code is written with Next.js Route Handlers in mind, but runs as standalone TypeScript modules backed by the official OpenAI SDK and a deterministic test-user harness so you can evaluate behaviors without shipping production auth.
## Quick Start

1) Install

```bash
npm install
```

2) Configure environment

```bash
# copy the template and fill in secrets
cp .env.example .env
# set your OpenAI key if you plan to run live calls
# mocked tests do NOT require this
OPENAI_API_KEY=sk-your-key
```

3) Run tests (auto: live when key is set; mocked otherwise)

- macOS/Linux
```bash
export OPENAI_API_KEY=sk-your-key && npm test
```
- Windows PowerShell
```powershell
$env:OPENAI_API_KEY='sk-your-key'; npm test
```

Note: When OPENAI_API_KEY is present, Jest automatically includes live OpenAI tests under `openai/__tests__/`. Without the key, it runs the mocked unit/e2e tests only.

4) Plug routes into your app (Next.js example)

```ts
// app/api/llm/openai/ask/route.ts
export { POST } from "openai/ask/route";
```


## Highlights

- **Agent streaming endpoint** (`agent/route.ts`) driving a multi-tool workflow with server sent events.
- **Prompting sandboxes** for free-form chat (`ask`), JSON enforcing (`ask-json`), and response-shaping presets (`ask-mode`).
- **RAG helpers** for context gathering and organization mode experiments.
- **Embeddings API** with built-in retry/backoff ready for vector stores.
- **Evaluation scaffolding** under `openai/__tests__` that shows how we smoke-test agents, run regression evals, and capture rich logs.
- **No auth middleware required** — requests default to a reproducible test user id or honor an `x-test-user-id` header for multi-user simulations.

## Project structure

```
+-- openai/
|   +-- agent/
|   |   +-- helpers.ts
|   |   +-- route.ts
|   |   `-- *.test.ts
|   +-- ask/
|   +-- ask-json/
|   +-- ask-mode/
|   +-- embeddings/
|   +-- gather-context/
|   +-- organization-mode/
|   +-- __tests__/        # smoke & eval harnesses + log snapshots
|   +-- errors.ts
|   `-- testUser.ts
+-- jest.config.ts
+-- package.json
+-- tsconfig.json
`-- README.md
```

Each `route.ts` file exports an async `POST` function that you can plug into Next.js, Remix, or any Fetch-compatible server. Shared helpers (OpenAI agent orchestration, streaming utilities, etc.) live alongside the routes for ease of reuse.

## Detailed setup

1. **Install dependencies**
   ```bash
   npm install
   ```
   Node.js 18.17+ is required for native `fetch`, `Headers`, and `ReadableStream` support.

2. **Configure environment**
   Create a `.env` file (or export variables through your shell):
   ```ini
   OPENAI_API_KEY=sk-your-key
   # Optional — overrides the default demo user id used by tests and examples
   PUBLIC_TEST_USER_ID=demo-user-123
   ```

3. **Run the Jest suite**
   Unit tests use `ts-jest` and run entirely against mocks so they are safe to execute without network access:
   ```bash
   npm test
   ```
   Evaluations in `openai/__tests__/live.*` illustrate how we collect smoke/eval logs. They are disabled by default; adapt them to your own datastore before running.

4. **Drop a route into your app**
   Example (Next.js 14 route handler):
   ```ts
   // app/api/llm/openai/ask/route.ts
   export { POST } from "openai/ask/route";
   ```

## Deterministic test-user harness

Authentication middleware has been stripped for the public release. Instead, the helper `openai/testUser.ts` resolves a stable user id:

```ts
import { resolveTestUserId } from "openai/testUser";

export async function POST(req: Request) {
  const userId = resolveTestUserId(req); // "test-user" unless you pass x-test-user-id
  // ...route logic...
}
```

- Pass `x-test-user-id` to simulate different tenants.
- Set `PUBLIC_TEST_USER_ID` (or the historical `NEXT_PUBLIC_HARDCODED_USER_ID`) for deterministic evals.

## Tests & evaluation

- Auto preference: if `OPENAI_API_KEY` is set, Jest includes the live OpenAI tests under `openai/__tests__/` in addition to the mocked suite. If it’s unset, only mocked tests run (no network, no cost).
- Run all tests:
  ```bash
  npm test
  ```
- Run a single test or pattern:
  ```bash
  npx jest openai/agent/e2e.agent.graph-actions.test.ts -t "E2E: Agent"
  ```
- What the suite uses by default:
  - OpenAI SDK is mocked → deterministic, fast, cost-free.
  - Vector DB/Pinecone calls are mocked.
- Optional live smokes (real OpenAI calls):
  1) Set env vars (see .env.example)
     ```bash
     export OPENAI_API_KEY=sk-your-key
     # export OPENAI_BASE_URL=... # if using a gateway/Azure
     ```
  2) Run the live tests (if present) or your own smokes:
     ```bash
     npx jest openai/__tests__/live.*.test.ts
     ```

Logs & artifacts:
- `openai/__tests__/test_logs/` contains markdown/JSON transcripts you can feed into your reporting pipeline.
- SSE streams in tests are deterministic so you can diff behavior across model/prompt changes.

## Available endpoints

| Route | Description |
|-------|-------------|
| `agent/route.ts` | Streams multi-step agent execution with tool call plumbing via `StreamingUIManager`. |
| `ask/route.ts` | Simple text responses using Chat Completions stream API. |
| `ask-json/route.ts` | Enforces JSON output via `zodResponseFormat`, includes strict RAG synthesis mode. |
| `ask-mode/route.ts` | Prebaked modes (draft, critique, synthesize) for fast UX prototyping. |
| `gather-context/route.ts` | Re-ranks retrieved context and balances local/global knowledge before RAG synthesis. |
| `organization-mode/route.ts` | Generates hierarchical outlines with citations for note collections. |
| `embeddings/route.ts` | Batches text into `text-embedding-3-small` vectors with retry/backoff. |

## Examples: Data and expected output

Example 1 — Agent creates a small hierarchy of notes

- Input prompt (user message):

```text
Please create an overview titled "AGI Safety" with a child section "Technical Approaches".
```

- Stream highlights (SSE):

```jsonl
{"type":"tool_call","name":"create_node","args":{"parentId":"root-x","content":"AGI Safety - A Structured Overview"}}
{"type":"client_action","action":"create_node","payload":{"parentId":"root-x","content":"AGI Safety - A Structured Overview","nodeId":"..."}}
{"type":"tool_call","name":"create_node","args":{"parentId":"<id of AGI Safety>","content":"Technical Approaches"}}
{"type":"client_action","action":"create_node","payload":{"parentId":"<id of AGI Safety>","content":"Technical Approaches","nodeId":"..."}}
{"type":"final_summary","text":"Created overview and child section."}
```

- Final hierarchy (conceptual):

```text
user/
└─ Notes/
   └─ AGI Safety - A Structured Overview (id: n1-…)
      └─ Technical Approaches (id: n2-…)
```

Example 2 — Embeddings route

- Request body:

```json
{"contents":["hello world","vectorize this"],"userId":"test-user"}
```

- Response shape (truncated):

```json
{
  "embeddings":[
    {"values":[...],"dimensions":1536},
    {"values":[...],"dimensions":1536}
  ]
}
```

## Next steps

- Plug the handlers into your framework of choice and wire any required storage adapters.
- Extend the Jest suites with your own fixtures — the SSE helpers make it easy to assert end-to-end behaviors.
- Replace test-user stubs with real auth middleware when you are ready for production.

Contributions welcome! Feel free to open issues or PRs for additional tools, eval recipes, or provider integrations.
