import { TimelineData } from '@types/index';
import { defaultClient } from '@api/client';
import { useFetch } from './useFetch';

/**
 * Hook for managing timeline data with automatic fetching.
 *
 * @param incidentId - The unique identifier for the incident to fetch
 * @returns Object containing timeline data, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { timeline, loading, error, refetch } = useTimeline('inc-123');
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 * return <TimelineViewer timeline={timeline} onRefresh={refetch} />;
 * ```
 */
export const useTimeline = (incidentId: string) => {
  const { data: timeline, loading, error, refetch } = useFetch<TimelineData>(
    () => defaultClient.getTimeline(incidentId),
    [incidentId],
    { skip: !incidentId }
  );

  return { timeline, loading, error, refetch };
};
