# RAG Pipeline Live Smoke Log
Started: 2025-09-15T22:28:30.723Z
Environment: OPENAI_KEY_PRESENT=1


[rag] scenario combined REQUEST {
{
  "prompt": "Summarize investor-related topics and any prospecting notes you can find. Provide 2-4 bullet points with citations."
}
}

[rag] scenario combined DOCS
[
  {
    "id": "710769d2#c0",
    "authorId": "global-admin-user-id",
    "text": "Investors",
    "score": 0.4593074205667571
  },
  {
    "id": "14746961#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "Investment Memos",
    "score": 0.5393811698931205
  },
  {
    "id": "3252dc4f#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "Seed Stage AI Template - Problem, solution, market, team, traction, risks sections",
    "score": 0.47989582723324614
  },
  {
    "id": "1da249a6#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "Prospecting",
    "score": 0.43138195179772876
  },
  {
    "id": "80a5ba8d#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "LP Quarterly Update Template - Performance, portfolio highlights, market commentary",
    "score": 0.48239817060636303
  }
]

[rag] scenario combined CONTEXT
[[AllowedCitationIds]] 710769d2, 14746961, 3252dc4f, 1da249a6, 80a5ba8d

[[Doc 1 | id=710769d2 | author=global-admin-user-id | score=0.459]]
Investors
[Hierarchy] Parent: People | Siblings: Founders; Researchers | Children: Sequoia Capital - Leading VC firm with $85B AUM, portfolio includes Apple, Google, Stripe, Airbnb; Marc Andreessen - Co-founder of a16z, previously founded Netscape, 'Software is eating the world' thesis; Peter Thiel - Co-founder of PayPal and Palantir, first outside investor in Facebook, Founders Fund partner

[[Doc 2 | id=14746961 | author=SPECIAL::mew|0123456789 | score=0.539]]
Investment Memos
[Hierarchy] Parent: Templates | Siblings: Communication | Children: Seed Stage AI Template - Problem, solution, market, team, traction, risks sections; Series A Deep Tech Template - Technology moat, IP analysis, competitive dynamics; Due Diligence Checklist - Technical, market, financial, legal, team evaluation framework

[[Doc 3 | id=3252dc4f | author=SPECIAL::mew|0123456789 | score=0.480]]
Seed Stage AI Template - Problem, solution, market, team, traction, risks sections
[Hierarchy] Parent: Investment Memos | Siblings: Series A Deep Tech Template - Technology moat, IP analysis, competitive dynamics; Due Diligence Checklist - Technical, market, financial, legal, team evaluation framework

[[Doc 4 | id=1da249a6 | author=SPECIAL::mew|0123456789 | score=0.431]]
Prospecting
[Hierarchy] Parent: Reports | Siblings: Due Diligence; Market Research | Children: AI Startups Q2 2024 - Analysis of 50 AI startups in seed/Series A focusing on enterprise AI and vertical SaaS; Quantum Computing Investment Thesis - Deep dive on quantum hardware and software investment opportunities; Climate Tech Pipeline - Evaluation of 30 climate startups across carbon capture, fusion, and green hydrogen

[[Doc 5 | id=80a5ba8d | author=SPECIAL::mew|0123456789 | score=0.482]]
LP Quarterly Update Template - Performance, portfolio highlights, market commentary
[Hierarchy] Parent: Communication | Siblings: Founder Pitch Feedback Template - Constructive framework for declining investments; Cold Outreach Template - Personalized approach for connecting with founders

[rag] scenario combined ANSWER


Citations: [id=14746961] [id=710769d2]

[rag] scenario combined USAGE
{"prompt_tokens":920,"completion_tokens":400,"total_tokens":1320,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":400,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}}

[rag] scenario combined STRUCTURED
{
  "citations": [
    "14746961",
    "710769d2"
  ]
}

[rag] scenario combined END

[rag] scenario user_only REQUEST {
{
  "prompt": "List what is in my Prospecting reports. Cite ids."
}
}

[rag] scenario user_only DOCS
[
  {
    "id": "1da249a6#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "Prospecting",
    "score": 0.567214114339341
  },
  {
    "id": "66dba3d0#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "Market Reports",
    "score": 0.4864189653124482
  },
  {
    "id": "0d881528#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "Due Diligence Checklist - Technical, market, financial, legal, team evaluation framework",
    "score": 0.38744983566015134
  },
  {
    "id": "efa77de5#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "Personal Notes",
    "score": 0.346622661990399
  },
  {
    "id": "user-hashtags-id-SPECIAL::mew|0123456789#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "My Hashtags",
    "score": 0.28021290112741665
  }
]

[rag] scenario user_only CONTEXT
[[AllowedCitationIds]] 1da249a6, 66dba3d0, 0d881528, efa77de5, user-hashtags-id-SPECIAL::mew|0123456789

[[Doc 1 | id=1da249a6 | author=SPECIAL::mew|0123456789 | score=0.567]]
Prospecting
[Hierarchy] Parent: Reports | Siblings: Due Diligence; Market Research | Children: AI Startups Q2 2024 - Analysis of 50 AI startups in seed/Series A focusing on enterprise AI and vertical SaaS; Quantum Computing Investment Thesis - Deep dive on quantum hardware and software investment opportunities; Climate Tech Pipeline - Evaluation of 30 climate startups across carbon capture, fusion, and green hydrogen

[[Doc 2 | id=66dba3d0 | author=SPECIAL::mew|0123456789 | score=0.486]]
Market Reports
[Hierarchy] Parent: Research Library | Siblings: AI Papers; Technical Guides | Children: Gartner AI Hype Cycle 2024 - Generative AI entering trough of disillusionment; McKinsey AI Adoption Study - 70% of companies piloting, 20% in production; CB Insights AI Funding Report - $42B invested in AI startups in 2023

[[Doc 3 | id=0d881528 | author=SPECIAL::mew|0123456789 | score=0.387]]
Due Diligence Checklist - Technical, market, financial, legal, team evaluation framework
[Hierarchy] Parent: Investment Memos | Siblings: Seed Stage AI Template - Problem, solution, market, team, traction, risks sections; Series A Deep Tech Template - Technology moat, IP analysis, competitive dynamics

[[Doc 4 | id=efa77de5 | author=SPECIAL::mew|0123456789 | score=0.347]]
Personal Notes
[Hierarchy] Parent: Tyler Durden | Siblings: My Hashtags; My Favorites; My Stream | Children: Investment Thesis 2024; Network Building; Learning Goals

[[Doc 5 | id=user-hashtags-id-SPECIAL::mew|0123456789 | author=SPECIAL::mew|0123456789 | score=0.280]]
My Hashtags
[Hierarchy] Parent: Tyler Durden | Siblings: My Favorites; My Stream; My Templates

[rag] scenario user_only ANSWER


Citations: [id=1da249a6]

[rag] scenario user_only USAGE
{"prompt_tokens":878,"completion_tokens":400,"total_tokens":1278,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":400,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}}

[rag] scenario user_only STRUCTURED
{
  "citations": [
    "1da249a6"
  ]
}

[rag] scenario user_only END

[rag] scenario global_only REQUEST {
{
  "prompt": "What subsections exist under People in the global knowledge? Cite ids."
}
}

[rag] scenario global_only DOCS
[
  {
    "id": "9f509b5f#c0",
    "authorId": "global-admin-user-id",
    "text": "People",
    "score": 0.3922722560477475
  },
  {
    "id": "global-hashtags-id#c0",
    "authorId": "global-admin-user-id",
    "text": "Global Hashtags",
    "score": 0.3098440265223199
  },
  {
    "id": "6f1b8c4a#c0",
    "authorId": "global-admin-user-id",
    "text": "Academic Papers",
    "score": 0.2812987361799379
  },
  {
    "id": "3245756e#c0",
    "authorId": "global-admin-user-id",
    "text": "Data Sovereignty - GDPR influence spreading, national data localization requirements",
    "score": 0.2549634208640108
  },
  {
    "id": "8e62ed6e#c0",
    "authorId": "global-admin-user-id",
    "text": "Chain-of-Thought Prompting - Wei et al 2022, improved reasoning in large language models",
    "score": 0.1961154677336217
  }
]

[rag] scenario global_only CONTEXT
[[AllowedCitationIds]] 9f509b5f, global-hashtags-id, 6f1b8c4a, 3245756e, 8e62ed6e

[[Doc 1 | id=9f509b5f | author=global-admin-user-id | score=0.392]]
People
[Hierarchy] Parent: Global Hub | Siblings: __global_relation_types__; Market Intel; Industry Analysis | Children: Founders; Investors; Researchers

[[Doc 2 | id=global-hashtags-id | author=global-admin-user-id | score=0.310]]
Global Hashtags

[[Doc 3 | id=6f1b8c4a | author=global-admin-user-id | score=0.281]]
Academic Papers
[Hierarchy] Parent: Global Hub | Siblings: __global_relation_types__; People; Market Intel | Children: Attention Is All You Need - Vaswani et al 2017, introduced transformer architecture, 100k+ citations; Constitutional AI - Anthropic 2022, training AI systems to be helpful harmless and honest; Scaling Laws for Neural Language Models - Kaplan et al 2020, power laws in model performance

[[Doc 4 | id=3245756e | author=global-admin-user-id | score=0.255]]
Data Sovereignty - GDPR influence spreading, national data localization requirements
[Hierarchy] Parent: Geopolitical Factors | Siblings: Chip Wars - US CHIPS Act $280B investment, semiconductor supply chain reshoring; Tech Regulation - Antitrust actions against big tech, AI governance frameworks emerging

[[Doc 5 | id=8e62ed6e | author=global-admin-user-id | score=0.196]]
Chain-of-Thought Prompting - Wei et al 2022, improved reasoning in large language models
[Hierarchy] Parent: Academic Papers | Siblings: Attention Is All You Need - Vaswani et al 2017, introduced transformer architecture, 100k+ citations; Constitutional AI - Anthropic 2022, training AI systems to be helpful harmless and honest; Scaling Laws for Neural Language Models - Kaplan et al 2020, power laws in model performance

[rag] scenario global_only ANSWER


Citations: [id=9f509b5f]

[rag] scenario global_only USAGE
{"prompt_tokens":823,"completion_tokens":400,"total_tokens":1223,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":400,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}}

[rag] scenario global_only STRUCTURED
{
  "citations": [
    "9f509b5f"
  ]
}

[rag] scenario global_only END

[rag] scenario cross_graph_search REQUEST {
{
  "prompt": "What do I know about Sam Altman and my interactions with him?"
}
}

[rag] scenario cross_graph_search DOCS
[
  {
    "id": "6fce070f#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "YC Network - Leverage alumni connections, Sam Altman relationship valuable for AI deals",
    "score": 0.5949094050437624
  },
  {
    "id": "5147f316#c0",
    "authorId": "global-admin-user-id",
    "text": "Sam Altman - CEO of OpenAI, formerly president of Y Combinator, born April 22, 1985",
    "score": 0.5539210187928182
  },
  {
    "id": "4423e6be#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "Sam Altman catch-up - Discussed GPT-5 capabilities and potential co-investment opportunities",
    "score": 0.5253995284792087
  },
  {
    "id": "af17ea0d#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "Cold Outreach Template - Personalized approach for connecting with founders",
    "score": 0.348703499734414
  },
  {
    "id": "bb48cdf9#c0",
    "authorId": "global-admin-user-id",
    "text": "Peter Thiel - Co-founder of PayPal and Palantir, first outside investor in Facebook, Founders Fund partner",
    "score": 0.3261148025820578
  }
]

[rag] scenario cross_graph_search CONTEXT
[[AllowedCitationIds]] 6fce070f, 5147f316, 4423e6be, af17ea0d, bb48cdf9

[[Doc 1 | id=6fce070f | author=SPECIAL::mew|0123456789 | score=0.595]]
YC Network - Leverage alumni connections, Sam Altman relationship valuable for AI deals
[Hierarchy] Parent: Network Building | Siblings: Academic Connections - Stanford AI Lab, MIT CSAIL for technical talent and research commercialization; Corporate Development - Maintain relationships with Google, Microsoft, Meta for strategic exits; International Expansion - Building connections in European AI ecosystem, exploring Asia opportunities

[[Doc 2 | id=5147f316 | author=global-admin-user-id | score=0.554]]
Sam Altman - CEO of OpenAI, formerly president of Y Combinator, born April 22, 1985
[Hierarchy] Parent: Founders | Siblings: Elon Musk - CEO of Tesla and SpaceX, co-founder of OpenAI (departed 2018); Jensen Huang - Founder and CEO of NVIDIA, pioneered GPU computing and AI acceleration

[[Doc 3 | id=4423e6be | author=SPECIAL::mew|0123456789 | score=0.525]]
Sam Altman catch-up - Discussed GPT-5 capabilities and potential co-investment opportunities
[Hierarchy] Parent: Recent | Siblings: Meeting with Jensen - NVIDIA AI Summit discussing Blackwell architecture and 2.5x performance gains; Quick thought on AGI timeline - Converging estimates 2027-2030 after Ilya's OpenAI departure; Due diligence request - Runway ML seeking $5M at $1.5B valuation for video generation platform

[[Doc 4 | id=af17ea0d | author=SPECIAL::mew|0123456789 | score=0.349]]
Cold Outreach Template - Personalized approach for connecting with founders
[Hierarchy] Parent: Communication | Siblings: Founder Pitch Feedback Template - Constructive framework for declining investments; LP Quarterly Update Template - Performance, portfolio highlights, market commentary

[[Doc 5 | id=bb48cdf9 | author=global-admin-user-id | score=0.326]]
Peter Thiel - Co-founder of PayPal and Palantir, first outside investor in Facebook, Founders Fund partner
[Hierarchy] Parent: Investors | Siblings: Sequoia Capital - Leading VC firm with $85B AUM, portfolio includes Apple, Google, Stripe, Airbnb; Marc Andreessen - Co-founder of a16z, previously founded Netscape, 'Software is eating the world' thesis

[rag] scenario cross_graph_search ANSWER


Citations: [id=6fce070f] [id=5147f316]

[rag] scenario cross_graph_search USAGE
{"prompt_tokens":919,"completion_tokens":400,"total_tokens":1319,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":400,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}}

[rag] scenario cross_graph_search STRUCTURED
{
  "citations": [
    "6fce070f",
    "5147f316"
  ]
}

[rag] scenario cross_graph_search END

[rag] scenario knowledge_synthesis REQUEST {
{
  "prompt": "Summarize the current state of AI safety research and my investment thesis"
}
}

[rag] scenario knowledge_synthesis DOCS
[
  {
    "id": "20db8b4d#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "CB Insights AI Funding Report - $42B invested in AI startups in 2023",
    "score": 0.5348724927299255
  },
  {
    "id": "00617e3f#c0",
    "authorId": "global-admin-user-id",
    "text": "AI Safety",
    "score": 0.5252693447849589
  },
  {
    "id": "20ca265e#c0",
    "authorId": "global-admin-user-id",
    "text": "Alignment Research - Methods for ensuring AI systems behave according to human values including RLHF and Constitutional AI",
    "score": 0.5209364520239325
  },
  {
    "id": "54b2bc79#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "Quick thought on AGI timeline - Converging estimates 2027-2030 after Ilya's OpenAI departure",
    "score": 0.5199386063599857
  },
  {
    "id": "0258a4f9#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "Stanford AI Symposium - Academic research increasingly commercializable",
    "score": 0.5052562427267012
  }
]

[rag] scenario knowledge_synthesis CONTEXT
[[AllowedCitationIds]] 20db8b4d, 00617e3f, 20ca265e, 54b2bc79, 0258a4f9

[[Doc 1 | id=20db8b4d | author=SPECIAL::mew|0123456789 | score=0.535]]
CB Insights AI Funding Report - $42B invested in AI startups in 2023
[Hierarchy] Parent: Market Reports | Siblings: Gartner AI Hype Cycle 2024 - Generative AI entering trough of disillusionment; McKinsey AI Adoption Study - 70% of companies piloting, 20% in production

[[Doc 2 | id=00617e3f | author=global-admin-user-id | score=0.525]]
AI Safety
[Hierarchy] Parent: Market Intel | Siblings: Quantum Computing; Biotech Innovations; Climate Tech | Children: Alignment Research - Methods for ensuring AI systems behave according to human values including RLHF and Constitutional AI; Existential Risk - Long-term risks from advanced AI systems with P(doom) estimates ranging from <1% to >50%; Governance Frameworks - Regulatory approaches including EU AI Act, US Executive Order 14110, California SB 1047

[[Doc 3 | id=20ca265e | author=global-admin-user-id | score=0.521]]
Alignment Research - Methods for ensuring AI systems behave according to human values including RLHF and Constitutional AI
[Hierarchy] Parent: AI Safety | Siblings: Existential Risk - Long-term risks from advanced AI systems with P(doom) estimates ranging from <1% to >50%; Governance Frameworks - Regulatory approaches including EU AI Act, US Executive Order 14110, California SB 1047

[[Doc 4 | id=54b2bc79 | author=SPECIAL::mew|0123456789 | score=0.520]]
Quick thought on AGI timeline - Converging estimates 2027-2030 after Ilya's OpenAI departure
[Hierarchy] Parent: Recent | Siblings: Meeting with Jensen - NVIDIA AI Summit discussing Blackwell architecture and 2.5x performance gains; Sam Altman catch-up - Discussed GPT-5 capabilities and potential co-investment opportunities; Due diligence request - Runway ML seeking $5M at $1.5B valuation for video generation platform

[[Doc 5 | id=0258a4f9 | author=SPECIAL::mew|0123456789 | score=0.505]]
Stanford AI Symposium - Academic research increasingly commercializable
[Hierarchy] Parent: 2024-04 | Siblings: YC Demo Day W24 - 30% of batch AI-focused, quality improving each cycle; Index Ventures AI Summit - European AI ecosystem maturing rapidly

[rag] scenario knowledge_synthesis ANSWER


Citations: [id=20db8b4d] [id=00617e3f]

[rag] scenario knowledge_synthesis USAGE
{"prompt_tokens":956,"completion_tokens":400,"total_tokens":1356,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":400,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}}

[rag] scenario knowledge_synthesis STRUCTURED
{
  "citations": [
    "20db8b4d",
    "00617e3f"
  ]
}

[rag] scenario knowledge_synthesis END

[rag] scenario personalized_recommendations REQUEST {
{
  "prompt": "What investment opportunities should I prioritize based on my thesis and current market?"
}
}

[rag] scenario personalized_recommendations DOCS
[
  {
    "id": "334bde34#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "Investment Thesis 2024",
    "score": 0.5370747998433263
  },
  {
    "id": "710769d2#c0",
    "authorId": "global-admin-user-id",
    "text": "Investors",
    "score": 0.46029931587120015
  },
  {
    "id": "d465a7da#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "Active Investments",
    "score": 0.44284052076335684
  },
  {
    "id": "3252dc4f#c0",
    "authorId": "SPECIAL::mew|0123456789",
    "text": "Seed Stage AI Template - Problem, solution, market, team, traction, risks sections",
    "score": 0.40150752350168095
  },
  {
    "id": "710769d2#c0",
    "authorId": "global-admin-user-id",
    "text": "Investors",
    "score": 0.46029931587120015
  }
]

[rag] scenario personalized_recommendations CONTEXT
[[AllowedCitationIds]] 334bde34, 710769d2, d465a7da, 3252dc4f

[[Doc 1 | id=334bde34 | author=SPECIAL::mew|0123456789 | score=0.537]]
Investment Thesis 2024
[Hierarchy] Parent: Personal Notes | Siblings: Network Building; Learning Goals | Children: Focus on AI infrastructure plays - Picks and shovels over pure LLM wrappers; Defensible moats required - Proprietary data, enterprise distribution, or technical differentiation; Avoid commoditized spaces - Basic chatbots, simple API wrappers, undifferentiated tools

[[Doc 2 | id=710769d2 | author=global-admin-user-id | score=0.460]]
Investors
[Hierarchy] Parent: People | Siblings: Founders; Researchers | Children: Sequoia Capital - Leading VC firm with $85B AUM, portfolio includes Apple, Google, Stripe, Airbnb; Marc Andreessen - Co-founder of a16z, previously founded Netscape, 'Software is eating the world' thesis; Peter Thiel - Co-founder of PayPal and Palantir, first outside investor in Facebook, Founders Fund partner

[[Doc 3 | id=d465a7da | author=SPECIAL::mew|0123456789 | score=0.443]]
Active Investments
[Hierarchy] Parent: Portfolio | Siblings: Pipeline; Exits | Children: Perplexity AI - $2M Series B at $520M valuation, AI-powered search competing with Google; Anthropic - $5M investment at $18B valuation, Constitutional AI for enterprise adoption; Cursor AI - $1M seed investment, AI-powered code editor with 100k+ developer adoption

[[Doc 4 | id=3252dc4f | author=SPECIAL::mew|0123456789 | score=0.402]]
Seed Stage AI Template - Problem, solution, market, team, traction, risks sections
[Hierarchy] Parent: Investment Memos | Siblings: Series A Deep Tech Template - Technology moat, IP analysis, competitive dynamics; Due Diligence Checklist - Technical, market, financial, legal, team evaluation framework

[[Doc 5 | id=710769d2 | author=global-admin-user-id | score=0.460]]
Investors
[Hierarchy] Parent: People | Siblings: Founders; Researchers | Children: Sequoia Capital - Leading VC firm with $85B AUM, portfolio includes Apple, Google, Stripe, Airbnb; Marc Andreessen - Co-founder of a16z, previously founded Netscape, 'Software is eating the world' thesis; Peter Thiel - Co-founder of PayPal and Palantir, first outside investor in Facebook, Founders Fund partner

[rag] scenario personalized_recommendations ANSWER


Citations: [id=334bde34] [id=710769d2]

[rag] scenario personalized_recommendations USAGE
{"prompt_tokens":932,"completion_tokens":400,"total_tokens":1332,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":400,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}}

[rag] scenario personalized_recommendations STRUCTURED
{
  "citations": [
    "334bde34",
    "710769d2"
  ]
}

[rag] scenario personalized_recommendations END
