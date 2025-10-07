import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';

const stats = [
  {
    name: 'Total Reservations',
    value: '124',
    change: '+12%',
    changeType: 'positive',
    icon: Calendar,
    color: 'bg-blue-500'
  },
  {
    name: 'Revenue This Month',
    value: '$3,249',
    change: '+8.5%',
    changeType: 'positive',
    icon: DollarSign,
    color: 'bg-green-500'
  },
  {
    name: 'Active Customers',
    value: '89',
    change: '+15%',
    changeType: 'positive',
    icon: Users,
    color: 'bg-purple-500'
  },
  {
    name: 'Conversion Rate',
    value: '68%',
    change: '-2.1%',
    changeType: 'negative',
    icon: TrendingUp,
    color: 'bg-orange-500'
  }
];

const recentReservations = [
  {
    id: '1',
    customer: 'Sarah Johnson',
    service: 'Hair Cut & Style',
    date: '2025-01-28',
    time: '10:00 AM',
    status: 'confirmed'
  },
  {
    id: '2',
    customer: 'Michael Chen',
    service: 'Personal Training',
    date: '2025-01-28',
    time: '2:00 PM',
    status: 'pending'
  },
  {
    id: '3',
    customer: 'Emily Rodriguez',
    service: 'Dinner Reservation',
    date: '2025-01-29',
    time: '7:30 PM',
    status: 'confirmed'
  },
  {
    id: '4',
    customer: 'David Park',
    service: 'Legal Consultation',
    date: '2025-01-30',
    time: '11:00 AM',
    status: 'cancelled'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <CheckCircle size={16} className="text-green-500" />;
    case 'pending':
      return <Clock size={16} className="text-yellow-500" />;
    case 'cancelled':
      return <XCircle size={16} className="text-red-500" />;
    default:
      return <AlertCircle size={16} className="text-gray-500" />;
  }
};

interface OverviewProps {
  onTabChange: (tab: string) => void;
}

export function Overview({ onTabChange }: OverviewProps) {
  const { t } = useTranslation();
  const { currentBusiness, reservations, services } = useBusiness();

  // Calculate real stats from data
  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
  const pendingReservations = reservations.filter(r => r.status === 'pending').length;
  const totalRevenue = reservations
    .filter(r => r.status === 'confirmed' || r.status === 'completed')
    .reduce((sum, r) => {
      const service = services.find(s => s.id === r.service_id);
      return sum + (service?.price || 0);
    }, 0);

  const updatedStats = [
    {
      name: 'Total Reservations',
      value: totalReservations.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      name: 'Revenue This Month',
      value: `$${totalRevenue.toFixed(0)}`,
      change: '+8.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      name: 'Confirmed Bookings',
      value: confirmedReservations.toString(),
      change: '+15%',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'bg-purple-500'
    },
    {
      name: 'Pending Bookings',
      value: pendingReservations.toString(),
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: Clock,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white p-6">
        <h2 className="text-2xl font-bold mb-2">
          {t('dashboard.welcome')}{currentBusiness ? `, ${currentBusiness.name}!` : '!'}
        </h2>
        <p className="text-blue-100">
          {t('dashboard.welcomeMessage')}
        </p>
      </div>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {updatedStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Reservations</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {reservations.slice(0, 4).map((reservation) => (
            <div key={reservation.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {reservation.customer_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {reservation.customer_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {services.find(s => s.id === reservation.service_id)?.name || 'Service'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(reservation.reservation_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">{reservation.reservation_time}</p>
                </div>
                <div className="ml-4 flex items-center">
                  {getStatusIcon(reservation.status)}
                  <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                    {reservation.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {reservations.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No reservations yet. Start by adding your services!</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => onTabChange('reservations')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Calendar size={24} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('reservations.newReservation')}</h3>
          <p className="text-sm text-gray-600">Създайте нова резервация за вашите клиенти</p>
        </button>

        <button 
          onClick={() => onTabChange('services')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Users size={24} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('services.title')}</h3>
          <p className="text-sm text-gray-600">Добавете или редактирайте вашите услуги</p>
        </button>

        <button 
          onClick={() => onTabChange('analytics')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp size={24} className="text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.analytics')}</h3>
          <p className="text-sm text-gray-600">Проверете ефективността на бизнеса си</p>
        </button>
      </div>
    </div>
  );
}