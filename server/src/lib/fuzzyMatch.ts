import { compareTwoStrings } from 'string-similarity';

const THRESHOLD = 0.85;

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\s*-\s*(remastered|live|radio edit|deluxe|bonus track|acoustic|remix|version|edition).*$/i, '')
    .trim();
}

export function fuzzyMatch(
  guess: string,
  answer: string
): { isCorrect: boolean; similarity: number } {
  const normalizedGuess = normalize(guess);
  const normalizedAnswer = normalize(answer);

  if (normalizedGuess === normalizedAnswer) {
    return { isCorrect: true, similarity: 1 };
  }

  const similarity = compareTwoStrings(normalizedGuess, normalizedAnswer);
  return { isCorrect: similarity >= THRESHOLD, similarity };
}
