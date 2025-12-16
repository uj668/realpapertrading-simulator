'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Select } from './ui/Select';
import { getTimeSeries } from '../lib/alphaVantage';
import { formatCurrency } from '../utils/calculations';
import { format } from 'date-fns';

export default function StockPriceChart({ symbols = [] }) {
  const { t } = useLanguage();
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [timeRange, setTimeRange] = useState('1month');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const timeRanges = [
    { value: '1day', label: t('day') },
    { value: '1week', label: t('week') },
    { value: '1month', label: t('month') },
    { value: '3months', label: t('threeMonths') },
    { value: '1year', label: t('year') },
  ];

  const getIntervalAndSize = (range) => {
    switch (range) {
      case '1day':
        return { interval: '15min', outputsize: 26 };
      case '1week':
        return { interval: '1h', outputsize: 120 };
      case '1month':
        return { interval: '1day', outputsize: 30 };
      case '3months':
        return { interval: '1day', outputsize: 90 };
      case '1year':
        return { interval: '1week', outputsize: 52 };
      default:
        return { interval: '1day', outputsize: 30 };
    }
  };

  useEffect(() => {
    if (symbols.length > 0 && !selectedSymbol) {
      setSelectedSymbol(symbols[0]);
    }
  }, [symbols, selectedSymbol]);

  useEffect(() => {
    if (!selectedSymbol) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const { interval, outputsize } = getIntervalAndSize(timeRange);
        const data = await getTimeSeries(selectedSymbol, interval, outputsize);
        
        const formattedData = data.reverse().map(item => ({
          date: item.datetime,
          price: item.close,
          volume: item.volume,
        }));
        
        setChartData(formattedData);
      } catch (err) {
        setError(t('error') + ': ' + err.message);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSymbol, timeRange, t]);

  const symbolOptions = symbols.map(symbol => ({
    value: symbol,
    label: symbol,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('stockPrice')}</CardTitle>
          <div className="flex space-x-2">
            <Select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              options={symbolOptions}
              placeholder={t('selectSymbol')}
              className="w-32"
            />
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              options={timeRanges}
              className="w-32"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">{t('loading')}</p>
          </div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">{t('noTrades')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                stroke="#6b7280"
              />
              <YAxis 
                tickFormatter={(value) => `€${value.toFixed(2)}`}
                stroke="#6b7280"
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), t('price')]}
                labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy HH:mm')}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

