import axios from 'axios';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';

export async function exchangeCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const response = await axios.post(
    `${SPOTIFY_ACCOUNTS_BASE}/api/token`,
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
    }
  );
  return response.data;
}

export async function refreshToken(refresh_token: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const response = await axios.post(
    `${SPOTIFY_ACCOUNTS_BASE}/api/token`,
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
    }
  );
  return response.data;
}

export async function fetchFromSpotify(
  endpoint: string,
  accessToken: string
): Promise<any> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${SPOTIFY_API_BASE}${endpoint}`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}
