import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { defaultClient } from './client';
import { queryKeys } from './queryClient';
import {
  Incident,
  RCAGraph,
  TimelineData,
  ChatSession,
  InsightStream,
  RemediationPlan,
} from '@types/index';
import { CACHE_TTL } from '@utils/constants';

// Incident Queries
export const useIncidents = () => {
  return useQuery({
    queryKey: queryKeys.incidents.list(),
    queryFn: async () => {
      const response = await defaultClient.getIncidents();
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch incidents');
      }
      return response.data!;
    },
    staleTime: CACHE_TTL.SHORT,
  });
};

export const useIncident = (id: string) => {
  return useQuery({
    queryKey: queryKeys.incidents.detail(id),
    queryFn: async () => {
      const response = await defaultClient.getIncident(id);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch incident');
      }
      return response.data!;
    },
    staleTime: CACHE_TTL.SHORT,
    enabled: !!id,
  });
};

// RCA Graph Queries
export const useRCAGraph = (incidentId: string) => {
  return useQuery({
    queryKey: queryKeys.rca.graph(incidentId),
    queryFn: async () => {
      const response = await defaultClient.getRCAGraph(incidentId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch RCA graph');
      }
      return response.data!;
    },
    staleTime: CACHE_TTL.MEDIUM,
    enabled: !!incidentId,
  });
};

// Timeline Queries
export const useTimeline = (incidentId: string) => {
  return useQuery({
    queryKey: queryKeys.timeline.detail(incidentId),
    queryFn: async () => {
      const response = await defaultClient.getTimeline(incidentId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch timeline');
      }
      return response.data!;
    },
    staleTime: CACHE_TTL.MEDIUM,
    enabled: !!incidentId,
  });
};

// Chat Queries
export const useChatSession = (incidentId: string) => {
  return useQuery({
    queryKey: queryKeys.chat.session(incidentId),
    queryFn: async () => {
      const response = await defaultClient.getChatSession(incidentId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch chat session');
      }
      return response.data!;
    },
    staleTime: CACHE_TTL.SHORT,
    enabled: !!incidentId,
  });
};

export const useSendMessage = (incidentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) => {
      const response = await defaultClient.sendChatMessage(incidentId, message);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to send message');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      // Optimistically update the chat session with both messages
      queryClient.setQueryData(
        queryKeys.chat.session(incidentId),
        (old: ChatSession | undefined) => {
          if (!old) return old;
          const { userMessage, assistantMessage } = data as any;
          if (userMessage && assistantMessage) {
            return {
              ...old,
              messages: [...old.messages, userMessage, assistantMessage],
              updatedAt: new Date().toISOString(),
            };
          }
          return old;
        }
      );
    },
  });
};

// Insights Queries
export const useInsights = (incidentId: string) => {
  return useQuery({
    queryKey: queryKeys.insights.stream(incidentId),
    queryFn: async () => {
      const response = await defaultClient.getInsights(incidentId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch insights');
      }
      return response.data!;
    },
    staleTime: CACHE_TTL.SHORT,
    enabled: !!incidentId,
  });
};

// Remediation Queries
export const useRemediationPlan = (incidentId: string) => {
  return useQuery({
    queryKey: queryKeys.remediation.plan(incidentId),
    queryFn: async () => {
      const response = await defaultClient.getRemediationPlan(incidentId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch remediation plan');
      }
      return response.data!;
    },
    staleTime: CACHE_TTL.MEDIUM,
    enabled: !!incidentId,
  });
};

export const useUpdateStepStatus = (incidentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stepId, status }: { stepId: string; status: string }) => {
      const response = await defaultClient.updateRemediationStepStatus(
        incidentId,
        stepId,
        status
      );
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update step status');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch the remediation plan
      queryClient.invalidateQueries({
        queryKey: queryKeys.remediation.plan(incidentId),
      });
    },
  });
};
