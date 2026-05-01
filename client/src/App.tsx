import { useEffect, useState } from 'react';
import { useAuthStore } from './hooks/useAuthStore';
import { PlaylistInput } from './components/PlaylistInput';
import { GameBoard } from './components/GameBoard';
import type { PlaylistData } from './types';

function App() {
  const { setTokens, isLoggedIn, logout } = useAuthStore();
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = params.get('expires_in');

    if (accessToken && refreshToken && expiresIn) {
      setTokens(accessToken, refreshToken, Number(expiresIn));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setTokens]);

  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col items-center justify-center p-4">
      {isLoggedIn && (
        <button
          onClick={logout}
          className="absolute top-4 right-4 text-sm text-gray-500 hover:text-gray-300"
        >
          Logout
        </button>
      )}

      {playlist ? (
        <GameBoard
          playlist={playlist}
          onNewPlaylist={() => setPlaylist(null)}
        />
      ) : (
        <PlaylistInput onPlaylistLoaded={setPlaylist} />
      )}
    </div>
  );
}

export default App;
