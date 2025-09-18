# RAG Pipeline Live Smoke Log
Started: 2025-09-17T23:50:58.683Z
Environment: OPENAI_KEY_PRESENT=1


[rag] scenario combined REQUEST {
{
  "prompt": "Summarize investor-related topics and any prospecting notes you can find. Provide 2-4 bullet points with citations."
}
}

[rag] scenario combined DOCS
[
  {
    "id": "n6#c0",
    "authorId": "global-admin",
    "text": "Investors",
    "score": 0.4593054566901722
  },
  {
    "id": "n46#c0",
    "authorId": "test-user",
    "text": "Investment Memos",
    "score": 0.539424323981074
  },
  {
    "id": "n47#c0",
    "authorId": "test-user",
    "text": "Seed Stage AI Template - Problem, solution, market, team, traction, risks sections",
    "score": 0.4799716663621695
  },
  {
    "id": "n1u#c0",
    "authorId": "test-user",
    "text": "Prospecting",
    "score": 0.4313829347214656
  },
  {
    "id": "n4c#c0",
    "authorId": "test-user",
    "text": "LP Quarterly Update Template - Performance, portfolio highlights, market commentary",
    "score": 0.4824166038594715
  }
]

[rag] scenario combined CONTEXT
[[AllowedCitationIds]] n6, n46, n47, n1u, n4c

[[Doc 1 | id=n6 | author=global-admin | score=0.459]]
Investors
[Hierarchy] Parent: People | Siblings: Founders; Researchers | Children: Sequoia Capital - Leading VC firm with $85B AUM, portfolio includes Apple, Google, Stripe, Airbnb; Marc Andreessen - Co-founder of a16z, previously founded Netscape, 'Software is eating the world' thesis; Peter Thiel - Co-founder of PayPal and Palantir, first outside investor in Facebook, Founders Fund partner

[[Doc 2 | id=n46 | author=test-user | score=0.539]]
Investment Memos
[Hierarchy] Parent: Templates | Siblings: Communication | Children: Seed Stage AI Template - Problem, solution, market, team, traction, risks sections; Series A Deep Tech Template - Technology moat, IP analysis, competitive dynamics; Due Diligence Checklist - Technical, market, financial, legal, team evaluation framework

[[Doc 3 | id=n47 | author=test-user | score=0.480]]
Seed Stage AI Template - Problem, solution, market, team, traction, risks sections
[Hierarchy] Parent: Investment Memos | Siblings: Series A Deep Tech Template - Technology moat, IP analysis, competitive dynamics; Due Diligence Checklist - Technical, market, financial, legal, team evaluation framework

[[Doc 4 | id=n1u | author=test-user | score=0.431]]
Prospecting
[Hierarchy] Parent: Reports | Siblings: Due Diligence; Market Research | Children: AI Startups Q2 2024 - Analysis of 50 AI startups in seed/Series A focusing on enterprise AI and vertical SaaS; Quantum Computing Investment Thesis - Deep dive on quantum hardware and software investment opportunities; Climate Tech Pipeline - Evaluation of 30 climate startups across carbon capture, fusion, and green hydrogen

[[Doc 5 | id=n4c | author=test-user | score=0.482]]
LP Quarterly Update Template - Performance, portfolio highlights, market commentary
[Hierarchy] Parent: Communication | Siblings: Founder Pitch Feedback Template - Constructive framework for declining investments; Cold Outreach Template - Personalized approach for connecting with founders

[rag] scenario combined ANSWER


Citations: [id=n46] [id=n6]

[rag] scenario combined USAGE
{"prompt_tokens":832,"completion_tokens":400,"total_tokens":1232,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":400,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}}

[rag] scenario combined STRUCTURED
{
  "citations": [
    "n46",
    "n6"
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
    "id": "n1u#c0",
    "authorId": "test-user",
    "text": "Prospecting",
    "score": 0.567262058941178
  },
  {
    "id": "n3x#c0",
    "authorId": "test-user",
    "text": "Market Reports",
    "score": 0.4864535842822866
  },
  {
    "id": "n49#c0",
    "authorId": "test-user",
    "text": "Due Diligence Checklist - Technical, market, financial, legal, team evaluation framework",
    "score": 0.38760167524298866
  },
  {
    "id": "n2z#c0",
    "authorId": "test-user",
    "text": "Personal Notes",
    "score": 0.3467145022897878
  },
  {
    "id": "n1t#c0",
    "authorId": "test-user",
    "text": "Reports",
    "score": 0.3953494734779642
  }
]

[rag] scenario user_only CONTEXT
[[AllowedCitationIds]] n1u, n3x, n49, n2z, n1t

[[Doc 1 | id=n1u | author=test-user | score=0.567]]
Prospecting
[Hierarchy] Parent: Reports | Siblings: Due Diligence; Market Research | Children: AI Startups Q2 2024 - Analysis of 50 AI startups in seed/Series A focusing on enterprise AI and vertical SaaS; Quantum Computing Investment Thesis - Deep dive on quantum hardware and software investment opportunities; Climate Tech Pipeline - Evaluation of 30 climate startups across carbon capture, fusion, and green hydrogen

[[Doc 2 | id=n3x | author=test-user | score=0.486]]
Market Reports
[Hierarchy] Parent: Research Library | Siblings: AI Papers; Technical Guides | Children: Gartner AI Hype Cycle 2024 - Generative AI entering trough of disillusionment; McKinsey AI Adoption Study - 70% of companies piloting, 20% in production; CB Insights AI Funding Report - $42B invested in AI startups in 2023

[[Doc 3 | id=n49 | author=test-user | score=0.388]]
Due Diligence Checklist - Technical, market, financial, legal, team evaluation framework
[Hierarchy] Parent: Investment Memos | Siblings: Seed Stage AI Template - Problem, solution, market, team, traction, risks sections; Series A Deep Tech Template - Technology moat, IP analysis, competitive dynamics

[[Doc 4 | id=n2z | author=test-user | score=0.347]]
Personal Notes
[Hierarchy] Parent: User Root | Siblings: Reports; Portfolio; Inbox | Children: Investment Thesis 2024; Network Building; Learning Goals

[[Doc 5 | id=n1t | author=test-user | score=0.395]]
Reports
[Hierarchy] Parent: User Root | Siblings: Portfolio; Inbox; Personal Notes | Children: Prospecting; Due Diligence; Market Research

[rag] scenario user_only ANSWER


Citations: [id=n1u]

[rag] scenario user_only USAGE
{"prompt_tokens":754,"completion_tokens":400,"total_tokens":1154,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":400,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}}

[rag] scenario user_only STRUCTURED
{
  "citations": [
    "n1u"
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
    "id": "n1#c0",
    "authorId": "global-admin",
    "text": "People",
    "score": 0.39232819923122514
  },
  {
    "id": "n1n#c0",
    "authorId": "global-admin",
    "text": "Data Sovereignty - GDPR influence spreading, national data localization requirements",
    "score": 0.25517289947086963
  },
  {
    "id": "n18#c0",
    "authorId": "global-admin",
    "text": "Academic Papers",
    "score": 0.2813499548465916
  },
  {
    "id": "n1e#c0",
    "authorId": "global-admin",
    "text": "Chain-of-Thought Prompting - Wei et al 2022, improved reasoning in large language models",
    "score": 0.19614539095168804
  },
  {
    "id": "n1g#c0",
    "authorId": "global-admin",
    "text": "Global Trends",
    "score": 0.2520928307041128
  }
]

[rag] scenario global_only CONTEXT
[[AllowedCitationIds]] n1, n1n, n18, n1e, n1g

[[Doc 1 | id=n1 | author=global-admin | score=0.392]]
People
[Hierarchy] Parent: Global | Siblings: Market Intel; Industry Analysis; Academic Papers | Children: Founders; Investors; Researchers

[[Doc 2 | id=n1n | author=global-admin | score=0.255]]
Data Sovereignty - GDPR influence spreading, national data localization requirements
[Hierarchy] Parent: Geopolitical Factors | Siblings: Chip Wars - US CHIPS Act $280B investment, semiconductor supply chain reshoring; Tech Regulation - Antitrust actions against big tech, AI governance frameworks emerging

[[Doc 3 | id=n18 | author=global-admin | score=0.281]]
Academic Papers
[Hierarchy] Parent: Global | Siblings: People; Market Intel; Industry Analysis | Children: Attention Is All You Need - Vaswani et al 2017, introduced transformer architecture, 100k+ citations; Constitutional AI - Anthropic 2022, training AI systems to be helpful harmless and honest; Scaling Laws for Neural Language Models - Kaplan et al 2020, power laws in model performance

[[Doc 4 | id=n1e | author=global-admin | score=0.196]]
Chain-of-Thought Prompting - Wei et al 2022, improved reasoning in large language models
[Hierarchy] Parent: Academic Papers | Siblings: Attention Is All You Need - Vaswani et al 2017, introduced transformer architecture, 100k+ citations; Constitutional AI - Anthropic 2022, training AI systems to be helpful harmless and honest; Scaling Laws for Neural Language Models - Kaplan et al 2020, power laws in model performance

[[Doc 5 | id=n1g | author=global-admin | score=0.252]]
Global Trends
[Hierarchy] Parent: Global | Siblings: People; Market Intel; Industry Analysis | Children: Technology Adoption; Geopolitical Factors; Workforce Evolution

[rag] scenario global_only ANSWER


Citations: [id=n1]

[rag] scenario global_only USAGE
{"prompt_tokens":764,"completion_tokens":400,"total_tokens":1164,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":400,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}}

[rag] scenario global_only STRUCTURED
{
  "citations": [
    "n1"
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
    "id": "n36#c0",
    "authorId": "test-user",
    "text": "YC Network - Leverage alumni connections, Sam Altman relationship valuable for AI deals",
    "score": 0.594928072226688
  },
  {
    "id": "n3#c0",
    "authorId": "global-admin",
    "text": "Sam Altman - CEO of OpenAI, formerly president of Y Combinator, born April 22, 1985",
    "score": 0.5539219042137244
  },
  {
    "id": "n2q#c0",
    "authorId": "test-user",
    "text": "Sam Altman catch-up - Discussed GPT-5 capabilities and potential co-investment opportunities",
    "score": 0.5254204375366662
  },
  {
    "id": "n4d#c0",
    "authorId": "test-user",
    "text": "Cold Outreach Template - Personalized approach for connecting with founders",
    "score": 0.3486948069962215
  },
  {
    "id": "n9#c0",
    "authorId": "global-admin",
    "text": "Peter Thiel - Co-founder of PayPal and Palantir, first outside investor in Facebook, Founders Fund partner",
    "score": 0.3260699401604428
  }
]

[rag] scenario cross_graph_search CONTEXT
[[AllowedCitationIds]] n36, n3, n2q, n4d, n9

[[Doc 1 | id=n36 | author=test-user | score=0.595]]
YC Network - Leverage alumni connections, Sam Altman relationship valuable for AI deals
[Hierarchy] Parent: Network Building | Siblings: Academic Connections - Stanford AI Lab, MIT CSAIL for technical talent and research commercialization; Corporate Development - Maintain relationships with Google, Microsoft, Meta for strategic exits; International Expansion - Building connections in European AI ecosystem, exploring Asia opportunities

[[Doc 2 | id=n3 | author=global-admin | score=0.554]]
Sam Altman - CEO of OpenAI, formerly president of Y Combinator, born April 22, 1985
[Hierarchy] Parent: Founders | Siblings: Elon Musk - CEO of Tesla and SpaceX, co-founder of OpenAI (departed 2018); Jensen Huang - Founder and CEO of NVIDIA, pioneered GPU computing and AI acceleration

[[Doc 3 | id=n2q | author=test-user | score=0.525]]
Sam Altman catch-up - Discussed GPT-5 capabilities and potential co-investment opportunities
[Hierarchy] Parent: Recent | Siblings: Meeting with Jensen - NVIDIA AI Summit discussing Blackwell architecture and 2.5x performance gains; Quick thought on AGI timeline - Converging estimates 2027-2030 after Ilya's OpenAI departure; Due diligence request - Runway ML seeking $5M at $1.5B valuation for video generation platform

[[Doc 4 | id=n4d | author=test-user | score=0.349]]
Cold Outreach Template - Personalized approach for connecting with founders
[Hierarchy] Parent: Communication | Siblings: Founder Pitch Feedback Template - Constructive framework for declining investments; LP Quarterly Update Template - Performance, portfolio highlights, market commentary

[[Doc 5 | id=n9 | author=global-admin | score=0.326]]
Peter Thiel - Co-founder of PayPal and Palantir, first outside investor in Facebook, Founders Fund partner
[Hierarchy] Parent: Investors | Siblings: Sequoia Capital - Leading VC firm with $85B AUM, portfolio includes Apple, Google, Stripe, Airbnb; Marc Andreessen - Co-founder of a16z, previously founded Netscape, 'Software is eating the world' thesis

[rag] scenario cross_graph_search ANSWER


Citations: [id=n36] [id=n3]

[rag] scenario cross_graph_search USAGE
{"prompt_tokens":839,"completion_tokens":400,"total_tokens":1239,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":400,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}}

[rag] scenario cross_graph_search STRUCTURED
{
  "citations": [
    "n36",
    "n3"
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
    "id": "n40#c0",
    "authorId": "test-user",
    "text": "CB Insights AI Funding Report - $42B invested in AI startups in 2023",
    "score": 0.5349016548243263
  },
  {
    "id": "nf#c0",
    "authorId": "global-admin",
    "text": "AI Safety",
    "score": 0.5253327864251437
  },
  {
    "id": "n3d#c0",
    "authorId": "test-user",
    "text": "Regulatory Landscape - Tracking global AI governance and compliance requirements",
    "score": 0.5310882532963239
  },
  {
    "id": "n2p#c0",
    "authorId": "test-user",
    "text": "Quick thought on AGI timeline - Converging estimates 2027-2030 after Ilya's OpenAI departure",
    "score": 0.5195128558956517
  },
  {
    "id": "n31#c0",
    "authorId": "test-user",
    "text": "Focus on AI infrastructure plays - Picks and shovels over pure LLM wrappers",
    "score": 0.5075415747209013
  }
]

[rag] scenario knowledge_synthesis CONTEXT
[[AllowedCitationIds]] n40, nf, n3d, n2p, n31

[[Doc 1 | id=n40 | author=test-user | score=0.535]]
CB Insights AI Funding Report - $42B invested in AI startups in 2023
[Hierarchy] Parent: Market Reports | Siblings: Gartner AI Hype Cycle 2024 - Generative AI entering trough of disillusionment; McKinsey AI Adoption Study - 70% of companies piloting, 20% in production

[[Doc 2 | id=nf | author=global-admin | score=0.525]]
AI Safety
[Hierarchy] Parent: Market Intel | Siblings: Quantum Computing; Biotech Innovations; Climate Tech | Children: Alignment Research - Methods for ensuring AI systems behave according to human values including RLHF and Constitutional AI; Existential Risk - Long-term risks from advanced AI systems with P(doom) estimates ranging from <1% to >50%; Governance Frameworks - Regulatory approaches including EU AI Act, US Executive Order 14110, California SB 1047

[[Doc 3 | id=n3d | author=test-user | score=0.531]]
Regulatory Landscape - Tracking global AI governance and compliance requirements
[Hierarchy] Parent: Learning Goals | Siblings: Technical Deep Dives - Understanding transformer alternatives, multimodal architectures; Market Analysis - Studying vertical AI disruption patterns across industries; Emerging Technologies - Quantum computing, neuromorphic chips, biological computing

[[Doc 4 | id=n2p | author=test-user | score=0.520]]
Quick thought on AGI timeline - Converging estimates 2027-2030 after Ilya's OpenAI departure
[Hierarchy] Parent: Recent | Siblings: Meeting with Jensen - NVIDIA AI Summit discussing Blackwell architecture and 2.5x performance gains; Sam Altman catch-up - Discussed GPT-5 capabilities and potential co-investment opportunities; Due diligence request - Runway ML seeking $5M at $1.5B valuation for video generation platform

[[Doc 5 | id=n31 | author=test-user | score=0.508]]
Focus on AI infrastructure plays - Picks and shovels over pure LLM wrappers
[Hierarchy] Parent: Investment Thesis 2024 | Siblings: Defensible moats required - Proprietary data, enterprise distribution, or technical differentiation; Avoid commoditized spaces - Basic chatbots, simple API wrappers, undifferentiated tools; Key criteria - 10x improvement, $1B+ TAM, exceptional founders, clear GTM strategy

[rag] scenario knowledge_synthesis ANSWER


Citations: [id=n40] [id=nf]

[rag] scenario knowledge_synthesis USAGE
{"prompt_tokens":872,"completion_tokens":400,"total_tokens":1272,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":400,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}}

[rag] scenario knowledge_synthesis STRUCTURED
{
  "citations": [
    "n40",
    "nf"
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
    "id": "n30#c0",
    "authorId": "test-user",
    "text": "Investment Thesis 2024",
    "score": 0.5371633277184577
  },
  {
    "id": "n6#c0",
    "authorId": "global-admin",
    "text": "Investors",
    "score": 0.46030921955215814
  },
  {
    "id": "n27#c0",
    "authorId": "test-user",
    "text": "Active Investments",
    "score": 0.44287318201612397
  },
  {
    "id": "n47#c0",
    "authorId": "test-user",
    "text": "Seed Stage AI Template - Problem, solution, market, team, traction, risks sections",
    "score": 0.4015032963338681
  },
  {
    "id": "n6#c0",
    "authorId": "global-admin",
    "text": "Investors",
    "score": 0.46030921955215814
  }
]

[rag] scenario personalized_recommendations CONTEXT
[[AllowedCitationIds]] n30, n6, n27, n47

[[Doc 1 | id=n30 | author=test-user | score=0.537]]
Investment Thesis 2024
[Hierarchy] Parent: Personal Notes | Siblings: Network Building; Learning Goals | Children: Focus on AI infrastructure plays - Picks and shovels over pure LLM wrappers; Defensible moats required - Proprietary data, enterprise distribution, or technical differentiation; Avoid commoditized spaces - Basic chatbots, simple API wrappers, undifferentiated tools

[[Doc 2 | id=n6 | author=global-admin | score=0.460]]
Investors
[Hierarchy] Parent: People | Siblings: Founders; Researchers | Children: Sequoia Capital - Leading VC firm with $85B AUM, portfolio includes Apple, Google, Stripe, Airbnb; Marc Andreessen - Co-founder of a16z, previously founded Netscape, 'Software is eating the world' thesis; Peter Thiel - Co-founder of PayPal and Palantir, first outside investor in Facebook, Founders Fund partner

[[Doc 3 | id=n27 | author=test-user | score=0.443]]
Active Investments
[Hierarchy] Parent: Portfolio | Siblings: Pipeline; Exits | Children: Perplexity AI - $2M Series B at $520M valuation, AI-powered search competing with Google; Anthropic - $5M investment at $18B valuation, Constitutional AI for enterprise adoption; Cursor AI - $1M seed investment, AI-powered code editor with 100k+ developer adoption

[[Doc 4 | id=n47 | author=test-user | score=0.402]]
Seed Stage AI Template - Problem, solution, market, team, traction, risks sections
[Hierarchy] Parent: Investment Memos | Siblings: Series A Deep Tech Template - Technology moat, IP analysis, competitive dynamics; Due Diligence Checklist - Technical, market, financial, legal, team evaluation framework

[[Doc 5 | id=n6 | author=global-admin | score=0.460]]
Investors
[Hierarchy] Parent: People | Siblings: Founders; Researchers | Children: Sequoia Capital - Leading VC firm with $85B AUM, portfolio includes Apple, Google, Stripe, Airbnb; Marc Andreessen - Co-founder of a16z, previously founded Netscape, 'Software is eating the world' thesis; Peter Thiel - Co-founder of PayPal and Palantir, first outside investor in Facebook, Founders Fund partner

[rag] scenario personalized_recommendations ANSWER


Citations: [id=n30] [id=n6]

[rag] scenario personalized_recommendations USAGE
{"prompt_tokens":855,"completion_tokens":400,"total_tokens":1255,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0},"completion_tokens_details":{"reasoning_tokens":400,"audio_tokens":0,"accepted_prediction_tokens":0,"rejected_prediction_tokens":0}}

[rag] scenario personalized_recommendations STRUCTURED
{
  "citations": [
    "n30",
    "n6"
  ]
}

[rag] scenario personalized_recommendations END
