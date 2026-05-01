import { useCallback } from 'react';
import { useAuthStore } from '../hooks/useAuthStore';
import { useGameState } from '../hooks/useGameState';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import { useStats } from '../hooks/useStats';
import { startGame, submitGuess, skipGuess } from '../lib/spotifyApi';
import { AttemptIndicator } from './AttemptIndicator';
import { AudioPlayer } from './AudioPlayer';
import { GuessInput } from './GuessInput';
import { ResultModal } from './ResultModal';
import type { PlaylistData } from '../types';

interface Props {
  playlist: PlaylistData;
  onNewPlaylist: () => void;
}

export function GameBoard({ playlist, onNewPlaylist }: Props) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const game = useGameState();
  const { isReady, isConnecting, error: playerError, play } = useSpotifyPlayer();
  const { stats, onWin, onLoss } = useStats();

  const handleStartRound = useCallback(async () => {
    if (!accessToken) return;
    const data = await startGame(playlist.id, accessToken);
    game.startRound(data.roundId, data.trackUri);
  }, [accessToken, playlist.id]);

  const handlePlay = useCallback(() => {
    if (!game.trackUri) return;
    play(game.trackUri, game.currentClipDuration());
  }, [game.trackUri, game.attemptNumber, play]);

  const handleGuess = useCallback(
    async (guess: string) => {
      if (!game.roundId || !accessToken) return;
      const result = await submitGuess(game.roundId, guess, accessToken);
      game.addGuess({ text: guess, isSkip: false, isCorrect: result.correct });
      if (result.correct && result.answer) {
        game.setWon(result.answer);
        onWin(result.attemptNumber);
      } else if (result.gameOver && result.answer) {
        game.setLost(result.answer);
        onLoss();
      }
    },
    [game.roundId, accessToken, onWin, onLoss]
  );

  const handleSkip = useCallback(async () => {
    if (!game.roundId || !accessToken) return;
    const result = await skipGuess(game.roundId, accessToken);
    game.addGuess({ text: '', isSkip: true, isCorrect: false });
    if (result.gameOver && result.answer) {
      game.setLost(result.answer);
      onLoss();
    }
  }, [game.roundId, accessToken, onLoss]);

  const handlePlayAgain = useCallback(() => {
    game.reset();
    handleStartRound();
  }, [handleStartRound]);

  const handleNewPlaylist = useCallback(() => {
    game.reset();
    onNewPlaylist();
  }, [onNewPlaylist]);

  if (playerError) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-red-400">{playerError}</p>
        <button
          onClick={onNewPlaylist}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (game.status === 'idle') {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 bg-gray-800 rounded-lg p-4 w-full max-w-sm">
          {playlist.imageUrl && (
            <img
              src={playlist.imageUrl}
              alt={playlist.name}
              className="w-12 h-12 rounded"
            />
          )}
          <div className="text-left">
            <p className="font-semibold">{playlist.name}</p>
            <p className="text-sm text-gray-400">{playlist.tracks.length} tracks</p>
          </div>
        </div>

        {isConnecting ? (
          <p className="text-gray-400">Connecting to Spotify...</p>
        ) : (
          <button
            onClick={handleStartRound}
            disabled={!isReady}
            className="bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-semibold px-8 py-3 rounded-full text-lg transition-colors"
          >
            {isReady ? 'Start Round' : 'Waiting for player...'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <AttemptIndicator
        guesses={game.guesses}
        currentAttempt={game.attemptNumber}
      />

      <AudioPlayer
        clipDuration={game.currentClipDuration()}
        onPlay={handlePlay}
        disabled={game.status !== 'playing'}
        isConnecting={isConnecting}
      />

      {game.status === 'playing' && (
        <GuessInput
          onGuess={handleGuess}
          onSkip={handleSkip}
          disabled={false}
        />
      )}

      {(game.status === 'won' || game.status === 'lost') && game.answer && (
        <ResultModal
          status={game.status}
          answer={game.answer}
          attemptNumber={game.attemptNumber}
          stats={stats}
          onPlayAgain={handlePlayAgain}
          onNewPlaylist={handleNewPlaylist}
        />
      )}
    </div>
  );
}
