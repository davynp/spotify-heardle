import { describe, it, expect } from 'vitest';
import { fuzzyMatch } from './fuzzyMatch.js';

describe('fuzzyMatch', () => {
  describe('exact matches', () => {
    it('matches identical strings', () => {
      const result = fuzzyMatch('Bohemian Rhapsody', 'Bohemian Rhapsody');
      expect(result.isCorrect).toBe(true);
      expect(result.similarity).toBe(1);
    });

    it('matches case-insensitively', () => {
      const result = fuzzyMatch('bohemian rhapsody', 'Bohemian Rhapsody');
      expect(result.isCorrect).toBe(true);
      expect(result.similarity).toBe(1);
    });

    it('matches with mixed case', () => {
      const result = fuzzyMatch('BOHEMIAN RHAPSODY', 'Bohemian Rhapsody');
      expect(result.isCorrect).toBe(true);
      expect(result.similarity).toBe(1);
    });
  });

  describe('normalization — strips parentheticals', () => {
    it('strips (feat. Artist) from answer', () => {
      const result = fuzzyMatch('Blinding Lights', 'Blinding Lights (feat. Someone)');
      expect(result.isCorrect).toBe(true);
    });

    it('strips (Remastered 2021) from answer', () => {
      const result = fuzzyMatch('Hotel California', 'Hotel California (Remastered 2021)');
      expect(result.isCorrect).toBe(true);
    });

    it('strips parentheticals from guess too', () => {
      const result = fuzzyMatch('Stairway to Heaven (Live)', 'Stairway to Heaven');
      expect(result.isCorrect).toBe(true);
    });

    it('strips square brackets from answer', () => {
      const result = fuzzyMatch('Lose Yourself', 'Lose Yourself [Soundtrack Version]');
      expect(result.isCorrect).toBe(true);
    });
  });

  describe('normalization — strips dash suffixes', () => {
    it('strips "- Remastered" suffix', () => {
      const result = fuzzyMatch('Stayin Alive', "Stayin' Alive - Remastered");
      expect(result.isCorrect).toBe(true);
    });

    it('strips "- Live" suffix', () => {
      const result = fuzzyMatch('Comfortably Numb', 'Comfortably Numb - Live');
      expect(result.isCorrect).toBe(true);
    });

    it('strips "- Radio Edit" suffix', () => {
      const result = fuzzyMatch('Somebody That I Used to Know', 'Somebody That I Used to Know - Radio Edit');
      expect(result.isCorrect).toBe(true);
    });

    it('strips "- Deluxe" suffix', () => {
      const result = fuzzyMatch('Bad Guy', 'Bad Guy - Deluxe');
      expect(result.isCorrect).toBe(true);
    });

    it('strips "- Acoustic" suffix', () => {
      const result = fuzzyMatch('Riptide', 'Riptide - Acoustic');
      expect(result.isCorrect).toBe(true);
    });

    it('strips "- Remix" suffix', () => {
      const result = fuzzyMatch('Levitating', 'Levitating - Remix');
      expect(result.isCorrect).toBe(true);
    });
  });

  describe('fuzzy matching with threshold', () => {
    it('accepts close misspellings (above 0.85 threshold)', () => {
      const result = fuzzyMatch('Bohemian Rhapsdy', 'Bohemian Rhapsody');
      expect(result.isCorrect).toBe(true);
      expect(result.similarity).toBeGreaterThanOrEqual(0.85);
    });

    it('rejects clearly wrong guesses', () => {
      const result = fuzzyMatch('Yesterday', 'Bohemian Rhapsody');
      expect(result.isCorrect).toBe(false);
      expect(result.similarity).toBeLessThan(0.85);
    });

    it('rejects empty guess against a real answer', () => {
      const result = fuzzyMatch('', 'Bohemian Rhapsody');
      expect(result.isCorrect).toBe(false);
    });

    it('returns similarity score between 0 and 1', () => {
      const result = fuzzyMatch('Something Random', 'Bohemian Rhapsody');
      expect(result.similarity).toBeGreaterThanOrEqual(0);
      expect(result.similarity).toBeLessThanOrEqual(1);
    });
  });

  describe('edge cases', () => {
    it('handles whitespace trimming', () => {
      const result = fuzzyMatch('  Bohemian Rhapsody  ', 'Bohemian Rhapsody');
      expect(result.isCorrect).toBe(true);
    });

    it('handles single word titles', () => {
      const result = fuzzyMatch('Creep', 'Creep');
      expect(result.isCorrect).toBe(true);
      expect(result.similarity).toBe(1);
    });

    it('handles answer with both parentheticals and dash suffix', () => {
      const result = fuzzyMatch(
        'Come Together',
        'Come Together (feat. Gary Clark Jr.) - Remastered'
      );
      expect(result.isCorrect).toBe(true);
    });
  });
});
