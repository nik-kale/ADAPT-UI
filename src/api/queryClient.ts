import { QueryClient } from '@tanstack/react-query';
import { CACHE_TTL } from '@utils/constants';
import { logger } from '@utils/logger';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default cache time
      staleTime: CACHE_TTL.SHORT,
      gcTime: CACHE_TTL.MEDIUM,

      // Retry configuration
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch configuration
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,

      // Error handling
      throwOnError: false,
    },
    mutations: {
      retry: 1,
      throwOnError: false,
      onError: (error) => {
        logger.error('Mutation failed', error);
      },
    },
  },
});

// Query keys factory for type-safe and consistent query keys
export const queryKeys = {
  incidents: {
    all: ['incidents'] as const,
    list: () => [...queryKeys.incidents.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.incidents.all, 'detail', id] as const,
  },
  rca: {
    all: ['rca'] as const,
    graph: (incidentId: string) => [...queryKeys.rca.all, 'graph', incidentId] as const,
  },
  timeline: {
    all: ['timeline'] as const,
    detail: (incidentId: string) => [...queryKeys.timeline.all, 'detail', incidentId] as const,
  },
  chat: {
    all: ['chat'] as const,
    session: (incidentId: string) => [...queryKeys.chat.all, 'session', incidentId] as const,
  },
  insights: {
    all: ['insights'] as const,
    stream: (incidentId: string) => [...queryKeys.insights.all, 'stream', incidentId] as const,
  },
  remediation: {
    all: ['remediation'] as const,
    plan: (incidentId: string) => [...queryKeys.remediation.all, 'plan', incidentId] as const,
  },
} as const;
