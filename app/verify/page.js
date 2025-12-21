'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Input, Label } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import db from '../../lib/instantdb';

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify the magic code
      await db.auth.signInWithMagicCode({ email, code });
      
      console.log('[Verify] Magic code verified successfully');
      
      // Wait a moment for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the current user after auth
      const currentUser = db.auth.user;
      
      if (!currentUser) {
        console.error('[Verify] No user found after sign in');
        throw new Error('Authentication failed - please try again');
      }
      
      console.log('[Verify] Checking if profile exists for user:', currentUser.id);
      
      // Check if user profile already exists
      const { data } = await db.queryOnce({
        users: {
          $: {
            where: { id: currentUser.id }
          }
        }
      });
      
      const existingProfile = data?.users?.[0];
      
      if (existingProfile && existingProfile.createdAt) {
        // Existing user - redirect to portfolio
        console.log('[Verify] Existing profile found, redirecting to portfolio');
        router.push('/portfolio');
      } else {
        // New user - redirect to profile initialization
        console.log('[Verify] No profile found, redirecting to initialize-profile');
        router.push('/initialize-profile');
      }
    } catch (err) {
      console.error('[Verify] Error:', err);
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
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
            Verify your email
          </p>
        </div>

        <Card>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              We've sent a 6-digit code to <strong>{email}</strong>. 
              Check your email (and spam folder) and enter the code below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  required
                  maxLength={6}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading || code.length !== 6}
              >
                {loading ? t('loading') : 'Verify & Continue'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/login')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Back to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <VerifyPageContent />
    </Suspense>
  );
}

