import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MessageSquare,
  CheckCircle,
  Star,
  MapPin,
  Globe
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BusinessBookingPageProps {
  businessId: string;
}

interface Business {
  id: string;
  name: string;
  type: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  theme_color: string;
  logo_url?: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  is_active: boolean;
}

interface BusinessHours {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_open: boolean;
}

export function BusinessBookingPage({ businessId }: BusinessBookingPageProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    partySize: 1,
    specialRequests: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchBusinessData();
  }, [businessId]);

  const fetchBusinessData = async () => {
    try {
      // Fetch business info
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (businessError) throw businessError;
      setBusiness(businessData);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch business hours
      const { data: hoursData, error: hoursError } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessId)
        .order('day_of_week', { ascending: true });

      if (hoursError) throw hoursError;
      setBusinessHours(hoursData || []);

    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !customerInfo.name) {
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reservations')
        .insert([{
          business_id: businessId,
          service_id: selectedService?.id || null,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone || null,
          customer_email: customerInfo.email || null,
          party_size: business.type === 'Restaurant' || business.type === 'Entertainment' ? customerInfo.partySize : null,
          special_requests: customerInfo.specialRequests || null,
          reservation_date: selectedDate,
          reservation_time: selectedTime,
          notes: customerInfo.notes || null,
          status: 'pending'
        }]);

      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Error creating reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          business_id: businessId,
          customer_name: customerInfo.name || 'Анонимен клиент',
          customer_contact: customerInfo.phone || customerInfo.email || 'Няма контакт',
          channel: 'web',
          content: contactMessage,
          status: 'unread'
        }]);

      if (error) throw error;
      
      setContactMessage('');
      setShowContactForm(false);
      alert('Съобщението е изпратено успешно!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Грешка при изпращане на съобщението.');
    } finally {
      setSendingMessage(false);
    }
  };

  const generateTimeSlots = () => {
  const slots: string[] = [];
  if (!selectedDate) return slots;

  const selected = new Date(selectedDate);
  // Align JS day (0–6, Sunday first) to your DB day (1–7, Monday first)
  const jsDay = selected.getDay(); // Sunday = 0
  const dayOfWeek = jsDay === 0 ? 7 : jsDay; // convert to 1–7

  const hours = businessHours.find(h => h.day_of_week === dayOfWeek);
  if (!hours || !hours.is_open) return slots;

  const [openHour, openMinute] = hours.open_time.split(':').map(Number);
  const [closeHour, closeMinute] = hours.close_time.split(':').map(Number);

  const serviceDuration = selectedService?.duration || 60;
  const slotInterval = 30;

  for (let hour = openHour; hour < closeHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotInterval) {
      const endTime = hour * 60 + minute + serviceDuration;
      const closeTime = closeHour * 60 + closeMinute;
      if (endTime > closeTime) break;

      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }

  return slots;
};


  const getDayName = (dayIndex: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <p className="text-gray-600">The business you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Your reservation has been submitted successfully. You'll receive a confirmation shortly.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Booking Details</h3>
            <p className="text-sm text-gray-600">Service: {selectedService?.name}</p>
            <p className="text-sm text-gray-600">Date: {new Date(selectedDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Time: {selectedTime}</p>
            <p className="text-sm text-gray-600">Customer: {customerInfo.name}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="bg-gradient-to-r text-white py-12"
        style={{ 
          backgroundColor: business.theme_color,
          backgroundImage: `linear-gradient(135deg, ${business.theme_color} 0%, ${business.theme_color}dd 100%)`
        }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            {business.logo_url && (
              <img 
                src={business.logo_url} 
                alt={business.name}
                className="w-16 h-16 rounded-full mx-auto mb-4 bg-white p-2"
              />
            )}
            <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
            <p className="text-lg opacity-90 mb-4">{business.type}</p>
            {business.description && (
              <p className="text-base opacity-80 max-w-2xl mx-auto">{business.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {services.length > 0 ? 'Изберете услуга' : 'Обща резервация'}
                  </label>
                  {services.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedService?.id === service.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{service.name}</h3>
                              {service.description && (
                                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock size={14} />
                                  <span>{service.duration} min</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">{service.price}лв</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <p className="text-gray-600">Ще направим обща резервация за вас</p>
                    </div>
                  )}
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Изберете дата *
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Изберете час *
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {generateTimeSlots().map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 text-sm border rounded-lg transition-all ${
                            selectedTime === time
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Party Size for Restaurants/Entertainment */}
                {selectedTime && (business.type === 'Restaurant' || business.type === 'Entertainment') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Брой хора *
                    </label>
                    <select
                      value={customerInfo.partySize}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, partySize: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {[...Array(20)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i === 0 ? 'човек' : 'души'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Customer Information */}
                {selectedTime && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Вашата информация</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Пълно име *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Въведете вашето име"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Телефонен номер
                        </label>
                        <input
                          type="tel"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+359 88 123 4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Имейл адрес
                        </label>
                        <input
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Специални заявки
                      </label>
                      <textarea
                        value={customerInfo.specialRequests}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, specialRequests: e.target.value }))}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Алергии, диетични ограничения, специални нужди..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Допълнителни бележки
                      </label>
                      <textarea
                        value={customerInfo.notes}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Допълнителна информация или коментари..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {submitting ? 'Резервира се...' : 'Направи резервация'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Business Info Sidebar */}
          <div className="space-y-6">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Свържете се с нас</h3>
              {!showContactForm ? (
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageSquare size={20} />
                  <span>Изпрати съобщение</span>
                </button>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Вашето име
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Въведете вашето име"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Съобщение
                    </label>
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Напишете вашето съобщение..."
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={sendingMessage}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {sendingMessage ? 'Изпраща се...' : 'Изпрати'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Отказ
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Контактна информация</h3>
              <div className="space-y-3">
                {business.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone size={18} className="text-gray-400" />
                    <span className="text-gray-700">{business.phone}</span>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center space-x-3">
                    <Mail size={18} className="text-gray-400" />
                    <span className="text-gray-700">{business.email}</span>
                  </div>
                )}
                {business.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin size={18} className="text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{business.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Business Hours */}
            {businessHours.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Работно време</h3>
                <div className="space-y-2">
                  {businessHours.map((hours) => (
                    <div key={hours.day_of_week} className="flex justify-between items-center">
                      <span className="text-gray-700">{getDayName(hours.day_of_week)}</span>
                      <span className="text-gray-600">
                        {hours.is_open 
                          ? `${hours.open_time} - ${hours.close_time}`
                          : 'Затворено'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative Booking Methods */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Други начини за резервация</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Phone size={16} />
                  <span>Обадете се директно</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <MessageSquare size={16} />
                  <span>Пишете ни в Telegram</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Globe size={16} />
                  <span>Сканирайте QR код</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}