interface Props {
  onPlay: () => void;
  disabled: boolean;
  isConnecting: boolean;
  isPlaying: boolean;
}

export function AudioPlayer({ onPlay, disabled, isConnecting, isPlaying }: Props) {
  if (isConnecting) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center animate-pulse">
          <span className="text-gray-400 text-sm">...</span>
        </div>
        <span className="text-sm text-gray-400">Connecting to Spotify...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onPlay}
        disabled={disabled || isPlaying}
        className="w-16 h-16 rounded-full bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 flex items-center justify-center transition-colors"
      >
        <svg
          className="w-8 h-8 text-black ml-1"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
    </div>
  );
}
