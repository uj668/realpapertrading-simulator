'use client';

import { useLanguage } from '../context/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { formatCurrency, formatPercent } from '../utils/calculations';

export default function PortfolioSummary({ cash, totalValue, initialBalance, positionsValue }) {
  const { t } = useLanguage();
  
  const totalPL = totalValue - initialBalance;
  const totalPLPercent = ((totalValue - initialBalance) / initialBalance) * 100;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
      <CardHeader>
        <CardTitle className="text-2xl">{t('portfolio')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Value */}
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('totalValue')}</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalValue)}
            </p>
          </div>

          {/* Profit/Loss */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-1">{t('profitLoss')}</p>
            <p className={`text-2xl font-bold ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalPL)} ({formatPercent(totalPLPercent)})
            </p>
          </div>

          {/* Breakdown */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('cash')}:</span>
              <span className="font-medium text-gray-900">{formatCurrency(cash)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('positions')}:</span>
              <span className="font-medium text-gray-900">{formatCurrency(positionsValue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('balance')} ({t('initial')}):</span>
              <span className="font-medium text-gray-900">{formatCurrency(initialBalance)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

