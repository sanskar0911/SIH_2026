import { apiRequest } from './apiClient';

export interface AnalysisJob {
  id: string;
  stormId: string;
  status: string;
  progress: number;
  currentStage: string;
  error?: string;
  result?: any;
}

export const analysisApi = {
  runAnalysis: (stormId: string, forceReanalysis = false) =>
    apiRequest<AnalysisJob>('/analysis/run', {
      method: 'POST',
      body: JSON.stringify({ stormId, forceReanalysis }),
    }),
  getJobStatus: (jobId: string) => apiRequest<AnalysisJob>(`/analysis/${jobId}`),
};
