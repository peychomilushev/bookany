// components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { SubscriptionRequired } from '../subscription/SubscriptionRequired';
import { DashboardLayout } from './DashboardLayout';
import { Overview } from './Overview';
import { BusinessSetup } from './BusinessSetup';
import { ReservationManagement } from './ReservationManagement';
import { ServiceManagement } from './ServiceManagement';
import { CustomerManagement } from './CustomerManagement';
import { Messages } from './Messages';
import { Analytics } from './Analytics';
import { QRCodeGenerator } from './QRCodeGenerator';
import { AIPhoneAgent } from './AIPhoneAgent';
import { TelegramIntegration } from './TelegramIntegration';
import { BusinessHours } from './BusinessHours';
import { SubscriptionManager } from '../subscription/SubscriptionManager';
import { useBusiness } from '../../hooks/useBusiness';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const { hasAccess, loading: subscriptionLoading, refreshSubscription } = useSubscription(user);
  const { currentBusiness, loading: businessLoading } = useBusiness();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Handle subscription success redirect
useEffect(() => {
  const handleSubscriptionSuccess = async () => {
    if (searchParams.get('subscription') === 'success') {
      console.log('Subscription success detected! Refreshing subscription status...');
      
      // Refresh subscription status with a small delay to allow webhook to process
      setTimeout(async () => {
        await refreshSubscription();
        
        if (hasAccess) {
          console.log('Subscription access granted!');
          // Remove query parameters
          searchParams.delete('subscription');
          setSearchParams(searchParams);
        } else {
          console.log('Subscription not found yet, will retry...');
          // The hook will automatically retry
        }
      }, 3000); // 3 second delay to allow webhook to process
    }
  };

  handleSubscriptionSuccess();
}, [searchParams, setSearchParams, refreshSubscription, hasAccess]);

  // Show loading while checking subscription
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Проверяване на абонамент...</p>
        </div>
      </div>
    );
  }

  // Show error if any
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show subscription required if no access
  if (!hasAccess) {
    console.log('No subscription found for user - showing SubscriptionRequired');
    return <SubscriptionRequired />;
  }

  // Show business setup if no business exists
  if (!businessLoading && !currentBusiness) {
    console.log('No business - showing BusinessSetup');
    return (
      <DashboardLayout activeTab="setup" onTabChange={setActiveTab}>
        <BusinessSetup />
      </DashboardLayout>
    );
  }

  const renderContent = () => {
    try {
      console.log('Rendering content for tab:', activeTab);
      switch (activeTab) {
        case 'overview':
          return <Overview onTabChange={setActiveTab} />;
        case 'reservations':
          return <ReservationManagement />;
        case 'customers':
          return <CustomerManagement />;
        case 'messages':
          return <Messages />;
        case 'analytics':
          return <Analytics />;
        case 'services':
          return <ServiceManagement />;
        case 'qr-code':
          return <QRCodeGenerator />;
        case 'ai-phone':
          return <AIPhoneAgent />;
        case 'telegram':
          return <TelegramIntegration />;
        case 'hours':
          return <BusinessHours />;
        case 'subscription':
          return <SubscriptionManager />;
        case 'settings':
          return <BusinessSetup />;
        default:
          return <Overview onTabChange={setActiveTab} />;
      }
    } catch (err) {
      console.error('Error rendering content:', err);
      setError(`Error rendering ${activeTab}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800">Error</h3>
          <p className="text-red-600">Failed to load ${activeTab}. Please try refreshing the page.</p>
        </div>
      );
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}