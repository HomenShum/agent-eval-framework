# Agent Smoke Evaluation Output
SourceLog: agent.smoke.2025-09-17T10-04-30-888Z.log.md
EvaluatedAt: 2025-09-17T10:08:55.404Z


## Agent Eval  organize_meetings
{
  "scenario": "organize_meetings",
  "rating": "professional",
  "toolUse": "good",
  "toolSelectionAccuracy": "good",
  "argumentQuality": "good",
  "taskCompletion": "complete",
  "responseCoherence": "good",
  "errorHandling": "good",
  "followedInstructions": true,
  "summaryQuality": "good",
  "feedback": "Heuristic judge: agent produced a final summary and tool calls."
}

## Agent Eval — organize_meetings
{
  "scenario": "organize_meetings",
  "rating": "professional",
  "toolUse": "good",
  "toolSelectionAccuracy": "good",
  "argumentQuality": "good",
  "taskCompletion": "complete",
  "responseCoherence": "good",
  "errorHandling": "good",
  "followedInstructions": true,
  "summaryQuality": "good",
  "feedback": "Heuristic judge: agent produced a final summary and tool calls."
}

## Agent Eval  batch_doc_ops
{
  "scenario": "batch_doc_ops",
  "rating": "low",
  "toolUse": "poor",
  "toolSelectionAccuracy": "poor",
  "argumentQuality": "poor",
  "taskCompletion": "incomplete",
  "responseCoherence": "poor",
  "errorHandling": "good",
  "followedInstructions": false,
  "summaryQuality": "poor",
  "feedback": "Heuristic judge: missing final summary or tool usage."
}

## Agent Eval — batch_doc_ops
{
  "scenario": "batch_doc_ops",
  "rating": "low",
  "toolUse": "poor",
  "toolSelectionAccuracy": "poor",
  "argumentQuality": "poor",
  "taskCompletion": "incomplete",
  "responseCoherence": "poor",
  "errorHandling": "good",
  "followedInstructions": false,
  "summaryQuality": "poor",
  "feedback": "Heuristic judge: missing final summary or tool usage."
}

## Agent Eval — Summary
{
  "summaryAt": "2025-09-17T10:09:02.382Z",
  "overallPassRate": 0.5,
  "agentPassRate": 0.5,
  "p95LatencyMs": 0,
  "thresholds": {
    "overallPassRate": ">=0.80",
    "agentLayerPassRate": ">=0.70",
    "onlyUserWrites": "100%",
    "p95LatencyMs": "<=300000 (eval)"
  }
}
