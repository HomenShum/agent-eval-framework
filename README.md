# OpenAI Evaluation Backend

A production-ready backend for prototyping and evaluating agentic AI workflows. Built with Next.js Route Handlers, powered by the OpenAI SDK, and includes deterministic testing for reliable evaluations without production authentication.

## 🚀 What This Does

This backend provides battle-tested infrastructure for:
- **Agentic Workflows** - Multi-tool orchestration with streaming responses
- **JSON Extraction** - Structured output with schema enforcement
- **Embeddings** - Vector generation with built-in retry logic
- **RAG Pipelines** - Context gathering and synthesis patterns
- **Evaluation Framework** - Deterministic testing and performance metrics

## 🎯 Key Features

- ✅ **Production-Ready Routes** - Drop into any Next.js/Remix/Express app
- ✅ **Streaming SSE Support** - Real-time agent execution traces
- ✅ **Zero-Cost Testing** - Mocked tests run without OpenAI credits
- ✅ **Deterministic Evaluation** - Reproducible results for CI/CD
- ✅ **Multi-User Simulation** - Test different user contexts easily

## 📦 Installation

### Prerequisites
- Node.js 18.17+ (for native fetch/streams support)
- npm or yarn
- OpenAI API key (optional for live testing)

### Quick Setup

1. **Clone and install**
```bash
git clone https://github.com/HomenShum/openai-agent-eval-framework
cd openai-eval-backend
npm install
```

2. **Configure environment**
```bash
# Copy template
cp .env.example .env

# Add your OpenAI key (optional - only for live tests)
# Mocked tests work without this
echo "OPENAI_API_KEY=sk-your-key" >> .env
```

3. **Verify installation**
```bash
# Run mocked tests (no API key needed)
npm test

# Run with live API (if key is set)
$env:OPENAI_API_KEY=sk-your-key
npm test
```

## 🏗️ Project Structure

```
openai-eval-backend/
├── openai/                    # Core route handlers
│   ├── agent/                 # Multi-tool agent orchestration
│   ├── ask/                   # Simple chat completions
│   ├── ask-json/              # Structured JSON outputs
│   ├── ask-mode/              # Preset response modes
│   ├── embeddings/            # Vector embeddings
│   ├── gather-context/        # RAG context collection
│   ├── organization-mode/     # Hierarchical note generation
│   └── __tests__/            # Test suites and evaluations
├── Interview/                 # Demo materials
│   ├── sse_samples/          # Captured SSE traces
│   ├── dataset/              # Sample evaluation data
│   └── *.md                  # Documentation
├── lib/                      # Shared utilities
│   └── eval/                 # Evaluation framework
├── scripts/                  # CLI utilities
└── test/__mocks__/          # Test mocks
```

## 🔧 Usage

### Integration with Next.js

Drop any route directly into your Next.js app:

```typescript
// app/api/llm/openai/ask/route.ts
export { POST } from "openai/ask/route";

// app/api/llm/openai/agent/route.ts
export { POST } from "openai/agent/route";
```

### Available Endpoints

| Endpoint | Purpose | Best For |
|----------|---------|----------|
| `/agent` | Multi-step workflows with tools | Complex tasks, automation |
| `/ask` | Simple text generation | Chat, Q&A |
| `/ask-json` | Structured JSON output | Forms, data extraction |
| `/ask-mode` | Preset response styles | Drafting, critiques |
| `/embeddings` | Vector generation | Semantic search, RAG |
| `/gather-context` | Context ranking | Knowledge retrieval |
| `/organization-mode` | Hierarchical outlines | Note-taking, documentation |

### Example: Agent Workflow

```javascript
// Request
const response = await fetch('/api/llm/openai/agent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-test-user-id': 'user-123' // Optional user context
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Create a project plan for AGI Safety' }
    ]
  })
});

// Stream SSE responses
const reader = response.body.getReader();
// ... process streaming chunks
```

## 🧪 Testing & Evaluation

### Test Modes

The test suite intelligently adapts based on environment:

| Mode | Condition | Use Case |
|------|-----------|----------|
| **Mocked** | No API key | Fast, deterministic, CI/CD |
| **Live** | API key present | Real model behavior testing |
| **Hybrid** | Mixed config | Development iteration |

### Running Tests

```bash
# All tests (auto-detects mode)
npm test

# Specific test file
npx jest openai/agent/e2e.agent.test.ts

# Pattern matching
npx jest --testNamePattern="E2E: Agent"

# Live tests only (requires API key)
OPENAI_API_KEY=sk-your-key npx jest openai/__tests__/live.*.test.ts
```

### Demo Commands

```bash
# Capture deterministic SSE trace
npm run -s demo:capture-sse

# Live SSE capture (requires API key)
npm run -s demo:capture-sse:live

# Run mini evaluation suite
npm run -s demo:eval:compact
```

## 📊 Master test summary (snapshot)

- Suites: 18 passed, 1 skipped (19 total)
- Tests: 55 passed, 16 skipped (71 total)
- Skips: env‑gated live tests (require OPENAI_API_KEY)

Key signals
- Mini‑eval macro P/R/F1
  - Banking ≈ P 0.80, R 1.00, F1 0.867
  - AI Research ≈ P 0.767, R 0.933, F1 0.814
- Routes passed: ask, ask‑json, embeddings, agent, gather‑context, organization‑mode
- Live smokes ran successfully where applicable

See also
- Full write‑up: TEST_MASTER_SUMMARY.md
- Latest SSE sample (preflight): Interview/sse_samples/ai_research.preflight.sse.log


## 🔐 Authentication

For simplicity, this public version uses a deterministic test-user system:

```typescript
// Default behavior
userId = "test-user"

// Override via header
headers: { 'x-test-user-id': 'custom-user-123' }

// Override via environment
PUBLIC_TEST_USER_ID=demo-user-456
```

**Production Note:** Replace `testUser.ts` with your actual auth middleware before deploying.

## 📊 Evaluation Framework

### Mini-Eval Example

```javascript
// Define test cases
const testCases = [
  {
    input: "Analyze competitor Stripe",
    expectedTags: ["analysis", "competitor", "Stripe"],
    expectedActions: ["search", "analyze", "report"]
  }
];

// Run evaluation
npm run -s demo:eval:compact

// Output
// Precision: 0.95
// Recall: 0.88
// F1 Score: 0.91
```

### SSE Trace Analysis

Captured traces show complete agent execution:

```jsonl
{"type":"tool_call","name":"search","args":{"query":"AGI safety"}}
{"type":"tool_result","data":{"hits":15,"top_result":"..."}}
{"type":"reasoning","text":"Found relevant papers, organizing..."}
{"type":"final","summary":"Created 3 notes with 15 citations"}
```

## 🚦 Environment Variables

```bash
# Required for live tests (optional for mocked)
OPENAI_API_KEY=sk-your-key

# Optional configurations
OPENAI_BASE_URL=https://api.openai.com/v1  # Custom endpoint
PUBLIC_TEST_USER_ID=demo-user-123          # Default user ID
OPENAI_MODEL=gpt-5-mini                    # Model selection
```

## 📈 Performance Considerations

- **Streaming**: All endpoints support SSE for real-time feedback
- **Retry Logic**: Built-in exponential backoff for rate limits
- **Batching**: Embeddings endpoint handles up to 100 texts per request
- **Caching**: Deterministic test harness enables result caching

## 🎓 Learning Resources

1. **Start Here**: `Interview/TEST_MASTER_SUMMARY.md` - Overview of test patterns
2. **Deep Dive**: `Interview/INTERVIEW_GUIDE.md` - Complete walkthrough with examples
3. **SSE Samples**: `Interview/sse_samples/` - Real execution traces
4. **Datasets**: `Interview/dataset/` - Sample evaluation data

## 🛠️ Development Workflow

1. **Local Development**
   ```bash
   # Use mocked tests for rapid iteration
   npm test -- --watch
   ```

2. **Integration Testing**
   ```bash
   # Test with real API
   OPENAI_API_KEY=sk-test npm test
   ```

3. **Production Deployment**
   ```bash
   # Add auth middleware
   # Configure production env vars
   # Deploy to your platform
   ```

## 🤝 Contributing

We welcome contributions! Areas of interest:
- Additional tool integrations
- Evaluation metrics and datasets
- Provider adapters (Anthropic, Cohere, etc.)
- Performance optimizations

---

Built with ❤️ for the AI engineering community. Start with mocked tests, iterate quickly, and deploy with confidence.