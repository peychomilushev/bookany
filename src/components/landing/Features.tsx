import React from 'react';
import {
  Calendar,
  Users,
  Smartphone,
  BarChart3,
  MessageSquare,
  Shield,
  Clock,
  CreditCard,
  Bell,
  Palette,
  Globe,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Drag-and-drop calendar with automatic conflict detection and availability management.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Users,
    title: 'Multi-Business Support',
    description: 'Manage multiple businesses from one dashboard with separate branding and settings.',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: 'Fully responsive interface optimized for mobile, tablet, and desktop usage.',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track reservations, revenue, customer patterns, and business performance metrics.',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    icon: MessageSquare,
    title: 'AI Chat Integration',
    description: 'Automated chat support with Telegram and web chat for seamless customer interaction.',
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security with encrypted data, secure payments, and compliance standards.',
    color: 'bg-red-100 text-red-600'
  },
  {
    icon: Clock,
    title: 'Real-Time Updates',
    description: 'Instant notifications and real-time synchronization across all devices and platforms.',
    color: 'bg-teal-100 text-teal-600'
  },
  {
    icon: CreditCard,
    title: 'Payment Processing',
    description: 'Integrated payment gateway with support for deposits, refunds, and recurring billing.',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Automated SMS and email reminders to reduce no-shows and improve customer experience.',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    icon: Palette,
    title: 'Custom Branding',
    description: 'Fully customizable themes, colors, and logos to match your business identity.',
    color: 'bg-cyan-100 text-cyan-600'
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description: 'Support for multiple languages and time zones for global business operations.',
    color: 'bg-lime-100 text-lime-600'
  },
  {
    icon: Zap,
    title: 'API Integration',
    description: 'Powerful APIs for custom integrations and third-party service connections.',
    color: 'bg-amber-100 text-amber-600'
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Reservations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools you need to streamline your booking process,
            enhance customer experience, and grow your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-8 border border-gray-100"
            >
              <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}