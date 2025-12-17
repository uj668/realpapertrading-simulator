'use client';

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/Button';
import { Input, Label } from './ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

export default function FixDepositsModal({ isOpen, onClose, onFixDeposits, currentTotalDeposits }) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum < 0) {
      setError('Please enter a valid amount (0 or more)');
      return;
    }

    setLoading(true);
    try {
      await onFixDeposits(amountNum);
      setAmount('');
      onClose();
    } catch (err) {
      setError(err.message || 'Error fixing deposits');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🔧 Fix Previously Added Deposits</span>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              ⚠️ One-Time Correction Needed
            </p>
            <p className="text-xs text-yellow-700">
              If you added funds before the tracking fix, they weren't recorded. 
              Enter the TOTAL amount you deposited previously (not including your initial €10,000).
            </p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Current tracked deposits: <span className="font-bold">€{(currentTotalDeposits || 0).toFixed(2)}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fixAmount">Total Amount Previously Deposited</Label>
              <Input
                id="fixAmount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2000.00"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the total you deposited via "Add Funds" before this fix
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 <strong>How to calculate:</strong> Look at your P/L. If it's much higher than your 
                actual position profits, the difference is likely what you deposited.
              </p>
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
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                disabled={loading || !amount}
              >
                {loading ? 'Fixing...' : 'Set Correct Amount'}
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-800">
              ⚠️ <strong>One-time use only:</strong> This will SET (not add) your total deposits to the amount you enter. 
              Use this only to fix old deposits that weren't tracked.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

