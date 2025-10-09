// hooks/useSubscription.ts
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useSubscription(user: User | null) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = async (retryCount = 0) => {
    if (!user) {
      console.log('No user found, no subscription access');
      setHasAccess(false);
      setLoading(false);
      return;
    }

    try {
      console.log('Checking subscription for user:', user.id);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .maybeSingle();

      if (error) {
        console.error('Database error checking subscription:', error);
        setError(error.message);
        setHasAccess(false);
      } else if (data) {
        console.log('Subscription found:', data);
        setSubscription(data);
        setHasAccess(true);
        setError(null);
      } else {
        console.log('No active subscription found for user');
        setHasAccess(false);
        setError(null);
        
        // Retry logic for new subscriptions (up to 3 times with delay)
        if (retryCount < 3) {
          console.log(`Retrying subscription check in 2 seconds... (${retryCount + 1}/3)`);
          setTimeout(() => checkSubscription(retryCount + 1), 2000);
          return;
        }
      }
    } catch (err) {
      console.error('Unexpected error checking subscription:', err);
      setError('Failed to check subscription status');
      setHasAccess(false);
    } finally {
      if (retryCount === 0) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
  const check = async () => {
    setLoading(true);
    const start = Date.now();

    await checkSubscription(); // your existing async logic

    // ensure at least 2s spinner
    const elapsed = Date.now() - start;
    const minDelay = 2000;
    if (elapsed < minDelay) {
      await new Promise((r) => setTimeout(r, minDelay - elapsed));
    }

    setLoading(false);
  };

  if (user) check();
  else setLoading(false);
}, [user]);

  const refreshSubscription = async () => {
    setLoading(true);
    setError(null);
    await checkSubscription(0);
  };

  return {
    hasAccess,
    loading,
    subscription,
    error,
    refreshSubscription
  };
}