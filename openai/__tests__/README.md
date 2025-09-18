# OpenAI Live Tests and Evaluation

This folder contains live smoke tests, evaluation tests, and supporting fixtures for the OpenAI integration. Tests are environment‑gated and designed to validate real LLM behavior with strict RAG guarantees, agent tool policies, and reproducible logs.

## Test Suites

- live.smoke.test.ts
  - Mixed: mock GraphStore scenarios and optional live route/SDK smokes (env‑gated)
  - Includes a strict RAG JSON synthesis route test (ask-json, responseType="rag_synthesis")
- live.smoke.eval.test.ts
- live.rag.smoke.test.ts
  - End‑to‑end RAG smoke with strict citation and mixed‑source balance enforcement
- live.rag.smoke.eval.test.ts
  - Evaluates RAG results and reports metrics (precision/recall proxies), env‑gated thresholds
- live.agent.smoke.test.ts
  - Agent SSE live smoke for core scenarios (organize_meetings, batch_doc_ops)
  - Writes timestamped human‑readable logs under **tests**/test_logs/
- live.agent.smoke.eval.test.ts
  - LLM judge evaluates the latest agent log; also enforces protocol/tool gates and optional strict citations

## Quickstart (Commands)

To run the live smokes and evals end-to-end in a fresh terminal with dotenv auto-loaded:

```bash
# Set local env
$env:OPENAI_API_KEY="your-key"
$env:PERPLEXITY_API_KEY="your-key"

# Core mixed smoke (route/SDK + mock GraphStore)
yarn test --testPathPattern="live.smoke.test.ts" --verbose
yarn test --testPathPattern="live.smoke.eval.test.ts" --verbose

# RAG-focused tests
yarn test --testPathPattern="live.rag.smoke.test.ts" --verbose
yarn test --testPathPattern="live.rag.smoke.eval.test.ts" --verbose

# Agent-focused tests (generates latest agent log)
yarn test --testPathPattern="live.agent.smoke.test.ts" --verbose
yarn test --testPathPattern="live.agent.smoke.eval.test.ts" --verbose
```

## Case Explanations (What we verify)

- Research and Create Notes:
  - Agent can synthesize from context and create new notes; citations are enforced when RAG is used
- Update existing notes:
  - Agent finds existing nodes and updates content while preserving history
- Organize meetings and move nodes:
  - Agent creates a "Meetings" folder under a specified parent, re-parents notes correctly, and finishes work
- Create knowledge connections:
  - Agent adds relations (e.g., relatedTo) between relevant nodes
- Batch document operations:
  - Agent creates reports under user/Reports/Prospecting; user-only writes are enforced
- RAG synthesis quality:
  - Strict JSON (bullets, citations, claims_to_citations), whitelist compliance, and mixed local/global balance
- Protocol and policies:
  - Two-pass (draft → self_eval → revise) where applicable; forbidden tools never used in disallowed scenarios

## Target Users and Use Cases

- Knowledge workers (analysts, researchers): synthesize insights with citations
- Investors / bankers: founder and firm research, market intel, academic grounding
- General users: organize notes, update existing knowledge, build relationships between nodes

Representative use cases covered:

- Research and Create Notes
- Update existing notes while preserving history
- Organize meetings and move/reparent nodes
- Create relationships (e.g., relatedTo)
- Batch document operations under user/Reports/Prospecting
- RAG personalized recommendations, contextual update, smart organization, relationship discovery
- Constraints: read‑only research scenarios, forbidden tools in specific flows, two‑pass agent protocol

## What Success Looks Like (RAG JSON)

When calling /api/llm/openai/ask-json with responseType="rag_synthesis", we require STRICT JSON:

- bullets: [{ id: string, text: string }, ...]
- citations: [string, ...] // must be drawn ONLY from AllowedCitationIds
- claims_to_citations: [{ id: string, cites: [string, ...] }, ...]
- Every bullet.id must appear in claims_to_citations with ≥1 cite
- If both LocalIds and GlobalIds are available, include ≥2 citations overall with at least one local and one global

Example (abbreviated):

{
"bullets": [
{ "id": "c1", "text": "Founder raised Series B in 2024 [id=docA][id=docB]" },
{ "id": "c2", "text": "Go‑to‑market targets enterprise buyers [id=docB]" }
],
"citations": ["docA", "docB"],
"claims_to_citations": [
{ "id": "c1", "cites": ["docA", "docB"] },
{ "id": "c2", "cites": ["docB"] }
]
}

Inputs that enable strictness:

- finalContext: prebuilt context string
- allowedCitationIds: whitelist of source IDs
- sourcesMeta: [{ id, origin: "user" | "global" }] (enables mixed‑source balance)

## Live Smoke Design

- Environment‑gated: tests run live only if keys are available (see Env Vars below)
- Human‑readable logs: **tests**/test_logs/<rag|agent>.smoke.<ISO>.log.md
- SSE logging: full raw SSE appended with clear scenario markers for robust parsing
- Route‑level error schema: { code, message, hint } for non‑200 responses
- Performance: optional p50/p95 gating via env

## Evaluation Method (LLM as Judge)

- Agent eval

  - Reads the latest agent.smoke.<timestamp>.log.md
  - Uses gpt‑5‑mini with response_format: json_schema to produce structured ratings
  - Enforces:
    - final_summary present exactly once
    - two‑pass protocol (draft → self_eval → revise) when self‑eval path used
    - user‑only writes for batch_doc_ops
    - optional tool sequence gates
    - optional strict citations (≥2) via env
  - Writes per‑scenario results and a Summary block back to the same log

- RAG eval
  - Computes retrieval/response quality proxies and supports CI gating via env

## Environment Variables

- Required for live tests

  - OPENAI_API_KEY
  - PERPLEXITY_API_KEY (only for web search scenarios)

- Optional strict gates
  - JUDGE_ENFORCE=1
  - JUDGE_MIN_PASS_RATE=0.8
  - AGENT_REQUIRE_CITATIONS=1 # enforce ≥2 citations in agent eval
  - AGENT_EXPECT_SEQUENCE=plan,find_nodes,graph_rag_answer,create_node
  - ROUTE_P95_MS=2000 # route latency gate in smokes
  - WEB_FRESHNESS_DAYS=7 # enforce web result recency in eval

Note: dotenv is auto‑loaded for all tests from .env.test.local, then .env.local, then .env.

## Commands

- Generate agent logs (required before agent eval):

  - yarn test --testPathPattern="live.agent.smoke.test.ts" --verbose

- Run agent eval (LLM judge over latest log):

  - yarn test --testPathPattern="live.agent.smoke.eval.test.ts" --verbose

- RAG live smoke and eval:

  - yarn test --testPathPattern="live.rag.smoke.test.ts" --verbose
  - yarn test --testPathPattern="live.rag.smoke.eval.test.ts" --verbose

- Full mixed smoke (with route/SDK checks and mock GraphStore flows):
  - yarn test --testPathPattern="live.smoke.test.ts" --verbose

## Data and Fixtures

- **tests**/fixtures/batch_ops.seed.json seeds a realistic global/user hierarchy
- gather‑context + ask‑mode: use sourcesMeta and allowedCitationIds to enforce balanced citations and whitelisting
- ask-json (rag_synthesis): strict JSON mode with claims_to_citations coverage; fallback repair if the model returns empty/invalid JSON

## Tips

- If eval skips: ensure OPENAI_API_KEY is available to Jest and that a fresh agent log exists
- If RAG answers lack balance: pass both LocalIds and GlobalIds in sourcesMeta and ensure allowedCitationIds includes both
- To tighten CI: enable JUDGE_ENFORCE and set thresholds in env
