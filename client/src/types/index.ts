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

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<1 | 2 | 3 | 4 | 5 | 6, number>;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayer;
    };
  }
}

export interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: string, callback: (data: any) => void): void;
  removeListener(event: string, callback?: (data: any) => void): void;
  getCurrentState(): Promise<any>;
  setName(name: string): Promise<void>;
  getVolume(): Promise<number>;
  setVolume(volume: number): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  togglePlay(): Promise<void>;
  seek(positionMs: number): Promise<void>;
  previousTrack(): Promise<void>;
  nextTrack(): Promise<void>;
}
