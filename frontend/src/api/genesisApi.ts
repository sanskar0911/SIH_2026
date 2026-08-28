import { apiRequest } from './apiClient';

export const genesisApi = {
  getGenesisPredictions: () => apiRequest<any>('/genesis'),
};
