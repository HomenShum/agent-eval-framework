# RAG Smoke Evaluation Output
SourceLog: rag.smoke.2025-09-17T22-12-34-406Z.log.md
EvaluatedAt: 2025-09-17T22:12:34.439Z


## RAG Eval — Summary
{
  "summaryAt": "2025-09-17T22:12:34.441Z",
  "overallPassRate": null,
  "ragPassRate": null,
  "p95LatencyMs": 0,
  "thresholds": {
    "overallPassRate": ">=0.80",
    "ragLayerPassRate": ">=0.70",
    "hitAt3": ">=0.60",
    "p95LatencyMs": "<=60000 (eval)"
  }
}
# RAG Smoke Evaluation Output
SourceLog: rag.smoke.2025-09-17T22-12-34-406Z.log.md
EvaluatedAt: 2025-09-17T22:15:45.587Z


## RAG Eval — combined
{
  "scenario": "combined",
  "expectations": "mixed",
  "pass": true,
  "metrics": {
    "hit3": 1,
    "precision": 1,
    "recall": 0.6666666666666666,
    "mrr": 0.75,
    "goldPrecision": 0,
    "goldRecall": 0,
    "goldMRR": 0,
    "citationCount": 2,
    "localHit": true,
    "claimsBacked100": true,
    "durationMs": 4846,
    "tokens": 1232
  },
  "judge": {}
}

## RAG Eval — user_only
{
  "scenario": "user_only",
  "expectations": "user",
  "pass": true,
  "metrics": {
    "hit3": 1,
    "precision": 1,
    "recall": 0.3333333333333333,
    "mrr": 1,
    "goldPrecision": 0,
    "goldRecall": 0,
    "goldMRR": 0,
    "citationCount": 1,
    "localHit": true,
    "claimsBacked100": true,
    "durationMs": 3659,
    "tokens": 1154
  },
  "judge": {}
}

## RAG Eval — global_only
{
  "scenario": "global_only",
  "expectations": "global",
  "pass": true,
  "metrics": {
    "hit3": 1,
    "precision": 1,
    "recall": 0.3333333333333333,
    "mrr": 1,
    "goldPrecision": 0,
    "goldRecall": 0,
    "goldMRR": 0,
    "citationCount": 1,
    "localHit": true,
    "claimsBacked100": true,
    "durationMs": 4582,
    "tokens": 1164
  },
  "judge": {}
}

## RAG Eval — cross_graph_search
{
  "scenario": "cross_graph_search",
  "expectations": "mixed",
  "pass": true,
  "metrics": {
    "hit3": 1,
    "precision": 1,
    "recall": 0.6666666666666666,
    "mrr": 0.75,
    "goldPrecision": 0,
    "goldRecall": 0,
    "goldMRR": 0,
    "citationCount": 2,
    "localHit": true,
    "claimsBacked100": true,
    "durationMs": 3083,
    "tokens": 1239
  },
  "judge": {}
}

## RAG Eval — knowledge_synthesis
{
  "scenario": "knowledge_synthesis",
  "expectations": "mixed",
  "pass": true,
  "metrics": {
    "hit3": 1,
    "precision": 1,
    "recall": 0.6666666666666666,
    "mrr": 0.75,
    "goldPrecision": 0,
    "goldRecall": 0,
    "goldMRR": 0,
    "citationCount": 2,
    "localHit": true,
    "claimsBacked100": true,
    "durationMs": 2796,
    "tokens": 1272
  },
  "judge": {}
}

## RAG Eval — personalized_recommendations
{
  "scenario": "personalized_recommendations",
  "expectations": "mixed",
  "pass": true,
  "metrics": {
    "hit3": 1,
    "precision": 1,
    "recall": 0.6666666666666666,
    "mrr": 0.75,
    "goldPrecision": 0,
    "goldRecall": 0,
    "goldMRR": 0,
    "citationCount": 2,
    "localHit": true,
    "claimsBacked100": true,
    "durationMs": 4070,
    "tokens": 1255
  },
  "judge": {}
}

## RAG Eval — Summary
{
  "summaryAt": "2025-09-17T22:16:08.629Z",
  "overallPassRate": 1,
  "ragPassRate": 1,
  "p95LatencyMs": 4582,
  "thresholds": {
    "overallPassRate": ">=0.80",
    "ragLayerPassRate": ">=0.70",
    "hitAt3": ">=0.60",
    "p95LatencyMs": "<=60000 (eval)"
  }
}
