/*
Mini Evaluation Suite — Overview & Walkthroughs

Purpose
- Deterministic, zero-network scoring of short bullet outputs against canonical tags.
- Used for live demos/interviews to show evaluation thinking without external dependencies.

How it works
- Each example has bullets (predicted content) and expected_tags (ground truth labels).
- We derive predicted_tags by scanning bullets for canonical tags or their synonyms.
- We compute per-example precision/recall/F1 and macro-average across the set.

Run locally
- npm test -s -- openai/__tests__/mini_eval.test.ts

Walkthrough A: Quick start (5–7 min)
1) Open Interview/dataset/toy_examples.json (5 examples).
2) Review TAG_SYNONYMS below to see what labels/synonyms are recognized.
3) Run the test to see macro P/R/F1 and per-example scores.
4) Add a new tag or synonym, re-run, observe score changes.

Walkthrough B: Swap in model outputs (10–12 min)
1) Produce bullets via your preferred route (e.g., /api/llm/openai/ask-json) with a structured layout.
2) Replace bullets for an example, keep expected_tags as ground truth.
3) Re-run the eval; discuss gaps (false positives/negatives) and next prompt or data changes.
4) Optionally, show /agent SSE traces to visualize planning, tool calls, and “proofs”.

Design notes
- Normalization: lowercase, strip punctuation, collapse whitespace to stabilize matching.
- Determinism: no randomness, no network calls; results are reproducible.
- Metrics: precision, recall, F1 (rounded to 3 decimals for readability).
- Extensibility: expand TAG_SYNONYMS and the dataset as your taxonomy grows.

Limitations
- Simple string containment — good for demos; for production use, consider richer matchers
  (tokenization, stemming, embedding-based similarity, or a small classifier).
*/

export type Example = {
  id: string;
  prompt: string;
  bullets: string[]; // generated or hand-authored output to score
  expected_tags: string[]; // canonical tags to check against
};

export type EvalResult = {
  id: string;
  predicted_tags: string[];
  expected_tags: string[];
  precision: number;
  recall: number;
  f1: number;
};

// Simple tag dictionary + synonyms.
// Add domain-specific tags/synonyms here to make the scoring deterministic.
const TAG_SYNONYMS: Record<string, string[]> = {
  // Core agentic topics
  "agentic frameworks": ["agentic", "agents", "planning+execution", "tool calls", "tool-calls"],
  "context engineering": ["context", "retrieval", "RAG", "prompting", "grounding", "context windows"],
  "evaluation": ["eval", "metrics", "score", "precision", "recall", "f1", "rubric"],
  "demo": ["walkthrough", "mini", "showcase"],
  "projects": ["work", "case studies", "deliverables", "builds"],

  // Banking prospecting
  "banking prospecting": ["prospecting", "banking", "banks", "financial institutions", "pipeline", "crm", "deal sourcing"],
  "lead qualification": ["qualification", "qualify leads", "fit", "icp", "budget", "authority", "timeline", "bant"],
  "risk compliance": ["risk", "compliance", "kyc", "aml", "regulatory", "policy", "controls"],
  "products": ["product", "offerings", "lending", "payments", "treasury", "wealth"],
  "outreach": ["outreach", "email", "sequence", "follow-up", "contact", "prospect"],

  // AI agent academic research + notes
  "literature review": ["literature", "papers", "survey", "review", "citations"],
  "note organization": ["notes", "note-taking", "organization", "linking", "graph", "zettelkasten"],
  "agent tools": ["tools", "tool calls", "actions", "plugins", "apis"],
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

export function tagsFromBullets(bullets: string[]): string[] {
  const pred = new Set<string>();
  const joined = normalize(bullets.join("\n"));
  for (const [canonical, synonyms] of Object.entries(TAG_SYNONYMS)) {
    const tokens = [canonical, ...synonyms].map(normalize);
    for (const t of tokens) {
      if (t && joined.includes(t)) {
        pred.add(canonical);
        break;
      }
    }
  }
  return Array.from(pred);
}

export function scoreExample(ex: Example): EvalResult {
  const expected = Array.from(new Set(ex.expected_tags.map(normalize)));
  const predicted = Array.from(new Set(tagsFromBullets(ex.bullets).map(normalize)));
  const expSet = new Set(expected);
  const predSet = new Set(predicted);
  let tp = 0;
  for (const p of predSet) if (expSet.has(p)) tp++;
  const precision = predSet.size ? tp / predSet.size : 0;
  const recall = expSet.size ? tp / expSet.size : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  return {
    id: ex.id,
    predicted_tags: predicted,
    expected_tags: expected,
    precision: round3(precision),
    recall: round3(recall),
    f1: round3(f1),
  };
}

export function aggregate(results: EvalResult[]): { macro_precision: number; macro_recall: number; macro_f1: number } {
  if (results.length === 0) return { macro_precision: 0, macro_recall: 0, macro_f1: 0 };
  const p = results.reduce((s, r) => s + r.precision, 0) / results.length;
  const r = results.reduce((s, r) => s + r.recall, 0) / results.length;
  const f1 = results.reduce((s, r) => s + r.f1, 0) / results.length;
  return { macro_precision: round3(p), macro_recall: round3(r), macro_f1: round3(f1) };
}

// Per-tag precision/recall/F1 across a set of examples.
// Uses union of all predicted and expected tags found in the results.
export function perTagMetrics(results: EvalResult[]): Record<string, { precision: number; recall: number; f1: number; tp: number; fp: number; fn: number }> {
  const allTags = new Set<string>();
  for (const r of results) {
    r.predicted_tags.forEach(t => allTags.add(t));
    r.expected_tags.forEach(t => allTags.add(t));
  }
  const scores: Record<string, { precision: number; recall: number; f1: number; tp: number; fp: number; fn: number }> = {};
  for (const tag of allTags) {
    let tp = 0, fp = 0, fn = 0;
    for (const r of results) {
      const pred = new Set(r.predicted_tags);
      const exp = new Set(r.expected_tags);
      if (pred.has(tag) && exp.has(tag)) tp++;
      else if (pred.has(tag) && !exp.has(tag)) fp++;
      else if (!pred.has(tag) && exp.has(tag)) fn++;
    }
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    scores[tag] = { precision: round3(precision), recall: round3(recall), f1: round3(f1), tp, fp, fn };
  }
  return scores;
}

function round3(x: number) {
  return Math.round(x * 1000) / 1000;
}

