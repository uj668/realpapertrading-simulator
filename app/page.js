'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import db from '../lib/instantdb';

export default function Home() {
  const router = useRouter();
  const { isLoading, user } = db.useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/portfolio');
      } else {
        router.push('/login');
      }
    }
  }, [isLoading, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">📈</div>
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    </div>
  );
}

