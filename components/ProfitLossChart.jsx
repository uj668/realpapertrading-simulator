'use client';

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { formatCurrency } from '../utils/calculations';
import { format } from 'date-fns';

export default function ProfitLossChart({ snapshots = [], initialBalance = 10000 }) {
  const { t } = useLanguage();

  // Calculate P/L for each snapshot
  const chartData = snapshots.map(snapshot => {
    const profitLoss = snapshot.totalValue - initialBalance;
    return {
      date: snapshot.timestamp,
      profitLoss,
      cumulativePL: profitLoss,
    };
  }).sort((a, b) => a.date - b.date);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profitLossChart')}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">{t('noTrades')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
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
                formatter={(value) => [formatCurrency(value), t('profitLoss')]}
                labelFormatter={(timestamp) => format(new Date(timestamp), 'MMM dd, yyyy')}
              />
              <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
              <Bar 
                dataKey="profitLoss" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.profitLoss >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
              <Line 
                type="monotone" 
                dataKey="cumulativePL" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

