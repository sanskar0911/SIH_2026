import { apiRequest } from './apiClient';

export const observationsApi = {
  getLatestObservations: () => apiRequest<any[]>('/observations/latest'),
  getStormObservations: (stormId: string) => apiRequest<any[]>(`/observations/${stormId}`),
};
