import { useState, useEffect } from 'react';
import { InsightStream, AgentInsight } from '@types/index';
import { defaultClient } from '@api/client';

export const useInsights = (incidentId: string, enableRealtime = false) => {
  const [insights, setInsights] = useState<AgentInsight[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);

      const response = await defaultClient.getInsights(incidentId);

      if (response.success && response.data) {
        setInsights(response.data.insights);
        setIsLive(response.data.isLive);
      } else {
        setError(response.error?.message || 'Failed to load insights');
      }

      setLoading(false);
    };

    if (incidentId) {
      fetchInsights();
    }
  }, [incidentId]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!enableRealtime || !incidentId) return;

    let isMounted = true;

    defaultClient.connectWebSocket(
      incidentId,
      (data) => {
        // Only update state if component is still mounted
        if (isMounted && data.type === 'insight') {
          setInsights(prev => [...prev, data.payload]);
        }
      },
      (error) => {
        if (isMounted) {
          console.error('WebSocket error:', error);
          setError('WebSocket connection error');
        }
      }
    );

    return () => {
      isMounted = false;
      defaultClient.disconnectWebSocket();
    };
  }, [incidentId, enableRealtime]);

  return { insights, isLive, loading, error };
};
