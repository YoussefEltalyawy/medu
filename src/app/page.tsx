'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { isOnboardingCompleted } = useOnboardingStatus();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (isOnboardingCompleted) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, isOnboardingCompleted, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
