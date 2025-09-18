// src/app/api/llm/openai/agent/agentTools.ts

// OpenAI Chat Completions tools format
// Each tool is of the form: { type: "function", function: { name, description, parameters, strict } }

export const agentToolsOpenAI = [
  {
    type: "function",
    function: {
      name: "execute_multi_step_research_plan",
      description:
        "Preferred for multi-step requests. Decompose user request into tasks and call once with the full plan.",
      parameters: {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            description: "Sequential tasks to execute",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["person_research", "company_research", "note_organization"] },
                query: { type: "string" },
                details: { type: "object", properties: {}, additionalProperties: false, nullable: true },
              },
              required: ["type", "query", "details"],
              additionalProperties: false,
            },
          },
        },
        required: ["tasks"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "generate_report_outline",
      description:
        "Step 1. Research a topic and synthesize a JSON outline. Output is fed to populate_report_from_outline.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string" },
          user_goal_context: { type: "string" },
        },
        required: ["topic", "user_goal_context"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "populate_report_from_outline",
      description: "Step 2. Takes a JSON outline and builds nodes with content.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string" },
          outline_json: { type: "string" },
        },
        required: ["topic", "outline_json"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "find_related_nodes_via_graph",
      description: "Traverse graph from seeds to find related nodes (parents, children, related).",
      parameters: {
        type: "object",
        properties: {
          node_ids: { type: "array", items: { type: "string" } },
        },
        required: ["node_ids"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "execute_direct_request",
      description: "Execute a direct, concise response to the user's query under the current node.",
      parameters: {
        type: "object",
        properties: {
          user_query: { type: "string" },
          parent_node_id: { type: "string" },
        },
        required: ["user_query", "parent_node_id"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "evaluate_and_enhance_report",
      description: "Analyze report and add one targeted enhancement.",
      parameters: {
        type: "object",
        properties: {
          user_query: { type: "string" },
          report_root_node_id: { type: "string" },
          current_report_content: { type: "string" },
        },
        required: ["user_query", "report_root_node_id", "current_report_content"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "research_company_deep_dive",
      description: "Deep dive research for a company across multiple aspects.",
      parameters: {
        type: "object",
        properties: {
          company_name: { type: "string" },
          aspects: { type: "array", items: { type: "string" } },
        },
        required: ["company_name", "aspects"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "research_person_deep_dive",
      description: "Deep dive research for a person across multiple aspects.",
      parameters: {
        type: "object",
        properties: {
          full_name: { type: "string" },
          aspects: { type: "array", items: { type: "string" } },
        },
        required: ["full_name", "aspects"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "research_and_update_profile_section",
      description: "After a deep dive, fill an 'Unknown' section with new info.",
      parameters: {
        type: "object",
        properties: {
          profile_node_id: { type: "string" },
          section_title: { type: "string" },
          research_query: { type: "string" },
        },
        required: ["profile_node_id", "section_title", "research_query"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "create_knowledge_map",
      description: "Analyze all notes, cluster by topic, build an organized hierarchy.",
      parameters: {
        type: "object",
        properties: { num_clusters: { type: "integer", nullable: true } },
        required: ["num_clusters"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Perform a general-purpose web search (server calls internal /api/search).",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  // Core graph modification tools (client actions requested via SSE)
  {
    type: "function",
    function: {
      name: "create_node",
      description:
        "Create a single new node under a parent and return its ID. parentId may be a human-readable path (e.g., 'Reports/Prospecting' or 'user:Reports/Prospecting') or a concrete nodeId. When the user specifies a destination folder/path in the instruction, you MUST pass that explicit path (not an opaque root id). Prefer 'user:'/'global:' prefixes when known.",
      parameters: {
        type: "object",
        properties: { parentId: { type: "string" }, content: { type: "string" } },
        required: ["parentId", "content"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "update_node_content",
      description: "Update text content of an existing node.",
      parameters: {
        type: "object",
        properties: { nodeId: { type: "string" }, newContent: { type: "string" } },
        required: ["nodeId", "newContent"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "delete_node",
      description: "Delete a node and its relations.",
      parameters: {
        type: "object",
        properties: { nodeId: { type: "string" } },
        required: ["nodeId"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "move_node",
      description:
        "Move a node to a new parent. nodeIdToMove and newParentId may be IDs or canonical paths (e.g., 'user:Inbox/Recent/…' to 'user:Reports/Due Diligence'). When a destination path is known, you MUST pass the explicit path, not just a root id.",
      parameters: {
        type: "object",
        properties: { nodeIdToMove: { type: "string" }, newParentId: { type: "string" } },
        required: ["nodeIdToMove", "newParentId"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "add_relation",
      description:
        "Create a relation between two nodes. fromNodeId/toNodeId may be node IDs or canonical paths like 'user:Portfolio/Active Investments/Anthropic' and 'global:Market Intel/AI Safety'. When the instruction names specific paths/titles, prefer passing the exact canonical path.",
      parameters: {
        type: "object",
        properties: {
          fromNodeId: { type: "string" },
          toNodeId: { type: "string" },
          relationType: { type: "string", enum: ["child", "relatedTo", "hashtag", "author"] },
        },
        required: ["fromNodeId", "toNodeId", "relationType"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "create_node_and_get_details",
      description:
        "Create a new node and return its details. parentId may be a human-readable path (e.g., 'Reports/Prospecting' or 'user:Reports/Prospecting') or a concrete nodeId. When the instruction calls out a path, you MUST pass that path, not a generic root id.",
      parameters: {
        type: "object",
        properties: { parentId: { type: "string" }, content: { type: "string" } },
        required: ["parentId", "content"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "search_academic",
      description: "Search academic sources (e.g., arXiv, Semantic Scholar).",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "search_news",
      description: "Search historical news sources.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "superconnector_prepare_outreach",
      description: "Prepare a cold outreach via SuperConnector (foundational stub).",
      parameters: {
        type: "object",
        properties: {
          contact_name: { type: "string" },
          company: { type: "string", nullable: true },
          channel: { type: "string", enum: ["email", "linkedin", "twitter"] },
          context: { type: "string" },
        },
        required: ["contact_name", "company", "channel", "context"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "superconnector_schedule_event",
      description: "Schedule an event via SuperConnector (foundational stub).",
      parameters: {
        type: "object",
        properties: {
          event_title: { type: "string" },
          datetime_iso: { type: "string" },
          attendees: { type: "array", items: { type: "string" } },
        },
        required: ["event_title", "datetime_iso", "attendees"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "finish_work",
      description: "Must be called to end the session with a final summary.",
      parameters: {
        type: "object",
        properties: { summary_of_work_done: { type: "string" } },
        required: ["summary_of_work_done"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
] as const;
