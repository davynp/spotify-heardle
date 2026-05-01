import { fetchFromSpotify } from './spotify.js';
import type { TrackData } from '../types/index.js';

export async function fetchAllTracks(playlistId: string, token: string): Promise<TrackData[]> {
  const tracks: TrackData[] = [];
  let url: string | null = `/playlists/${playlistId}/items`;

  while (url) {
    const data = await fetchFromSpotify(url, token);
    const items = Array.isArray(data.items) ? data.items : data.items?.items ?? [];

    for (const entry of items) {
      const track = entry.track ?? entry.item;
      if (!track || entry.is_local || !track.uri) continue;

      tracks.push({
        id: track.id,
        uri: track.uri,
        name: track.name,
        artists: track.artists.map((a: any) => a.name),
        albumName: track.album.name,
        albumImageUrl: track.album.images?.[0]?.url ?? null,
        durationMs: track.duration_ms,
      });
    }

    url = data.next ?? data.items?.next ?? null;
  }

  return tracks;
}
