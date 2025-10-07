import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { 
  CreditCard, 
  Check, 
  Star, 
  Calendar,
  AlertCircle,
  Crown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  stripePriceId: string;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    stripePriceId: 'price_1SCwyW2Lue5peqhPyGGcZSEt',
    features: [
      'До 100 резервации/месец',
      'Основно управление на календар',
      'Имейл известия',
      'Мобилна страница за резервации',
      'Основна аналитика',
      'Имейл поддръжка'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    interval: 'month',
    stripePriceId: 'price_1SCxAH2Lue5peqhPvG0J79fb',
    popular: true,
    features: [
      'Неограничени резервации',
      'Разширен календар с drag & drop',
      'SMS и имейл известия',
      'Персонализиран брандинг',
      'Разширена аналитика',
      'Управление на множество бизнеси',
      'AI чат интеграция',
      'Приоритетна поддръжка'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    interval: 'month',
    stripePriceId: 'price_1SCxAw2Lue5peqhPIRDfSixi',
    features: [
      'Всичко от Professional',
      'White-label решение',
      'API достъп и интеграции',
      'Разширен AI телефонен агент',
      'Персонализирани работни процеси',
      'Dedicated account manager',
      'SLA гаранция',
      '24/7 телефонна поддръжка'
    ]
  }
];

interface UserSubscription {
  id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export function SubscriptionManager() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCurrentSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: typeof plans[0]) => {
  if (!user) return;

  setLoading(plan.id);
  try {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to load');

    // Get user email for better matching in webhook
    const userEmail = user.email;

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId: plan.price,
        userId: user.id,
        userEmail: userEmail, // Pass the email
        successUrl: `${window.location.origin}/dashboard?subscription=success`,
        cancelUrl: `${window.location.origin}/dashboard?subscription=canceled`
      }
    });

    if (error) throw error;

    const result = await stripe.redirectToCheckout({
      sessionId: data.sessionId
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Error creating subscription:', error);
    alert('Грешка при създаване на абонамент. Моля опитайте отново.');
  } finally {
    setLoading(true);
  }
};

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    if (confirm('Сигурни ли сте, че искате да отмените абонамента си?')) {
      try {
        const { error } = await supabase.functions.invoke('cancel-subscription', {
          body: { subscriptionId: currentSubscription.id }
        });

        if (error) throw error;

        await fetchSubscription();
        alert('Абонаментът е отменен успешно.');
      } catch (error) {
        console.error('Error canceling subscription:', error);
        alert('Грешка при отмяна на абонамента.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('subscription.title')}</h2>
        <p className="text-gray-600">Управлявайте вашия абонамент и фактуриране</p>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Crown size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('subscription.currentPlan')}: {currentSubscription.plan_id}
                </h3>
                <p className="text-sm text-gray-600">
                  Статус: <span className="capitalize">{currentSubscription.status}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelSubscription}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              {t('subscription.cancel')}
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('subscription.nextBilling')}:</span>
              <span className="font-medium">
                {new Date(currentSubscription.current_period_end).toLocaleDateString('bg-BG')}
              </span>
            </div>
            {currentSubscription.cancel_at_period_end && (
              <div className="mt-2 flex items-center text-sm text-orange-600">
                <AlertCircle size={16} className="mr-1" />
                Абонаментът ще бъде отменен в края на периода
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl shadow-lg p-8 ${
              plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : 'border border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Star size={16} className="fill-current" />
                  <span>Най-популярен</span>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-gray-900">{plan.price}лв</span>
                <span className="text-xl text-gray-500 ml-1">/месец</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={upgrading === plan.id || currentSubscription?.plan_id === plan.id}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                currentSubscription?.plan_id === plan.id
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {upgrading === plan.id ? (
                'Обработва се...'
              ) : currentSubscription?.plan_id === plan.id ? (
                'Текущ план'
              ) : (
                'Избери план'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

