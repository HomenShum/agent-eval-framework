# Live Smoke Test Log
Started: 2025-09-17T10:43:32.449Z
Environment: OPENAI_KEY_PRESENT=1

[live] SDK embeddings {
  "model": "text-embedding-3-small",
  "dims": 1536
}
[live] chat completions {
  "id": "chatcmpl-CGjv5D7hLJ6tBBtB83IhrENFtTqG6",
  "created": 1758105799,
  "choices": 1,
  "finish": "length"
}
[live] route /embeddings {
  "count": 2,
  "model": "text-embedding-3-small",
  "nodeIds": [
    "1",
    "2"
  ]
}
[live] route /embeddings error {
  "code": "BAD_REQUEST",
  "message": "Invalid request",
  "hint": {
    "formErrors": [],
    "fieldErrors": {
      "contents": [
        "Array must contain at least 1 element(s)"
      ]
    }
  }
}
[live] route /ask-json {
  "ok": true,
  "keywords": [
    "quantum chips",
    "quantum computing",
    "quantum processors"
  ]
}
[live] route /ask-json rag_synthesis {
  "bullets": [
    {
      "id": "b1",
      "text": "Founder: experienced founder with relevant background who has recently enacted strategic operational and financing moves, indicating active focus on execution."
    },
    {
      "id": "b2",
      "text": "Investment highlights: attractive market opportunity, a differentiated offering and early signs of traction/monetization that support upside potential."
    },
    {
      "id": "b3",
      "text": "Key risks: execution risk, competitive pressure, and potential need for additional capital are the main downside considerations to monitor."
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
        "docB"
      ]
    }
  ]
}

[live] scenario agent_non_tool request {
  "query": "Say hello briefly then end. Do NOT call tools; just conclude.",
  "context": "",
  "currentEditingNodeId": "root-node"
}

[live] scenario agent_non_tool SSE_RAW
data: {"type":"error","data":{"message":"streaming not permitted"}}

data: {"type":"final_summary","data":{"summary":"Complete.","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario agent_non_tool END
[live] route /agent SSE flags {
  "hasFinal": true,
  "hasError": true,
  "hasToolCall": false
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

[live] scenario organize_meetings request {
  "query": "Using ONLY the provided tools (no web_search), create a folder named 'Meetings' under parent 'project-alpha-id', then move 'note-123-id' and 'note-456-id' under it. Finally call finish_work with a short summary.",
  "context": "",
  "currentEditingNodeId": "root-node"
}

[live] scenario organize_meetings SSE_RAW
data: {"type":"error","data":{"message":"streaming not permitted"}}

data: {"type":"final_summary","data":{"summary":"Complete.","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario organize_meetings END

[live] scenario add_relation request {
  "query": "Using ONLY tools (no web_search), add_relation from 'existing-thoughts-id' to 'ai-risk-note-id' of type 'relatedTo', then call finish_work with a brief summary.",
  "context": "",
  "currentEditingNodeId": "root-node"
}

[live] scenario add_relation SSE_RAW
data: {"type":"error","data":{"message":"streaming not permitted"}}

data: {"type":"final_summary","data":{"summary":"Complete.","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario add_relation END

[live] scenario web_search request {
  "query": "Mandatory: Use the web_search tool with query 'latest quantum computing news'. Do NOT answer directly. After web_search returns, call finish_work with a short summary.",
  "context": "No local knowledge available.",
  "currentEditingNodeId": "root-node"
}

[live] scenario web_search SSE_RAW
data: {"type":"error","data":{"message":"streaming not permitted"}}

data: {"type":"final_summary","data":{"summary":"Complete.","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario web_search END

[live] scenario update_node_content request {
  "query": "Must call update_node_content on nodeId 'draft-note-1' with a brief summary about quantum chips. Do not create a new node. Then call finish_work.",
  "context": "You may update node content.",
  "currentEditingNodeId": "draft-note-1"
}

[live] scenario update_node_content SSE_RAW
data: {"type":"error","data":{"message":"streaming not permitted"}}

data: {"type":"final_summary","data":{"summary":"Complete.","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario update_node_content END

[live] scenario research_person_deep_dive request {
  "query": "You must call research_person_deep_dive with full_name 'Sam Altman' and aspects ['investments','background'], optionally call find_related_nodes_via_graph, then finish_work with a summary and mention 'sources'.",
  "context": "Graph has seed nodes; web access allowed.",
  "currentEditingNodeId": "root-node"
}

[live] scenario research_person_deep_dive SSE_RAW
data: {"type":"error","data":{"message":"streaming not permitted"}}

data: {"type":"final_summary","data":{"summary":"Complete.","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario research_person_deep_dive END

[live] scenario search_academic request {
  "query": "Mandatory: Call search_academic with query 'AGI safety site:arxiv.org'. Do not answer directly. Then call finish_work with a brief summary.",
  "context": "Academic focus; cite sources.",
  "currentEditingNodeId": "root-node"
}

[live] scenario search_academic SSE_RAW
data: {"type":"error","data":{"message":"streaming not permitted"}}

data: {"type":"final_summary","data":{"summary":"Complete.","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario search_academic END

[live] scenario superconnector_prepare_outreach request {
  "query": "You must call superconnector_prepare_outreach with contact_name 'Jane Doe', channel 'email', context 'seed funding discussion'. Then finish_work.",
  "context": "Cold outreach planning; no actual send.",
  "currentEditingNodeId": "root-node"
}

[live] scenario superconnector_prepare_outreach SSE_RAW
data: {"type":"error","data":{"message":"streaming not permitted"}}

data: {"type":"final_summary","data":{"summary":"Complete.","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario superconnector_prepare_outreach END

[live] scenario batch_doc_ops request {
  "query": "Create a 'Prospecting Report — Sam Altman' under user 'Reports/Prospecting'. You may use info from global nodes (People/Investors, Market Intel) but do NOT modify global nodes. Append any new nodes ONLY under the user root. After creating the report, call add_relation linking it to 'global/People/Founders/Sam Altman' using relationType 'relatedTo'. Finish with a summary.",
  "context": "User has Reports/Prospecting; Global has People and Market Intel.",
  "currentEditingNodeId": "test-user-root"
}

[live] scenario batch_doc_ops SSE_RAW
data: {"type":"error","data":{"message":"streaming not permitted"}}

data: {"type":"final_summary","data":{"summary":"Complete.","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] route latency ms {
  "samples": [
    267,
    3774
  ],
  "p50": 267,
  "p95": 267
}

[live] scenario rag_contextual_update request {
  "query": "Find the user's 'OpenAI Analysis' note and perform a brief web_search for latest developments, then update_node_content on that note to add a short update. Finish with a single final summary.",
  "context": "Use tools: find_nodes -> web_search -> update_node_content -> finish_work.",
  "currentEditingNodeId": "test-user-root"
}

[live] scenario rag_contextual_update SSE_RAW
data: {"type":"error","data":{"message":"streaming not permitted"}}

data: {"type":"final_summary","data":{"summary":"Complete.","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario rag_contextual_update END

[live] scenario rag_smart_organization request {
  "query": "Organize my inbox items into appropriate categories under my graph (use move_node). Use triage rules implicitly. Do not modify global. Finish with one final summary.",
  "context": "Inbox items exist; prefer moves for items like 'Meeting with Jensen', 'Quick thought on AGI', 'Due diligence request'.",
  "currentEditingNodeId": "test-user-root"
}

[live] scenario rag_smart_organization SSE_RAW
data: {"type":"error","data":{"message":"streaming not permitted"}}

data: {"type":"final_summary","data":{"summary":"Complete.","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario rag_smart_organization END

[live] scenario rag_relationship_discovery request {
  "query": "Find connections between my portfolio companies and global market trends. Create relations between them when appropriate. Finish with a single final summary.",
  "context": "Use add_relation between relevant nodes. Prefer 'relatedTo' relationType when available.",
  "currentEditingNodeId": "test-user-root"
}

[live] scenario rag_relationship_discovery SSE_RAW
data: {"type":"error","data":{"message":"streaming not permitted"}}

data: {"type":"final_summary","data":{"summary":"Complete.","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario rag_relationship_discovery END
