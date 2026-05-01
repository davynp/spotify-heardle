import type { PlayerStats } from '../types';

const STORAGE_KEY = 'spotify-heardle-stats';

function defaultStats(): PlayerStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  };
}

export function getStats(): PlayerStats {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultStats();
  return JSON.parse(raw);
}

function saveStats(stats: PlayerStats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordWin(attempt: number) {
  const stats = getStats();
  stats.gamesPlayed++;
  stats.gamesWon++;
  stats.currentStreak++;
  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  stats.guessDistribution[attempt as 1 | 2 | 3 | 4 | 5 | 6]++;
  saveStats(stats);
}

export function recordLoss() {
  const stats = getStats();
  stats.gamesPlayed++;
  stats.currentStreak = 0;
  saveStats(stats);
}
