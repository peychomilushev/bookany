import React, { useState } from 'react';
import { Building2, Palette, Clock, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';

const businessTypes = [
  'Beauty & Wellness',
  'Fitness & Health',
  'Restaurant',
  'Medical & Healthcare',
  'Professional Services',
  'Education & Training',
  'Automotive',
  'Home Services',
  'Entertainment',
  'Other'
];

const themeColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export function BusinessSetup() {
  const { businesses, currentBusiness, createBusiness, updateBusiness } = useBusiness();
  const [isEditing, setIsEditing] = useState(!currentBusiness);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: currentBusiness?.name || '',
    type: currentBusiness?.type || '',
    description: currentBusiness?.description || '',
    phone: currentBusiness?.phone || '',
    email: currentBusiness?.email || '',
    address: currentBusiness?.address || '',
    theme_color: currentBusiness?.theme_color || '#3B82F6',
    timezone: currentBusiness?.timezone || 'UTC',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentBusiness) {
        const { error } = await updateBusiness(currentBusiness.id, formData);
        if (error) throw new Error(error);
      } else {
        const { error } = await createBusiness(formData);
        if (error) throw new Error(error);
      }
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving business:', error);
      alert('Error saving business: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isEditing && currentBusiness) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Информация за бизнеса</h2>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Редактирай бизнеса
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Име на бизнеса</label>
                <p className="text-gray-900 font-medium">{currentBusiness.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип бизнес</label>
                <p className="text-gray-900">{currentBusiness.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <p className="text-gray-900">{currentBusiness.phone || 'Не е предоставен'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имейл</label>
                <p className="text-gray-900">{currentBusiness.email || 'Не е предоставен'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Цвят на темата</label>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: currentBusiness.theme_color }}
                  />
                  <span className="text-gray-900">{currentBusiness.theme_color}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Часова зона</label>
                <p className="text-gray-900">{currentBusiness.timezone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                <p className="text-gray-900">{currentBusiness.address || 'Не е предоставен'}</p>
              </div>
            </div>
          </div>

          {currentBusiness.description && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <p className="text-gray-900">{currentBusiness.description}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentBusiness ? 'Редактирай бизнеса' : 'Настройте вашия бизнес'}
          </h2>
          <p className="text-gray-600">
            {currentBusiness 
              ? 'Актуализирайте информацията и брандинга на вашия бизнес.'
              : 'Нека настроим вашия бизнес в BookAny. Тази информация ще се използва за страницата за резервации и комуникацията с клиентите.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 size={16} className="inline mr-1" />
                Име на бизнеса *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Въведете името на вашия бизнес"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип бизнес *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Изберете тип бизнес</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-1" />
                Телефонен номер
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+359 88 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-1" />
                Имейл адрес
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="biznes@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-1" />
              Адрес на бизнеса
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ул. Бизнес 123, София 1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-1" />
              Описание на бизнеса
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Опишете вашия бизнес и услуги..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette size={16} className="inline mr-1" />
              Цвят на темата
            </label>
            <div className="flex flex-wrap gap-3">
              {themeColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange('theme_color', color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    formData.theme_color === color
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              Часова зона
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="UTC">UTC</option>
              <option value="Europe/Sofia">София (EET)</option>
              <option value="Europe/London">Лондон (GMT)</option>
              <option value="Europe/Paris">Париж (CET)</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Запазва се...' : currentBusiness ? 'Актуализирай бизнеса' : 'Създай бизнес'}
            </button>
            {currentBusiness && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Отказ
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}