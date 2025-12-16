'use client';

import { useEffect, useRef } from 'react';
import db from '../lib/instantdb';

export function usePortfolioSnapshot(userId, totalValue, cash, positionsValue) {
  const lastSnapshotRef = useRef(null);

  useEffect(() => {
    if (!userId || totalValue === undefined) return;

    const saveSnapshot = async () => {
      const now = new Date();
      const today = now.toDateString();

      // Only save one snapshot per day
      if (lastSnapshotRef.current === today) return;

      try {
        await db.transact([
          db.tx.portfolioSnapshots[db.id()].update({
            userId,
            totalValue,
            cash,
            positionsValue,
            timestamp: now.getTime(),
          }),
        ]);

        lastSnapshotRef.current = today;
      } catch (error) {
        console.error('Error saving portfolio snapshot:', error);
      }
    };

    // Save snapshot on significant changes (debounced)
    const timeoutId = setTimeout(saveSnapshot, 5000);

    return () => clearTimeout(timeoutId);
  }, [userId, totalValue, cash, positionsValue]);
}

