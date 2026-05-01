import { useState } from 'react';

interface Props {
  onGuess: (guess: string) => void;
  onSkip: () => void;
  disabled: boolean;
}

export function GuessInput({ onGuess, onSkip, disabled }: Props) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (!value.trim()) return;
    onGuess(value.trim());
    setValue('');
  };

  return (
    <div className="flex gap-2 w-full max-w-sm">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Know the song? Type your guess..."
        disabled={disabled}
        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#1DB954] disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        Guess
      </button>
      <button
        onClick={onSkip}
        disabled={disabled}
        className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Skip
      </button>
    </div>
  );
}
