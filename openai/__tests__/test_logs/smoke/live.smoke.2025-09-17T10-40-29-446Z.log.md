# Live Smoke Test Log
Started: 2025-09-17T10:40:29.447Z
Environment: OPENAI_KEY_PRESENT=1

[live] SDK embeddings {
  "model": "text-embedding-3-small",
  "dims": 1536
}
[live] chat completions {
  "id": "chatcmpl-CGjs8086r93GAMSe92650g5iV0KMe",
  "created": 1758105616,
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
      "text": "Founder: background and recent strategic moves are summarized in docA."
    },
    {
      "id": "b2",
      "text": "Investment: primary highlights and key risks for investors are outlined in docB."
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
[mock] NodeStore relation added {
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
    329,
    4111
  ],
  "p50": 329,
  "p95": 329
}
