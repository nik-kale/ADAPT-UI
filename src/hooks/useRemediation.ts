import { useState, useEffect } from 'react';
import { RemediationPlan } from '@types/index';
import { defaultClient } from '@api/client';

export const useRemediation = (incidentId: string) => {
  const [plan, setPlan] = useState<RemediationPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      setError(null);

      const response = await defaultClient.getRemediationPlan(incidentId);

      if (response.success && response.data) {
        setPlan(response.data);
      } else {
        setError(response.error?.message || 'Failed to load remediation plan');
      }

      setLoading(false);
    };

    if (incidentId) {
      fetchPlan();
    }
  }, [incidentId]);

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

  return { plan, loading, error, updateStepStatus };
};
