'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import db from '../../lib/instantdb';
import { getQuote } from '../../lib/alphaVantage';
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

  const userProfile = demoMode ? demoData : (userData?.users?.[0] || null);
  const initialBalance = demoMode ? (demoData?.initialBalance || 10000) : (userProfile?.initialBalance || 10000);
  const trades = demoMode ? (demoData?.trades || []) : (tradesData?.trades || []);
  const positions = demoMode ? (demoData?.positions || []) : (positionsData?.positions || []);
  
  // Generate snapshots from trades for both demo and real mode
  const snapshots = useMemo(() => {
    // Guard: Return empty if data not ready
    if (!trades || !initialBalance) {
      return [];
    }
    
    // Try to use existing snapshots from DB first (real mode only)
    if (!demoMode && snapshotsData?.portfolioSnapshots && snapshotsData.portfolioSnapshots.length > 0) {
      return snapshotsData.portfolioSnapshots;
    }
    
    // Generate snapshots from trades if none exist or in demo mode
    if (trades.length === 0) return [];
    
    // Add initial snapshot (starting point)
    const snaps = [{
      timestamp: trades[trades.length - 1].timestamp - 1000, // 1 second before first trade
      totalValue: initialBalance,
      cash: initialBalance,
      positionsValue: 0,
      profit: 0,
      profitPercent: 0,
    }];
    
    // Sort trades by timestamp (oldest first)
    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);
    
    // Add snapshot for each trade
    sortedTrades.forEach((trade, index) => {
      const tradesUpToNow = sortedTrades.slice(0, index + 1);
      const cashSpent = tradesUpToNow.reduce((sum, t) => {
        return sum + (t.type === 'BUY' ? -t.totalAmount : t.totalAmount);
      }, 0);
      const currentCash = initialBalance + cashSpent;
      
      // Calculate position quantities and cost basis
      const positionQty = {};
      const positionCost = {};
      tradesUpToNow.forEach(t => {
        if (!positionQty[t.symbol]) {
          positionQty[t.symbol] = 0;
          positionCost[t.symbol] = 0;
        }
        if (t.type === 'BUY') {
          positionQty[t.symbol] += t.quantity;
          positionCost[t.symbol] += t.totalAmount;
        } else {
          positionQty[t.symbol] -= t.quantity;
          // For SELL, reduce cost proportionally
          const costPerShare = positionCost[t.symbol] / (positionQty[t.symbol] + t.quantity);
          positionCost[t.symbol] -= costPerShare * t.quantity;
        }
      });
      
      // Calculate market value using CURRENT prices
      let positionsValue = 0;
      let totalCostBasis = 0;
      Object.keys(positionQty).forEach(symbol => {
        const qty = positionQty[symbol];
        const cost = positionCost[symbol];
        const currentPrice = currentPrices[symbol];
        
        if (qty > 0) {
          if (currentPrice) {
            positionsValue += qty * currentPrice; // CURRENT market value
          } else {
            // Fallback to cost basis if price not available yet
            positionsValue += cost;
          }
          totalCostBasis += cost; // What was paid
        }
      });
      
      const totalValue = currentCash + positionsValue;
      const profit = totalValue - initialBalance;
      const profitPercent = initialBalance > 0 ? (profit / initialBalance) * 100 : 0;
      
      snaps.push({
        timestamp: trade.timestamp,
        totalValue,
        cash: currentCash,
        positionsValue,
        profit,
        profitPercent,
      });
    });
    
    return snaps;
  }, [trades, initialBalance, currentPrices, demoMode, snapshotsData]);

  // Get unique symbols from positions and trades
  const symbols = [...new Set([
    ...(positions || []).map(p => p?.symbol).filter(Boolean),
    ...(trades || []).map(t => t?.symbol).filter(Boolean),
  ])];

  // Fetch current prices for all symbols
  const [currentPrices, setCurrentPrices] = useState({});

  useEffect(() => {
    const fetchPrices = async () => {
      const prices = {};
      for (const symbol of symbols) {
        try {
          const quote = await getQuote(symbol); // Current price, no date param
          prices[symbol] = quote.price;
        } catch (err) {
          console.error(`Failed to fetch price for ${symbol}:`, err);
          prices[symbol] = null;
        }
      }
      setCurrentPrices(prices);
    };
    
    if (symbols.length > 0) {
      fetchPrices();
    }
  }, [symbols.join(',')]); // Use join to avoid infinite loop

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

