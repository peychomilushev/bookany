import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  BarChart3, 
  Settings, 
  Users, 
  MessageSquare, 
  Home,
  Menu,
  X,
  LogOut,
  QrCode,
  Phone,
  Send,
  Clock,
  CreditCard,
  Globe
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { id: 'overview', name: 'dashboard.overview', icon: Home },
  { id: 'reservations', name: 'dashboard.reservations', icon: Calendar },
  { id: 'services', name: 'dashboard.services', icon: Users },
  { id: 'customers', name: 'dashboard.customers', icon: Users },
  { id: 'messages', name: 'dashboard.messages', icon: MessageSquare },
  { id: 'analytics', name: 'dashboard.analytics', icon: BarChart3 },
  { id: 'qr-code', name: 'dashboard.qrCode', icon: QrCode },
  { id: 'ai-phone', name: 'dashboard.aiPhone', icon: Phone },
  { id: 'telegram', name: 'dashboard.telegram', icon: Send },
  { id: 'hours', name: 'dashboard.businessHours', icon: Clock },
  { id: 'subscription', name: 'subscription.title', icon: CreditCard },
  { id: 'settings', name: 'dashboard.settings', icon: Settings },
];

export function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'bg' ? 'en' : 'bg';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calendar className="text-white" size={20} />
            </div>
            <span className="text-lg font-bold text-gray-900">BookAny</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center px-6 py-3 text-left transition-colors
                ${activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon size={20} className="mr-3" />
              {t(item.name)}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-3"
          >
            <Globe size={20} className="mr-3" />
            {i18n.language === 'bg' ? 'English' : 'Български'}
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            {t('auth.signOut')}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 capitalize">
              {t(navigation.find(n => n.id === activeTab)?.name || 'dashboard.overview')}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}