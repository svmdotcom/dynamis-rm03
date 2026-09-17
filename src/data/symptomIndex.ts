import type {
  CodebookEntry,
  ConditionResult,
  RankedRemedy,
  RefinementSuggestion,
  SymptomCondition,
  SymptomIndexFile,
  OntologyZone,
  SymptomRemedy,
  SymptomSearchConfig,
  SymptomSearchOutcome,
} from '../types';
import type { ConditionScore } from '../utils/symptomSearch';
import {
  buildQueryTerms,
  foldRemedyName,
  normalizeText,
  scoreCondition,
  stem,
} from '../utils/symptomSearch';
import { remedies as codebookEntries } from './index';
import rawConfig from './symptomSearchConfig.v2.json';

/** Condition de la v2, pre-normalisee une seule fois. */
export interface PreparedCondition {
  condition: SymptomCondition;
  normLabel: string;
  stemLabel: string;
  labelTokens: Set<string>;
  aliases: string[];
  aliasTokens: Set<string>;
  layAliases: string[];
  layAliasTokens: Set<string>;
  /** Mots-cles repris du libelle / des alias : signal fort. */
  primaryKeywords: Set<string>;
  /** Mots-cles issus de la description : signal faible. */
  secondaryKeywords: Set<string>;
  symptomPhrases: string[];
  symptomTokens: Set<string>;
  domains: Set<string>;
}

export interface PreparedRefinement {
  zone: string;
  label: string;
  /** Requetes candidates, de la plus specifique a la plus generale. */
  queries: string[];
  tokens: Set<string>;
}

export interface PreparedOntology {
  zoneByAlias: Map<string, string>;
  refinementsByZone: Map<string, PreparedRefinement[]>;
  allRefinements: PreparedRefinement[];
}

interface CodebookCandidate {
  entry: CodebookEntry;
  tokens: string[];
}

interface SymptomIndex {
  prepared: PreparedCondition[];
  ontology: PreparedOntology;
  sourceTitles: Map<string, string>;
}

export const searchConfig = rawConfig as unknown as SymptomSearchConfig;

/** Maximum de conditions proposees avant que l'utilisateur en choisisse une. */
const MAX_CONDITIONS = Math.min(5, searchConfig.search_rules.max_condition_results);
/** Score minimal absolu : sous ce seuil, le signal est du bruit de description. */
const MIN_SCORE = 20;
/** Un resultat tres en dessous du meilleur score n'est pas montre. */
const RELATIVE_SCORE_THRESHOLD = 0.2;

let indexCache: SymptomIndex | null = null;
let codebookCache: Map<string, CodebookCandidate[]> | null = null;
const resolutionCache = new Map<string, CodebookEntry | null>();

function tokenSet(values: string[]): Set<string> {
  const set = new Set<string>();
  for (const value of values) {
    for (const word of normalizeText(value).split(' ')) {
      if (word.length >= 3) set.add(stem(word));
    }
  }
  return set;
}

function stemPhrase(value: string): string {
  return normalizeText(value).split(' ').map(stem).join(' ');
}

/**
 * Extension d'ontologie cote application : uniquement du vocabulaire et de la
 * hierarchie de repertoire (zones anatomiques et libelles de precision).
 * Aucune association remede <-> maladie n'est creee ici : les puces relancent
 * simplement une recherche sur des termes deja presents dans la base.
 */
const ONTOLOGY_EXTENSIONS: Record<string, OntologyZone> = {
  langue: {
    aliases: ['langue', 'lingual'],
    refinements: [
      { label: 'Langue douloureuse / brulante', terms: ['glossite'] },
      { label: 'Ulceration / aphte', terms: ['aphtes'] },
      { label: 'Langue blanche / muguet', terms: ['muguet'] },
      { label: 'Inflammation de la bouche', terms: ['stomatite'] },
      { label: 'Bouche seche', terms: ['secheresse buccale', 'xerostomie'] },
    ],
  },
};

/** Fusionne l'ontologie du fichier de config et l'extension de vocabulaire. */
function mergeOntology(config: SymptomSearchConfig): Record<string, OntologyZone> {
  const merged: Record<string, OntologyZone> = { ...(config.ontology ?? {}) };

  for (const [zone, definition] of Object.entries(ONTOLOGY_EXTENSIONS)) {
    const existing = merged[zone];
    merged[zone] = existing
      ? {
        aliases: [...(existing.aliases ?? []), ...(definition.aliases ?? [])],
        refinements: [...(existing.refinements ?? []), ...(definition.refinements ?? [])],
      }
      : definition;
  }

  return merged;
}

/**
 * Requetes candidates d'une puce de precision, triees du terme le plus
 * discriminant au plus general ("lombalgie" avant "mal dos"). La premiere qui
 * donne des resultats sera retenue a l'affichage.
 */
function refinementQueries(terms: string[], fallback: string): string[] {
  const candidates = terms.length > 0 ? [...terms] : [fallback];
  const specificity = (term: string): number => normalizeText(term)
    .split(' ')
    .reduce((max, word) => Math.max(max, word.length), 0);

  return candidates.sort((a, b) => specificity(b) - specificity(a));
}

function prepareOntology(config: SymptomSearchConfig): PreparedOntology {
  const zoneByAlias = new Map<string, string>();
  const refinementsByZone = new Map<string, PreparedRefinement[]>();
  const allRefinements: PreparedRefinement[] = [];

  for (const [zone, definition] of Object.entries(mergeOntology(config))) {
    for (const alias of definition.aliases ?? []) {
      for (const word of normalizeText(alias).split(' ')) {
        if (word.length >= 3) zoneByAlias.set(stem(word), zone);
      }
    }

    const refinements: PreparedRefinement[] = (definition.refinements ?? []).map(refinement => ({
      zone,
      label: refinement.label,
      queries: refinementQueries(refinement.terms ?? [], refinement.label),
      tokens: tokenSet(refinement.terms ?? []),
    }));

    refinementsByZone.set(zone, refinements);
    allRefinements.push(...refinements);
  }

  return { zoneByAlias, refinementsByZone, allRefinements };
}

/**
 * symptomRemedyIndex.v2.clean.json est volumineux : charge et normalise une
 * seule fois, puis garde en cache pour la session.
 */
export function getSymptomIndex(): SymptomIndex {
  if (indexCache) return indexCache;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const raw = require('./symptomRemedyIndex.v2.clean.json') as SymptomIndexFile;
  const conditions = Array.isArray(raw.conditions) ? raw.conditions : [];

  const prepared: PreparedCondition[] = conditions
    .filter(condition => condition.searchable !== false)
    .map((condition) => {
      const normLabel = normalizeText(condition.label ?? '');
      const symptoms = condition.symptoms ?? [];

      const labelTokens = tokenSet([condition.label ?? '']);
      const aliasTokens = tokenSet(condition.aliases ?? []);
      const layAliasTokens = tokenSet(condition.lay_aliases ?? []);

      // keywords_v2 melange les mots du libelle et des mots repris de la
      // description ("eczema" apparait dans les mots-cles de Constipation).
      // Seuls les premiers sont un signal fort.
      const primaryKeywords = new Set<string>();
      const secondaryKeywords = new Set<string>();
      for (const keyword of tokenSet(condition.keywords_v2 ?? [])) {
        if (labelTokens.has(keyword) || aliasTokens.has(keyword) || layAliasTokens.has(keyword)) {
          primaryKeywords.add(keyword);
        } else {
          secondaryKeywords.add(keyword);
        }
      }

      return {
        condition,
        normLabel,
        stemLabel: stemPhrase(condition.label ?? ''),
        labelTokens,
        aliases: (condition.aliases ?? []).map(stemPhrase),
        aliasTokens,
        layAliases: (condition.lay_aliases ?? []).map(stemPhrase),
        layAliasTokens,
        primaryKeywords,
        secondaryKeywords,
        symptomPhrases: symptoms.map(stemPhrase),
        symptomTokens: tokenSet(symptoms),
        domains: tokenSet(condition.domains ?? []),
      };
    });

  const sourceTitles = new Map<string, string>();
  for (const source of raw.meta?.sources ?? []) {
    if (source.source_id && typeof source.title === 'string') {
      sourceTitles.set(source.source_id, source.title);
    }
  }

  indexCache = { prepared, ontology: prepareOntology(searchConfig), sourceTitles };
  return indexCache;
}

function getCodebookIndex(): Map<string, CodebookCandidate[]> {
  if (codebookCache) return codebookCache;

  const map = new Map<string, CodebookCandidate[]>();

  for (const entry of codebookEntries) {
    const tokens = foldRemedyName(entry.name).split(' ').filter(Boolean);
    if (tokens.length === 0) continue;

    const bucketKey = tokens[0].slice(0, 3);
    const bucket = map.get(bucketKey);
    if (bucket) bucket.push({ entry, tokens });
    else map.set(bucketKey, [{ entry, tokens }]);
  }

  codebookCache = map;
  return map;
}

function isHomeopathic(entry: CodebookEntry): boolean {
  return entry.category?.startsWith('Homeopathic Remedy') ?? false;
}

/**
 * Nom de remede -> entree RM03 existante, uniquement par normalisation
 * orthographique et correspondance de prefixes de mots. Renvoie null si aucune
 * correspondance sure : aucun code n'est cree.
 */
export function resolveRemedyCode(name: string, variants: string[] = []): CodebookEntry | null {
  const cacheKey = name.toLowerCase();
  const cached = resolutionCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let found: CodebookEntry | null = null;
  for (const candidate of [name, ...variants]) {
    found = matchCodebook(candidate);
    if (found) break;
  }

  resolutionCache.set(cacheKey, found);
  return found;
}

function matchCodebook(name: string): CodebookEntry | null {
  const queryTokens = foldRemedyName(name).split(' ').filter(Boolean);
  if (queryTokens.length === 0) return null;

  const candidates = getCodebookIndex().get(queryTokens[0].slice(0, 3)) ?? [];
  let best: CodebookEntry | null = null;
  let bestScore = -1;
  const longerCandidates: CodebookEntry[] = [];

  for (const candidate of candidates) {
    const { tokens, entry } = candidate;

    if (tokens.length <= queryTokens.length) {
      let matches = true;
      for (let i = 0; i < tokens.length; i += 1) {
        if (!queryTokens[i].startsWith(tokens[i]) && !tokens[i].startsWith(queryTokens[i])) {
          matches = false;
          break;
        }
      }
      if (!matches) continue;

      const score = tokens.length * 4
        + (isHomeopathic(entry) ? 2 : 0)
        + (tokens.join(' ') === queryTokens.join(' ') ? 1 : 0);

      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    } else {
      let matches = true;
      for (let i = 0; i < queryTokens.length; i += 1) {
        if (!tokens[i].startsWith(queryTokens[i])) {
          matches = false;
          break;
        }
      }
      if (matches) longerCandidates.push(entry);
    }
  }

  if (best) return best;

  const uniqueCodes = new Set(longerCandidates.map(entry => entry.code));
  if (longerCandidates.length > 0 && uniqueCodes.size === 1) return longerCandidates[0];

  return null;
}

/**
 * Niveau 2 : classement des remedes a l'interieur d'une condition.
 * Priorite aux associations citees dans plusieurs sources (source_count /
 * book_consensus). Aucun remede n'est ajoute ni invente.
 */
function rankRemedies(condition: SymptomCondition, sourceTitles: Map<string, string>): RankedRemedy[] {
  const bonus = searchConfig.search_rules.multi_source_remedy_bonus;
  const seen = new Set<string>();
  const scored: { remedy: RankedRemedy; score: number }[] = [];

  for (const remedy of condition.remedies ?? []) {
    const key = foldRemedyName(remedy.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);

    const sourceCount = remedy.source_count ?? remedy.source_ids?.length ?? 1;
    const confidence = bestConfidence(remedy);
    const titles = (remedy.source_ids ?? [])
      .map(id => sourceTitles.get(id))
      .filter((title): title is string => typeof title === 'string' && title.length > 0);

    scored.push({
      score: sourceCount * bonus + confidence * 10,
      remedy: {
        name: remedy.name,
        entry: resolveRemedyCode(remedy.name, remedy.name_variants ?? []),
        sourceCount,
        sourceTitles: titles,
        multiSource: remedy.book_consensus === 'multiple_sources' || sourceCount > 1,
      },
    });
  }

  scored.sort((a, b) => (b.score - a.score) || a.remedy.name.localeCompare(b.remedy.name));
  return scored.map(item => item.remedy);
}

function bestConfidence(remedy: SymptomRemedy): number {
  let best = 0;
  for (const evidence of remedy.evidence ?? []) {
    if (typeof evidence.match_confidence === 'number' && evidence.match_confidence > best) {
      best = evidence.match_confidence;
    }
  }
  return best;
}

const refinementCache = new Map<string, RefinementSuggestion[]>();

/**
 * Puces d'une zone. Chaque puce est associee a la premiere de ses requetes qui
 * ramene effectivement des conditions : on n'affiche pas de piste morte.
 */
function buildRefinements(zone: string, ontology: PreparedOntology): RefinementSuggestion[] {
  const cached = refinementCache.get(zone);
  if (cached) return cached;

  const suggestions: RefinementSuggestion[] = [];

  for (const refinement of ontology.refinementsByZone.get(zone) ?? []) {
    const resolved = refinement.queries.find((candidate) => {
      const outcome = searchSymptoms(candidate, { skipRefine: true });
      return outcome.kind === 'conditions';
    });
    if (resolved) suggestions.push({ label: refinement.label, query: resolved });
  }

  refinementCache.set(zone, suggestions);
  return suggestions;
}

/**
 * Recherche locale en deux niveaux :
 * 1. requete trop large (zone anatomique seule) -> propositions de precision ;
 * 2. sinon -> conditions classees, chacune avec ses remedes classes.
 */
export function searchSymptoms(
  query: string,
  options: { skipRefine?: boolean } = {},
): SymptomSearchOutcome {
  const { prepared, ontology, sourceTitles } = getSymptomIndex();
  const terms = buildQueryTerms(query, ontology);

  if (terms.tokens.length === 0) return { kind: 'idle' };

  // skipRefine : l'utilisateur vient de choisir une precision, on passe
  // directement aux conditions et a leurs remedes.
  if (terms.isBroadBodyPart && !options.skipRefine) {
    const zone = terms.zones[0];
    const suggestions = buildRefinements(zone, ontology);
    if (suggestions.length > 0) return { kind: 'refine', zone, suggestions };
  }

  const scored: { prepared: PreparedCondition; score: number; matchedTerms: string[] }[] = [];

  for (const item of prepared) {
    if ((item.condition.remedies?.length ?? 0) === 0) continue;
    const { score, matchedTerms } = scoreCondition(item, terms, searchConfig);
    if (score <= 0) continue;
    scored.push({ prepared: item, score, matchedTerms });
  }

  if (scored.length === 0) return { kind: 'empty' };

  scored.sort((a, b) => (b.score - a.score) || a.prepared.normLabel.localeCompare(b.prepared.normLabel));

  // Coupe le bruit : bien en dessous du meilleur resultat, il ne s'agit plus
  // que d'occurrences isolees dans des descriptions.
  const bestScore = scored[0].score;
  const cutoff = Math.max(MIN_SCORE, bestScore * RELATIVE_SCORE_THRESHOLD);
  const retained = scored.filter(item => item.score >= cutoff);
  if (retained.length === 0) return { kind: 'empty' };

  const conditions: ConditionResult[] = retained
    .slice(0, MAX_CONDITIONS)
    .map(({ prepared: item, score, matchedTerms }) => ({
      id: item.condition.id,
      label: item.condition.label,
      score,
      matchedTerms,
      remedies: rankRemedies(item.condition, sourceTitles),
    }));

  return { kind: 'conditions', conditions };
}

/** Detail interne d'un resultat, pour le debug du moteur (jamais affiche). */
export interface SearchExplanation {
  label: string;
  score: number;
  matchedTerms: string[];
  fields: ConditionScore['fields'];
  coverage: number;
  coveredTokens: string[];
  requiredCoverage: number;
  exactMatch: boolean;
  remedyCount: number;
}

/**
 * Outil de developpement : explique pourquoi chaque condition est classee ou
 * ecartee (score, champs ayant marque, termes correspondants, couverture).
 * N'est utilise par aucun ecran : reserve aux tests et au diagnostic.
 */
export function explainSearch(query: string, limit = 10): {
  kind: SymptomSearchOutcome['kind'];
  tokens: string[];
  zones: string[];
  refinements: string[];
  results: SearchExplanation[];
} {
  const { prepared, ontology } = getSymptomIndex();
  const terms = buildQueryTerms(query, ontology);
  const outcome = searchSymptoms(query);

  const results: SearchExplanation[] = [];
  for (const item of prepared) {
    if ((item.condition.remedies?.length ?? 0) === 0) continue;
    const detail = scoreCondition(item, terms, searchConfig);
    if (detail.score <= 0) continue;
    results.push({
      label: item.condition.label,
      score: detail.score,
      matchedTerms: detail.matchedTerms,
      fields: detail.fields,
      coverage: detail.coverage,
      coveredTokens: detail.coveredTokens,
      requiredCoverage: detail.requiredCoverage,
      exactMatch: detail.exactMatch,
      remedyCount: item.condition.remedies?.length ?? 0,
    });
  }

  results.sort((a, b) => b.score - a.score);

  return {
    kind: outcome.kind,
    tokens: terms.tokens,
    zones: terms.zones,
    refinements: terms.matchedRefinements,
    results: results.slice(0, limit),
  };
}
