import { useState, useEffect } from 'react';
import { forecastApi } from '../api/forecastApi';
import type { ForecastPoint } from '../types';

export function useForecast(stormId: string) {
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stormId) return;
    setLoading(true);
    forecastApi
      .getStormForecast(stormId)
      .then((data) => {
        setForecast(data);
        setError(null);
      })
      .catch((err) => setError(err?.message || 'Failed to fetch forecast'))
      .finally(() => setLoading(false));
  }, [stormId]);

  return { forecast, loading, error };
}
