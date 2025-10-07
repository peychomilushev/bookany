import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small businesses just getting started',
    features: [
      'Up to 100 reservations/month',
      'Basic calendar management',
      'Email notifications',
      'Mobile-responsive booking page',
      'Basic analytics',
      'Email support'
    ],
    popular: false,
    color: 'border-gray-200'
  },
  {
    name: 'Professional',
    price: '$79',
    period: '/month',
    description: 'Ideal for growing businesses with multiple services',
    features: [
      'Unlimited reservations',
      'Advanced calendar with drag & drop',
      'SMS & email notifications',
      'Custom branding & themes',
      'Advanced analytics & reports',
      'Multi-business management',
      'AI chat integration',
      'Priority support'
    ],
    popular: true,
    color: 'border-blue-500 ring-2 ring-blue-500'
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    description: 'For large businesses with advanced needs',
    features: [
      'Everything in Professional',
      'White-label solution',
      'API access & integrations',
      'Advanced AI call handling',
      'Custom workflows',
      'Dedicated account manager',
      'SLA guarantee',
      '24/7 phone support'
    ],
    popular: false,
    color: 'border-gray-200'
  }
];

export function Pricing() {
  const [authModal, setAuthModal] = useState(false);

  return (
    <>
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your business. All plans include a 14-day free trial.
              No setup fees, no hidden costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg ${plan.color} p-8 ${
                  plan.popular ? 'transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Star size={16} className="fill-current" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-xl text-gray-500 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setAuthModal(true)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Start Free Trial
                </button>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">
              All plans include a 14-day free trial. No credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-green-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-green-500" />
                <span>24/7 support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-green-500" />
                <span>99.9% uptime SLA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={authModal}
        onClose={() => setAuthModal(false)}
        initialTab="signup"
      />
    </>
  );
}