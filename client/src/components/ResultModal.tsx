import type { TrackData, PlayerStats } from '../types';
import { StatsPanel } from './StatsPanel';

interface Props {
  status: 'won' | 'lost';
  answer: TrackData;
  attemptNumber: number;
  stats: PlayerStats;
  onPlayAgain: () => void;
  onNewPlaylist: () => void;
}

export function ResultModal({
  status,
  answer,
  attemptNumber,
  stats,
  onPlayAgain,
  onNewPlaylist,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4">
        {answer.albumImageUrl && (
          <img
            src={answer.albumImageUrl}
            alt={answer.albumName}
            className="w-32 h-32 rounded-lg shadow-lg"
          />
        )}
        <div className="text-center">
          <p className="text-lg font-bold">{answer.name}</p>
          <p className="text-gray-400">{answer.artists.join(', ')}</p>
        </div>

        <p className="text-lg">
          {status === 'won' ? (
            <span className="text-[#1DB954]">
              Got it in {attemptNumber}/6!
            </span>
          ) : (
            <span className="text-red-400">Better luck next time</span>
          )}
        </p>

        <StatsPanel stats={stats} />

        <div className="flex gap-3 w-full">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold py-2 rounded-lg transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onNewPlaylist}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            New Playlist
          </button>
        </div>
      </div>
    </div>
  );
}
