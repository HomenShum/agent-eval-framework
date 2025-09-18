# Live Smoke Test Log
Started: 2025-09-17T13:25:15.599Z
Environment: OPENAI_KEY_PRESENT=1

[live] SDK embeddings {
  "model": "text-embedding-3-small",
  "dims": 1536
}
[live] chat completions {
  "id": "chatcmpl-CGmRcfgOSBII7l0xG6qAsQYajjHbm",
  "created": 1758115504,
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
    "quantum processors",
    "qubits",
    "quantum computing"
  ]
}
[live] route /ask-json rag_synthesis {
  "bullets": [
    {
      "id": "b1",
      "text": "Founder background: the founder brings relevant sector experience and has recently made strategic moves that affect the company's direction (see docA)."
    },
    {
      "id": "b2",
      "text": "Investment highlights and risks: the opportunity includes specific growth and positioning advantages but also carries documented risks around market dynamics and execution (see docB)."
    },
    {
      "id": "b3",
      "text": "Overall takeaway: balance the founder’s background and recent actions (docA) against the stated investment highlights and risks (docB) when deciding next steps and areas for further due diligence."
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
data: {"type":"tool_call","data":{"name":"create_node_and_get_details","args":{"parentId":"project-alpha-id","content":"Meetings"}}}

data: {"type":"client_action","data":{"name":"create_node","args":{"parentId":"project-alpha-id","content":"Meetings","nodeId":"00000000-0000-0000-0000-000000000000"}}}

data: {"type":"tool_call","data":{"name":"move_node","args":{"nodeId":"note-123-id","newParentId":"00000000-0000-0000-0000-000000000000"}}}

data: {"type":"client_action","data":{"name":"move_node","args":{"nodeId":"note-123-id","newParentId":"00000000-0000-0000-0000-000000000000"}}}

data: {"type":"tool_call","data":{"name":"move_node","args":{"nodeId":"note-456-id","newParentId":"00000000-0000-0000-0000-000000000000"}}}

data: {"type":"client_action","data":{"name":"move_node","args":{"nodeId":"note-456-id","newParentId":"00000000-0000-0000-0000-000000000000"}}}

data: {"type":"final_summary","data":{"summary":"Agent session finished (preflight).","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario organize_meetings END

[live] scenario add_relation request {
  "query": "Using ONLY tools (no web_search), add_relation from 'existing-thoughts-id' to 'ai-risk-note-id' of type 'relatedTo', then call finish_work with a brief summary.",
  "context": "",
  "currentEditingNodeId": "root-node"
}

[live] scenario add_relation SSE_RAW
data: {"type":"tool_call","data":{"name":"add_relation","args":{"fromId":"existing-thoughts-id","toId":"ai-risk-note-id","relationTypeId":"relatedTo"}}}

data: {"type":"client_action","data":{"name":"add_relation","args":{"fromId":"existing-thoughts-id","toId":"ai-risk-note-id","relationTypeId":"relatedTo"}}}

data: {"type":"final_summary","data":{"summary":"Agent session finished (preflight).","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario add_relation END

[live] scenario web_search request {
  "query": "Mandatory: Use the web_search tool with query 'latest quantum computing news'. Do NOT answer directly. After web_search returns, call finish_work with a short summary.",
  "context": "No local knowledge available.",
  "currentEditingNodeId": "root-node"
}

[live] scenario web_search SSE_RAW
data: {"type":"tool_call","data":{"name":"web_search","args":{"query":"latest quantum computing news"}}}

data: {"type":"tool_result","data":{"name":"web_search","result":{"hits":3},"success":true}}

data: {"type":"final_summary","data":{"summary":"Agent session finished (preflight).","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario web_search END

[live] scenario update_node_content request {
  "query": "Must call update_node_content on nodeId 'draft-note-1' with a brief summary about quantum chips. Do not create a new node. Then call finish_work.",
  "context": "You may update node content.",
  "currentEditingNodeId": "draft-note-1"
}

[live] scenario update_node_content SSE_RAW
data: {"type":"tool_call","data":{"name":"update_node_content","args":{"nodeId":"draft-note-1","newContent":"Brief summary about quantum chips."}}}

data: {"type":"client_action","data":{"name":"update_node_content","args":{"nodeId":"draft-note-1","newContent":"Brief summary about quantum chips."}}}

data: {"type":"final_summary","data":{"summary":"Agent session finished (preflight).","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario update_node_content END

[live] scenario research_person_deep_dive request {
  "query": "You must call research_person_deep_dive with full_name 'Sam Altman' and aspects ['investments','background'], optionally call find_related_nodes_via_graph, then finish_work with a summary and mention 'sources'.",
  "context": "Graph has seed nodes; web access allowed.",
  "currentEditingNodeId": "root-node"
}

[live] scenario research_person_deep_dive SSE_RAW
data: {"type":"tool_call","data":{"name":"research_person_deep_dive","args":{"full_name":"Sam Altman","aspects":["investments","background"]}}}

data: {"type":"tool_result","data":{"name":"research_person_deep_dive","result":{"notes":2},"success":true}}

data: {"type":"final_summary","data":{"summary":"Agent session finished (preflight).","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario research_person_deep_dive END

[live] scenario search_academic request {
  "query": "Mandatory: Call search_academic with query 'AGI safety site:arxiv.org'. Do not answer directly. Then call finish_work with a brief summary.",
  "context": "Academic focus; cite sources.",
  "currentEditingNodeId": "root-node"
}

[live] scenario search_academic SSE_RAW
data: {"type":"tool_call","data":{"name":"search_academic","args":{"query":"AGI safety site:arxiv.org"}}}

data: {"type":"tool_result","data":{"name":"search_academic","result":{"hits":2},"success":true}}

data: {"type":"final_summary","data":{"summary":"Agent session finished (preflight).","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario search_academic END

[live] scenario superconnector_prepare_outreach request {
  "query": "You must call superconnector_prepare_outreach with contact_name 'Jane Doe', channel 'email', context 'seed funding discussion'. Then finish_work.",
  "context": "Cold outreach planning; no actual send.",
  "currentEditingNodeId": "root-node"
}

[live] scenario superconnector_prepare_outreach SSE_RAW
data: {"type":"tool_call","data":{"name":"superconnector_prepare_outreach","args":{"contact_name":"Jane Doe","channel":"email","context":"seed funding discussion"}}}

data: {"type":"client_action","data":{"name":"superconnector_outreach","args":{"contact_name":"Jane Doe","channel":"email","context":"seed funding discussion"}}}

data: {"type":"final_summary","data":{"summary":"Agent session finished (preflight).","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario superconnector_prepare_outreach END

[live] scenario batch_doc_ops request {
  "query": "Create a 'Prospecting Report — Sam Altman' under user 'Reports/Prospecting'. You may use info from global nodes (People/Investors, Market Intel) but do NOT modify global nodes. Append any new nodes ONLY under the user root. After creating the report, call add_relation linking it to 'global/People/Founders/Sam Altman' using relationType 'relatedTo'. Finish with a summary.",
  "context": "User has Reports/Prospecting; Global has People and Market Intel.",
  "currentEditingNodeId": "test-user-root"
}

[live] scenario batch_doc_ops SSE_RAW
data: {"type":"tool_call","data":{"name":"execute_direct_request","args":{"user_query":"Create a 'Prospecting Report — Sam Altman' under user 'Reports/Prospecting'. You may use info from global nodes (People/Investors, Market Intel) but do NOT modify global nodes. Append any new nodes ONLY under the user root. After creating the report, call add_relation linking it to 'global/People/Fo","parent_node_id":"user/Reports/Prospecting"}}}

data: {"type":"client_action","data":{"name":"create_node","args":{"parentId":"user/Reports/Prospecting","content":"Node path: user/Reports/Prospecting/Prospecting Report — Sam Altman\n\nProspecting brief — Sam Altman","nodeId":"00000000-0000-0000-0000-000000000000"}}}

data: {"type":"client_action","data":{"name":"add_relation","args":{"fromId":"00000000-0000-0000-0000-000000000000","toId":"SAM_ALTMAN","relationTypeId":"relatedTo"}}}

data: {"type":"final_summary","data":{"summary":"Agent session finished (preflight).","stats":{}}}

data: {"type":"end","data":{"ok":true}}



[live] scenario batch_doc_ops GRAPH_AFTER_CREATED
[
  {
    "id": "00000000-0000-0000-0000-000000000000",
    "authorId": "test-user",
    "text": "Node path: user/Reports/Prospecting/Prospecting Report — Sam Altman\n\nProspecting brief — Sam Altman"
  }
]
[live] scenario batch_doc_ops END

[live] scenario rag_contextual_update request {
  "query": "Find the user's 'OpenAI Analysis' note and perform a brief web_search for latest developments, then update_node_content on that note to add a short update. Finish with a single final summary.",
  "context": "Use tools: find_nodes -> web_search -> update_node_content -> finish_work.",
  "currentEditingNodeId": "test-user-root"
}

[live] scenario rag_contextual_update SSE_RAW
data: {"type":"tool_call","data":{"name":"update_node_content","args":{"nodeId":"user/Reports/Due Diligence/OpenAI Analysis - Comprehensive analysis of business model, competitive position, and growth trajectory","newContent":"Added latest developments and citations."}}}

data: {"type":"client_action","data":{"name":"update_node_content","args":{"nodeId":"user/Reports/Due Diligence/OpenAI Analysis - Comprehensive analysis of business model, competitive position, and growth trajectory","newContent":"Added latest developments and citations."}}}

data: {"type":"final_summary","data":{"summary":"Agent session finished (preflight).","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario rag_contextual_update END

[live] scenario rag_smart_organization request {
  "query": "Organize my inbox items into appropriate categories under my graph (use move_node). Use triage rules implicitly. Do not modify global. Finish with one final summary.",
  "context": "Inbox items exist; prefer moves for items like 'Meeting with Jensen', 'Quick thought on AGI', 'Due diligence request'.",
  "currentEditingNodeId": "test-user-root"
}

[live] scenario rag_smart_organization SSE_RAW
data: {"type":"tool_call","data":{"name":"move_node","args":{"nodeId":"user/Inbox/Recent/Meeting with Jensen - NVIDIA AI Summit discussing Blackwell architecture and 2.5x performance gains","newParentId":"user/Meeting Notes/2024-05"}}}

data: {"type":"client_action","data":{"name":"move_node","args":{"nodeId":"user/Inbox/Recent/Meeting with Jensen - NVIDIA AI Summit discussing Blackwell architecture and 2.5x performance gains","newParentId":"user/Meeting Notes/2024-05"}}}

data: {"type":"tool_call","data":{"name":"move_node","args":{"nodeId":"user/Inbox/Recent/Quick thought on AGI timeline - Converging estimates 2027-2030 after Ilya's OpenAI departure","newParentId":"user/Personal Notes"}}}

data: {"type":"client_action","data":{"name":"move_node","args":{"nodeId":"user/Inbox/Recent/Quick thought on AGI timeline - Converging estimates 2027-2030 after Ilya's OpenAI departure","newParentId":"user/Personal Notes"}}}

data: {"type":"tool_call","data":{"name":"move_node","args":{"nodeId":"user/Inbox/Recent/Due diligence request - Runway ML seeking $5M at $1.5B valuation for video generation platform","newParentId":"user/Reports/Due Diligence"}}}

data: {"type":"client_action","data":{"name":"move_node","args":{"nodeId":"user/Inbox/Recent/Due diligence request - Runway ML seeking $5M at $1.5B valuation for video generation platform","newParentId":"user/Reports/Due Diligence"}}}

data: {"type":"final_summary","data":{"summary":"Agent session finished (preflight).","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario rag_smart_organization END

[live] scenario rag_relationship_discovery request {
  "query": "Find connections between my portfolio companies and global market trends. Create relations between them when appropriate. Finish with a single final summary.",
  "context": "Use add_relation between relevant nodes. Prefer 'relatedTo' relationType when available.",
  "currentEditingNodeId": "test-user-root"
}

[live] scenario rag_relationship_discovery SSE_RAW
data: {"type":"tool_call","data":{"name":"add_relation","args":{"fromId":"user/Portfolio/Active Investments/Anthropic","toId":"global/Market Intel/AI Safety","relationTypeId":"relatedTo"}}}

data: {"type":"client_action","data":{"name":"add_relation","args":{"fromId":"user/Portfolio/Active Investments/Anthropic","toId":"global/Market Intel/AI Safety","relationTypeId":"relatedTo"}}}

data: {"type":"tool_call","data":{"name":"add_relation","args":{"fromId":"user/Portfolio/Active Investments/Perplexity AI","toId":"global/Industry Analysis/Enterprise AI","relationTypeId":"relatedTo"}}}

data: {"type":"client_action","data":{"name":"add_relation","args":{"fromId":"user/Portfolio/Active Investments/Perplexity AI","toId":"global/Industry Analysis/Enterprise AI","relationTypeId":"relatedTo"}}}

data: {"type":"tool_call","data":{"name":"add_relation","args":{"fromId":"user/Portfolio/Pipeline/Mistral AI","toId":"global/Academic Papers/Mamba","relationTypeId":"relatedTo"}}}

data: {"type":"client_action","data":{"name":"add_relation","args":{"fromId":"user/Portfolio/Pipeline/Mistral AI","toId":"global/Academic Papers/Mamba","relationTypeId":"relatedTo"}}}

data: {"type":"final_summary","data":{"summary":"Agent session finished (preflight).","stats":{}}}

data: {"type":"end","data":{"ok":true}}


[live] scenario rag_relationship_discovery END
