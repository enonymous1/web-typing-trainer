// Word pools for the typing trainer.
// All words are common English words written for this project — no text
// copied from any book, article, or other typing site.

export const COMMON_WORDS: string[] = [
  'the', 'of', 'and', 'a', 'to', 'in', 'is', 'you', 'that', 'it',
  'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they',
  'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word',
  'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said',
  'there', 'use', 'an', 'each', 'which', 'she', 'do', 'how', 'their', 'if',
  'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so',
  'some', 'her', 'would', 'make', 'like', 'him', 'into', 'time', 'has', 'look',
  'two', 'more', 'write', 'go', 'see', 'number', 'no', 'way', 'could', 'people',
  'my', 'than', 'first', 'water', 'been', 'call', 'who', 'oil', 'its', 'now',
  'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part',
  'over', 'new', 'sound', 'take', 'only', 'little', 'work', 'know', 'place', 'year',
  'live', 'me', 'back', 'give', 'most', 'very', 'after', 'thing', 'our', 'just',
  'name', 'good', 'sentence', 'man', 'think', 'say', 'great', 'where', 'help', 'through',
  'much', 'before', 'line', 'right', 'too', 'mean', 'old', 'any', 'same', 'tell',
  'boy', 'follow', 'came', 'want', 'show', 'also', 'around', 'form', 'three', 'small',
  'set', 'put', 'end', 'does', 'another', 'well', 'large', 'must', 'big', 'even',
  'such', 'because', 'turn', 'here', 'why', 'ask', 'went', 'men', 'read', 'need',
  'land', 'different', 'home', 'us', 'move', 'try', 'kind', 'hand', 'picture', 'again',
  'change', 'off', 'play', 'spell', 'air', 'away', 'animal', 'house', 'point', 'page',
  'letter', 'mother', 'answer', 'found', 'study', 'still', 'learn', 'should', 'world', 'high',
  'every', 'near', 'add', 'food', 'between', 'own', 'below', 'country', 'plant', 'last',
  'school', 'father', 'keep', 'tree', 'never', 'start', 'city', 'earth', 'eye', 'light',
  'thought', 'head', 'under', 'story', 'saw', 'left', 'few', 'while', 'along', 'might',
  'close', 'something', 'seem', 'next', 'hard', 'open', 'example', 'begin', 'life', 'always',
  'those', 'both', 'paper', 'together', 'got', 'group', 'often', 'run', 'dog', 'horse',
  'cat', 'bird', 'fish', 'red', 'blue', 'green', 'sun', 'moon', 'star', 'rain',
  'snow', 'wind', 'sea', 'lake', 'road', 'town', 'book', 'song', 'game', 'ball',
  'door', 'wall', 'room', 'chair', 'table', 'fire', 'stone', 'gold', 'king', 'queen',
  'fast', 'slow', 'warm', 'cold', 'soft', 'dark', 'bright', 'happy', 'quick', 'brave',
];

const PUNCTUATION = ['.', ',', '?', '!', ';', ':'];
const SYMBOL_TOKENS = [
  '$12', '100%', '#7', '@home', '3.14', '42', '7', '19', '2026', '8-bit',
  'well-known', "don't", "it's", 'e-mail', 'co-op', 'x2', '10am', '5k',
  'a+b', 'c#', '50/50', '2nd', '3rd', '1st', '&', '*', '(yes)', '[ok]',
];

/** Tokens used only on Hard: numbers, symbols, and punctuation-heavy words. */
export const HARD_TOKENS: string[] = [...SYMBOL_TOKENS];

export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Uppercase the first letter. Used by the Medium/Hard generators to
 * sprinkle sentence-style capitals into a passage — applied to a word
 * that is otherwise lowercase, so Easy text stays all-lowercase.
 */
export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Append one random end-of-sentence mark. Used by the Medium/Hard
 * generators to sprinkle sentence-style punctuation into a passage —
 * the mark is always trailing so the word itself stays typable as-is.
 */
export function withPunctuation(word: string, rng: () => number): string {
  const mark = PUNCTUATION[Math.floor(rng() * PUNCTUATION.length)];
  return word + mark;
}

/**
 * Drill definitions for Practice mode.
 *
 * `chars` is the key set the drill trains. For a `'words'` drill it is a
 * hard constraint — every word in `words` must use only those keys —
 * except Common Words (see below). For a `'chars'` drill the passage is
 * random key sequences, not words, because real words are impossible
 * for that key set (the bottom row has no vowels).
 *
 * `kind` selects how the passage is built: `'words'` samples from
 * `words`, `'chars'` samples characters from `chars`. The Weak Keys
 * drill is `'chars'` with an empty word list: its text comes from
 * `buildFocusText`, not from this table.
 */
export interface Drill {
  id: string;
  label: string;
  blurb: string;
  chars: string;
  kind: 'words' | 'chars';
  words: string[];
}

export const DRILLS: Drill[] = [
  {
    id: 'home',
    label: 'Home Row',
    blurb: 'a s d f j k l ; — where your fingers live.',
    chars: 'asdfjkl;',
    kind: 'words',
    // Purity rule: every word uses only home-row keys — no 'z' (jazz),
    // no 'h' (shall, flash), no 'g' (glass), and no duplicates.
    words: ['a', 'as', 'sad', 'fad', 'dad', 'all', 'ask', 'fall', 'lass', 'flask', 'salsa', 'alaska', 'adds', 'fads', 'lad', 'salad'],
  },
  {
    id: 'top',
    label: 'Top Row',
    blurb: 'q w e r t y u i o p — reach up, come back home.',
    chars: 'qwertyuiop',
    kind: 'words',
    words: ['we', 'wet', 'wit', 'quit', 'type', 'tower', 'power', 'write', 'quiet', 'quite', 'tree', 'true', 'trio', 'pup', 'top', 'pot', 'rip', 'yet', 'you', 'out', 'our', 'pour', 'trip', 'tire', 'wire', 'wrote'],
  },
  {
    id: 'bottom',
    label: 'Bottom Row',
    // The bottom row has no vowels, so no English word can be spelled
    // with bottom-row keys alone — a word list is impossible here by
    // construction. This drill trains bottom-row key sequences instead.
    blurb: 'z x c v b n m , . — the row below home. No vowels live here, so this drill trains key sequences, not words.',
    chars: 'zxcvbnm,.',
    kind: 'chars',
    words: [],
  },
  {
    id: 'numbers',
    label: 'Numbers',
    blurb: 'Digits and common number patterns.',
    chars: '0123456789',
    kind: 'words',
    words: ['12', '34', '56', '78', '90', '123', '456', '789', '2026', '100', '42', '7', '99', '365', '24', '60', '1000', '314', '19', '25', '80', '15', '30', '11'],
  },
  {
    id: 'common',
    label: 'Common Words',
    blurb: 'The words you type most often, on repeat.',
    // 'etaoinshrdlu' is the twelve most frequent letters in English, in
    // frequency order — a hint about which keys matter most, NOT a
    // constraint: these are real words, so they use letters outside the
    // set ('of' needs f, 'you' needs y and u). The purity test in
    // words.test.ts deliberately exempts this drill.
    chars: 'etaoinshrdlu',
    kind: 'words',
    words: COMMON_WORDS.slice(0, 60),
  },
  {
    id: 'weak',
    label: 'Weak Keys',
    blurb: 'Built from your own mistakes — your weakest keys, more often.',
    chars: '',
    kind: 'chars',
    words: [],
  },
];
