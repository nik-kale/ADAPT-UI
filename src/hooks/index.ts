// Export new utilities (keyboard, touch, search, fetch)
export * from './useKeyboardNavigation';
export * from './useTouchGestures';
export * from './useGraphSearch';
export * from './useFetch';

// Re-export React Query hooks as primary hooks
export {
  useIncidents,
  useIncident,
  useRCAGraph,
  useTimeline,
  useChatSession,
  useSendMessage,
  useInsights,
  useRemediationPlan,
  useUpdateStepStatus
} from '@api/queries';

// Note: Old hooks (useRCAGraph.ts, useTimeline.ts, etc.) are deprecated
// They remain for backward compatibility but should not be used in new code
