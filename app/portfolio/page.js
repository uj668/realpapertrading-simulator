'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { useSimulation } from '../../context/SimulationContext';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { usePortfolioSnapshot } from '../../hooks/usePortfolioSnapshot';
import { getQuote } from '../../lib/twelveData';
import db from '../../lib/instantdb';
import Navbar from '../../components/Navbar';
import PortfolioSummary from '../../components/PortfolioSummary';
import PositionCard from '../../components/PositionCard';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { formatDistance, format as formatDate } from 'date-fns';

export default function PortfolioPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { simulationDate, isHistoricalMode, jumpToToday } = useSimulation();
  
  // Check for demo mode
  const [demoMode, setDemoMode] = useState(false);
  const [demoUser, setDemoUser] = useState(null);

  useEffect(() => {
    const isDemo = localStorage.getItem('demoMode') === 'true';
    if (isDemo) {
      setDemoMode(true);
      const user = JSON.parse(localStorage.getItem('demoUser') || '{}');
      setDemoUser(user);
    }
  }, []);

  const { user: authUser, isLoading: authLoading } = db.useAuth();
  const user = demoMode ? demoUser : authUser;
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user data and positions from InstantDB (skip in demo mode)
  const { data: userData } = db.useQuery(
    user && !demoMode ? { users: { $: { where: { id: user.id } } } } : null
  );

  const { data: positionsData } = db.useQuery(
    user && !demoMode ? { positions: { $: { where: { userId: user.id } } } } : null
  );

  // Demo mode data
  const [demoData, setDemoData] = useState({
    cash: 10000,
    initialBalance: 10000,
    positions: [],
  });

  useEffect(() => {
    if (demoMode) {
      const savedData = localStorage.getItem('demoData');
      if (savedData) {
        setDemoData(JSON.parse(savedData));
      }
    }
  }, [demoMode]);

  const userProfile = demoMode ? demoData : userData?.users?.[0];
  const cash = demoMode ? demoData.cash : (userProfile?.currentCash || 10000);
  const initialBalance = demoMode ? demoData.initialBalance : (userProfile?.initialBalance || 10000);

  // Fetch current or historical prices for all positions
  const fetchPrices = async () => {
    const posData = demoMode ? demoData.positions : (positionsData?.positions || []);
    
    if (!posData || posData.length === 0) {
      setPositions([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch prices for each symbol (either current or historical)
      const pricePromises = posData.map(async (position) => {
        try {
          const quote = await getQuote(position.symbol, simulationDate);
          return {
            ...position,
            currentPrice: quote?.price || position.avgCostBasis,
            change: quote?.change || 0,
            changePercent: quote?.changePercent || 0,
          };
        } catch (error) {
          console.error(`Error fetching price for ${position.symbol}:`, error);
          return {
            ...position,
            currentPrice: position.avgCostBasis,
            change: 0,
            changePercent: 0,
          };
        }
      });

      const updatedPositions = await Promise.all(pricePromises);
      setPositions(updatedPositions);
    } catch (error) {
      console.error('Error fetching prices:', error);
      const fallbackPositions = posData.map(position => ({
        ...position,
        currentPrice: position.avgCostBasis,
        change: 0,
        changePercent: 0,
      }));
      setPositions(fallbackPositions);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh prices
  const { isRefreshing, lastUpdate, manualRefresh } = useAutoRefresh(
    fetchPrices,
    60000, // 60 seconds
    autoRefreshEnabled
  );

  // Initial load and when simulation date changes
  useEffect(() => {
    if (user && (positionsData || demoMode)) {
      fetchPrices();
    }
  }, [user, positionsData, demoMode, simulationDate]);

  // Calculate totals
  const positionsValue = positions.reduce((sum, p) => sum + (p.quantity * p.currentPrice), 0);
  const totalValue = cash + positionsValue;

  // Save portfolio snapshot
  usePortfolioSnapshot(user?.id, totalValue, cash, positionsValue);

  // Redirect if not authenticated (skip check in demo mode)
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
        {/* Historical Mode Banner */}
        {isHistoricalMode && simulationDate && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-orange-800">
                📅 Viewing portfolio as of: {formatDate(new Date(simulationDate), 'MMMM d, yyyy')}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Prices and values shown are from this historical date
              </p>
            </div>
            <Button
              onClick={jumpToToday}
              variant="success"
              size="sm"
            >
              {t('language') === 'lt' ? 'Peršokti į šiandien' : 'Jump to Today'}
            </Button>
          </div>
        )}

        {/* Header with Controls */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('portfolio')}</h1>
          
          <div className="flex items-center space-x-4">
            {/* Auto-refresh Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefreshEnabled}
                onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('autoRefresh')}</span>
            </label>

            {/* Manual Refresh Button */}
            <Button
              onClick={manualRefresh}
              variant="secondary"
              size="sm"
              disabled={isRefreshing}
            >
              {isRefreshing ? t('updating') : t('refresh')}
            </Button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-sm text-gray-500 mb-6">
          {t('lastUpdated')}: {formatDistance(lastUpdate, Date.now(), { addSuffix: true })}
        </div>

        {/* Portfolio Summary */}
        <div className="mb-8">
          <PortfolioSummary
            cash={cash}
            totalValue={totalValue}
            initialBalance={initialBalance}
            positionsValue={positionsValue}
          />
        </div>

        {/* Positions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('positions')}</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('loading')}</p>
            </div>
          ) : positions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">{t('noPositions')}</p>
                <p className="text-gray-400 text-sm mb-6">{t('startTrading')}</p>
                <Button
                  onClick={() => router.push('/trade')}
                  variant="primary"
                >
                  {t('trade')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {positions.map((position) => (
                <PositionCard
                  key={position.id}
                  position={position}
                  onTrade={(symbol) => router.push(`/trade?symbol=${symbol}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

