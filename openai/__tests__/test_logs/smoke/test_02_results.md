# Results: live batch_doc_ops

Test: live.smoke.test.ts :: batch_doc_ops
Timestamp: 2025-09-17T23-51-40-254Z

Input.query: Create a 'Prospecting Report — Sam Altman' under user 'Reports/Prospecting'. You may use info from global nodes (People/Investors, Market Intel) but do NOT modify global nodes. Append any new nodes ONLY under the user root. After creating the report, call add_relation linking it to 'global/People/Founders/Sam Altman' using relationType 'relatedTo'. Finish with a summary.
Input.context: User has Reports/Prospecting; Global has People and Market Intel.

Seed.paths:
- user/Reports/Prospecting => OK
- global/People/Founders/Sam Altman => OK

Actions.count: 2
Actions.sample:
- create_node {"parentId":"user/Reports/Prospecting","content":"Node path: user/Reports/Prospecting/Prospecting Report — Sam Altman\n\nProspecting brief — Sam Altman","nodeId":"00000000-0000-0000-0000-000000000000"}
- add_relation {"fromId":"00000000-0000-0000-0000-000000000000","toId":"SAM_ALTMAN","relationTypeId":"relatedTo"}

Created nodes (1), onlyUser=true
- 00000000-0000-0000-0000-000000000000 :: Node path: user/Reports/Prospecting/Prospecting Report — Sam Altman

Prospecting brief — Sam Altman

Prospecting subtree after actions:
- AI Startups Q2 2024 - Analysis of 50 AI startups in seed/Series A focusing on enterprise AI and vertical SaaS
- Quantum Computing Investment Thesis - Deep dive on quantum hardware and software investment opportunities
- Climate Tech Pipeline - Evaluation of 30 climate startups across carbon capture, fusion, and green hydrogen
- Node path: user/Reports/Prospecting/Prospecting Report — Sam Altman

Prospecting brief — Sam Altman
