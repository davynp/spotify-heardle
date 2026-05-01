import { Router } from 'express';
import { fetchFromSpotify } from '../lib/spotify.js';
import { fetchAllTracks } from '../lib/tracks.js';
import type { PlaylistData } from '../types/index.js';

const router = Router();

router.get('/:id', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'No authorization token' });
    return;
  }

  try {
    const playlist = await fetchFromSpotify(`/playlists/${req.params.id}`, token);
    const tracks = await fetchAllTracks(req.params.id, token);

    if (tracks.length === 0) {
      res.status(400).json({ error: 'No playable tracks found in this playlist' });
      return;
    }

    const result: PlaylistData = {
      id: playlist.id,
      name: playlist.name,
      imageUrl: playlist.images?.[0]?.url ?? null,
      owner: playlist.owner.display_name,
      tracks,
    };

    res.json(result);
  } catch (error: any) {
    console.error('Playlist fetch error:', error.response?.status, error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({ error: 'Failed to fetch playlist' });
  }
});

export default router;
