# Master Test Summary and Walkthrough

Date: 2025-09-17

This document summarizes the current test suite status and provides a concise walkthrough of what each group of tests demonstrates. It also points to the most recent real SSE capture.

## Latest test run (summary)
- Test suites: 18 passed, 1 skipped (19 total)
- Tests: 55 passed, 16 skipped, 71 total
- Skipped tests: live tests that require OPENAI_API_KEY (safe-by-default gating)

How to re-run:
- Full suite: `npm test`
- Deterministic SSE capture only: `npm run -s demo:capture-sse`
- Live SSE capture (requires OPENAI_API_KEY): `npm run -s demo:capture-sse:live`
- Compact mini-eval: `npm run -s demo:eval:compact`

## Most recent SSE capture (real, preflight)
Path: Interview/sse_samples/ai_research.preflight.sse.log

````text
(data) {"type":"tool_call","data":{"name":"search_academic","args":{"query":"AGI safety site:arxiv.org"}}}

(data) {"type":"tool_result","data":{"name":"search_academic","result":{"hits":2},"success":true}}

(data) {"type":"final_summary","data":{"summary":"Agent session finished (preflight).","stats":{}}}

(data) {"type":"end","data":{"ok":true}}
````

Notes:
- “Preflight” runs are deterministic, designed for repeatable demos.
- Live runs (with OPENAI_API_KEY) will produce similar shape but may vary in details; live logs are redacted for domains/URLs.

## Walkthrough by test area

### Agent route and SSE streaming
- Files:
  - openai/agent/route.test.ts (mocked, stable)
  - openai/agent/e2e.agent.graph-actions.test.ts (end-to-end style with streaming tool-calls)
  - openai/__tests__/capture_sse.test.ts (writes deterministic SSE logs under Interview/sse_samples)
  - openai/__tests__/capture_sse.live.test.ts (env-gated live capture with redaction)
- Purpose:
  - Validate Server-Sent Events flow: tool_call deltas → tool execution → client_action emissions → final_summary/end.
  - Ensure incremental function-call args accumulation and client action sequencing.
- Notes:
  - Show how the agent streams function names/args, executes tools, and emits client_actions like create_node/add_relation.
  - Contrast preflight (deterministic) vs live (real API, redacted).

### Ask / Ask-JSON routes
- Files:
  - openai/ask/route.test.ts
  - openai/ask-json/route.test.ts
  - openai/ask-mode/route.test.ts
  - openai/organization-mode/route.test.ts
- Purpose:
  - Validate normal Q&A, structured JSON responses, and organization/ask modes.
- Notes:
  - Highlight consistent model usage (gpt-5-mini) and no unsupported params (e.g., temperature removed where required).

### Embeddings and RAG
- Files:
  - openai/embeddings/route.test.ts
  - openai/__tests__/live.rag.smoke.test.ts (env-gated)
  - openai/__tests__/live.rag.smoke.eval.test.ts (env-gated mini-eval of RAG synthesis)
- Purpose:
  - Validate embeddings API usage and basic RAG synthesis paths.
- Notes:
  - Show instrumentation lines (counts per user) and how RAG output is validated at a high level.

### URL parsing + utilities
- Files:
  - openai/__tests__/url_parser.test.ts
  - openai/testUser.test.ts
- Purpose:
  - Validate URL extraction/normalization and testing scaffolds for user identity in tests.
- Notes:
  - Emphasize robust parsing/normalization for downstream use.

### Mini evaluation suite
- Files:
  - openai/__tests__/mini_eval.test.ts
- Purpose:
  - Deterministic label matching with macro Precision/Recall/F1 summarization for two small datasets (Banking, AI Research).
- Notes:
  - Show clean console summary; discuss how to extend datasets and tags.


## Metrics: precision, recall, F1, accuracy (how we calculate)

Context
- Task type: multi-label tagging per example (small, deterministic datasets under Interview/dataset).
- Predicted tags: derived from output bullets via a fixed TAG_SYNONYMS dictionary.
- Expected tags: canonical labels provided in the dataset for each example.

Per-example scoring (set-based)
- TP (true positive): predicted tag is in expected set
- FP (false positive): predicted tag is not in expected set
- FN (false negative): expected tag not predicted
- Precision = TP / (TP + FP)  (0 if denominator is 0)
- Recall = TP / (TP + FN)     (0 if denominator is 0)
- F1 = 2 * (Precision * Recall) / (Precision + Recall)  (0 if P+R is 0)
- We round to 3 decimals for readability.

Aggregation across the dataset
- Macro averages: mean of per-example Precision, Recall, and F1.
  - This weights each example equally (not each tag).
- What we report today: macro Precision, macro Recall, macro F1.

Accuracy (optional, stricter)
- Exact-set accuracy (subset accuracy): 1 if predicted tag set equals expected tag set exactly; else 0.
- Dataset accuracy: mean of per-example exact matches.
- We don’t print accuracy in the current console summary; it’s easy to add but is often harsh for multi-label tasks (one extra or missing tag makes an example 0).

Tied to our toy datasets
- Banking (5 examples): macro ≈ P 0.80, R 1.00, F1 0.867
- AI Research (5 examples): macro ≈ P 0.767, R 0.933, F1 0.814
- Example (from Banking b2): expected set has 1 tag; prediction has 2 tags including the correct one → TP=1, FP=1, FN=0 → P=0.5, R=1.0, F1≈0.667.

Reference (implementation)
- Computation lives in lib/eval/mini.ts → scoreExample (per-example) and aggregate (macro averages).


## Tag rationale (compact reference for walkthroughs)

Banking dataset

| Example | Bullet phrase (excerpt) | Tag(s) |
|---|---|---|
| b1 | "Prospecting banks; build pipeline in CRM." | banking prospecting |
| b1 | "lending, payments, treasury products" | products |
| b1 | "Draft initial outreach" | outreach |
| b2 | "BANT" / "ICP" | lead qualification |
| b3 | "KYC/AML"; "regulatory requirements" | risk compliance |
| b4 | "Email outreach"; "Follow-up sequence" | outreach |
| b5 | "Prospecting continues" | banking prospecting |
| b5 | "Qualify leads" | lead qualification |
| b5 | "schedule outreach" | outreach |

AI Research dataset

| Example | Bullet phrase (excerpt) | Tag(s) |
|---|---|---|
| r1 | "Literature review of agent papers and surveys" | literature review |
| r1 | "frameworks and tool usage patterns" | agent tools |
| r1 | "context windows and retrieval grounding" | context engineering |
| r2 | "Notes organized; bidirectional linking (graph)" | note organization |
| r2 | "Zettelkasten style" | note organization |
| r3 | "Context engineering for retrieval and grounding" | context engineering |
| r4 | "agent actions and plugin calls" | agent tools |
| r4 | "tool-call traces" | agent tools |
| r5 | "precision, recall, F1" | evaluation |
| r5 | "Scoring outputs against expected labels" | evaluation |

Toy examples dataset

| Example | Bullet phrase (excerpt) | Tag(s) |
|---|---|---|
| ex1 | "planning+execution" / "tool calls" | agentic frameworks |
| ex1 | "demo" / "walkthrough" | demo |
| ex2 | "Context engineering ... retrieval and grounding" | context engineering |
| ex3 | "precision, recall, and F1" | evaluation |
| ex4 | "case studies"; "deliverables"; "builds" | projects |
| ex5 | "agentic ... planning and tool-calls" | agentic frameworks |
| ex5 | "Context engineering ... retrieval/grounding" | context engineering |
| ex5 | "evaluation using precision/recall/F1" | evaluation |
| ex5 | "builds" | projects |
| ex5 | "demo walkthrough" | demo |



> Why measurement matters as we add agents/tools
> - More agents/tools = more decision points and subtle failure modes.
> - P/R/F1 make trade‑offs visible (recall gains vs precision losses).
> - Deterministic eval catches drift from prompt/synonym changes early.
> - CI thresholds prevent “cool demo, worse system.”
> - Per‑tag F1 highlights exactly which areas regressed so fixes are targeted.

## Explaining agentic frameworks and multi‑agent use cases

What is an agentic framework?
- An architecture where a reasoning loop plans, calls tools, observes results, and updates state until goals are met.
- Core loop: plan → act (tool_call) → observe (tool_result) → reflect → next plan → … → final_summary.
- In our code, this shows up in the agent route and SSE stream as tool_call → tool_result → client_action events.

Why it matters
- Robustness: external tools (search, DB, APIs) are first‑class; failures and retries are visible.
- Transparency: streaming makes intermediate decisions legible.
- Extensibility: add tools or change planning prompts without rewriting business logic.

Patterns you can name in conversation
- Planner–Executor: a planner proposes steps; an executor performs tool calls and returns observations.
- Router/Specialist: a router chooses the right specialist (tool or sub‑agent) based on the query.
- Supervisor–Workers (multi‑agent): a supervisor assigns tasks to worker agents and integrates results.
- Debate/Reflection: multiple proposals compete; reflection consolidates into a final plan.
- Retrieval‑Augmented: a retrieval “cortex” supplies facts; an actor agent decides actions.

How our repo demonstrates this
- Single‑agent with tool use and streaming:
  - openai/agent/route.ts streams tool_call deltas → executes tools → emits client_action updates → final_summary.
  - The SSE capture file shows the exact sequence deterministically in preflight mode.
- Tooling surface (examples): search, knowledge graph updates, relation linking.
- Evaluation surface: mini‑eval provides deterministic scoring to track functional correctness of outputs.

Link to the datasets/tags
- Tags like "agentic frameworks", "agent tools", and "context engineering" in the toy datasets map directly to these patterns.
- Banking/AI Research examples demonstrate how specific phrases in bullets trigger those tags via TAG_SYNONYMS.

Multi‑agent use cases and how to describe them using our building blocks
- Supervisor–Workers: The current agent can act as a supervisor; workers can be implemented as separate route handlers or tools that encapsulate specialized prompts.
- Router–Specialist: Implement a simple router tool that classifies intents (e.g., prospecting vs research) and dispatches to specialist tools/agents.
- Blackboard/Memory: Use the NodeStore‑like client_actions to persist intermediate notes/relations, enabling agents to share context.
- Verification step: Add a “reflection” tool that re‑reads outputs and scores them (can reuse mini‑eval ideas.)

60‑second whiteboard script you can reuse
- Draw the loop: plan → act (tool) → observe → reflect; label the SSE events under each arrow.
- Point to deterministic SSE log (preflight) and show 2–3 lines: tool_call, tool_result, final_summary.
- Mention how to extend to multi‑agent: add a router or supervisor that invokes sub‑agents as tools.
- Close with: “We keep it measurable via mini‑eval (macro P/R/F1) so changes are trackable.”

## How to run the demos
1) Show deterministic SSE capture generation:
   - Command: `npm run -s demo:capture-sse`
   - Open the newest log in Interview/sse_samples and walk through the events (tool_call → tool_result → final_summary → end).
2) Optional: Show live SSE capture with redaction:
   - Set OPENAI_API_KEY, then run: `npm run -s demo:capture-sse:live`
   - Explain redaction and why live runs are non-deterministic.
3) Show compact evaluation results:
   - Command: `npm run -s demo:eval:compact`
   - Discuss macro P/R/F1 and how the eval can be extended.

## Log cleanup policy
- To keep the repository trim, only the most recent SSE log is retained in Interview/sse_samples.
- You can regenerate deterministic logs anytime with `npm run -s demo:capture-sse` (this will produce fresh logs, after which you can repeat cleanup as needed).

