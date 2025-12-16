'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { useSimulation } from '../../context/SimulationContext';
import { id } from '@instantdb/react';
import db from '../../lib/instantdb';
import Navbar from '../../components/Navbar';
import TradeForm from '../../components/TradeForm';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { formatCurrency, formatNumber, calculateNewAvgCost } from '../../utils/calculations';
import { format } from 'date-fns';

export default function TradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { simulationDate, isHistoricalMode, displayDate } = useSimulation();
  
  // Check for demo mode
  const [demoMode, setDemoMode] = useState(false);
  const [demoUser, setDemoUser] = useState(null);
  const [demoData, setDemoData] = useState({
    cash: 10000,
    positions: [],
    trades: [],
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
  const [trades, setTrades] = useState([]);

  // Get symbol from URL query params
  const initialSymbol = searchParams.get('symbol') || '';

  // Fetch user data and positions from InstantDB (skip in demo mode)
  const { data: userData } = db.useQuery(
    user && !demoMode ? { users: { $: { where: { id: user.id } } } } : null
  );

  const { data: positionsData } = db.useQuery(
    user && !demoMode ? { positions: { $: { where: { userId: user.id } } } } : null
  );

  const { data: tradesData } = db.useQuery(
    user && !demoMode
      ? { 
          trades: { 
            $: { 
              where: { userId: user.id },
              order: { serverCreatedAt: 'desc' },
              limit: 10
            } 
          } 
        } 
      : null
  );

  const userProfile = demoMode ? demoData : userData?.users?.[0];
  const cash = demoMode ? demoData.cash : (userProfile?.currentCash || 10000);
  const positions = demoMode ? demoData.positions : (positionsData?.positions || []);

  useEffect(() => {
    if (demoMode) {
      setTrades(demoData.trades || []);
    } else if (tradesData?.trades) {
      setTrades(tradesData.trades);
    }
  }, [tradesData, demoMode, demoData]);

  // Handle trade execution
  const handleTradeComplete = async (tradeData) => {
    const { symbol, type, quantity, pricePerShare, totalAmount, simulationDate, isHistorical } = tradeData;

    try {
      if (demoMode) {
        // DEMO MODE - Save to localStorage
        const existingPosition = positions.find(p => p.symbol === symbol);
        
        if (type === 'BUY') {
          const newCash = cash - totalAmount;
          let newPositions = [...positions];
          
          if (existingPosition) {
            const newQuantity = existingPosition.quantity + quantity;
            const newAvgCost = calculateNewAvgCost(
              existingPosition.quantity,
              existingPosition.avgCostBasis,
              quantity,
              pricePerShare
            );
            newPositions = newPositions.map(p => 
              p.symbol === symbol 
                ? { ...p, quantity: newQuantity, avgCostBasis: newAvgCost }
                : p
            );
          } else {
            newPositions.push({
              id: Date.now().toString(),
              symbol,
              quantity,
              avgCostBasis: pricePerShare,
            });
          }
          
          const newTrade = {
            id: Date.now().toString(),
            symbol,
            type: 'BUY',
            quantity,
            pricePerShare,
            totalAmount,
            timestamp: Date.now(),
            simulationDate: simulationDate,
            isHistorical: isHistorical || false,
          };
          
          const updatedData = {
            cash: newCash,
            positions: newPositions,
            trades: [newTrade, ...demoData.trades].slice(0, 10),
            initialBalance: demoData.initialBalance || 10000,
          };
          
          setDemoData(updatedData);
          localStorage.setItem('demoData', JSON.stringify(updatedData));
        } else {
          // SELL
          if (!existingPosition) {
            throw new Error(t('insufficientShares'));
          }
          
          const newQuantity = existingPosition.quantity - quantity;
          const newCash = cash + totalAmount;
          let newPositions = [...positions];
          
          if (newQuantity <= 0.0001) {
            newPositions = newPositions.filter(p => p.symbol !== symbol);
          } else {
            newPositions = newPositions.map(p => 
              p.symbol === symbol 
                ? { ...p, quantity: newQuantity }
                : p
            );
          }
          
          const newTrade = {
            id: Date.now().toString(),
            symbol,
            type: 'SELL',
            quantity,
            pricePerShare,
            totalAmount,
            timestamp: Date.now(),
            simulationDate: simulationDate,
            isHistorical: isHistorical || false,
          };
          
          const updatedData = {
            cash: newCash,
            positions: newPositions,
            trades: [newTrade, ...demoData.trades].slice(0, 10),
            initialBalance: demoData.initialBalance || 10000,
          };
          
          setDemoData(updatedData);
          localStorage.setItem('demoData', JSON.stringify(updatedData));
        }
        
        alert(t('tradeExecuted'));
      } else {
        // REAL MODE - Use InstantDB
        if (!user || !user.id) {
          throw new Error('User not authenticated');
        }

        const existingPosition = positions.find(p => p.symbol === symbol);
        
        if (type === 'BUY') {
          const newCash = cash - totalAmount;
          
          // Create trade record with proper UUID
          const tradeId = id();
          
          // Update or create position
          if (existingPosition) {
            const newQuantity = existingPosition.quantity + quantity;
            const newAvgCost = calculateNewAvgCost(
              existingPosition.quantity,
              existingPosition.avgCostBasis,
              quantity,
              pricePerShare
            );
            
            await db.transact([
              // Update user cash
              db.tx.users[user.id].update({ currentCash: newCash }),
              // Update position
              db.tx.positions[existingPosition.id].update({
                quantity: newQuantity,
                avgCostBasis: newAvgCost,
              }),
              // Create trade record
              db.tx.trades[tradeId].update({
                userId: user.id,
                symbol,
                type: 'BUY',
                quantity,
                pricePerShare,
                totalAmount,
                timestamp: Date.now(),
                simulationDate: simulationDate ? simulationDate.toISOString() : new Date().toISOString(),
                isHistorical: isHistorical || false,
              }),
            ]);
          } else {
            // Create new position with proper UUID
            const positionId = id();
            
            await db.transact([
              // Update user cash
              db.tx.users[user.id].update({ currentCash: newCash }),
              // Create position
              db.tx.positions[positionId].update({
                userId: user.id,
                symbol,
                quantity,
                avgCostBasis: pricePerShare,
              }),
              // Create trade record
              db.tx.trades[tradeId].update({
                userId: user.id,
                symbol,
                type: 'BUY',
                quantity,
                pricePerShare,
                totalAmount,
                timestamp: Date.now(),
                simulationDate: simulationDate ? simulationDate.toISOString() : new Date().toISOString(),
                isHistorical: isHistorical || false,
              }),
            ]);
          }
          
          alert(t('tradeExecuted'));
        } else {
          // SELL
          if (!existingPosition) {
            throw new Error(t('insufficientShares'));
          }
          
          if (existingPosition.quantity < quantity) {
            throw new Error(t('insufficientShares'));
          }
          
          const newQuantity = existingPosition.quantity - quantity;
          const newCash = cash + totalAmount;
          
          // Create trade record with proper UUID
          const tradeId = id();
          
          if (newQuantity <= 0.0001) {
            // Delete position if quantity is near zero
            await db.transact([
              // Update user cash
              db.tx.users[user.id].update({ currentCash: newCash }),
              // Delete position
              db.tx.positions[existingPosition.id].delete(),
              // Create trade record
              db.tx.trades[tradeId].update({
                userId: user.id,
                symbol,
                type: 'SELL',
                quantity,
                pricePerShare,
                totalAmount,
                timestamp: Date.now(),
                simulationDate: simulationDate ? simulationDate.toISOString() : new Date().toISOString(),
                isHistorical: isHistorical || false,
              }),
            ]);
          } else {
            // Update position quantity
            await db.transact([
              // Update user cash
              db.tx.users[user.id].update({ currentCash: newCash }),
              // Update position
              db.tx.positions[existingPosition.id].update({
                quantity: newQuantity,
              }),
              // Create trade record
              db.tx.trades[tradeId].update({
                userId: user.id,
                symbol,
                type: 'SELL',
                quantity,
                pricePerShare,
                totalAmount,
                timestamp: Date.now(),
                simulationDate: simulationDate ? simulationDate.toISOString() : new Date().toISOString(),
                isHistorical: isHistorical || false,
              }),
            ]);
          }
          
          alert(t('tradeExecuted'));
        }
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      throw error;
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('trade')}</h1>

        {/* Historical Mode Banner */}
        {isHistoricalMode && (
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6" role="alert">
            <p className="font-bold">📅 {t('tradingAtHistoricalDate')}: {displayDate}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trade Form */}
          <div>
            <TradeForm
              initialSymbol={initialSymbol}
              cash={cash}
              positions={positions}
              onTradeComplete={handleTradeComplete}
              simulationDate={simulationDate}
            />
          </div>

          {/* Recent Trades */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t('recentTrades')}</CardTitle>
              </CardHeader>
              <CardContent>
                {trades.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">{t('noTrades')}</p>
                ) : (
                  <div className="space-y-3">
                    {trades.map((trade) => (
                      <div
                        key={trade.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {trade.symbol}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(trade.timestamp || Date.now(), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            trade.type === 'BUY' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {trade.type}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatNumber(trade.quantity, 4)} @ {formatCurrency(trade.pricePerShare)}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(trade.totalAmount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

