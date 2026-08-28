import { apiRequest } from './apiClient';
import type { ForecastPoint } from '../types';

export const forecastApi = {
  getStormForecast: (stormId: string) =>
    apiRequest<ForecastPoint[]>(`/storms/${stormId}/forecast`),
  getStormUncertainty: (stormId: string) =>
    apiRequest<any>(`/storms/${stormId}/uncertainty`),
  getStormWindfield: (stormId: string) =>
    apiRequest<any>(`/storms/${stormId}/wind-field`),
};
