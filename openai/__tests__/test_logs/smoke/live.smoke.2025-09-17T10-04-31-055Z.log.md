# Live Smoke Test Log
Started: 2025-09-17T10:04:31.056Z
Environment: OPENAI_KEY_PRESENT=1

[live] SDK embeddings {
  "model": "text-embedding-3-small",
  "dims": 1536
}
[live] chat completions {
  "id": "chatcmpl-CGjJK2LUfk1zcfPzS4qf5UZs5VOgL",
  "created": 1758103458,
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
      "text": "Founder background and recent moves are summarized in docA, highlighting the founder’s experience and recent strategic actions relevant to early company direction."
    },
    {
      "id": "b2",
      "text": "Investment highlights and risks are detailed in docB, outlining key strengths to consider alongside principal downside risks for potential investors."
    },
    {
      "id": "b3",
      "text": "High-level takeaway: weigh the founder’s background and recent moves (docA) against the investment highlights and risks (docB) when making an investment decision."
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
    },
    {
      "id": "b3",
      "cites": [
        "docA",
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
    358,
    5626
  ],
  "p50": 358,
  "p95": 358
}
