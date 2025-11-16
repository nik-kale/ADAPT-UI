import { useState, useEffect } from 'react';
import { TimelineData } from '@types/index';
import { defaultClient } from '@api/client';

export const useTimeline = (incidentId: string) => {
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      setError(null);

      const response = await defaultClient.getTimeline(incidentId);

      if (response.success && response.data) {
        setTimeline(response.data);
      } else {
        setError(response.error?.message || 'Failed to load timeline');
      }

      setLoading(false);
    };

    if (incidentId) {
      fetchTimeline();
    }
  }, [incidentId]);

  return { timeline, loading, error };
};
