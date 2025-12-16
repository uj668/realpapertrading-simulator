'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Input, Label } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import db from '../../lib/instantdb';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // InstantDB uses magic code authentication
      // Send a magic code to the user's email
      await db.auth.sendMagicCode({ email });
      
      // Redirect to verification page
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.message || 'Failed to send login code');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <span className="text-6xl">📈</span>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            RealPaperTrading
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('signInAccount')}
          </p>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? t('loading') : t('login')}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <p className="text-sm text-gray-600">
                {t('dontHaveAccount')}{' '}
                <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  {t('signup')}
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Or try{' '}
                <Link href="/demo" className="text-green-600 hover:text-green-700 font-medium">
                  Demo Mode
                </Link>
                {' '}(no login required)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

