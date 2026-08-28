import { useState, useEffect } from 'react';
import { stormsApi } from '../api/stormsApi';
import type { Storm } from '../types';

export function useStorms() {
  const [storms, setStorms] = useState<Storm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStorms = async () => {
    try {
      setLoading(true);
      const data = await stormsApi.getCurrentStorms();
      setStorms(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch storms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorms();
  }, []);

  return { storms, loading, error, refresh: fetchStorms };
}
