import { useState, useEffect } from 'react';
import { InsightStream, AgentInsight } from '@types/index';
import { defaultClient } from '@api/client';
import { useFetch } from './useFetch';
import { logger } from '../utils/logger';

/**
 * Hook for managing insights with automatic fetching and optional real-time updates.
 *
 * @param incidentId - The unique identifier for the incident to fetch
 * @param enableRealtime - Whether to enable WebSocket for real-time insight updates
 * @returns Object containing insights array, isLive status, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { insights, isLive, loading, error } = useInsights('inc-123', true);
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 * return <InsightsPanel insights={insights} isLive={isLive} />;
 * ```
 */
export const useInsights = (incidentId: string, enableRealtime = false) => {
  const { data: insightStream, loading, error, refetch } = useFetch<InsightStream>(
    () => defaultClient.getInsights(incidentId),
    [incidentId],
    { skip: !incidentId }
  );

  const [insights, setInsights] = useState<AgentInsight[]>(insightStream?.insights || []);
  const [isLive, setIsLive] = useState(insightStream?.isLive || false);

  // Sync local state with fetched data
  useEffect(() => {
    if (insightStream) {
      setInsights(insightStream.insights);
      setIsLive(insightStream.isLive);
    }
  }, [insightStream]);

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
      (wsError) => {
        if (isMounted) {
          logger.error('WebSocket error', wsError, {
            component: 'useInsights',
            action: 'webSocketError',
            incidentId
          });
        }
      }
    );

    return () => {
      isMounted = false;
      defaultClient.disconnectWebSocket();
    };
  }, [incidentId, enableRealtime]);

  return { insights, isLive, loading, error, refetch };
};
