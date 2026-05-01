import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage for Node environment
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  length: 0,
  key: vi.fn(() => null),
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Import after localStorage is defined
const { getStats, recordWin, recordLoss } = await import(
  '../../../client/src/lib/statsStorage.js'
);

describe('statsStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getStats', () => {
    it('returns default stats when nothing stored', () => {
      const stats = getStats();
      expect(stats).toEqual({
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      });
    });

    it('returns stored stats', () => {
      const saved = {
        gamesPlayed: 5,
        gamesWon: 3,
        currentStreak: 2,
        maxStreak: 3,
        guessDistribution: { 1: 1, 2: 1, 3: 1, 4: 0, 5: 0, 6: 0 },
      };
      store['spotify-heardle-stats'] = JSON.stringify(saved);
      const stats = getStats();
      expect(stats).toEqual(saved);
    });
  });

  describe('recordWin', () => {
    it('increments gamesPlayed and gamesWon', () => {
      recordWin(1);
      const stats = getStats();
      expect(stats.gamesPlayed).toBe(1);
      expect(stats.gamesWon).toBe(1);
    });

    it('increments current streak', () => {
      recordWin(1);
      recordWin(2);
      const stats = getStats();
      expect(stats.currentStreak).toBe(2);
    });

    it('updates max streak', () => {
      recordWin(1);
      recordWin(1);
      recordWin(1);
      const stats = getStats();
      expect(stats.maxStreak).toBe(3);
    });

    it('records guess distribution by attempt number', () => {
      recordWin(1);
      recordWin(3);
      recordWin(3);
      recordWin(6);
      const stats = getStats();
      expect(stats.guessDistribution[1]).toBe(1);
      expect(stats.guessDistribution[3]).toBe(2);
      expect(stats.guessDistribution[6]).toBe(1);
      expect(stats.guessDistribution[2]).toBe(0);
    });
  });

  describe('recordLoss', () => {
    it('increments gamesPlayed but not gamesWon', () => {
      recordLoss();
      const stats = getStats();
      expect(stats.gamesPlayed).toBe(1);
      expect(stats.gamesWon).toBe(0);
    });

    it('resets current streak to 0', () => {
      recordWin(1);
      recordWin(1);
      expect(getStats().currentStreak).toBe(2);
      recordLoss();
      expect(getStats().currentStreak).toBe(0);
    });

    it('preserves max streak after loss', () => {
      recordWin(1);
      recordWin(1);
      recordWin(1);
      recordLoss();
      const stats = getStats();
      expect(stats.maxStreak).toBe(3);
      expect(stats.currentStreak).toBe(0);
    });
  });

  describe('streak edge cases', () => {
    it('handles win-loss-win pattern correctly', () => {
      recordWin(1);
      recordWin(2);
      recordLoss();
      recordWin(3);
      const stats = getStats();
      expect(stats.currentStreak).toBe(1);
      expect(stats.maxStreak).toBe(2);
      expect(stats.gamesPlayed).toBe(4);
      expect(stats.gamesWon).toBe(3);
    });
  });
});
