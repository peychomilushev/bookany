import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Users,
  Clock,
  Target,
  Award
} from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';

export function Analytics() {
  const { reservations, services } = useBusiness();

  const analytics = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Filter reservations by month
    const thisMonthReservations = reservations.filter(r => {
      const date = new Date(r.reservation_date);
      return date >= thisMonth && date <= thisMonthEnd;
    });

    const lastMonthReservations = reservations.filter(r => {
      const date = new Date(r.reservation_date);
      return date >= lastMonth && date < thisMonth;
    });

    // Calculate revenue
    const calculateRevenue = (reservationList: any[]) => {
      return reservationList
        .filter(r => r.status === 'confirmed' || r.status === 'completed')
        .reduce((sum, r) => {
          const service = services.find(s => s.id === r.service_id);
          return sum + (service?.price || 0);
        }, 0);
    };

    const thisMonthRevenue = calculateRevenue(thisMonthReservations);
    const lastMonthRevenue = calculateRevenue(lastMonthReservations);

    // Calculate growth rates
    const reservationGrowth = lastMonthReservations.length > 0 
      ? ((thisMonthReservations.length - lastMonthReservations.length) / lastMonthReservations.length) * 100
      : thisMonthReservations.length > 0 ? 100 : 0;

    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0 ? 100 : 0;

    // Status breakdown
    const statusBreakdown = reservations.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Service popularity
    const serviceStats = services.map(service => {
      const serviceReservations = reservations.filter(r => r.service_id === service.id);
      const revenue = serviceReservations
        .filter(r => r.status === 'confirmed' || r.status === 'completed')
        .length * service.price;
      
      return {
        ...service,
        bookings: serviceReservations.length,
        revenue
      };
    }).sort((a, b) => b.bookings - a.bookings);

    // Daily stats for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyStats = last7Days.map(date => {
      const dayReservations = reservations.filter(r => r.reservation_date === date);
      return {
        date,
        reservations: dayReservations.length,
        revenue: calculateRevenue(dayReservations)
      };
    });

    return {
      thisMonthReservations: thisMonthReservations.length,
      lastMonthReservations: lastMonthReservations.length,
      thisMonthRevenue,
      lastMonthRevenue,
      reservationGrowth,
      revenueGrowth,
      statusBreakdown,
      serviceStats,
      dailyStats,
      totalCustomers: new Set(reservations.map(r => r.customer_email || r.customer_phone || r.customer_name)).size,
      averageBookingValue: thisMonthRevenue / (thisMonthReservations.filter(r => r.status === 'confirmed' || r.status === 'completed').length || 1)
    };
  }, [reservations, services]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <p className="text-gray-600">Track your business performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">This Month Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${analytics.thisMonthRevenue.toFixed(0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${
              analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.revenueGrowth >= 0 ? '+' : ''}{analytics.revenueGrowth.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">This Month Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analytics.thisMonthReservations}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${
              analytics.reservationGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.reservationGrowth >= 0 ? '+' : ''}{analytics.reservationGrowth.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analytics.totalCustomers}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-blue-600">
              {Math.round((analytics.totalCustomers / reservations.length) * 100)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">repeat customers</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg. Booking Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${analytics.averageBookingValue.toFixed(0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-gray-600">
              Per reservation
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Last 7 Days Activity</h3>
          <div className="space-y-3">
            {analytics.dailyStats.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">
                    {day.reservations} bookings
                  </span>
                  <span className="text-sm text-gray-600">
                    ${day.revenue.toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
          <div className="space-y-4">
            {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
              const percentage = (count / reservations.length) * 100;
              const colors = {
                pending: 'bg-yellow-500',
                confirmed: 'bg-green-500',
                cancelled: 'bg-red-500',
                completed: 'bg-blue-500'
              };
              
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors[status as keyof typeof colors]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Service Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Performance</h3>
        {analytics.serviceStats.length === 0 ? (
          <div className="text-center py-8">
            <Award size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No services data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Service</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Bookings</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Avg. Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.serviceStats.map((service) => (
                  <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-500">{service.duration} min</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{service.bookings}</td>
                    <td className="py-3 px-4 text-gray-900">${service.revenue.toFixed(0)}</td>
                    <td className="py-3 px-4 text-gray-900">${service.price.toFixed(0)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}