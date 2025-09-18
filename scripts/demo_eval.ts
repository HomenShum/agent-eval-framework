import fs from "fs";
import path from "path";
import { Example, scoreExample, aggregate } from "../lib/eval/mini";

function loadExamples(relPath: string): Example[] {
  const p = path.join(process.cwd(), "Interview", "dataset", relPath);
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error(`Expected array in ${p}`);
  return data as Example[];
}

function runDataset(label: string, relPath: string) {
  const examples = loadExamples(relPath);
  const results = examples.map(scoreExample);
  const agg = aggregate(results);
  // Compact one-line summary
  console.log(`${label}: P=${agg.macro_precision} R=${agg.macro_recall} F1=${agg.macro_f1}`);
}

try {
  runDataset("Banking", "banking_toy_examples.json");
  runDataset("AI Research", "ai_research_toy_examples.json");
} catch (err) {
  console.error(String(err));
  process.exit(1);
}

