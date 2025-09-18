# Interview Guide: Agentic Frameworks & Live Demo
**Thursday Sept 18th, 9:30am - 10:30am PST**

## 1. Quick Intro: What Are Agentic Frameworks? (5 min)
**Core Concept:** Systems that transform LLMs into capable AI agents

### Key Capabilities
- **Context Management** → Track conversation history & maintain coherence
- **Tool Integration** → Call APIs, databases, web search
- **Task Planning** → Decompose goals, execute multi-step workflows
- **Memory Systems** → Store/retrieve state, personalize over time
- **Adaptation** → Learn from feedback, refine strategies

### Visual: Before vs After
```
BEFORE (Plain LLM):
User: "Hello, I'm Jon"
User: "What's my name?"
→ Fails: No memory

AFTER (Framework):
User: "Hello, I'm Jon"
Assistant: "Hello Jon!"
User: "What's my name?"
→ Success: Maintains context & memory
```

## 2. Background & Projects Discussion (10 min)

### Topics to Cover
- My experience with Agentic RAG system designs
- NodeBench AI project overview
- Past implementations and lessons learned
- Real-world applications built

## 3. Context Engineering Deep Dive (15 min)

### Live Discussion Points
- **Application-Specific Context** → Tailoring to user roles & goals
- **Context Granularity** → What to include/exclude
- **Dynamic Context Selection** → Adapting based on task
- **Safety Controls** → Guardrails and boundaries

### Framework Comparison
- Single-agent vs Multi-agent architectures
- Routing patterns and orchestration
- Tool management strategies

## 4. Live Demo: Building an Agent (20 min)
*Screen sharing with development environment (Cursor/Windsurf/VS Code)*

### Demo Flow
1. **Define Use Case** 
   - Pick domain (e.g., Banking Prospecting or AI Research)
   - Set success criteria

2. **Build the Agent**
   ```python
   # Live coding example
   class DemoAgent(Agent):
       model = "gpt-5-mini"
       system_prompt = "Context for specific use case..."
       
       @tool
       def search_data(self, query: str):
           # Tool implementation
           pass
   ```

3. **Run Example**
   - Execute agent with sample queries
   - Show SSE trace of tool calls
   - Display planning/execution steps

4. **Observe Results**
   ```
   Tool trace:
   → web_search {query: "..."}
   → update_content {nodeId: "..."}
   → generate_report {format: "..."}
   Final: Response with citations
   ```

## 5. Mini Evaluation Suite (10 min)

### Quick Eval Setup
```javascript
// mini_eval.test.ts
const testCases = [
  {
    input: "Prospecting Report for Sam Altman",
    expectedTags: ["prospecting", "report", "client"],
    expectedActions: ["create_node", "add_relation"]
  }
];

// Run evaluation
npm test -- mini_eval.test.ts
```

### Metrics Review
- Precision/Recall/F1 scores
- Action accuracy
- Context retention
- Error analysis & iteration

## 6. Interactive Q&A (10 min)

### Discussion Topics
- Specific use cases from the team
- Integration with existing systems
- Scaling considerations
- Best practices for production

---

## Demo Resources

### Sample Domains Ready
1. **Banking Prospecting**
   - Client qualification
   - Compliance checks
   - Product recommendations

2. **AI Research Assistant**
   - Literature search
   - Note organization
   - Citation management

### Development Environment
- Live coding with IDE extensions
- Real-time SSE trace visualization
- Deterministic test harness
- No-network evaluation mode

### Key Files for Demo
```
- lib/eval/mini.ts           # Evaluation scorer
- openai/__tests__/*         # Test suites
- Interview/sse_samples/*    # Trace examples
- Interview/dataset/*        # Sample data
```

## Quick Commands for Demo
```bash
# Run evaluation
npm test -s -- mini_eval.test.ts

# Capture SSE trace
npm run -s demo:capture-sse:live

# Show agent execution
npm run -s demo:agent:banking
```

---

*Note: All examples can run deterministically for consistent demos. Screen sharing enabled for live coding and real-time adjustments based on team questions.*test\__mocks__\@\app\auth\MewUser.ts