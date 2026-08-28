import { useState, useEffect } from 'react';
import { genesisApi } from '../api/genesisApi';

export function useGenesis() {
  const [genesis, setGenesis] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    genesisApi
      .getGenesisPredictions()
      .then((data) => setGenesis(data))
      .catch(() => setGenesis(null))
      .finally(() => setLoading(false));
  }, []);

  return { genesis, loading };
}
