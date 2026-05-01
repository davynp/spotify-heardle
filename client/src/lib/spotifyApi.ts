import axios from 'axios';
import type { PlaylistData, GuessResponse } from '../types';

const api = axios.create({ baseURL: '' });

export async function login(): Promise<string> {
  const { data } = await api.post('/auth/login');
  return data.url;
}

export async function refreshToken(
  refresh_token: string
): Promise<{ access_token: string; expires_in: number }> {
  const { data } = await api.post('/auth/refresh', { refresh_token });
  return data;
}

export async function fetchPlaylist(
  playlistId: string,
  accessToken: string
): Promise<PlaylistData> {
  const { data } = await api.get(`/api/playlist/${playlistId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

export async function startGame(
  playlistId: string,
  accessToken: string
): Promise<{ roundId: string; trackCount: number; trackUri: string }> {
  const { data } = await api.post(
    '/api/game/start',
    { playlistId },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data;
}

export async function submitGuess(
  roundId: string,
  guess: string,
  accessToken: string
): Promise<GuessResponse> {
  const { data } = await api.post(
    `/api/game/${roundId}/guess`,
    { guess },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data;
}

export async function skipGuess(
  roundId: string,
  accessToken: string
): Promise<GuessResponse> {
  const { data } = await api.post(`/api/game/${roundId}/skip`, null, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}
