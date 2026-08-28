import { useState, useEffect } from 'react';
import { historicalApi } from '../api/historicalApi';
import type { HistoricalStorm } from '../types';

export function useHistoricalReplay(stormId: string) {
  const [replay, setReplay] = useState<HistoricalStorm | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!stormId) return;
    setLoading(true);
    historicalApi
      .getHistoricalReplay(stormId)
      .then((data) => setReplay(data))
      .catch(() => setReplay(null))
      .finally(() => setLoading(false));
  }, [stormId]);

  return { replay, loading };
}
