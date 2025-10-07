import React, { useState, useEffect } from 'react';
import { Clock, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';
import { supabase } from '../../lib/supabase';

interface BusinessHour {
  id?: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_open: boolean;
}

const DAYS = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export function BusinessHours() {
  const { currentBusiness } = useBusiness();
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentBusiness) {
      fetchBusinessHours();
    }
  }, [currentBusiness]);

  const fetchBusinessHours = async () => {
    if (!currentBusiness) return;

    try {
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .order('day_of_week', { ascending: true });

      if (error) throw error;

      // Initialize with default hours if none exist
      if (!data || data.length === 0) {
        const defaultHours = DAYS.map((_, index) => ({
          day_of_week: index,
          open_time: '09:00',
          close_time: '17:00',
          is_open: index >= 1 && index <= 5 // Monday to Friday open by default
        }));
        setHours(defaultHours);
      } else {
        setHours(data);
      }
    } catch (error) {
      console.error('Error fetching business hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayIndex: number) => {
    setHours(prev => prev.map(hour => 
      hour.day_of_week === dayIndex 
        ? { ...hour, is_open: !hour.is_open }
        : hour
    ));
  };

  const handleTimeChange = (dayIndex: number, field: 'open_time' | 'close_time', value: string) => {
    setHours(prev => prev.map(hour => 
      hour.day_of_week === dayIndex 
        ? { ...hour, [field]: value }
        : hour
    ));
  };

  const handleSave = async () => {
    if (!currentBusiness) return;

    setSaving(true);
    try {
      // Delete existing hours
      await supabase
        .from('business_hours')
        .delete()
        .eq('business_id', currentBusiness.id);

      // Insert new hours
      const hoursToInsert = hours.map(hour => ({
        business_id: currentBusiness.id,
        day_of_week: hour.day_of_week,
        open_time: hour.open_time,
        close_time: hour.close_time,
        is_open: hour.is_open
      }));

      const { error } = await supabase
        .from('business_hours')
        .insert(hoursToInsert);

      if (error) throw error;

      alert('Business hours saved successfully!');
    } catch (error) {
      console.error('Error saving business hours:', error);
      alert('Error saving business hours. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Business Hours</h2>
        <p className="text-gray-600">Set your operating hours for each day of the week</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {hours.map((hour) => (
            <div key={hour.day_of_week} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-24">
                <span className="font-medium text-gray-900">{DAYS[hour.day_of_week]}</span>
              </div>
              
              <button
                onClick={() => handleToggleDay(hour.day_of_week)}
                className="flex items-center"
              >
                {hour.is_open ? (
                  <ToggleRight size={24} className="text-green-500" />
                ) : (
                  <ToggleLeft size={24} className="text-gray-400" />
                )}
              </button>

              {hour.is_open ? (
                <div className="flex items-center space-x-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Open:</label>
                    <input
                      type="time"
                      value={hour.open_time}
                      onChange={(e) => handleTimeChange(hour.day_of_week, 'open_time', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Close:</label>
                    <input
                      type="time"
                      value={hour.close_time}
                      onChange={(e) => handleTimeChange(hour.day_of_week, 'close_time', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <span className="text-gray-500 italic">Closed</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save size={20} />
            <span>{saving ? 'Saving...' : 'Save Hours'}</span>
          </button>
        </div>
      </div>

      {/* Quick Setup Templates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Setup</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              const businessHours = hours.map(hour => ({
                ...hour,
                is_open: hour.day_of_week >= 1 && hour.day_of_week <= 5,
                open_time: '09:00',
                close_time: '17:00'
              }));
              setHours(businessHours);
            }}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
          >
            <h4 className="font-medium text-gray-900 mb-1">Standard Business</h4>
            <p className="text-sm text-gray-600">Mon-Fri, 9 AM - 5 PM</p>
          </button>

          <button
            onClick={() => {
              const retailHours = hours.map(hour => ({
                ...hour,
                is_open: hour.day_of_week >= 1 && hour.day_of_week <= 6,
                open_time: hour.day_of_week === 0 ? '12:00' : '10:00',
                close_time: hour.day_of_week === 6 ? '18:00' : '20:00'
              }));
              setHours(retailHours);
            }}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
          >
            <h4 className="font-medium text-gray-900 mb-1">Retail Store</h4>
            <p className="text-sm text-gray-600">Mon-Sat, 10 AM - 8 PM</p>
          </button>

          <button
            onClick={() => {
              const restaurantHours = hours.map(hour => ({
                ...hour,
                is_open: true,
                open_time: '11:00',
                close_time: '22:00'
              }));
              setHours(restaurantHours);
            }}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
          >
            <h4 className="font-medium text-gray-900 mb-1">Restaurant</h4>
            <p className="text-sm text-gray-600">Daily, 11 AM - 10 PM</p>
          </button>
        </div>
      </div>
    </div>
  );
}