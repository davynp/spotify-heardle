import type { GuessRecord } from '../types';

const CLIP_DURATIONS = [1, 2, 4, 8, 16, 30];
const CLIP_LABELS = ['1s', '2s', '4s', '8s', '16s', '30s'];

interface Props {
  guesses: GuessRecord[];
  currentAttempt: number;
  progress: number; // 0–1, how far through the current clip
  isPlaying: boolean;
}

export function AttemptIndicator({ guesses, currentAttempt, progress, isPlaying }: Props) {
  // Cumulative start position for each segment (in duration units)
  const cumStart = CLIP_DURATIONS.map((_, i) =>
    CLIP_DURATIONS.slice(0, i).reduce((a, b) => a + b, 0)
  );
  // Total span from segment 0 through currentAttempt
  const totalSpan = cumStart[currentAttempt] + CLIP_DURATIONS[currentAttempt];
  // Global position of the playback head
  const globalPos = progress * totalSpan;

  return (
    <div className="flex gap-1 w-full max-w-sm">
      {Array.from({ length: 6 }, (_, i) => {
        const guess = guesses[i];
        let bgColor = 'bg-gray-700';

        if (isPlaying && i <= currentAttempt) {
          // During playback, make all segments up to current uniform gray
          bgColor = 'bg-gray-600';
        } else if (guess) {
          if (guess.isCorrect) bgColor = 'bg-[#1DB954]';
          else if (guess.isSkip) bgColor = 'bg-yellow-500';
          else bgColor = 'bg-red-500';
        } else if (i === currentAttempt) {
          bgColor = 'bg-gray-600';
        }

        // Continuous fill: how much of this segment is filled
        let fillPct = 0;
        if (isPlaying && i <= currentAttempt) {
          fillPct = Math.min(Math.max((globalPos - cumStart[i]) / CLIP_DURATIONS[i], 0), 1) * 100;
        }

        return (
          <div key={i} style={{ flex: CLIP_DURATIONS[i] }} className="flex flex-col items-center gap-1">
            <div className={`relative w-full h-2.5 rounded-full ${bgColor} overflow-hidden transition-colors`}>
              {fillPct > 0 && (
                <div
                  className="absolute inset-y-0 left-0 bg-[#1DB954]"
                  style={{ width: `${fillPct}%` }}
                />
              )}
            </div>
            <span className="text-xs text-gray-500">{CLIP_LABELS[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
