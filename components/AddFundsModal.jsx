'use client';

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/Button';
import { Input, Label } from './ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

export default function AddFundsModal({ isOpen, onClose, onAddFunds, currentBalance }) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(t('invalidAmount'));
      return;
    }

    if (amountNum > 1000000) {
      setError(t('amountTooLarge'));
      return;
    }

    setLoading(true);
    try {
      await onAddFunds(amountNum);
      setAmount('');
      onClose();
    } catch (err) {
      setError(err.message || t('errorAddingFunds'));
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>💰 {t('addFunds')}</span>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {t('currentBalance')}: <span className="font-bold text-green-600">€{currentBalance.toFixed(2)}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">{t('amountToAdd')}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max="1000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000.00"
                required
              />
            </div>

            <div>
              <Label>{t('quickAmounts')}</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="px-3 py-2 text-sm font-medium text-gray-900 bg-white border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-colors"
                  >
                    €{quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex space-x-3">
              <Button 
                type="button" 
                onClick={onClose} 
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                {t('cancel')}
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={loading || !amount}
              >
                {loading ? t('adding') : t('addFunds')}
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              ℹ️ {t('addFundsInfo')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

