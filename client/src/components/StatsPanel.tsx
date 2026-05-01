import type { PlayerStats } from '../types';

interface Props {
  stats: PlayerStats;
}

export function StatsPanel({ stats }: Props) {
  const winPct =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const maxDist = Math.max(
    ...Object.values(stats.guessDistribution),
    1
  );

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
          <p className="text-xs text-gray-400">Played</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{winPct}</p>
          <p className="text-xs text-gray-400">Win %</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.currentStreak}</p>
          <p className="text-xs text-gray-400">Streak</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.maxStreak}</p>
          <p className="text-xs text-gray-400">Max</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-gray-400 text-left">Guess Distribution</p>
        {([1, 2, 3, 4, 5, 6] as const).map((n) => (
          <div key={n} className="flex items-center gap-2">
            <span className="text-xs w-3 text-gray-400">{n}</span>
            <div className="flex-1 h-4 bg-gray-800 rounded overflow-hidden">
              <div
                className="h-full bg-[#1DB954] rounded flex items-center justify-end px-1"
                style={{
                  width: `${Math.max(
                    (stats.guessDistribution[n] / maxDist) * 100,
                    stats.guessDistribution[n] > 0 ? 8 : 0
                  )}%`,
                }}
              >
                {stats.guessDistribution[n] > 0 && (
                  <span className="text-[10px] text-black font-bold">
                    {stats.guessDistribution[n]}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
