'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import db from '../../lib/instantdb';
import Navbar from '../../components/Navbar';
import TradeHistoryTable from '../../components/TradeHistoryTable';
import StockPriceChart from '../../components/StockPriceChart';
import PortfolioValueChart from '../../components/PortfolioValueChart';
import ProfitLossChart from '../../components/ProfitLossChart';

export default function HistoryPage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  // Check for demo mode
  const [demoMode, setDemoMode] = useState(false);
  const [demoUser, setDemoUser] = useState(null);
  const [demoData, setDemoData] = useState({
    cash: 10000,
    positions: [],
    trades: [],
    initialBalance: 10000,
  });

  useEffect(() => {
    const isDemo = localStorage.getItem('demoMode') === 'true';
    if (isDemo) {
      setDemoMode(true);
      const user = JSON.parse(localStorage.getItem('demoUser') || '{}');
      setDemoUser(user);
      const savedData = localStorage.getItem('demoData');
      if (savedData) {
        setDemoData(JSON.parse(savedData));
      }
    }
  }, []);

  const { user: authUser, isLoading: authLoading } = db.useAuth();
  const user = demoMode ? demoUser : authUser;

  // Fetch user data (skip in demo mode)
  const { data: userData } = db.useQuery(
    user && !demoMode ? { users: { $: { where: { id: user.id } } } } : null
  );

  // Fetch all trades (skip in demo mode)
  const { data: tradesData } = db.useQuery(
    user && !demoMode
      ? { 
          trades: { 
            $: { 
              where: { userId: user.id },
              order: { serverCreatedAt: 'desc' }
            } 
          } 
        } 
      : null
  );

  // Fetch portfolio snapshots (skip in demo mode)
  const { data: snapshotsData } = db.useQuery(
    user && !demoMode
      ? { 
          portfolioSnapshots: { 
            $: { 
              where: { userId: user.id },
              order: { timestamp: 'asc' }
            } 
          } 
        } 
      : null
  );

  // Fetch positions for symbol list (skip in demo mode)
  const { data: positionsData } = db.useQuery(
    user && !demoMode ? { positions: { $: { where: { id: user.id } } } } : null
  );

  const userProfile = demoMode ? demoData : userData?.users?.[0];
  const initialBalance = demoMode ? (demoData.initialBalance || 10000) : (userProfile?.initialBalance || 10000);
  const trades = demoMode ? (demoData.trades || []) : (tradesData?.trades || []);
  const positions = demoMode ? (demoData.positions || []) : (positionsData?.positions || []);
  
  // Create snapshots from demo data if in demo mode
  const snapshots = demoMode 
    ? (() => {
        if (trades.length === 0) return [];
        
        // Add initial snapshot (starting point)
        const snaps = [{
          timestamp: trades[0].timestamp - 1000, // 1 second before first trade
          totalValue: initialBalance,
          cash: initialBalance,
          positionsValue: 0,
        }];
        
        // Add snapshot for each trade
        trades.forEach((trade, index) => {
          const tradesUpToNow = trades.slice(0, index + 1);
          const cashSpent = tradesUpToNow.reduce((sum, t) => {
            return sum + (t.type === 'BUY' ? -t.totalAmount : t.totalAmount);
          }, 0);
          const currentCash = initialBalance + cashSpent;
          
          // Estimate positions value (simplified)
          const positionsValue = tradesUpToNow.reduce((sum, t) => {
            return sum + (t.type === 'BUY' ? t.totalAmount : -t.totalAmount);
          }, 0);
          
          snaps.push({
            timestamp: trade.timestamp,
            totalValue: currentCash + positionsValue,
            cash: currentCash,
            positionsValue: positionsValue,
          });
        });
        
        return snaps;
      })()
    : (snapshotsData?.portfolioSnapshots || []);

  // Get unique symbols from positions and trades
  const symbols = [...new Set([
    ...positions.map(p => p.symbol),
    ...trades.map(t => t.symbol),
  ])];

  // Redirect if not authenticated (skip in demo mode)
  useEffect(() => {
    if (!demoMode && !authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router, demoMode]);

  if (!demoMode && (authLoading || !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('history')}</h1>

        {demoMode && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>📊 Demo Mode:</strong> You have {trades.length} trade(s) recorded. 
              {trades.length === 0 && " Go to the Trade page to make your first trade!"}
            </p>
          </div>
        )}

        {/* Trade History Table */}
        <div className="mb-8">
          <TradeHistoryTable trades={trades} />
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          {/* Stock Price Chart */}
          {symbols.length > 0 && (
            <StockPriceChart symbols={symbols} />
          )}

          {/* Portfolio Value Chart */}
          <PortfolioValueChart snapshots={snapshots} />

          {/* Profit/Loss Chart */}
          <ProfitLossChart snapshots={snapshots} initialBalance={initialBalance} />
        </div>
      </main>
    </div>
  );
}

