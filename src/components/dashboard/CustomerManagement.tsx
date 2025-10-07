import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  MessageSquare,
  Filter,
  UserPlus
} from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';

export function CustomerManagement() {
  const { reservations, services } = useBusiness();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Extract unique customers from reservations
  const customers = useMemo(() => {
    const customerMap = new Map();
    
    reservations.forEach(reservation => {
      const key = reservation.customer_email || reservation.customer_phone || reservation.customer_name;
      
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name: reservation.customer_name,
          email: reservation.customer_email,
          phone: reservation.customer_phone,
          reservations: [],
          totalSpent: 0,
          lastVisit: reservation.reservation_date
        });
      }
      
      const customer = customerMap.get(key);
      customer.reservations.push(reservation);
      
      // Calculate total spent
      const service = services.find(s => s.id === reservation.service_id);
      if (service && (reservation.status === 'confirmed' || reservation.status === 'completed')) {
        customer.totalSpent += service.price;
      }
      
      // Update last visit
      if (new Date(reservation.reservation_date) > new Date(customer.lastVisit)) {
        customer.lastVisit = reservation.reservation_date;
      }
    });
    
    return Array.from(customerMap.values());
  }, [reservations, services]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'spent':
        return b.totalSpent - a.totalSpent;
      case 'visits':
        return b.reservations.length - a.reservations.length;
      case 'recent':
      default:
        return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{customers.length} customers</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Recent Activity</option>
              <option value="name">Name A-Z</option>
              <option value="spent">Total Spent</option>
              <option value="visits">Most Visits</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Repeat Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {customers.filter(c => c.reservations.length > 1).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserPlus size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg. Spent</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${customers.length > 0 ? (customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toFixed(0) : '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {customers.filter(c => 
                  new Date(c.lastVisit).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {sortedCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search' : 'Customers will appear here after their first reservation'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedCustomers.map((customer) => (
              <div key={customer.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-blue-600">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{customer.name}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        {customer.email && (
                          <div className="flex items-center space-x-1">
                            <Mail size={14} />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone size={14} />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{customer.reservations.length}</p>
                        <p className="text-gray-500">Visits</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">${customer.totalSpent.toFixed(0)}</p>
                        <p className="text-gray-500">Spent</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">
                          {new Date(customer.lastVisit).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500">Last Visit</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recent reservations */}
                <div className="mt-4 ml-16">
                  <p className="text-sm font-medium text-gray-700 mb-2">Recent Reservations:</p>
                  <div className="space-y-1">
                    {customer.reservations.slice(0, 3).map((reservation) => {
                      const service = services.find(s => s.id === reservation.service_id);
                      return (
                        <div key={reservation.id} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
                          <span>{service?.name || 'General Reservation'}</span>
                          <span>{new Date(reservation.reservation_date).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            reservation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reservation.status}
                          </span>
                        </div>
                      );
                    })}
                    {customer.reservations.length > 3 && (
                      <p className="text-xs text-gray-500 px-3">
                        +{customer.reservations.length - 3} more reservations
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}