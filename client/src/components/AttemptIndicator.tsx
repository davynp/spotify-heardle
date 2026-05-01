import type { GuessRecord } from '../types';

const CLIP_DURATIONS = [1, 2, 4, 8, 16, 30];
const CLIP_LABELS = ['1s', '2s', '4s', '8s', '16s', '30s'];

interface Props {
  guesses: GuessRecord[];
  currentAttempt: number;
}

export function AttemptIndicator({ guesses, currentAttempt }: Props) {
  return (
    <div className="flex gap-1.5 w-full max-w-sm">
      {Array.from({ length: 6 }, (_, i) => {
        const guess = guesses[i];
        let color = 'bg-gray-700';
        if (guess) {
          if (guess.isCorrect) color = 'bg-[#1DB954]';
          else if (guess.isSkip) color = 'bg-yellow-500';
          else color = 'bg-red-500';
        } else if (i === currentAttempt) {
          color = 'bg-gray-500';
        }

        return (
          <div key={i} style={{ flex: CLIP_DURATIONS[i] }} className="flex flex-col items-center gap-1">
            <div className={`w-full h-2 rounded-full ${color} transition-colors`} />
            <span className="text-xs text-gray-500">{CLIP_LABELS[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
