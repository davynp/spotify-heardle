import { useState, useEffect } from 'react';
import { useAuthStore } from '../hooks/useAuthStore';
import { login, fetchPlaylist } from '../lib/spotifyApi';
import {
  getRecentPlaylists,
  saveRecentPlaylist,
  removeRecentPlaylist,
  type SavedPlaylist,
} from '../lib/statsStorage';
import type { PlaylistData } from '../types';

interface Props {
  onPlaylistLoaded: (playlist: PlaylistData) => void;
}

export function PlaylistInput({ onPlaylistLoaded }: Props) {
  const { isLoggedIn, accessToken } = useAuthStore();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [recentPlaylists, setRecentPlaylists] = useState<SavedPlaylist[]>([]);

  useEffect(() => {
    setRecentPlaylists(getRecentPlaylists());
  }, []);

  const handleLoadRecent = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlaylist(id, accessToken!);
      setPlaylist(data);
      saveRecentPlaylist({
        id: data.id,
        name: data.name,
        imageUrl: data.imageUrl,
        owner: data.owner,
      });
      setRecentPlaylists(getRecentPlaylists());
    } catch {
      setError('Failed to load playlist.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRecent = (id: string) => {
    removeRecentPlaylist(id);
    setRecentPlaylists(getRecentPlaylists());
  };

  const handleLogin = async () => {
    const authUrl = await login();
    window.location.href = authUrl;
  };

  const handleLoad = async () => {
    const match = url.match(/(?:playlist[/:])([\w]+)/);
    if (!match) {
      setError('Invalid playlist URL. Paste a Spotify playlist link.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchPlaylist(match[1], accessToken!);
      setPlaylist(data);
      saveRecentPlaylist({
        id: data.id,
        name: data.name,
        imageUrl: data.imageUrl,
        owner: data.owner,
      });
      setRecentPlaylists(getRecentPlaylists());
    } catch {
      setError('Failed to load playlist. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold">Spotify Heardle</h1>
        <p className="text-gray-400">Guess the song from short audio clips</p>
        <button
          onClick={handleLogin}
          className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold px-8 py-3 rounded-full text-lg transition-colors"
        >
          Log in with Spotify
        </button>
        <p className="text-sm text-gray-500">Requires Spotify Premium</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <h1 className="text-4xl font-bold">Spotify Heardle</h1>

      <div className="flex w-full gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a Spotify playlist URL..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#1DB954]"
          onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
        />
        <button
          onClick={handleLoad}
          disabled={loading || !url.trim()}
          className="bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? '...' : 'Load'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {recentPlaylists.length > 0 && (
        <div className="w-full">
          <p className="text-sm text-gray-400 mb-2">Recent Playlists</p>
          <div className="flex flex-col gap-2">
            {recentPlaylists.map((rp) => (
              <div
                key={rp.id}
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-750 rounded-lg p-3 cursor-pointer transition-colors"
                onClick={() => handleLoadRecent(rp.id)}
              >
                {rp.imageUrl && (
                  <img
                    src={rp.imageUrl}
                    alt={rp.name}
                    className="w-10 h-10 rounded"
                  />
                )}
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{rp.name}</p>
                  <p className="text-xs text-gray-400 truncate">{rp.owner}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveRecent(rp.id);
                  }}
                  className="text-gray-500 hover:text-gray-300 text-sm px-1"
                  title="Remove"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {playlist && (
        <div className="flex items-center gap-4 bg-gray-800 rounded-lg p-4 w-full">
          {playlist.imageUrl && (
            <img
              src={playlist.imageUrl}
              alt={playlist.name}
              className="w-16 h-16 rounded"
            />
          )}
          <div className="text-left flex-1">
            <p className="font-semibold">{playlist.name}</p>
            <p className="text-sm text-gray-400">
              {playlist.owner} &middot; {playlist.tracks.length} tracks
            </p>
          </div>
          <button
            onClick={() => onPlaylistLoaded(playlist)}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold px-6 py-2 rounded-full transition-colors"
          >
            Start Game
          </button>
        </div>
      )}
    </div>
  );
}
