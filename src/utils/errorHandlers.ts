/**
 * Global Error Handlers
 * Provides centralized error handling for uncaught exceptions and unhandled promise rejections
 */

import { logger } from './logger';

/**
 * Setup global error handlers for the application
 * 
 * Catches:
 * - Uncaught JavaScript errors (window.onerror)
 * - Unhandled promise rejections (window.onunhandledrejection)
 * 
 * All errors are logged with structured context for debugging and monitoring.
 * Can be integrated with external error tracking services (Sentry, Datadog, etc.)
 * 
 * @example
 * ```tsx
 * // In your main.tsx or index.tsx
 * import { setupGlobalErrorHandlers } from '@utils/errorHandlers';
 * 
 * setupGlobalErrorHandlers();
 * ```
 */
export function setupGlobalErrorHandlers() {
  // Handle uncaught exceptions
  window.onerror = (message, source, lineno, colno, error) => {
    logger.error('Uncaught exception', error, {
      component: 'GlobalErrorHandler',
      action: 'uncaughtException',
      message: String(message),
      source,
      line: lineno,
      column: colno,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Hook for external error tracking service
    // Example: Sentry.captureException(error);
    
    // Return false to let the default handler run
    return false;
  };

  // Handle unhandled promise rejections
  window.onunhandledrejection = (event) => {
    const error = event.reason;
    
    logger.error('Unhandled promise rejection', error, {
      component: 'GlobalErrorHandler',
      action: 'unhandledRejection',
      reason: error?.message || String(error),
      promiseRejectionReason: event.reason,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Hook for external error tracking service
    // Example: Sentry.captureException(error);
    
    // Prevent default browser console error
    // event.preventDefault();
  };

  logger.info('Global error handlers initialized', {
    component: 'GlobalErrorHandler',
    action: 'setup',
  });
}

/**
 * Remove global error handlers
 * Useful for testing or cleanup
 */
export function teardownGlobalErrorHandlers() {
  window.onerror = null;
  window.onunhandledrejection = null;
  
  logger.info('Global error handlers removed', {
    component: 'GlobalErrorHandler',
    action: 'teardown',
  });
}

/**
 * Manually report an error to the global error tracking system
 * Useful for catching and reporting errors in try-catch blocks
 * 
 * @param error - The error to report
 * @param context - Additional context about where/why the error occurred
 * 
 * @example
 * ```tsx
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   reportError(error, {
 *     component: 'DataLoader',
 *     action: 'loadData',
 *     userId: currentUser.id
 *   });
 *   // Handle error locally
 * }
 * ```
 */
export function reportError(error: Error | unknown, context?: Record<string, unknown>) {
  logger.error('Manually reported error', error, {
    component: 'GlobalErrorHandler',
    action: 'manualReport',
    ...context,
  });

  // Hook for external error tracking service
  // Example: Sentry.captureException(error, { extra: context });
}

