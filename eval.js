// Evaluate the supplied keyword and semantic search results: node eval.js
// Plain Node.js is enough; no libraries or API keys are needed.
const fs = require('fs');

// --- 1. Load the inputs (already done for you) -----------------------------
// test-set.csv has a header row, then: query,correct_post_ids
// correct_post_ids may be a semicolon list, e.g. "1024;1025".
function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split('\n').slice(1);
  return lines.map(line => {
    const [query, ids] = line.split(',');
    return { query, correctIds: ids.split(';').map(Number) };
  });
}
const testSet = loadTestSet('test-set.csv');

// search-results.json maps each query to the top-10 ranked post_id lists that
// each system returned: { "<query>": { keyword: [...], semantic: [...] } }
const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

// --- 2. Reciprocal Rank ----------------------------------------------------
// Return 1 / (rank of the FIRST correct id in rankedIds). Return 0 if none of
// the correct ids appear in the top 10. Rank is 1-based (first result = rank 1).
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank === null ? 0 : 1 / rank;
}

// Helper: the 1-based rank of the first correct id, or null if it is a miss.
function rankOf(rankedIds, correctIds) {
  const index = rankedIds.slice(0, 10).findIndex(id => correctIds.includes(id));
  return index === -1 ? null : index + 1;
}

// --- 3. Run the evaluation loop -------------------------------------------
// For every query: look up its keyword and semantic ranked lists, compute the
// reciprocal rank of each, accumulate the RRs, and count a "hit" whenever the
// correct answer was found in the top 10 (RR > 0).
// Then compute:
//   keywordMRR, semanticMRR         = average RR across all queries
//   keywordRecall, semanticRecall   = hits / number of queries
let keywordRRSum = 0;
let semanticRRSum = 0;
let keywordHits = 0;
let semanticHits = 0;

const rows = testSet.map(({ query, correctIds }) => {
  const { keyword, semantic } = results[query];
  const keywordRR = reciprocalRank(keyword, correctIds);
  const semanticRR = reciprocalRank(semantic, correctIds);

  keywordRRSum += keywordRR;
  semanticRRSum += semanticRR;
  if (keywordRR > 0) keywordHits += 1;
  if (semanticRR > 0) semanticHits += 1;

  return `| ${query} | ${rankOf(keyword, correctIds) ?? 'miss'} | ${rankOf(semantic, correctIds) ?? 'miss'} |`;
});

const keywordMRR = keywordRRSum / testSet.length;
const semanticMRR = semanticRRSum / testSet.length;
const keywordRecall = keywordHits / testSet.length;
const semanticRecall = semanticHits / testSet.length;

// --- 4. Print a markdown comparison table ---------------------------------
// Print one row per query: | query | keyword rank | semantic rank |  (use "miss"
// when the answer was not in the top 10), then a final **Summary** row with
// MRR and Recall@10 for each system, each rounded to 2 decimals.
console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');
rows.forEach(row => console.log(row));
console.log(`| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`);
