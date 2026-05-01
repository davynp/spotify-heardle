import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';
import type { SpotifyPlayer } from '../types';

export function useSpotifyPlayer() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      setIsConnecting(true);
      const player = new window.Spotify.Player({
        name: 'Spotify Heardle',
        getOAuthToken: (cb) => {
          const token = useAuthStore.getState().accessToken;
          if (token) cb(token);
        },
        volume: 0.5,
      });

      player.addListener('ready', async ({ device_id }: { device_id: string }) => {
        deviceIdRef.current = device_id;
        try {
          await axios.put(
            'https://api.spotify.com/v1/me/player',
            { device_ids: [device_id], play: false },
            { headers: { Authorization: `Bearer ${useAuthStore.getState().accessToken}` } }
          );
          setIsReady(true);
          setIsConnecting(false);
        } catch (e: any) {
          setError('Failed to transfer playback. Make sure you have Spotify Premium.');
          setIsConnecting(false);
        }
      });

      player.addListener('not_ready', () => {
        setIsReady(false);
      });

      player.addListener('initialization_error', ({ message }: { message: string }) => {
        setError(`Initialization error: ${message}`);
        setIsConnecting(false);
      });

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        setError(`Authentication error: ${message}`);
        setIsConnecting(false);
      });

      player.addListener('account_error', ({ message }: { message: string }) => {
        setError('Spotify Premium is required to play audio.');
        setIsConnecting(false);
      });

      player.connect();
      playerRef.current = player;
    };

    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      playerRef.current?.disconnect();
      document.body.removeChild(script);
    };
  }, [accessToken]);

  const play = useCallback(
    async (trackUri: string, durationMs: number) => {
      const token = useAuthStore.getState().accessToken;
      if (!token || !deviceIdRef.current) return;

      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);

      await axios.put(
        'https://api.spotify.com/v1/me/player/play',
        { uris: [trackUri], position_ms: 0 },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { device_id: deviceIdRef.current },
        }
      );

      pauseTimerRef.current = setTimeout(async () => {
        const currentToken = useAuthStore.getState().accessToken;
        if (currentToken) {
          await axios.put(
            'https://api.spotify.com/v1/me/player/pause',
            {},
            { headers: { Authorization: `Bearer ${currentToken}` } }
          );
        }
      }, durationMs);
    },
    []
  );

  const pause = useCallback(async () => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    const token = useAuthStore.getState().accessToken;
    if (!token) return;
    await axios.put(
      'https://api.spotify.com/v1/me/player/pause',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }, []);

  return { isReady, isConnecting, error, play, pause };
}
