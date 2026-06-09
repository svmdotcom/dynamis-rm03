const fs = require('fs');
const path = require('path');

const rawPath = path.join(__dirname, 'codebook-raw-xml.txt');
const outPath = path.join(__dirname, '../src/data/codebook.generated.json');

const rawLines = fs.readFileSync(rawPath, 'utf8')
  .split('\n')
  .map(l => l.replace(/^﻿/, '').trimEnd());

// All known single-cell rows that are entry-name continuations (code is on the
// first row, name fragment continues on the next row with no code column).
// Normalised to ASCII hyphens for matching.
const CONTINUATION_FRAGMENTS = new Set([
  '(camph-ac)',
  '(fevernut)',
  '(ladyfern)',
  '(sulphonamides)',
  '(tiger shark liver oil)',
  'dihydrochloride)',
  'milk)',
  'mountain spotted fever',
  'pallidum',
  'penicillin)',
  'pseudotuberculosis',
  'racemosa)',
  'strains)',
  'swan)',
  'urea)',
  'cells',
  'vaccine (pcv)',
]);

function isContinuation(text) {
  // Normalise unicode dashes → ASCII hyphen before matching
  return CONTINUATION_FRAGMENTS.has(
    text.toLowerCase().replace(/[–−—]/g, '-')
  );
}

const results = [];
const seen = new Set();
let currentCategory = '';
let pending = null; // { name, code, category }

function commitPending() {
  if (!pending) return;
  const cleanName = pending.name.replace(/\s+/g, ' ').trim();
  const key = `${cleanName.toLowerCase()}|${pending.code}`;
  if (!seen.has(key)) {
    seen.add(key);
    results.push({
      id: String(results.length + 1).padStart(4, '0'),
      name: cleanName,
      code: pending.code,
      category: pending.category,
      aliases: [],
    });
  }
  pending = null;
}

for (const line of rawLines) {
  if (!line.trim()) continue;

  const parts = line.split('\t');
  const cell0 = parts[0].trim();
  const cell1 = parts[1] ? parts[1].trim() : '';

  if (!cell0) continue;

  if (cell1 && /^\d+$/.test(cell1)) {
    // Entry with numeric code
    commitPending();
    if (!currentCategory) {
      pending = null;
      continue;
    }
    pending = { name: cell0, code: cell1, category: currentCategory };
  } else if (!cell1) {
    // Single-cell row: continuation or category header
    if (pending && isContinuation(cell0)) {
      pending.name = pending.name + ' ' + cell0;
    } else {
      commitPending();
      currentCategory = cell0.replace(/\s+/g, ' ').trim();
    }
  }
  // Non-numeric second cell: skip
}

commitPending();

// Post-process: subdivide bulk homeopathic section by first letter of name
results.forEach(r => {
  if (r.category === 'Guild of Homoepaths MP' || r.category === 'homeopathic potency') {
    const match = r.name.match(/[A-Za-z]/);
    if (match) {
      r.category = `Homeopathic Remedy - ${match[0].toUpperCase()}`;
    }
  }
});

fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');

// ── Stats ─────────────────────────────────────────────────────────────────────
const catMap = {};
results.forEach(r => { catMap[r.category] = (catMap[r.category] || 0) + 1; });
const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

console.log(`Total entries: ${results.length}`);
console.log(`Categories:    ${catEntries.length}`);

console.log('\nTop 30 categories:');
catEntries.slice(0, 30).forEach(([cat, n]) =>
  console.log(`  ${n.toString().padStart(4)} - ${cat}`)
);

const suspicious = catEntries.filter(([cat]) =>
  cat.length < 5 ||
  /\)$/.test(cat) ||
  /^\(/.test(cat) ||
  /^\s*[^a-zA-Z0-9(]/.test(cat)
);
console.log(`\nSuspicious categories: ${suspicious.length}`);
suspicious.forEach(([cat, n]) => console.log(`  ${n.toString().padStart(4)} - "${cat}"`));

function search(term) {
  const t = term.toLowerCase();
  return results.filter(r => r.name.toLowerCase().includes(t));
}

['Tabacum', 'Amoxicillin', 'Ferrum', 'Mag Phos', 'Nat Mur', 'Giardia', 'Tree Pollens'].forEach(term => {
  const hits = search(term);
  console.log(`\nSearch "${term}" → ${hits.length} result(s):`);
  hits.forEach(r => console.log(`  ${r.name} | ${r.code} | ${r.category}`));
});

console.log('\nFirst 20 entries:');
results.slice(0, 20).forEach(r =>
  console.log(`  [${r.id}] ${r.name} | ${r.code} | ${r.category}`)
);

console.log('\nLast 20 entries:');
results.slice(-20).forEach(r =>
  console.log(`  [${r.id}] ${r.name} | ${r.code} | ${r.category}`)
);
