'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { formatCurrency } from '../utils/calculations';
import { format } from 'date-fns';

export default function PortfolioValueChart({ snapshots = [] }) {
  const { t } = useLanguage();

  // Format data for chart
  const chartData = snapshots.map(snapshot => ({
    date: snapshot.timestamp,
    value: snapshot.totalValue,
  })).sort((a, b) => a.date - b.date);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('portfolioValue')}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">{t('noTrades')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM dd')}
                stroke="#6b7280"
              />
              <YAxis 
                tickFormatter={(value) => `€${value.toFixed(0)}`}
                stroke="#6b7280"
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), t('totalValue')]}
                labelFormatter={(timestamp) => format(new Date(timestamp), 'MMM dd, yyyy')}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

