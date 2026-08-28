import { useState, useEffect } from 'react';
import { alertsApi } from '../api/alertsApi';
import type { Alert } from '../types';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    alertsApi
      .getAlerts()
      .then((data) => setAlerts(data))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  return { alerts, loading };
}
