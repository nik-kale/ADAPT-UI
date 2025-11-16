import React, { Suspense } from 'react';
import { Loader } from 'lucide-react';
import { lazyWithRetry } from '@utils/performance';

/**
 * Loading fallback component
 */
const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-adapt-bg-secondary rounded-lg">
    <Loader size={48} className="text-adapt-primary animate-spin mb-4" />
    <p className="text-adapt-text-secondary">{message}</p>
  </div>
);

/**
 * Lazy-loaded RCA Graph Viewer with retry logic
 */
export const LazyRCAGraphViewer = lazyWithRetry(
  () => import('./Graph/RCAGraphViewer')
);

/**
 * Lazy-loaded Timeline Viewer with retry logic
 */
export const LazyTimelineViewer = lazyWithRetry(
  () => import('./Timeline/TimelineViewer')
);

/**
 * Lazy-loaded Chat Interface with retry logic
 */
export const LazyChatInterface = lazyWithRetry(
  () => import('./Chat/ChatInterface')
);

/**
 * Lazy-loaded Insights Panel with retry logic
 */
export const LazyInsightsPanel = lazyWithRetry(
  () => import('./InsightsPanel/InsightsPanel')
);

/**
 * Lazy-loaded Remediation Viewer with retry logic
 */
export const LazyRemediationViewer = lazyWithRetry(
  () => import('./Remediation/RemediationViewer')
);

/**
 * Wrapper component with Suspense and error boundary
 */
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  name = 'Component',
}) => {
  return (
    <Suspense fallback={fallback || <LoadingFallback message={`Loading ${name}...`} />}>
      {children}
    </Suspense>
  );
};

/**
 * Route-based code splitting helper
 */
export const createLazyRoute = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  componentName: string = 'Page'
) => {
  const LazyComponent = React.lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <LazyWrapper name={componentName}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );
};

/**
 * Preload function for eager loading
 */
export const preloadComponent = (importFunc: () => Promise<any>) => {
  importFunc();
};
