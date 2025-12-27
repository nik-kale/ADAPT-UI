import { RCAGraph } from '@types/index';
import { defaultClient } from '@api/client';
import { useFetch } from './useFetch';

/**
 * Hook for managing RCA graph data with automatic fetching and caching.
 *
 * @param incidentId - The unique identifier for the incident to fetch
 * @returns Object containing graph data, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { graph, loading, error, refetch } = useRCAGraph('inc-123');
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 * return <RCAGraphViewer graph={graph} onRefresh={refetch} />;
 * ```
 */
export const useRCAGraph = (incidentId: string) => {
  const { data: graph, loading, error, refetch } = useFetch<RCAGraph>(
    () => defaultClient.getRCAGraph(incidentId),
    [incidentId],
    { skip: !incidentId }
  );

  return { graph, loading, error, refetch };
};
