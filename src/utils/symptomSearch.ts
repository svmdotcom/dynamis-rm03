import type { PreparedCondition, PreparedOntology } from '../data/symptomIndex';
import type { SymptomSearchConfig } from '../types';

/**
 * Normalisation : minuscules, accents, apostrophes typographiques,
 * ponctuation, espaces multiples. "J'ai les Yeux Rouges" -> "j ai les yeux rouges".
 */
export function normalizeText(input: string): string {
  return input
    .replace(/[‘’ʼ´`]/g, "'")
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Normalisation supplementaire pour les noms latins de remedes :
 * variantes orthographiques uniquement (ph/f, y/j -> i, lettres doublees).
 */
export function foldRemedyName(input: string): string {
  return normalizeText(input)
    .replace(/ph/g, 'f')
    .replace(/[yj]/g, 'i')
    .replace(/([a-z])\1+/g, '$1');
}

/** Radical simple : neutralise surtout le singulier / pluriel francais. */
export function stem(word: string): string {
  if (word.length <= 4) return word;
  if (word.endsWith('aux')) return `${word.slice(0, -3)}al`;
  // Uniquement la marque du pluriel : "nausees" -> "nausee", "rouges" -> "rouge".
  if (word.endsWith('s') || word.endsWith('x')) return word.slice(0, -1);
  return word;
}

const STOPWORDS = new Set([
  'ai', 'ait', 'arrive', 'arrives', 'au', 'aux', 'avec', 'avoir', 'car', 'ce',
  'ces', 'cet', 'cette', 'chez', 'comme', 'dans', 'de', 'des', 'du', 'elle',
  'elles', 'en', 'est', 'et', 'etais', 'etait', 'ete', 'etre', 'eu', 'fait',
  'faire', 'ils', 'il', 'je', 'la', 'le', 'les', 'leur', 'lors', 'lui', 'ma',
  'mais', 'me', 'mes', 'moi', 'mon', 'ne', 'nos', 'notre', 'nous', 'on', 'ont',
  'ou', 'par', 'pas', 'peu', 'plus', 'pour', 'qua', 'quand', 'que', 'quel',
  'quelle', 'qui', 'quoi', 'sa', 'sans', 'se', 'ses', 'son', 'sont', 'suis',
  'sur', 'ta', 'tes', 'toi', 'ton', 'tres', 'trop', 'tu', 'un', 'une', 'vos',
  'votre', 'vous', 'and', 'are', 'for', 'have', 'the', 'this', 'that', 'with',
  'you',
  // Mots trop generiques pour discriminer une condition.
  'apres', 'avant', 'aussi', 'beaucoup', 'bien', 'depuis', 'encore', 'envie',
  'fois', 'grand', 'grande', 'jamais', 'mal', 'maux', 'meme', 'pendant',
  'petit', 'petite', 'probleme', 'problemes', 'souvent', 'symptome',
  'symptomes', 'toujours', 'tous', 'tout', 'toute', 'toutes',
]);

/**
 * Couche lexicale : verbes / mots du langage parle -> vocabulaire du
 * repertoire et de l'ontologie. Synonymes de vocabulaire uniquement, aucune
 * correspondance medicale n'est creee ici.
 */
const LAY_VOCABULARY: Record<string, string[]> = {
  siffle: ['sifflement', 'acouphene', 'bourdonnement'],
  siffler: ['sifflement', 'acouphene', 'bourdonnement'],
  sonne: ['bourdonnement', 'acouphene'],
  bourdonne: ['bourdonnement', 'acouphene'],
  gratte: ['demangeaison', 'prurit'],
  gratter: ['demangeaison', 'prurit'],
  demange: ['demangeaison', 'prurit'],
  pique: ['demangeaison', 'prurit'],
  coule: ['ecoulement', 'coryza'],
  couler: ['ecoulement', 'coryza'],
  bouche: ['bouche', 'congestion', 'obstrue'],
  tourne: ['vertige', 'etourdissement'],
  tourner: ['vertige', 'etourdissement'],
  vomir: ['vomissement', 'nausee'],
  gerber: ['vomissement', 'nausee'],
  dormir: ['sommeil', 'insomnie'],
  endormir: ['sommeil', 'insomnie'],
  reveille: ['reveil', 'insomnie'],
  gonfle: ['ballonnement', 'meteorisme'],
  ballonne: ['ballonnement', 'meteorisme'],
  pleurent: ['larmoiement'],
  pleure: ['larmoiement'],
  brule: ['brulure'],
  saigne: ['saignement', 'hemorragie'],
  eternue: ['eternuement'],
  tousse: ['toux'],
  voiture: ['transport', 'automobile'],
  bateau: ['mer', 'transport'],
  avion: ['transport'],
  bus: ['transport'],
  train: ['transport'],
};

/** Meme couche lexicale, indexee par racine verbale (gratte, grattent...). */
const LAY_VERB_ROOTS: Record<string, string[]> = {
  gratt: ['demangeaison', 'prurit'],
  demang: ['demangeaison', 'prurit'],
  siffl: ['sifflement', 'acouphene', 'bourdonnement'],
  bourdonn: ['bourdonnement', 'acouphene'],
  coul: ['ecoulement', 'coryza'],
  tourn: ['vertige', 'etourdissement'],
  vomi: ['vomissement', 'nausee'],
  dorm: ['sommeil', 'insomnie'],
  endorm: ['sommeil', 'insomnie'],
  reveil: ['reveil', 'insomnie'],
  gonfl: ['ballonnement', 'meteorisme'],
  ballonn: ['ballonnement', 'meteorisme'],
  pleur: ['larmoiement'],
  larmoi: ['larmoiement'],
  brul: ['brulure'],
  saign: ['saignement', 'hemorragie'],
  eternu: ['eternuement'],
  touss: ['toux'],
  respir: ['respiration', 'dyspnee'],
  urin: ['miction', 'urine'],
};

/**
 * Mots designant une zone entiere du corps : saisis seuls, ils declenchent une
 * demande de precision au lieu d'une longue liste de remedes. Vocabulaire
 * uniquement (les alias plus precis comme "amygdale" n'y figurent pas).
 */
const BROAD_ZONE_ALIASES = new Set([
  'oeil', 'yeux', 'vue', 'vision', 'oculaire',
  'oreille', 'audition', 'auditif',
  'langue',
  'gorge', 'pharynx', 'larynx',
  'nez', 'nasal', 'narine',
  'tete', 'crane',
  'ventre', 'estomac', 'digestion', 'digestif', 'intestin',
  'peau', 'cutane',
  'dos', 'muscle', 'articulation',
  'sommeil', 'dormir', 'nuit',
  'urine', 'urinaire', 'vessie',
  'regle', 'menstruation', 'femme',
  'respiration', 'poumon', 'bronche', 'souffle',
  'stress', 'humeur', 'nerveux',
  // Les mots sont compares apres stemmatisation ("stress" -> "stres").
].map(stem));

export interface QueryTerm {
  term: string;
  /** Mot saisi dont ce terme provient (pour le calcul de couverture). */
  origin: string;
  /** false lorsque le terme vient du vocabulaire ou de l'ontologie. */
  isUserWord: boolean;
}

export interface QueryTerms {
  /** Requete normalisee complete. */
  normalized: string;
  /** Mots utiles saisis (stemmes). */
  tokens: string[];
  /** Mots utiles + elargissement vocabulaire / ontologie. */
  expanded: QueryTerm[];
  /** Zones anatomiques de l'ontologie reconnues dans la requete. */
  zones: string[];
  /** Mots de la requete qui designent une zone anatomique. */
  zoneTokens: Set<string>;
  /** true si la requete ne designe qu'une zone anatomique. */
  isBroadBodyPart: boolean;
  /** Libelles des precisions de l'ontologie reconnues dans la requete. */
  matchedRefinements: string[];
  /** Termes specifiques (hors zone) des precisions reconnues : les retrouver
   *  dans une condition vaut credit pour le mot anatomique de la requete. */
  refinementTokens: Set<string>;
}

function addTerm(list: QueryTerm[], term: string, origin: string, isUserWord: boolean): void {
  if (term.length < 3) return;
  if (list.some(item => item.term === term)) return;
  list.push({ term, origin, isUserWord });
}

/**
 * Niveau 0 : comprendre la requete.
 * Decoupe, retire les mots vides, elargit avec le vocabulaire courant puis
 * avec les precisions de l'ontologie (symptomSearchConfig.v2.json).
 */
export function buildQueryTerms(rawQuery: string, ontology: PreparedOntology): QueryTerms {
  const normalized = normalizeText(rawQuery);
  const rawTokens: string[] = [];

  for (const word of normalized.split(' ')) {
    if (word.length < 3 || STOPWORDS.has(word)) continue;
    const stemmed = stem(word);
    if (!rawTokens.includes(stemmed)) rawTokens.push(stemmed);
  }

  const expanded: QueryTerm[] = [];
  for (const token of rawTokens) addTerm(expanded, token, token, true);

  for (const token of rawTokens) {
    const direct = LAY_VOCABULARY[token];
    const byRoot = direct
      ? undefined
      : Object.entries(LAY_VERB_ROOTS)
        .find(([root]) => token.length >= 4 && token.startsWith(root))?.[1];

    for (const synonym of direct ?? byRoot ?? []) {
      addTerm(expanded, stem(synonym), token, false);
    }
  }

  // Zones anatomiques citees (oreille, yeux, ventre...).
  const zones: string[] = [];
  const zoneTokens = new Set<string>();
  for (const term of expanded) {
    const zone = ontology.zoneByAlias.get(term.term);
    if (!zone) continue;
    if (!zones.includes(zone)) zones.push(zone);
    zoneTokens.add(term.term);
  }

  // Precisions de l'ontologie reconnues : un mot non anatomique de la requete
  // doit correspondre a un terme de la precision.
  const matchedRefinements: string[] = [];
  const candidateRefinements = zones.length > 0
    ? zones.flatMap(zone => ontology.refinementsByZone.get(zone) ?? [])
    : ontology.allRefinements;

  const scoredRefinements = candidateRefinements
    .map((refinement) => {
      const hits = expanded.filter(({ term }) =>
        !zoneTokens.has(term) && refinement.tokens.has(term));
      const specificTokens = [...refinement.tokens].filter(token => !zoneTokens.has(token));
      return { refinement, hits, specificTokens };
    })
    .filter(({ hits, specificTokens, refinement }) => {
      if (hits.length === 0) return false;
      // Sans zone anatomique dans la requete, une seule correspondance de mot
      // est trop faible (ex. "seche" -> "Gorge seche" ET "Toux seche").
      if (zones.length === 0 && hits.length < 2) {
        return refinement.tokens.size === hits.length || specificTokens.length === hits.length;
      }
      return true;
    });

  const bestHitCount = scoredRefinements.reduce((max, item) => Math.max(max, item.hits.length), 0);

  const refinementTokens = new Set<string>();

  for (const { refinement, hits, specificTokens } of scoredRefinements) {
    if (hits.length < bestHitCount) continue;

    matchedRefinements.push(refinement.label);
    const origin = hits[0].origin;
    for (const token of specificTokens) {
      refinementTokens.add(token);
      addTerm(expanded, token, origin, false);
    }
  }

  const userTokens = expanded.filter(item => item.isUserWord).map(item => item.term);
  const isBroadBodyPart = zones.length > 0
    && matchedRefinements.length === 0
    && userTokens.every(token => zoneTokens.has(token) && BROAD_ZONE_ALIASES.has(token));

  return {
    normalized,
    tokens: userTokens,
    expanded,
    zones,
    zoneTokens,
    isBroadBodyPart,
    matchedRefinements,
    refinementTokens,
  };
}

const SYNONYM_WEIGHT = 0.8;
/** Poids d'un mot purement anatomique (contexte, pas symptome). */
const ZONE_TOKEN_WEIGHT = 0.3;
/** Les poids de la config sont des poids de champ ; au niveau du mot isole
 *  les champs "expression" sont ponderes par ce facteur. */
const TOKEN_SCALE = 0.5;
/** Correspondance par prefixe (autocompletion) : moins forte qu'un mot entier. */
const PREFIX_SCALE = 0.6;
/** Longueur minimale d'un mot pour tenter une correspondance par prefixe. */
const PREFIX_MIN_LENGTH = 3;
/** Une condition retrouvee uniquement via des mots isoles de description est
 *  un signal faible : elle ne doit pratiquement plus peser. */
const WEAK_ONLY_PENALTY = 0.35;
/** Rubrique large nommee explicitement puis precisee ("toux grasse"). */
const NAMED_RUBRIC_PENALTY = 0.75;

/** Champs pouvant marquer des points, du plus fort au plus faible. */
export type ScoringField =
  | 'label_exact'
  | 'label_phrase'
  | 'lay_alias_exact'
  | 'lay_alias_phrase'
  | 'alias'
  | 'label_token'
  | 'lay_alias_token'
  | 'alias_token'
  | 'keywords_v2'
  | 'keywords_secondary'
  | 'label_prefix'
  | 'alias_prefix'
  | 'symptom_phrase'
  | 'symptom_token';

const WEAK_FIELDS: ScoringField[] = ['symptom_token', 'keywords_secondary', 'symptom_phrase'];

/** Champs pouvant justifier a eux seuls qu'un mot anatomique soit couvert. */
const STRONG_ZONE_FIELDS: ScoringField[] = [
  'label_token', 'lay_alias_token', 'alias_token', 'keywords_v2', 'label_prefix', 'alias_prefix',
];

/** Un mot-cle repris d'une description pese une fraction d'un mot-cle propre. */
const SECONDARY_KEYWORD_SCALE = 0.33;

export interface ConditionScore {
  score: number;
  matchedTerms: string[];
  /** Debug interne : points obtenus par champ. */
  fields: Partial<Record<ScoringField, number>>;
  /** Debug interne : proportion des mots saisis reellement retrouves. */
  coverage: number;
  /** Debug interne : mots saisis retrouves. */
  coveredTokens: string[];
  /** Debug interne : couverture exigee pour cette requete. */
  requiredCoverage: number;
  /** Debug interne : correspondance exacte ayant court-circuite la regle. */
  exactMatch: boolean;
}

/** Couverture exigee : 1 ou 2 mots -> 100 % ; 3 mots et plus -> 67 %. */
export function requiredCoverageFor(tokenCount: number): number {
  if (tokenCount <= 2) return 1;
  return 2 / 3;
}

const EMPTY_SCORE: ConditionScore = {
  score: 0,
  matchedTerms: [],
  fields: {},
  coverage: 0,
  coveredTokens: [],
  requiredCoverage: 1,
  exactMatch: false,
};

/**
 * Niveau 1 : score de la condition uniquement (jamais melange avec le score
 * des remedes). Ordre de priorite (symptomSearchConfig.v2.json) :
 * label exact > expression dans label > lay_aliases > aliases > keywords_v2 >
 * expression dans symptoms > mots isoles de symptoms.
 *
 * V3 : les mots de la requete sont combines en ET. Une condition n'est retenue
 * que si elle couvre la proportion exigee des mots saisis, sauf correspondance
 * exacte de label / alias.
 */
export function scoreCondition(
  prepared: PreparedCondition,
  terms: QueryTerms,
  config: SymptomSearchConfig,
): ConditionScore {
  const weights = config.search_rules.fields_and_weights;
  const { normalized, tokens, expanded } = terms;
  const matchedTerms: string[] = [];
  const fields: Partial<Record<ScoringField, number>> = {};
  let score = 0;
  let exactMatch = false;

  const add = (field: ScoringField, points: number): void => {
    score += points;
    fields[field] = (fields[field] ?? 0) + Math.round(points);
  };

  // Deux formes de la requete : brute (stemmee) et reduite aux mots utiles.
  const fullQuery = normalized.split(' ').map(stem).join(' ');
  const coreQuery = tokens.join(' ');
  const queries = fullQuery === coreQuery ? [fullQuery] : [fullQuery, coreQuery];

  const matchesAny = (field: string): boolean => queries.some(q => phraseMatch(field, q));
  const equalsAny = (field: string): boolean => queries.some(q => field === q);

  if (prepared.normLabel === normalized || equalsAny(prepared.stemLabel)) {
    add('label_exact', weights.label_exact);
    exactMatch = true;
  } else if (matchesAny(prepared.stemLabel)) {
    add('label_phrase', weights.label_phrase);
    // L'expression complete figure dans le label : correspondance sure.
    exactMatch = queries.some(q => (' ' + prepared.stemLabel + ' ').includes(' ' + q + ' '));
  }

  if (prepared.layAliases.some(equalsAny)) {
    add('lay_alias_exact', weights.lay_alias_exact);
    exactMatch = true;
  } else if (prepared.layAliases.some(matchesAny)) {
    add('lay_alias_phrase', weights.lay_alias_exact * TOKEN_SCALE);
  }

  if (prepared.aliases.some(equalsAny)) {
    add('alias', weights.alias);
    exactMatch = true;
  } else if (prepared.aliases.some(matchesAny)) {
    add('alias', weights.alias * TOKEN_SCALE);
  }

  if (tokens.length > 1 && prepared.symptomPhrases.some(matchesAny)) {
    add('symptom_phrase', weights.symptom_phrase);
    if (!matchedTerms.includes(coreQuery)) matchedTerms.push(coreQuery);
  }

  const coveredOrigins = new Set<string>();
  let matchedRefinementTerm = false;

  for (const { term, origin, isUserWord } of expanded) {
    let gained = 0;
    let field: ScoringField | null = null;

    if (prepared.labelTokens.has(term)) {
      gained = weights.label_phrase * TOKEN_SCALE;
      field = 'label_token';
    } else if (prepared.layAliasTokens.has(term)) {
      gained = weights.lay_alias_exact * TOKEN_SCALE;
      field = 'lay_alias_token';
    } else if (prepared.aliasTokens.has(term)) {
      gained = weights.alias * TOKEN_SCALE;
      field = 'alias_token';
    } else if (prepared.primaryKeywords.has(term)) {
      gained = weights.keywords_v2;
      field = 'keywords_v2';
    } else if (prepared.secondaryKeywords.has(term)) {
      // Mot repris d'une description : ne doit plus dominer le classement.
      gained = weights.keywords_v2 * SECONDARY_KEYWORD_SCALE;
      field = 'keywords_secondary';
    } else if (matchesPrefix(prepared.labelTokens, term)) {
      // Autocompletion : "rhum" -> "Rhume", "ecz" -> "Eczema".
      gained = weights.label_phrase * TOKEN_SCALE * PREFIX_SCALE;
      field = 'label_prefix';
    } else if (matchesPrefix(prepared.aliasTokens, term)
      || matchesPrefix(prepared.layAliasTokens, term)) {
      gained = weights.alias * TOKEN_SCALE * PREFIX_SCALE;
      field = 'alias_prefix';
    } else if (prepared.symptomTokens.has(term)) {
      // Dernier recours : mot isole dans une longue description.
      gained = weights.symptom_token;
      field = 'symptom_token';
    }

    if (gained === 0 || !field) continue;

    // Une zone anatomique seule est un contexte, pas un symptome.
    if (terms.zoneTokens.has(term)) gained *= ZONE_TOKEN_WEIGHT;

    add(field, isUserWord ? gained : gained * SYNONYM_WEIGHT);
    // "yeux" retrouve au detour d'une description ne prouve pas que la
    // condition concerne les yeux : pas de credit de couverture.
    if (!terms.zoneTokens.has(term) || STRONG_ZONE_FIELDS.includes(field)) {
      coveredOrigins.add(origin);
    }
    if (terms.refinementTokens.has(term)) matchedRefinementTerm = true;
    if (!matchedTerms.includes(term)) matchedTerms.push(term);
  }

  if (score === 0) return EMPTY_SCORE;

  // Le mot anatomique est considere couvert si la condition correspond a une
  // precision reconnue de cette zone ("yeux qui grattent" -> Prurit).
  if (matchedRefinementTerm) {
    for (const zoneToken of terms.zoneTokens) coveredOrigins.add(zoneToken);
  }

  const coveredTokens = tokens.filter(token => coveredOrigins.has(token));
  const coverage = tokens.length > 0 ? coveredTokens.length / tokens.length : 0;
  const requiredCoverage = requiredCoverageFor(tokens.length);

  // ET entre les mots de la requete : sous le seuil, la condition est ecartee
  // (et non simplement retrogradee comme en v2).
  if (!exactMatch && coverage + 1e-9 < requiredCoverage) return EMPTY_SCORE;

  // Signal faible uniquement (mot isole dans une description).
  const usedFields = Object.keys(fields) as ScoringField[];
  if (usedFields.every(field => WEAK_FIELDS.includes(field))) {
    score *= WEAK_ONLY_PENALTY;
  }

  // Une rubrique large (Yeux, Toux, Peau, Grossesse...) ne doit pas sortir en
  // tete tant que l'utilisateur ne l'a pas nommee explicitement.
  // Saisie encore incomplete (autocompletion) : on ne penalise pas la rubrique,
  // sinon "ecz" ne remonterait plus "Eczema".
  const prefixOnly = usedFields.length > 0
    && usedFields.every(field => field === 'label_prefix' || field === 'alias_prefix');

  if (prepared.condition.needs_refinement_when_query_is_broad && !prefixOnly) {
    const onlyThisRubric = tokens.length > 0 && tokens.every(token => prepared.labelTokens.has(token));
    // "toux grasse" nomme bien la rubrique Toux et la precise : penalite douce.
    const rubricNamed = [...prepared.labelTokens].every(token => tokens.includes(token));
    if (!onlyThisRubric) {
      score *= rubricNamed ? NAMED_RUBRIC_PENALTY : config.search_rules.broad_condition_penalty;
    }
  }

  return {
    score: Math.round(score),
    matchedTerms,
    fields,
    coverage,
    coveredTokens,
    requiredCoverage,
    exactMatch,
  };
}

/** Correspondance par prefixe sur un champ structure (label / alias). */
function matchesPrefix(fieldTokens: Set<string>, token: string): boolean {
  if (token.length < PREFIX_MIN_LENGTH) return false;
  for (const fieldToken of fieldTokens) {
    if (fieldToken.length > token.length && fieldToken.startsWith(token)) return true;
  }
  return false;
}

/**
 * Correspondance d'expression avec frontieres de mots
 * (require_word_boundaries), dans les deux sens : le champ peut contenir la
 * requete ("conjonctivite" pour "conjonctivite virale") ou la requete peut
 * contenir le champ ("envie de vomir" dans "j ai envie de vomir en voiture").
 */
function phraseMatch(field: string, query: string): boolean {
  if (!field || !query || query.length < 3) return false;
  if (field === query) return true;
  if (` ${field} `.includes(` ${query} `)) return true;
  if (field.length >= 4 && ` ${query} `.includes(` ${field} `)) return true;
  return false;
}
