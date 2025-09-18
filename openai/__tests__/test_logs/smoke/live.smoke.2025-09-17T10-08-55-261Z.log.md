# Live Smoke Test Log
Started: 2025-09-17T10:08:55.263Z
Environment: OPENAI_KEY_PRESENT=1

[live] SDK embeddings {
  "model": "text-embedding-3-small",
  "dims": 1536
}
[live] chat completions {
  "id": "chatcmpl-CGjNZZtOLrZJwcRmpgirwIqcfQeKp",
  "created": 1758103721,
  "choices": 1,
  "finish": "length"
}
[live] route /ask-json {
  "error": {
    "keywords": [
      "quantum chips"
    ]
  }
}
[live] route /ask-json rag_synthesis error {
  "bullets": [
    {
      "id": "b1",
      "text": "Founder has relevant domain experience and has recently taken strategic steps (e.g., hires/partnerships) to strengthen execution and accelerate growth."
    },
    {
      "id": "b2",
      "text": "Investment case: notable market opportunity and early traction, balanced by key risks such as execution challenges and competitive pressure."
    }
  ],
  "citations": [
    "docA",
    "docB"
  ],
  "claims_to_citations": [
    {
      "id": "b1",
      "cites": [
        "docA"
      ]
    },
    {
      "id": "b2",
      "cites": [
        "docB"
      ]
    }
  ]
}
[mock] GraphStore relation added {
  "from": "My Existing Thoughts",
  "to": "AGI Safety - A Structured Overview",
  "type": "relatedTo"
}
[mock] Research+Create built true
[mock] Updates created under ML notes {
  "nn": true,
  "tr": true,
  "updateFound": true
}
[mock] Meetings organized {
  "meetings": true,
  "children": true
}
[mock] Knowledge connection added {
  "from": "Climate Change",
  "to": "Renewable Energy"
}
[mock] AGI Safety KB built {
  "kb": true,
  "link": true
}
[live] route latency ms {
  "samples": [
    298,
    2794
  ],
  "p50": 298,
  "p95": 298
}
