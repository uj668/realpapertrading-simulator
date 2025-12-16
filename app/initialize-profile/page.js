'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import db from '../../lib/instantdb';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input, Label } from '../../components/ui/Input';

export default function InitializeProfilePage() {
  const router = useRouter();
  const { user, isLoading } = db.useAuth();
  const [username, setUsername] = useState('');
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if user already has a profile
  const { data: userData, isLoading: dataLoading } = db.useQuery(
    user ? { users: { $: { where: { id: user.id } } } } : null
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && user.email) {
      setUsername(user.email.split('@')[0]);
    }
  }, [user]);

  const handleInitialize = async (e) => {
    e.preventDefault();
    setError('');
    setInitializing(true);

    try {
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Check if profile already exists
      const existingProfile = userData?.users?.[0];
      if (existingProfile?.initialBalance) {
        setError('Profile already initialized!');
        setTimeout(() => router.push('/portfolio'), 2000);
        return;
      }

      console.log('Initializing profile for user:', user.id);

      // Create/update user profile with initial data
      await db.transact([
        db.tx.users[user.id].update({
          username: username || user.email.split('@')[0],
          initialBalance: 10000,
          currentCash: 10000,
          createdAt: Date.now(),
        }),
      ]);

      console.log('Profile initialized successfully!');
      setSuccess(true);

      // Wait a moment for InstantDB to sync, then redirect
      setTimeout(() => {
        router.push('/portfolio');
      }, 1500);
    } catch (err) {
      console.error('Error initializing profile:', err);
      setError(err.message || 'Failed to initialize profile. Please try again.');
    } finally {
      setInitializing(false);
    }
  };

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <span className="text-6xl">📈</span>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Initialize Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome, {user.email}! Let's set up your trading account.
          </p>
        </div>

        <Card>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-green-600 mb-2">
                  Profile Initialized!
                </h3>
                <p className="text-gray-600">
                  Redirecting to portfolio...
                </p>
              </div>
            ) : (
              <form onSubmit={handleInitialize} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This will be displayed on your account
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Your Starting Balance
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    €10,000.00
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    You'll start with €10,000 in virtual cash to trade stocks
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={initializing || !username.trim()}
                >
                  {initializing ? 'Initializing...' : 'Initialize Profile & Start Trading'}
                </Button>
              </form>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                Debug Info:
              </h4>
              <div className="text-xs font-mono text-gray-600 space-y-1">
                <div>User ID: {user.id}</div>
                <div>Email: {user.email}</div>
                <div>Profile Exists: {userData?.users?.[0] ? 'Yes' : 'No'}</div>
                {userData?.users?.[0] && (
                  <>
                    <div>Username: {userData.users[0].username || 'Not set'}</div>
                    <div>Balance: €{userData.users[0].initialBalance || 'Not set'}</div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

