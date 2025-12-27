import { useState } from 'react';
import { RemediationPlan } from '@types/index';
import { defaultClient } from '@api/client';
import { useFetch } from './useFetch';

/**
 * Hook for managing remediation plan data with step status updates.
 *
 * @param incidentId - The unique identifier for the incident to fetch
 * @returns Object containing plan data, loading state, error state, refetch function, and updateStepStatus function
 *
 * @example
 * ```tsx
 * const { plan, loading, error, updateStepStatus } = useRemediation('inc-123');
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 * return <RemediationViewer plan={plan} onUpdateStep={updateStepStatus} />;
 * ```
 */
export const useRemediation = (incidentId: string) => {
  const { data: initialPlan, loading, error: fetchError, refetch } = useFetch<RemediationPlan>(
    () => defaultClient.getRemediationPlan(incidentId),
    [incidentId],
    { skip: !incidentId }
  );

  // Use local state for plan to allow optimistic updates
  const [plan, setPlan] = useState<RemediationPlan | null>(initialPlan);
  const [error, setError] = useState<string | null>(fetchError);

  // Sync local plan state with fetched data
  if (initialPlan !== plan && initialPlan !== null) {
    setPlan(initialPlan);
  }

  // Sync error state
  if (fetchError !== error) {
    setError(fetchError);
  }

  const updateStepStatus = async (stepId: string, status: string) => {
    if (!plan) return;

    const response = await defaultClient.updateRemediationStepStatus(
      incidentId,
      stepId,
      status
    );

    if (response.success) {
      setPlan(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          steps: prev.steps.map(step =>
            step.id === stepId ? { ...step, status: status as any } : step
          ),
        };
      });
    } else {
      setError(response.error?.message || 'Failed to update step status');
    }
  };

  return { plan, loading, error, updateStepStatus, refetch };
};
