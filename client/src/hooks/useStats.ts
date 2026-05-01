import { useState, useCallback } from 'react';
import { getStats, recordWin, recordLoss } from '../lib/statsStorage';
import type { PlayerStats } from '../types';

export function useStats() {
  const [stats, setStats] = useState<PlayerStats>(getStats);

  const onWin = useCallback((attempt: number) => {
    recordWin(attempt);
    setStats(getStats());
  }, []);

  const onLoss = useCallback(() => {
    recordLoss();
    setStats(getStats());
  }, []);

  return { stats, onWin, onLoss };
}
