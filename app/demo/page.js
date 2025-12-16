'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    // Set demo mode in localStorage
    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('demoUser', JSON.stringify({
      id: 'demo-user',
      email: 'demo@realpapertrading.com',
      username: 'Demo User',
    }));
    
    // Redirect to portfolio
    router.push('/portfolio');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Loading demo mode...</p>
    </div>
  );
}

