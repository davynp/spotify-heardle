export interface PlaylistData {
  id: string;
  name: string;
  imageUrl: string | null;
  owner: string;
  tracks: TrackData[];
}

export interface TrackData {
  id: string;
  uri: string;
  name: string;
  artists: string[];
  albumName: string;
  albumImageUrl: string | null;
  durationMs: number;
}

export interface GameRound {
  id: string;
  playlistId: string;
  answer: TrackData;
  attemptNumber: number;
  guesses: GuessRecord[];
  status: 'playing' | 'won' | 'lost';
}

export interface GuessRecord {
  text: string;
  isSkip: boolean;
  isCorrect: boolean;
}

export interface GuessResponse {
  correct: boolean;
  similarity: number;
  attemptNumber: number;
  gameOver: boolean;
  answer?: TrackData;
}
