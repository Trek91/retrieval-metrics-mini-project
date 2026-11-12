# Retrieval Metrics Mini Project

This program compares keyword and semantic search using the supplied ranked results for 10 queries. It runs locally with Node.js and needs no dependencies, database, or API keys.

## Run

```bash
node eval.js
```

## Metrics

- **Reciprocal rank:** `1 / rank` of the first correct post in the top 10, or `0` for a miss. When multiple post IDs are correct, the earliest matching result determines the rank.
- **MRR:** the sum of reciprocal ranks divided by the number of queries, including misses.
- **Recall@10:** the fraction of queries with at least one correct post in the top 10, as defined by this assignment.

The evaluation uses `test-set.csv` for queries and correct IDs and `search-results.json` for each system's ranked lists. `posts-dataset.csv` contains the referenced posts for inspection. These are fixture results; the program does not run live searches.

## Program output

```text
| Query | Keyword rank | Semantic rank |
|---|---|---|
| my redis cache keeps showing old data | 8 | 1 |
| how do I add semantic search to a table I already have | miss | 2 |
| redis or memcached for caching | 1 | 2 |
| why did my query get slower after I added an index | miss | 1 |
| what does ACID actually guarantee | 2 | 1 |
| how do I keep my postgres online while changing the schema | 6 | 3 |
| my background jobs stop after every deploy | miss | 2 |
| how do I let my database accept more writes per second | 4 | 1 |
| sql or nosql for a new product | 1 | 3 |
| why does my redis memory keep climbing | miss | 2 |
| **Summary** | **MRR 0.30 · Recall@10 0.60** | **MRR 0.67 · Recall@10 1.00** |
```

## Interpretation

Semantic search performs better overall on this test set, with MRR of 0.67 versus 0.30 and Recall@10 of 1.00 versus 0.60, finding a correct post for all 10 queries while keyword search finds one for six. Keyword search wins on "redis or memcached for caching" and "sql or nosql for a new product", which both explicitly name the technologies being compared and give keyword matching clear terms to work with. Semantic search wins on "my redis cache keeps showing old data", "why did my query get slower after I added an index", "my background jobs stop after every deploy", and "why does my redis memory keep climbing", which describe symptoms in everyday language. It also wins on "how do I add semantic search to a table I already have", "how do I keep my postgres online while changing the schema", and "how do I let my database accept more writes per second", which express practical goals whose wording may differ from the relevant posts. Its remaining win, "what does ACID actually guarantee", asks for a concept's meaning; together these eight wins suggest that matching intent helps with explanatory questions as well as symptoms and goals, although this small fixture set cannot establish performance on other queries. A team would still keep keyword search because its two first-place comparison results show that it can complement semantic search when users provide explicit technical terms.
