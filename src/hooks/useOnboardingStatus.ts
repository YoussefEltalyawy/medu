'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase';

export function useOnboardingStatus() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || loading) {
        return;
      }

      try {
        setIsChecking(true);
        const supabase = createClient();

        const { data, error } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          // Default to not completed if there's an error
          setIsOnboardingCompleted(false);
        } else {
          setIsOnboardingCompleted(data?.onboarding_completed || false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboardingCompleted(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [user, loading]);

  useEffect(() => {
    if (!loading && user && isOnboardingCompleted === false) {
      // User is authenticated but hasn't completed onboarding
      router.push('/onboarding');
    }
  }, [user, loading, isOnboardingCompleted, router]);

  return {
    isOnboardingCompleted,
    isChecking,
  };
}
