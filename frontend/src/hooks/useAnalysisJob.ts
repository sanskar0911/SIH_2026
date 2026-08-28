import { useState } from 'react';
import { analysisApi, type AnalysisJob } from '../api/analysisApi';

export function useAnalysisJob() {
  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async (stormId: string) => {
    try {
      setRunning(true);
      setError(null);
      const res = await analysisApi.runAnalysis(stormId);
      setJob(res);
      return res;
    } catch (err: any) {
      setError(err?.message || 'Failed to start analysis job');
      throw err;
    } finally {
      setRunning(false);
    }
  };

  return { job, running, error, runAnalysis };
}
