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

// --- Recent Playlists ---

export interface SavedPlaylist {
  id: string;
  name: string;
  imageUrl: string | null;
  owner: string;
}

const PLAYLISTS_KEY = 'spotify-heardle-playlists';
const MAX_RECENT = 10;

export function getRecentPlaylists(): SavedPlaylist[] {
  const raw = localStorage.getItem(PLAYLISTS_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export function saveRecentPlaylist(playlist: SavedPlaylist) {
  const list = getRecentPlaylists().filter((p) => p.id !== playlist.id);
  list.unshift(playlist);
  if (list.length > MAX_RECENT) list.length = MAX_RECENT;
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(list));
}

export function removeRecentPlaylist(id: string) {
  const list = getRecentPlaylists().filter((p) => p.id !== id);
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(list));
}
