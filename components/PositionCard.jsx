'use client';

import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent } from './ui/Card';
import { formatCurrency, formatPercent, formatNumber } from '../utils/calculations';

export default function PositionCard({ position, onTrade }) {
  const { t } = useLanguage();
  
  const marketValue = position.quantity * position.currentPrice;
  const totalCost = position.quantity * position.avgCostBasis;
  const profitLoss = marketValue - totalCost;
  const profitLossPercent = ((marketValue - totalCost) / totalCost) * 100;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {position.symbol}
            </h3>
            <p className="text-sm text-gray-500">
              {formatNumber(position.quantity, 4)} {t('shares')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(position.currentPrice)}
            </p>
            <p className={`text-sm ${position.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(position.changePercent)}
            </p>
          </div>
        </div>

        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('marketValue')}:</span>
            <span className="font-medium">{formatCurrency(marketValue)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('avgCost')}:</span>
            <span className="font-medium">{formatCurrency(position.avgCostBasis)}</span>
          </div>

          <div className="flex justify-between text-sm font-semibold">
            <span className="text-gray-600">{t('profitLoss')}:</span>
            <span className={profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(profitLoss)} ({formatPercent(profitLossPercent)})
            </span>
          </div>
        </div>

        {onTrade && (
          <div className="mt-4 pt-3 border-t">
            <button
              onClick={() => onTrade(position.symbol)}
              className="w-full px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              {t('trade')}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

