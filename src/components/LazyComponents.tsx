import React, { Suspense } from 'react';
import { Loader } from 'lucide-react';

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
 * Lazy-loaded RCA Graph Viewer
 */
export const LazyRCAGraphViewer = React.lazy(
  () => import('./RCAGraphViewer').then((module) => ({ default: module.RCAGraphViewer }))
);

/**
 * Lazy-loaded Timeline Viewer
 */
export const LazyTimelineViewer = React.lazy(
  () => import('./TimelineViewer').then((module) => ({ default: module.TimelineViewer }))
);

/**
 * Lazy-loaded Chat Interface
 */
export const LazyChatInterface = React.lazy(
  () => import('./ChatInterface').then((module) => ({ default: module.ChatInterface }))
);

/**
 * Lazy-loaded Insights Panel
 */
export const LazyInsightsPanel = React.lazy(
  () => import('./InsightsPanel').then((module) => ({ default: module.InsightsPanel }))
);

/**
 * Lazy-loaded Remediation Viewer
 */
export const LazyRemediationViewer = React.lazy(
  () => import('./RemediationViewer').then((module) => ({ default: module.RemediationViewer }))
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
