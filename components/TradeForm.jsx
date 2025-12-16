'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';
import { Button } from './ui/Button';
import { Input, Label } from './ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { getQuote } from '../lib/twelveData';
import { formatCurrency, formatNumber, calculateSharesFromAmount, calculateTotalCost } from '../utils/calculations';
import { format } from 'date-fns';

export default function TradeForm({ initialSymbol = '', cash = 0, positions = [], onTradeComplete }) {
  const { t } = useLanguage();
  const { simulationDate, isHistoricalMode } = useSimulation();
  const [tradeType, setTradeType] = useState('BUY'); // BUY or SELL
  const [symbol, setSymbol] = useState(initialSymbol);
  const [inputMode, setInputMode] = useState('amount'); // 'amount' or 'quantity'
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priceLoading, setPriceLoading] = useState(false);

  // Find position for current symbol
  const position = positions.find(p => p.symbol === symbol.toUpperCase());
  const availableQuantity = position?.quantity || 0;

  // Fetch price when symbol or simulation date changes
  useEffect(() => {
    if (!symbol || symbol.length < 1) {
      setCurrentPrice(null);
      return;
    }

    const fetchPrice = async () => {
      setPriceLoading(true);
      try {
        const quote = await getQuote(symbol, simulationDate);
        setCurrentPrice(quote.price);
        setError('');
      } catch (err) {
        setError(t('invalidSymbol'));
        setCurrentPrice(null);
      } finally {
        setPriceLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPrice, 500);
    return () => clearTimeout(timeoutId);
  }, [symbol, t, simulationDate]);

  // Calculate preview values
  const getPreviewValues = () => {
    if (!currentPrice) return null;

    let shares = 0;
    let total = 0;

    if (inputMode === 'amount' && amount) {
      shares = calculateSharesFromAmount(parseFloat(amount), currentPrice);
      total = parseFloat(amount);
    } else if (inputMode === 'quantity' && quantity) {
      shares = parseFloat(quantity);
      total = calculateTotalCost(shares, currentPrice);
    }

    return { shares, total };
  };

  const preview = getPreviewValues();

  // Validate trade
  const validateTrade = () => {
    if (!symbol) {
      setError(t('pleaseEnterSymbol'));
      return false;
    }
    if (!currentPrice) {
      setError(t('invalidSymbol'));
      return false;
    }
    if (!preview || preview.shares <= 0) {
      setError(t('pleaseEnterAmount'));
      return false;
    }

    if (tradeType === 'BUY') {
      if (preview.total > cash) {
        setError(t('insufficientFunds'));
        return false;
      }
    } else {
      if (preview.shares > availableQuantity) {
        setError(t('insufficientShares'));
        return false;
      }
    }

    return true;
  };

  // Handle trade submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateTrade()) return;

    setLoading(true);
    try {
      await onTradeComplete({
        symbol: symbol.toUpperCase(),
        type: tradeType,
        quantity: preview.shares,
        pricePerShare: currentPrice,
        totalAmount: preview.total,
        simulationDate: simulationDate, // Store simulation date with trade
        isHistorical: isHistoricalMode,
      });

      // Reset form
      setSymbol('');
      setAmount('');
      setQuantity('');
      setCurrentPrice(null);
    } catch (err) {
      setError(err.message || t('tradeFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('trade')}</CardTitle>
        {isHistoricalMode && simulationDate && (
          <div className="mt-2 bg-orange-50 border border-orange-200 rounded px-3 py-2">
            <p className="text-sm text-orange-800">
              📅 Trading at: {format(new Date(simulationDate), 'MMMM d, yyyy')}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trade Type Toggle */}
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={tradeType === 'BUY' ? 'success' : 'outline'}
              className="flex-1"
              onClick={() => setTradeType('BUY')}
            >
              {t('buy')}
            </Button>
            <Button
              type="button"
              variant={tradeType === 'SELL' ? 'danger' : 'outline'}
              className="flex-1"
              onClick={() => setTradeType('SELL')}
            >
              {t('sell')}
            </Button>
          </div>

          {/* Symbol Input */}
          <div>
            <Label htmlFor="symbol">{t('symbol')}</Label>
            <Input
              id="symbol"
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              disabled={loading}
            />
          </div>

          {/* Current Price Display */}
          {symbol && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('currentPrice')}:</span>
                {priceLoading ? (
                  <span className="text-sm text-gray-500">{t('loading')}</span>
                ) : currentPrice ? (
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(currentPrice)}
                  </span>
                ) : (
                  <span className="text-sm text-red-600">{t('symbolNotFound')}</span>
                )}
              </div>
              {tradeType === 'SELL' && (
                <div className="mt-2 text-sm text-gray-600">
                  {t('quantity')}: {formatNumber(availableQuantity, 4)} {t('shares')}
                </div>
              )}
            </div>
          )}

          {/* Input Mode Toggle */}
          <div className="flex space-x-2 text-sm">
            <button
              type="button"
              onClick={() => setInputMode('amount')}
              className={`px-3 py-1 rounded ${
                inputMode === 'amount'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t('amount')} (EUR)
            </button>
            <button
              type="button"
              onClick={() => setInputMode('quantity')}
              className={`px-3 py-1 rounded ${
                inputMode === 'quantity'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t('quantity')}
            </button>
          </div>

          {/* Amount/Quantity Input */}
          {inputMode === 'amount' ? (
            <div>
              <Label htmlFor="amount">{t('amount')} (EUR)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                disabled={loading || !currentPrice}
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="quantity">{t('quantity')}</Label>
              <Input
                id="quantity"
                type="number"
                step="0.0001"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                disabled={loading || !currentPrice}
              />
            </div>
          )}

          {/* Preview */}
          {preview && preview.shares > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">{t('preview')}</h4>
              <p className="text-sm text-blue-800">
                {tradeType === 'BUY' ? t('youWillBuy') : t('youWillSell')}{' '}
                <strong>{formatNumber(preview.shares, 4)}</strong> {t('shares')}{' '}
                {t('at')} <strong>{formatCurrency(currentPrice)}</strong> {t('each')}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                {t('total')}: <strong>{formatCurrency(preview.total)}</strong>
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Available Cash (for BUY) */}
          {tradeType === 'BUY' && (
            <div className="text-sm text-gray-600">
              {t('cash')}: {formatCurrency(cash)}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant={tradeType === 'BUY' ? 'success' : 'danger'}
            className="w-full"
            disabled={loading || !currentPrice || priceLoading}
          >
            {loading ? t('loading') : t('confirm')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

