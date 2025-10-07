import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Phone, Send, User, Clock, CheckCircle, Eye, Calendar, Plus } from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';

const channelIcons = {
  phone: Phone,
  telegram: MessageSquare,
  web: MessageSquare,
  email: MessageSquare
};

const statusColors = {
  unread: 'bg-red-100 text-red-800',
  read: 'bg-yellow-100 text-yellow-800',
  replied: 'bg-green-100 text-green-800'
};

export function Messages() {
  const { t } = useTranslation();
  const { messages, updateMessage, createReservation, services } = useBusiness();
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReservationModal, setShowReservationModal] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredMessages = messages.filter(message => 
    filterStatus === 'all' || message.status === filterStatus
  );

  const handleReply = async (messageId: string) => {
    if (!replyText.trim()) return;
    
    try {
      await updateMessage(messageId, { status: 'replied' });
      // Here you would typically send the reply through the appropriate channel
      console.log('Reply sent:', replyText);
      setReplyText('');
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await updateMessage(messageId, { status: 'read' });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleCreateReservation = async (messageId: string, reservationData: any) => {
    try {
      await createReservation(reservationData);
      await updateMessage(messageId, { status: 'replied' });
      setShowReservationModal(null);
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('messages.title')}</h2>
          <p className="text-gray-600">{t('messages.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t('messages.allStatuses')}</option>
            <option value="unread">{t('messages.unread')}</option>
            <option value="read">{t('messages.read')}</option>
            <option value="replied">{t('messages.replied')}</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('messages.noMessages')}</h3>
            <p className="text-gray-500">{t('messages.noMessagesDesc')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => {
              const ChannelIcon = channelIcons[message.channel];
              return (
                <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {message.customer_name}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <ChannelIcon size={14} />
                            <span>{message.customer_contact}</span>
                            <Clock size={14} />
                            <span>{new Date(message.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-13">
                        <p className="text-gray-700 mb-3">{message.content}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[message.status]}`}>
                            {t(`messages.${message.status}`)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {message.status === 'unread' && (
                        <button
                          onClick={() => handleMarkAsRead(message.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title={t('messages.markAsRead')}
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedMessage(message.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title={t('messages.reply')}
                      >
                        <Send size={16} />
                      </button>
                      <button
                        onClick={() => setShowReservationModal(message.id)}
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                        title={t('messages.createReservation')}
                      >
                        <Calendar size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Reply Interface */}
                  {selectedMessage === message.id && (
                    <div className="mt-4 ml-13 p-4 bg-gray-50 rounded-lg">
                      <div className="flex space-x-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={t('messages.replyPlaceholder')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleReply(message.id)}
                            disabled={!replyText.trim()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send size={16} />
                          </button>
                          <button
                            onClick={() => setSelectedMessage(null)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            {t('common.cancel')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Reservation Modal */}
      {showReservationModal && (
        <QuickReservationModal
          messageId={showReservationModal}
          message={messages.find(m => m.id === showReservationModal)}
          services={services}
          onClose={() => setShowReservationModal(null)}
          onSubmit={handleCreateReservation}
          t={t}
        />
      )}
    </div>
  );
}

function QuickReservationModal({ messageId, message, services, onClose, onSubmit, t }: any) {
  const { currentBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: message?.customer_name || '',
    customer_phone: message?.customer_contact || '',
    customer_email: '',
    service_id: '',
    reservation_date: '',
    reservation_time: '',
    notes: `${t('messages.createdFromMessage')}: ${message?.content || ''}`
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;

    setLoading(true);
    try {
      await onSubmit(messageId, {
        ...formData,
        business_id: currentBusiness.id,
        service_id: formData.service_id || null,
        status: 'pending'
      });
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
          <h3 className="text-xl font-bold text-gray-900">{t('messages.createReservation')}</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservations.service')}</label>
            <select
              value={formData.service_id}
              onChange={(e) => setFormData(prev => ({ ...prev, service_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('reservations.generalReservation')}</option>
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
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {loading ? t('common.creating') : t('reservations.createReservation')}
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