import { useState, useEffect } from 'react';
import { explanationApi } from '../api/explanationApi';
import type { Explanation } from '../types';

export function useExplanation(stormId: string) {
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!stormId) return;
    setLoading(true);
    explanationApi
      .getExplanation(stormId)
      .then((data) => setExplanation(data))
      .catch(() => setExplanation(null))
      .finally(() => setLoading(false));
  }, [stormId]);

  return { explanation, loading };
}
