/**
 * Tests d'acceptation du moteur de recherche par symptomes (V3).
 *
 * Usage :
 *   node scripts/symptom-search-v3-tests.js          -> resultats + verdict
 *   node scripts/symptom-search-v3-tests.js --debug  -> detail interne du scoring
 *
 * Le script transpile a la volee src/data/symptomIndex.ts avec le tsc local,
 * puis rejoue les requetes. Si un fichier
 * src/data/symptomSearchAcceptanceTests.v3.json est present, ses cas sont
 * utilises en priorite ; sinon les cas ci-dessous (issus du brief V3) servent
 * de reference.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
// Build dans le projet : la resolution de node_modules doit rester possible.
const OUT = path.join(ROOT, '.tmp-v3-tests');

const FALLBACK_CASES = [
  { query: 'eczema', expectKind: 'conditions', expectTop: ['Eczema'], forbidTop: ['Constipation', 'Glossite', 'Migraines'] },
  { query: 'rhume', expectKind: 'conditions', expectTop: ['Rhume', 'Coryza'], forbidTop: ['Amenorrhee', 'Laryngite striduleuse'] },
  { query: 'rhum', expectKind: 'conditions', expectTop: ['Rhume', 'Rhumatisme'], forbidTop: [] },
  { query: 'douleur yeux', expectKind: 'conditions', expectTop: ['Yeux', 'Douleur'], forbidTop: ['Hepatite', 'Parasites'] },
  { query: 'yeux', expectKind: 'refine', expectTop: [], forbidTop: [] },
  { query: 'toux grasse', expectKind: 'conditions', expectTop: ['Toux'], forbidTop: ['Rougeole', 'Tuberculose'] },
  { query: 'gorge', expectKind: 'refine', expectTop: [], forbidTop: [] },
  { query: 'amygdale', expectKind: 'conditions', expectTop: ['Amygdal', 'Angine'], forbidTop: [] },
  { query: 'langue', expectKind: 'refine', expectTop: [], forbidTop: [] },
  { query: 'bleu', expectKind: 'conditions', expectTop: ['Hematome', 'Contusion', 'Coups', 'Traumatisme'], forbidTop: [] },
  { query: 'oreille qui siffle', expectKind: 'conditions', expectTop: ['Acouphene', 'Bourdonnement'], forbidTop: [] },
  { query: 'mal oreille', expectKind: 'refine', expectTop: [], forbidTop: [] },
  { query: 'ecz', expectKind: 'conditions', expectTop: ['Eczema'], forbidTop: [] },
  { query: 'amyg', expectKind: 'conditions', expectTop: ['Amygdal'], forbidTop: [] },
];

function loadCases() {
  const provided = path.join(ROOT, 'src', 'data', 'symptomSearchAcceptanceTests.v3.json');
  if (!fs.existsSync(provided)) return { source: 'brief V3 (fichier JSON absent)', cases: FALLBACK_CASES };

  const raw = JSON.parse(fs.readFileSync(provided, 'utf8'));
  const list = raw.tests || raw.cases || raw;
  const cases = list.map(item => ({
    query: item.query || item.q,
    expectKind: item.expect_kind || item.expectKind || 'conditions',
    expectTop: item.expect_top || item.expectTop || item.expect || [],
    forbidTop: item.forbid_top || item.forbidTop || item.must_not_contain || [],
  }));
  return { source: path.relative(ROOT, provided), cases };
}

function build() {
  try {
    execFileSync('npx', ['tsc', 'src/data/symptomIndex.ts', '--ignoreConfig', '--outDir', OUT,
      '--module', 'commonjs', '--target', 'es2019', '--resolveJsonModule', '--esModuleInterop',
      '--skipLibCheck', '--moduleResolution', 'bundler'], { cwd: ROOT, shell: true, stdio: 'pipe' });
  } catch (error) {
    // Hors du tsconfig du projet, `require` n'est pas type (TS2591) : le JS est
    // quand meme emis. Toute autre erreur est bloquante.
    const output = String(error.stdout || '');
    const blocking = output.split('\n').filter(line => line.includes('error TS') && !line.includes('TS2591'));
    if (blocking.length > 0) throw new Error(blocking.join('\n'));
  }

  for (const file of ['symptomRemedyIndex.v2.clean.json', 'codebook.generated.json']) {
    fs.copyFileSync(path.join(ROOT, 'src', 'data', file), path.join(OUT, 'data', file));
  }
  return require(path.join(OUT, 'data', 'symptomIndex.js'));
}

function normalize(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function run() {
  const debug = process.argv.includes('--debug');
  const { source, cases } = loadCases();
  const engine = build();

  console.log(`Cas de test : ${source}\n`);

  let passed = 0;
  for (const testCase of cases) {
    const outcome = engine.searchSymptoms(testCase.query);
    const labels = outcome.kind === 'conditions'
      ? outcome.conditions.map(condition => condition.label)
      : outcome.kind === 'refine'
        ? outcome.suggestions.map(suggestion => suggestion.label)
        : [];

    const kindOk = outcome.kind === testCase.expectKind;
    const topOk = testCase.expectTop.length === 0
      || testCase.expectTop.some(expected => labels.slice(0, 3).some(label => normalize(label).includes(normalize(expected))));
    const forbidOk = testCase.forbidTop.every(forbidden =>
      !labels.slice(0, 5).some(label => normalize(label).includes(normalize(forbidden))));

    const ok = kindOk && topOk && forbidOk;
    if (ok) passed += 1;

    console.log(`${ok ? 'OK  ' : 'FAIL'} ${testCase.query} [${outcome.kind}]`);
    console.log(`     ${labels.slice(0, 5).join(' | ') || '(aucun)'}`);
    if (!kindOk) console.log(`     attendu kind=${testCase.expectKind}`);
    if (!topOk) console.log(`     attendu dans le top 3 : ${testCase.expectTop.join(' / ')}`);
    if (!forbidOk) console.log(`     interdit dans le top 5 : ${testCase.forbidTop.join(' / ')}`);

    if (debug && outcome.kind === 'conditions') {
      const detail = engine.explainSearch(testCase.query, 5);
      console.log(`     mots=${JSON.stringify(detail.tokens)} zones=${JSON.stringify(detail.zones)} precisions=${JSON.stringify(detail.refinements)}`);
      for (const result of detail.results) {
        console.log(`       ${result.score} ${result.label} champs=${JSON.stringify(result.fields)}`
          + ` couverture=${result.coveredTokens.length}/${detail.tokens.length}`
          + ` (requis ${Math.round(result.requiredCoverage * 100)}%)${result.exactMatch ? ' exact' : ''}`);
      }
    }
    console.log('');
  }

  console.log(`${passed}/${cases.length} cas conformes`);
  fs.rmSync(OUT, { recursive: true, force: true });
  process.exitCode = passed === cases.length ? 0 : 1;
}

run();
