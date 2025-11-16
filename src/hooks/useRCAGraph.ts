import { useState, useEffect } from 'react';
import { RCAGraph } from '@types/index';
import { defaultClient } from '@api/client';

export const useRCAGraph = (incidentId: string) => {
  const [graph, setGraph] = useState<RCAGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true);
      setError(null);

      const response = await defaultClient.getRCAGraph(incidentId);

      if (response.success && response.data) {
        setGraph(response.data);
      } else {
        setError(response.error?.message || 'Failed to load RCA graph');
      }

      setLoading(false);
    };

    if (incidentId) {
      fetchGraph();
    }
  }, [incidentId]);

  return { graph, loading, error };
};
