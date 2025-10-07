import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, Plus, Filter, Search, CreditCard as Edit3 } from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
};

const statusIcons = {
  pending: AlertCircle,
  confirmed: CheckCircle,
  cancelled: XCircle,
  completed: CheckCircle
};

export function ReservationManagement() {
  const { t } = useTranslation();
  const { reservations, services, updateReservation, createReservation } = useBusiness();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [editingReservation, setEditingReservation] = useState<string | null>(null);

  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = selectedStatus === 'all' || reservation.status === selectedStatus;
    const matchesSearch = reservation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    await updateReservation(reservationId, { status: newStatus as any });
  };

  const getServiceName = (serviceId: string | null) => {
    if (!serviceId) return 'General Reservation';
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Unknown Service';
  };

  return (
    <>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('reservations.title')}</h2>
          <p className="text-gray-600">Управлявайте всички резервации на клиентите си</p>
        </div>
        <button
          onClick={() => setShowNewReservation(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>{t('reservations.newReservation')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Търсене на резервации..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Всички статуси</option>
              <option value="pending">{t('reservations.pending')}</option>
              <option value="confirmed">{t('reservations.confirmed')}</option>
              <option value="cancelled">{t('reservations.cancelled')}</option>
              <option value="completed">{t('reservations.completed')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {filteredReservations.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Няма намерени резервации</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Опитайте да промените филтрите' 
                : 'Започнете като създадете първата си резервация'
              }
            </p>
            <button
              onClick={() => setShowNewReservation(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Създай резервация
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReservations.map((reservation) => {
              const StatusIcon = statusIcons[reservation.status];
              return (
                <div key={reservation.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {reservation.customer_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {getServiceName(reservation.service_id)}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar size={16} />
                              <span>{new Date(reservation.reservation_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock size={16} />
                              <span>{reservation.reservation_time}</span>
                            </div>
                            {reservation.customer_phone && (
                              <div className="flex items-center space-x-1">
                                <Phone size={16} />
                                <span>{reservation.customer_phone}</span>
                              </div>
                            )}
                            {reservation.customer_email && (
                              <div className="flex items-center space-x-1">
                                <Mail size={16} />
                                <span>{reservation.customer_email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[reservation.status]}`}>
                        <StatusIcon size={12} className="mr-1" />
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <select
                          value={reservation.status}
                          onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                         <option value="pending">{t('reservations.pending')}</option>
                         <option value="confirmed">{t('reservations.confirmed')}</option>
                         <option value="cancelled">{t('reservations.cancelled')}</option>
                         <option value="completed">{t('reservations.completed')}</option>
                        </select>
                        <button
                          onClick={() => setEditingReservation(reservation.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {reservation.notes && (
                    <div className="mt-3 ml-16">
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <strong>{t('reservations.notes')}:</strong> {reservation.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Reservation Modal */}
      {showNewReservation && (
        <NewReservationModal
          onClose={() => setShowNewReservation(false)}
          services={services}
          onSubmit={createReservation}
          t={t}
        />
      )}
    </div>

      {/* Edit Reservation Modal */}
      {editingReservation && (
        <EditReservationModal
          reservationId={editingReservation}
          onClose={() => setEditingReservation(null)}
          services={services}
          reservations={reservations}
          onSubmit={updateReservation}
          t={t}
        />
      )}
    </>
  );
}

function NewReservationModal({ onClose, services, onSubmit, t }: any) {
  const { currentBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_id: '',
    reservation_date: '',
    reservation_time: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        business_id: currentBusiness.id,
        service_id: formData.service_id || null,
        status: 'pending'
      });
      onClose();
    } catch (error) {
      console.error('Error creating reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{t('reservations.newReservation')}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservations.customerName')} *</label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('business.phone')}</label>
            <input
              type="tel"
              value={formData.customer_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('business.email')}</label>
            <input
              type="email"
              value={formData.customer_email}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservations.service')}</label>
            <select
              value={formData.service_id}
              onChange={(e) => setFormData(prev => ({ ...prev, service_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Обща резервация</option>
              {services.map((service: any) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.price}лв
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservations.date')} *</label>
              <input
                type="date"
                value={formData.reservation_date}
                onChange={(e) => setFormData(prev => ({ ...prev, reservation_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservations.time')} *</label>
              <input
                type="time"
                value={formData.reservation_time}
                onChange={(e) => setFormData(prev => ({ ...prev, reservation_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservations.notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Специални заявки или бележки..."
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Създава се...' : 'Създай резервация'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditReservationModal({ reservationId, onClose, services, reservations, onSubmit, t }: any) {
  const reservation = reservations.find((r: any) => r.id === reservationId);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: reservation?.customer_name || '',
    customer_phone: reservation?.customer_phone || '',
    customer_email: reservation?.customer_email || '',
    service_id: reservation?.service_id || '',
    reservation_date: reservation?.reservation_date || '',
    reservation_time: reservation?.reservation_time || '',
    notes: reservation?.notes || '',
    status: reservation?.status || 'pending'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(reservationId, formData);
      onClose();
    } catch (error) {
      console.error('Error updating reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!reservation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Редактирай резервация</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservations.customerName')} *</label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('business.phone')}</label>
            <input
              type="tel"
              value={formData.customer_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('business.email')}</label>
            <input
              type="email"
              value={formData.customer_email}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservations.service')}</label>
            <select
              value={formData.service_id}
              onChange={(e) => setFormData(prev => ({ ...prev, service_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Обща резервация</option>
              {services.map((service: any) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.price}лв
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservations.status')}</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">{t('reservations.pending')}</option>
              <option value="confirmed">{t('reservations.confirmed')}</option>
              <option value="cancelled">{t('reservations.cancelled')}</option>
              <option value="completed">{t('reservations.completed')}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservations.date')} *</label>
              <input
                type="date"
                value={formData.reservation_date}
                onChange={(e) => setFormData(prev => ({ ...prev, reservation_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservations.time')} *</label>
              <input
                type="time"
                value={formData.reservation_time}
                onChange={(e) => setFormData(prev => ({ ...prev, reservation_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservations.notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Специални заявки или бележки..."
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Актуализира се...' : 'Актуализирай резервация'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}