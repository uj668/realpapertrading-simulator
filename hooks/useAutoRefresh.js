'use client';

import { useState, useEffect, useRef } from 'react';

export function useAutoRefresh(callback, interval = 60000, enabled = true) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Handle visibility change to pause when tab is inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, we'll pause (handled by enabled state)
      } else {
        // Tab is visible again, trigger a refresh
        if (enabled) {
          manualRefresh();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  // Auto-refresh interval
  useEffect(() => {
    if (!enabled || document.hidden) return;

    const intervalId = setInterval(async () => {
      setIsRefreshing(true);
      try {
        await callbackRef.current();
        setLastUpdate(Date.now());
      } catch (error) {
        console.error('Auto-refresh error:', error);
      } finally {
        setIsRefreshing(false);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [interval, enabled]);

  // Manual refresh function
  const manualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await callbackRef.current();
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Manual refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing,
    lastUpdate,
    manualRefresh,
  };
}

