import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  Settings, 
  Mic, 
  MicOff,
  Play,
  Pause,
  Volume2,
  Brain,
  MessageSquare
} from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';

interface CallLog {
  id: string;
  caller_number: string;
  duration: number;
  status: 'completed' | 'missed' | 'booking_made';
  transcript: string;
  booking_created: boolean;
  created_at: string;
}

export function AIPhoneAgent() {
  const { currentBusiness } = useBusiness();
  const [isEnabled, setIsEnabled] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('+359 2 123 4567');
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [aiSettings, setAiSettings] = useState({
    greeting: "Здравейте! Благодарим, че се обадихте в {business_name}. Аз съм вашият AI асистент. Как мога да ви помогна да направите резервация днес?",
    businessHours: "Работим от понеделник до петък, от 9:00 до 18:00 часа, и в събота от 10:00 до 16:00 часа.",
    bookingConfirmation: "Отлично! Записах ви час за {date} в {time}. Ще получите потвърждение скоро.",
    voiceType: 'female',
    language: 'bg-BG'
  });

  // Mock call logs for demonstration
  useEffect(() => {
    const mockLogs: CallLog[] = [
      {
        id: '1',
        caller_number: '+359 88 123 4567',
        duration: 180,
        status: 'booking_made',
        transcript: "Клиентът се обади за резервация за подстригване. Записан за утре в 14:00.",
        booking_created: true,
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        caller_number: '+359 87 654 3210',
        duration: 45,
        status: 'completed',
        transcript: "Клиентът попита за услуги и цени. Предоставена информация за наличните процедури.",
        booking_created: false,
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: '3',
        caller_number: '+359 89 987 6543',
        duration: 0,
        status: 'missed',
        transcript: "Обаждането не беше отговорено от AI агента.",
        booking_created: false,
        created_at: new Date(Date.now() - 10800000).toISOString()
      }
    ];
    setCallLogs(mockLogs);
  }, []);

  const handleToggleAI = () => {
    if (isEnabled) {
      if (confirm('Сигурни ли сте, че искате да изключите AI телефонния агент?')) {
        setIsEnabled(false);
        // Real implementation would disable the AI service
      }
    } else {
      setIsEnabled(true);
      // Real implementation would enable the AI service
    }
  };

  const handleSaveSettings = () => {
    // Real implementation would save to backend
    console.log('Saving AI settings:', aiSettings);
    alert('AI настройките са запазени успешно!');
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booking_made':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI Phone Agent</h2>
        <p className="text-gray-600">Automated phone booking with AI-powered conversation</p>
      </div>

      {/* AI Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isEnabled ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Brain size={24} className={isEnabled ? 'text-green-600' : 'text-gray-400'} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Agent Status</h3>
              <p className="text-sm text-gray-600">
                {isEnabled ? 'Active and ready to take calls' : 'Currently disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleAI}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isEnabled
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isEnabled ? 'Disable AI' : 'Enable AI'}
          </button>
        </div>

        {isEnabled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Phone size={16} className="text-green-600" />
              <span className="font-medium text-green-800">AI Телефонен номер</span>
            </div>
            <p className="text-green-700 font-mono text-lg">{phoneNumber}</p>
            <p className="text-sm text-green-600 mt-1">
              Клиентите могат да се обаждат на този номер 24/7 за резервации
            </p>
          </div>
        )}
      </div>

      {/* AI Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Конфигурация</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поздравително съобщение
            </label>
            <textarea
              value={aiSettings.greeting}
              onChange={(e) => setAiSettings(prev => ({ ...prev, greeting: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Въведете поздравителното съобщение за вашия AI агент..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Използвайте {'{business_name}'} за автоматично вмъкване на името на бизнеса
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Информация за работното време
            </label>
            <textarea
              value={aiSettings.businessHours}
              onChange={(e) => setAiSettings(prev => ({ ...prev, businessHours: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип глас
              </label>
              <select
                value={aiSettings.voiceType}
                onChange={(e) => setAiSettings(prev => ({ ...prev, voiceType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="female">Женски глас</option>
                <option value="male">Мъжки глас</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Език
              </label>
              <select
                value={aiSettings.language}
                onChange={(e) => setAiSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bg-BG">Български</option>
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Запази конфигурацията
          </button>
        </div>
      </div>

      {/* Call Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Calls</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{callLogs.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <PhoneCall size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Bookings Made</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {callLogs.filter(log => log.booking_created).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {callLogs.length > 0 
                  ? Math.round((callLogs.filter(log => log.booking_created).length / callLogs.length) * 100)
                  : 0
                }%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {callLogs.length > 0 
                  ? formatDuration(Math.round(callLogs.reduce((sum, log) => sum + log.duration, 0) / callLogs.length))
                  : '0:00'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Volume2 size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Call Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Call Logs</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {callLogs.map((log) => (
            <div key={log.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Phone size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{log.caller_number}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{log.transcript}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Duration: {formatDuration(log.duration)}</span>
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                    {log.booking_created && (
                      <span className="text-green-600 font-medium">✓ Booking Created</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}