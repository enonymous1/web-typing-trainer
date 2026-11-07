// Word pools for the typing trainer.
// All words are common English words written for this project — no text
// copied from any book, article, or other typing site.

export const COMMON_WORDS: string[] = [
  'the', 'of', 'and', 'a', 'to', 'in', 'is', 'you', 'that', 'it',
  'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'I',
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

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function withPunctuation(word: string, rng: () => number): string {
  const mark = PUNCTUATION[Math.floor(rng() * PUNCTUATION.length)];
  return word + mark;
}

/** Drill definitions for Practice mode. `chars` is the key set the drill trains. */
export interface Drill {
  id: string;
  label: string;
  blurb: string;
  chars: string;
  words: string[];
}

export const DRILLS: Drill[] = [
  {
    id: 'home',
    label: 'Home Row',
    blurb: 'a s d f j k l ; — where your fingers live.',
    chars: 'asdfjkl;',
    words: ['a', 'as', 'sad', 'fad', 'dad', 'all', 'ask', 'fall', 'lass', 'flask', 'salsa', 'alaska', 'adds', 'fads', 'jazz', 'lad', 'salad', 'shall', 'flash', 'glass', 'dad', 'fad', 'ask'],
  },
  {
    id: 'top',
    label: 'Top Row',
    blurb: 'q w e r t y u i o p — reach up, come back home.',
    chars: 'qwertyuiop',
    words: ['we', 'wet', 'wit', 'quit', 'type', 'tower', 'power', 'write', 'quiet', 'quite', 'tree', 'true', 'trio', 'pup', 'top', 'pot', 'rip', 'yet', 'you', 'out', 'our', 'pour', 'trip', 'tire', 'wire', 'wrote'],
  },
  {
    id: 'bottom',
    label: 'Bottom Row',
    blurb: 'z x c v b n m , . — the row below home.',
    chars: 'zxcvbnm,.',
    words: ['van', 'can', 'man', 'box', 'mix', 'vim', 'buzz', 'civic', 'zinc', 'max', 'vex', 'mob', 'moon', 'zoom', 'bend', 'camp', 'comb', 'bomb', 'numb', 'verb', 'zone', 'maze', 'zebra'],
  },
  {
    id: 'numbers',
    label: 'Numbers',
    blurb: 'Digits and common number patterns.',
    chars: '0123456789',
    words: ['12', '34', '56', '78', '90', '123', '456', '789', '2026', '100', '42', '7', '99', '365', '24', '60', '1000', '3.14', '19', '25', '80', '15', '30', '11'],
  },
  {
    id: 'common',
    label: 'Common Words',
    blurb: 'The words you type most often, on repeat.',
    chars: 'etaoinshrdlu',
    words: COMMON_WORDS.slice(0, 60),
  },
  {
    id: 'weak',
    label: 'Weak Keys',
    blurb: 'Built from your own mistakes — your weakest keys, more often.',
    chars: '',
    words: [],
  },
];
