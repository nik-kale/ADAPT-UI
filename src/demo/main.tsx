import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import '../styles/globals.css';
import { queryClient } from '@api/queryClient';
import { ErrorBoundary } from '@components/ErrorBoundary';
import { setupGlobalErrorHandlers } from '@utils/errorHandlers';

// Setup global error handlers for uncaught exceptions and promise rejections
setupGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
