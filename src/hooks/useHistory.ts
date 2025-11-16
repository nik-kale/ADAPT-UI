import { useState, useCallback } from 'react';

/**
 * History state structure
 */
interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

/**
 * Hook for undo/redo functionality
 * Provides time-travel capabilities for any state
 *
 * @example
 * const {
 *   state,
 *   setState,
 *   undo,
 *   redo,
 *   canUndo,
 *   canRedo,
 *   reset
 * } = useHistory(initialState);
 */
export function useHistory<T>(initialState: T, maxHistorySize: number = 50) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory((currentHistory) => {
      const resolvedState =
        typeof newState === 'function'
          ? (newState as (prev: T) => T)(currentHistory.present)
          : newState;

      // Don't add to history if state hasn't changed
      if (resolvedState === currentHistory.present) {
        return currentHistory;
      }

      const newPast = [...currentHistory.past, currentHistory.present];

      // Limit history size to prevent memory issues
      if (newPast.length > maxHistorySize) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: resolvedState,
        future: [], // Clear future when new state is set
      };
    });
  }, [maxHistorySize]);

  const undo = useCallback(() => {
    setHistory((currentHistory) => {
      if (currentHistory.past.length === 0) {
        return currentHistory;
      }

      const newPast = [...currentHistory.past];
      const newPresent = newPast.pop()!;

      return {
        past: newPast,
        present: newPresent,
        future: [currentHistory.present, ...currentHistory.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((currentHistory) => {
      if (currentHistory.future.length === 0) {
        return currentHistory;
      }

      const newFuture = [...currentHistory.future];
      const newPresent = newFuture.shift()!;

      return {
        past: [...currentHistory.past, currentHistory.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newState: T) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    historySize: history.past.length + 1 + history.future.length,
  };
}
