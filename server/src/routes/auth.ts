import { Router } from 'express';
import { exchangeCode, refreshToken } from '../lib/spotify.js';

const router = Router();

const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

router.post('/login', (_req, res) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: SCOPES,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
  });

  res.json({ url: `https://accounts.spotify.com/authorize?${params}` });
});

router.get('/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    res.redirect(`${process.env.CLIENT_URL}?error=no_code`);
    return;
  }

  try {
    const tokens = await exchangeCode(code);
    const params = new URLSearchParams({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: String(tokens.expires_in),
    });
    res.redirect(`${process.env.CLIENT_URL}?${params}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}?error=auth_failed`);
  }
});

router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    res.status(400).json({ error: 'refresh_token required' });
    return;
  }

  try {
    const tokens = await refreshToken(refresh_token);
    res.json(tokens);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'refresh_failed' });
  }
});

export default router;
