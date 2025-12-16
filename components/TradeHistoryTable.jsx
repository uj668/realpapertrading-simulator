'use client';

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { format } from 'date-fns';

export default function TradeHistoryTable({ trades = [] }) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all'); // all, BUY, SELL
  const [symbolFilter, setSymbolFilter] = useState('');

  // Get unique symbols
  const symbols = [...new Set(trades.map(t => t.symbol))];

  // Filter trades
  const filteredTrades = trades.filter(trade => {
    const typeMatch = filter === 'all' || trade.type === filter;
    const symbolMatch = !symbolFilter || trade.symbol === symbolFilter;
    return typeMatch && symbolMatch;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Total'];
    const rows = filteredTrades.map(trade => [
      format(trade.timestamp || Date.now(), 'yyyy-MM-dd HH:mm:ss'),
      trade.symbol,
      trade.type,
      trade.quantity,
      trade.pricePerShare,
      trade.totalAmount,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades_${format(Date.now(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('tradeHistory')}</CardTitle>
          <Button onClick={exportToCSV} variant="secondary" size="sm">
            {t('exportCSV')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {t('all')}
            </button>
            <button
              onClick={() => setFilter('BUY')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'BUY'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {t('buy')}
            </button>
            <button
              onClick={() => setFilter('SELL')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'SELL'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {t('sell')}
            </button>
          </div>

          <select
            value={symbolFilter}
            onChange={(e) => setSymbolFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="">{t('all')} {t('symbol')}</option>
            {symbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {filteredTrades.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('noTrades')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    {t('date')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Simulation Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    {t('symbol')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    {t('type')}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                    {t('quantity')}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                    {t('price')}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                    {t('total')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {format(trade.timestamp || Date.now(), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {trade.simulationDate ? (
                        <span className={trade.isHistorical ? 'text-orange-600' : 'text-green-600'}>
                          {format(new Date(trade.simulationDate), 'MMM dd, yyyy')}
                          {trade.isHistorical && ' 📅'}
                        </span>
                      ) : (
                        <span className="text-green-600">Live 🔴</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {trade.symbol}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        trade.type === 'BUY'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">
                      {formatNumber(trade.quantity, 4)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">
                      {formatCurrency(trade.pricePerShare)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(trade.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

