'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import db from '../../lib/instantdb';
import { id } from '@instantdb/react';
import Navbar from '../../components/Navbar';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function RecoverDataPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = db.useAuth();
  
  const [recovering, setRecovering] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  // Fetch user data
  const { data: userData } = db.useQuery(
    user ? { users: { $: { where: { id: user.id } } } } : null
  );

  // Fetch all trades
  const { data: tradesData } = db.useQuery(
    user
      ? { 
          trades: { 
            $: { 
              where: { userId: user.id },
              order: { timestamp: 'asc' }
            } 
          } 
        } 
      : null
  );

  // Fetch current positions
  const { data: positionsData } = db.useQuery(
    user ? { positions: { $: { where: { userId: user.id } } } } : null
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const analyzeData = () => {
    if (!tradesData?.trades || !userData?.users?.[0]) {
      return null;
    }

    const trades = tradesData.trades;
    const profile = userData.users[0];
    const positions = positionsData?.positions || [];

    // Calculate totals from trades
    let totalBuyAmount = 0;
    let totalSellAmount = 0;
    const symbolData = {};

    trades.forEach(trade => {
      if (trade.type === 'buy') {
        totalBuyAmount += trade.totalAmount;
        
        if (!symbolData[trade.symbol]) {
          symbolData[trade.symbol] = { shares: 0, totalCost: 0, buys: [], sells: [] };
        }
        symbolData[trade.symbol].shares += trade.quantity;
        symbolData[trade.symbol].totalCost += trade.totalAmount;
        symbolData[trade.symbol].buys.push(trade);
      } else if (trade.type === 'sell') {
        totalSellAmount += trade.totalAmount;
        
        if (!symbolData[trade.symbol]) {
          symbolData[trade.symbol] = { shares: 0, totalCost: 0, buys: [], sells: [] };
        }
        symbolData[trade.symbol].shares -= trade.quantity;
        // Reduce cost basis proportionally
        const avgCost = symbolData[trade.symbol].totalCost / (symbolData[trade.symbol].shares + trade.quantity);
        symbolData[trade.symbol].totalCost -= avgCost * trade.quantity;
        symbolData[trade.symbol].sells.push(trade);
      }
    });

    // Calculate correct cash balance
    const totalDeposits = profile.totalDeposits || 0;
    const correctCash = totalDeposits - totalBuyAmount + totalSellAmount;

    // Build positions from trades
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
      trades,
      currentProfile: profile,
      currentPositions: positions,
      totalBuyAmount,
      totalSellAmount,
      totalDeposits,
      correctCash,
      correctPositions,
      symbolData,
    };
  };

  useEffect(() => {
    if (tradesData && userData) {
      const analysis = analyzeData();
      setAnalysisData(analysis);
    }
  }, [tradesData, userData, positionsData]);

  const handleRecover = async () => {
    if (!analysisData || !user) {
      setError('No data to recover');
      return;
    }

    setRecovering(true);
    setError('');
    setStatus('Starting recovery...');

    try {
      const { correctCash, correctPositions, currentPositions } = analysisData;

      // Step 1: Update user cash balance
      setStatus('Updating cash balance...');
      await db.transact([
        db.tx.users[user.id].update({
          currentCash: correctCash,
        }),
      ]);

      console.log('[Recovery] Cash updated to:', correctCash);

      // Step 2: Delete all existing positions
      setStatus('Clearing old positions...');
      const deleteTransactions = currentPositions.map(pos => 
        db.tx.positions[pos.id].delete()
      );
      if (deleteTransactions.length > 0) {
        await db.transact(deleteTransactions);
      }

      console.log('[Recovery] Deleted', deleteTransactions.length, 'old positions');

      // Step 3: Create new correct positions
      setStatus('Rebuilding positions...');
      const createTransactions = correctPositions.map(pos => 
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

      console.log('[Recovery] Created', createTransactions.length, 'new positions');

      setStatus('Recovery complete!');
      setSuccess(true);

      // Redirect to portfolio after 3 seconds
      setTimeout(() => {
        router.push('/portfolio');
      }, 3000);
    } catch (err) {
      console.error('[Recovery] Error:', err);
      setError(err.message || 'Recovery failed. Please try again.');
    } finally {
      setRecovering(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-6xl">🔧</span>
            <h1 className="text-4xl font-bold text-white mt-4">
              Data Recovery Tool
            </h1>
            <p className="text-gray-300 mt-2">
              Recover your trades and positions from InstantDB
            </p>
          </div>

          {!analysisData ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">Analyzing your data...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Analysis Summary */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>📊 Data Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Trades</p>
                        <p className="text-2xl font-bold">{analysisData.trades.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Deposits</p>
                        <p className="text-2xl font-bold">€{analysisData.totalDeposits.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Bought</p>
                        <p className="text-2xl font-bold text-red-600">-€{analysisData.totalBuyAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Sold</p>
                        <p className="text-2xl font-bold text-green-600">+€{analysisData.totalSellAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                      <h3 className="font-semibold text-yellow-900 mb-2">Current State (Incorrect)</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-yellow-700">Cash Balance:</p>
                          <p className="font-bold text-yellow-900">€{analysisData.currentProfile.currentCash?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div>
                          <p className="text-yellow-700">Positions:</p>
                          <p className="font-bold text-yellow-900">{analysisData.currentPositions.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Recovered State (Correct)</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-green-700">Cash Balance:</p>
                          <p className="font-bold text-green-900">€{analysisData.correctCash.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-green-700">Positions:</p>
                          <p className="font-bold text-green-900">{analysisData.correctPositions.length}</p>
                        </div>
                      </div>
                      
                      {analysisData.correctPositions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-green-700 font-medium mb-1">Your Positions:</p>
                          <ul className="text-sm space-y-1">
                            {analysisData.correctPositions.map(pos => (
                              <li key={pos.symbol} className="text-green-900">
                                <span className="font-bold">{pos.symbol}:</span> {pos.quantity} shares @ €{pos.avgCostBasis.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recovery Actions */}
              <Card>
                <CardContent className="py-6">
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
                    <div className="text-center py-4">
                      <div className="text-6xl mb-4">✅</div>
                      <h3 className="text-xl font-bold text-green-600 mb-2">
                        Data Recovered Successfully!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Redirecting to portfolio...
                      </p>
                      <Button onClick={() => router.push('/portfolio')} variant="primary">
                        Go to Portfolio Now
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-orange-50 border border-orange-200 rounded p-4 mb-4">
                        <h4 className="font-semibold text-orange-900 mb-2">⚠️ Warning</h4>
                        <p className="text-sm text-orange-800">
                          This will recalculate your portfolio based on your trade history. 
                          Your current cash balance and positions will be replaced with the correct values.
                        </p>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          onClick={handleRecover}
                          variant="primary"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={recovering || analysisData.trades.length === 0}
                        >
                          {recovering ? 'Recovering...' : '🔧 Recover My Data'}
                        </Button>
                        <Button
                          onClick={() => router.push('/portfolio')}
                          variant="secondary"
                          disabled={recovering}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

