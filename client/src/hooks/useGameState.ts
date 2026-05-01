import { create } from 'zustand';
import type { TrackData, GuessRecord } from '../types';

const CLIP_DURATIONS = [1000, 2000, 4000, 8000, 16000, 30000];

interface GameState {
  roundId: string | null;
  trackUri: string | null;
  attemptNumber: number;
  guesses: GuessRecord[];
  status: 'idle' | 'playing' | 'won' | 'lost';
  answer: TrackData | null;
  clipDurations: number[];
  currentClipDuration: () => number;
  startRound: (roundId: string, trackUri: string) => void;
  addGuess: (guess: GuessRecord) => void;
  setWon: (answer: TrackData) => void;
  setLost: (answer: TrackData) => void;
  reset: () => void;
}

export const useGameState = create<GameState>((set, get) => ({
  roundId: null,
  trackUri: null,
  attemptNumber: 0,
  guesses: [],
  status: 'idle',
  answer: null,
  clipDurations: CLIP_DURATIONS,
  currentClipDuration: () => {
    const { attemptNumber, clipDurations } = get();
    return clipDurations[Math.min(attemptNumber, clipDurations.length - 1)];
  },
  startRound: (roundId, trackUri) =>
    set({
      roundId,
      trackUri,
      attemptNumber: 0,
      guesses: [],
      status: 'playing',
      answer: null,
    }),
  addGuess: (guess) =>
    set((s) => ({
      guesses: [...s.guesses, guess],
      attemptNumber: s.attemptNumber + 1,
    })),
  setWon: (answer) => set({ status: 'won', answer }),
  setLost: (answer) => set({ status: 'lost', answer }),
  reset: () =>
    set({
      roundId: null,
      trackUri: null,
      attemptNumber: 0,
      guesses: [],
      status: 'idle',
      answer: null,
    }),
}));
