import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Check, Star, CreditCard } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../../hooks/useAuth';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceId: 'price_starter_monthly',
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
    priceId: 'price_professional_monthly',
    popular: true,
    features: [
      'Неограничени резервации',
      'Разширен календар',
      'SMS и имейл известия',
      'Персонализиран брандинг',
      'Разширена аналитика',
      'AI чат интеграция',
      'Приоритетна поддръжка'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    priceId: 'price_enterprise_monthly',
    features: [
      'Всичко от Professional',
      'White-label решение',
      'API достъп',
      'AI телефонен агент',
      'Персонализирани работни процеси',
      'Dedicated account manager',
      '24/7 поддръжка'
    ]
  }
];

export function SubscriptionRequired() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!user) return;

    setLoading(plan.id);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

     // Use Supabase function instead of /api endpoint
     const { data, error } = await supabase.functions.invoke('create-checkout-session', {
       body: {
         priceId: plan.priceId,
         userId: user.id,
         userEmail: user.email,
         successUrl: `${window.location.origin}/dashboard?subscription=success`,
         cancelUrl: `${window.location.origin}/dashboard?subscription=canceled`
       }
     });

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
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown size={32} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Абонамент е необходим
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            За да използвате платформата BookAny, моля изберете подходящ абонаментен план
          </p>
        </div>

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
                disabled={loading === plan.id}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <CreditCard size={20} />
                <span>
                  {loading === plan.id ? 'Обработва се...' : 'Избери план'}
                </span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Всички планове включват 14-дневен безплатен период. Без скрити такси.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Check size={16} className="text-green-500" />
              <span>Отмяна по всяко време</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check size={16} className="text-green-500" />
              <span>24/7 поддръжка</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check size={16} className="text-green-500" />
              <span>99.9% uptime SLA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}