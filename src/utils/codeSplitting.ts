/**
 * Code splitting utilities for optimizing bundle size
 */

import React from 'react';

/**
 * Lazy load with retry logic
 * Retries failed chunk loads to handle network issues
 */
export const lazyWithRetry = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries = 3,
  interval = 1000
): React.LazyExoticComponent<T> => {
  return React.lazy(async () => {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        return await importFunc();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on the last attempt
        if (i < retries - 1) {
          // Wait before retrying with exponential backoff
          await new Promise((resolve) => setTimeout(resolve, interval * Math.pow(2, i)));
        }
      }
    }

    throw lastError || new Error('Failed to load component');
  });
};

/**
 * Preload a component without rendering it
 * Useful for preloading on hover or route prefetching
 */
export const preload = (importFunc: () => Promise<any>) => {
  importFunc().catch(() => {
    // Silently fail - component will be loaded again when needed
  });
};

/**
 * Prefetch components based on user interaction
 */
export const prefetchOnHover = (importFunc: () => Promise<any>) => {
  return {
    onMouseEnter: () => preload(importFunc),
    onTouchStart: () => preload(importFunc),
  };
};

/**
 * Prefetch components on idle
 */
export const prefetchOnIdle = (importFunc: () => Promise<any>) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => preload(importFunc));
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => preload(importFunc), 1);
  }
};

/**
 * Create a loading component with timeout
 */
export const createLoadingComponent = (
  Component: React.ComponentType,
  timeout: number = 10000
) => {
  return class LoadingWrapper extends React.Component<any, { timedOut: boolean }> {
    timer: NodeJS.Timeout | null = null;

    constructor(props: any) {
      super(props);
      this.state = { timedOut: false };
    }

    componentDidMount() {
      this.timer = setTimeout(() => {
        this.setState({ timedOut: true });
      }, timeout);
    }

    componentWillUnmount() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
    }

    render() {
      if (this.state.timedOut) {
        return (
          <div className="text-adapt-text-primary p-4">
            Loading is taking longer than expected. Please refresh the page.
          </div>
        );
      }
      return <Component {...this.props} />;
    }
  };
};

/**
 * Chunk names for better debugging
 */
export const getChunkName = (componentPath: string): string => {
  const parts = componentPath.split('/');
  const fileName = parts[parts.length - 1].replace('.tsx', '').replace('.ts', '');
  return fileName;
};

/**
 * Bundle size analyzer helper
 */
export const logChunkLoad = (chunkName: string, startTime: number) => {
  const loadTime = performance.now() - startTime;
  console.log(`[Code Splitting] Loaded ${chunkName} in ${loadTime.toFixed(2)}ms`);
};
