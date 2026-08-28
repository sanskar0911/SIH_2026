import { useState, useEffect } from 'react';
import { dataHealthApi } from '../api/dataHealthApi';
import type { DataHealth } from '../types';

export function useDataHealth() {
  const [dataHealth, setDataHealth] = useState<DataHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    dataHealthApi
      .getDataHealth()
      .then((data) => setDataHealth(data))
      .catch(() => setDataHealth(null))
      .finally(() => setLoading(false));
  }, []);

  return { dataHealth, loading };
}
