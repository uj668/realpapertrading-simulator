'use client';

import { useState, useEffect, useMemo } from 'react';
import { id } from '@instantdb/react';
import db from '../lib/instantdb';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';

export default function RecoveryModal({ isOpen, onClose, user, tradesData, positionsData, userData }) {
  const [recovering, setRecovering] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const trades = tradesData?.trades || [];
  const currentPositions = positionsData?.positions || [];
  const profile = userData?.users?.[0] || null;

  // Calculate correct state from trades
  const analysis = useMemo(() => {
    if (trades.length === 0) return null;

    let totalBuyAmount = 0;
    let totalSellAmount = 0;
    const symbolData = {};

    trades.forEach(trade => {
      if (trade.type === 'buy') {
        totalBuyAmount += trade.totalAmount;
        
        if (!symbolData[trade.symbol]) {
          symbolData[trade.symbol] = { shares: 0, totalCost: 0 };
        }
        symbolData[trade.symbol].shares += trade.quantity;
        symbolData[trade.symbol].totalCost += trade.totalAmount;
      } else if (trade.type === 'sell') {
        totalSellAmount += trade.totalAmount;
        
        if (!symbolData[trade.symbol]) {
          symbolData[trade.symbol] = { shares: 0, totalCost: 0 };
        }
        symbolData[trade.symbol].shares -= trade.quantity;
        const avgCost = symbolData[trade.symbol].totalCost / (symbolData[trade.symbol].shares + trade.quantity);
        symbolData[trade.symbol].totalCost -= avgCost * trade.quantity;
      }
    });

    const totalDeposits = profile?.totalDeposits || 0;
    const correctCash = totalDeposits - totalBuyAmount + totalSellAmount;

    const correctPositions = [];
    Object.keys(symbolData).forEach(symbol => {
      const data = symbolData[symbol];
      if (data.shares > 0) {
        correctPositions.push({
          symbol,
          quantity: data.shares,
          avgCostBasis: data.totalCost / data.shares,
        });
      }
    });

    return {
      totalBuyAmount,
      totalSellAmount,
      totalDeposits,
      correctCash,
      correctPositions,
      currentCash: profile?.currentCash || 0,
      currentPositions: currentPositions.length,
    };
  }, [trades, profile, currentPositions]);

  const handleRecover = async () => {
    if (!analysis || !user) return;

    setRecovering(true);
    setError('');
    setStatus('Starting recovery...');

    try {
      // Step 1: Update cash balance
      setStatus('Updating cash balance...');
      await db.transact([
        db.tx.users[user.id].update({
          currentCash: analysis.correctCash,
        }),
      ]);

      // Step 2: Delete old positions
      setStatus('Clearing old positions...');
      const deleteTransactions = currentPositions.map(pos => 
        db.tx.positions[pos.id].delete()
      );
      if (deleteTransactions.length > 0) {
        await db.transact(deleteTransactions);
      }

      // Step 3: Create new positions
      setStatus('Rebuilding positions...');
      const createTransactions = analysis.correctPositions.map(pos => 
        db.tx.positions[id()].update({
          userId: user.id,
          symbol: pos.symbol,
          quantity: pos.quantity,
          avgCostBasis: pos.avgCostBasis,
        })
      );
      if (createTransactions.length > 0) {
        await db.transact(createTransactions);
      }

      setStatus('Recovery complete!');
      setSuccess(true);

      // Close and refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('[Recovery] Error:', err);
      setError(err.message || 'Recovery failed. Please try again.');
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">🔧 Data Recovery</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={recovering}
            >
              ✕
            </button>
          </div>

          {!analysis ? (
            <p className="text-gray-600">No trades found to analyze.</p>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {status && (
                <div className={`${success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'} border px-4 py-3 rounded mb-4`}>
                  {status}
                </div>
              )}

              {success ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">
                    Data Recovered Successfully!
                  </h3>
                  <p className="text-gray-600">
                    Page will refresh automatically...
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Trades</p>
                        <p className="text-xl font-bold">{trades.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Deposits</p>
                        <p className="text-xl font-bold">€{analysis.totalDeposits.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                      <h3 className="font-semibold text-yellow-900 mb-2">Current (Incorrect)</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-yellow-700">Cash:</p>
                          <p className="font-bold text-yellow-900">€{analysis.currentCash.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-yellow-700">Positions:</p>
                          <p className="font-bold text-yellow-900">{analysis.currentPositions}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Recovered (Correct)</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <p className="text-green-700">Cash:</p>
                          <p className="font-bold text-green-900">€{analysis.correctCash.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-green-700">Positions:</p>
                          <p className="font-bold text-green-900">{analysis.correctPositions.length}</p>
                        </div>
                      </div>
                      
                      {analysis.correctPositions.length > 0 && (
                        <div>
                          <p className="text-sm text-green-700 font-medium mb-1">Your Positions:</p>
                          <ul className="text-sm space-y-1">
                            {analysis.correctPositions.map(pos => (
                              <li key={pos.symbol} className="text-green-900">
                                <span className="font-bold">{pos.symbol}:</span> {pos.quantity.toFixed(4)} shares @ €{pos.avgCostBasis.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded p-4 mb-4">
                    <p className="text-sm text-orange-800">
                      ⚠️ This will recalculate your portfolio based on your trade history.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleRecover}
                      variant="primary"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={recovering}
                    >
                      {recovering ? 'Recovering...' : '🔧 Recover My Data'}
                    </Button>
                    <Button
                      onClick={onClose}
                      variant="secondary"
                      disabled={recovering}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

