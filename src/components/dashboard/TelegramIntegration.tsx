import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Settings, 
  Copy, 
  Check,
  Bot,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';

interface TelegramMessage {
  id: string;
  customer_name: string;
  message: string;
  response: string;
  booking_created: boolean;
  created_at: string;
}

export function TelegramIntegration() {
  const { currentBusiness } = useBusiness();
  const [botToken, setBotToken] = useState('1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
  const [botUsername, setBotUsername] = useState('BookAnyBot');
  const [isConnected, setIsConnected] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<TelegramMessage[]>([]);

  // Mock messages for demonstration
  useEffect(() => {
    const mockMessages: TelegramMessage[] = [
      {
        id: '1',
        customer_name: 'Мария Петрова',
        message: 'Здравейте! Бих искала да си запиша час за подстригване утре следобед',
        response: 'Здравейте, Мария! Мога да ви помогна да запишете час. Имаме свободни часове утре в 14:00, 15:30 или 16:00. Кой час ви устройва?',
        booking_created: true,
        created_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: '2',
        customer_name: 'Георги Иванов',
        message: 'Какви са цените ви за персонални тренировки?',
        response: 'Нашите персонални тренировки са 75лв за 60 минути или 45лв за 30 минути. Предлагаме и пакетни оферти! Бихте ли искали да запишете тренировка?',
        booking_created: false,
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        customer_name: 'Елена Димитрова',
        message: 'Мога ли да преместя часа си от петък на събота?',
        response: 'Разбира се! Мога да ви помогна да промените часа. Нека проверя наличността ни за събота. Имаме свободни часове в 10:00, 13:00 и 15:00. Кой предпочитате?',
        booking_created: false,
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    setMessages(mockMessages);
  }, []);

  useEffect(() => {
    if (currentBusiness) {
      const baseUrl = window.location.origin;
      setWebhookUrl(`${baseUrl}/api/telegram/webhook/${currentBusiness.id}`);
    }
  }, [currentBusiness]);

  const handleConnectBot = () => {
    if (!botToken || !botUsername) {
      alert('Моля въведете и токен, и потребителско име на бота');
      return;
    }
    
    // Real implementation would validate and configure the bot
    setIsConnected(true);
    alert('Telegram ботът е свързан успешно!');
  };

  const handleDisconnectBot = () => {
    setIsConnected(false);
    setBotToken('');
    setBotUsername('');
    alert('Telegram ботът е изключен');
  };

  const handleCopyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy webhook URL:', error);
    }
  };

  const stats = {
    totalMessages: messages.length,
    bookingsCreated: messages.filter(m => m.booking_created).length,
    responseRate: messages.length > 0 ? 100 : 0, // Assuming all messages get responses
    avgResponseTime: '< 1 min'
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Telegram Integration</h2>
        <p className="text-gray-600">Connect your Telegram bot for automated booking via messages</p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isConnected ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Bot size={24} className={isConnected ? 'text-blue-600' : 'text-gray-400'} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bot Status</h3>
              <p className="text-sm text-gray-600">
                {isConnected ? `Connected as @${botUsername}` : 'Not connected'}
              </p>
            </div>
          </div>
          {isConnected && (
            <button
              onClick={handleDisconnectBot}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>

        {!isConnected ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">Как да настроите вашия Telegram бот:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Пишете на @BotFather в Telegram</li>
                <li>Изпратете /newbot и следвайте инструкциите</li>
                <li>Копирайте токена и потребителското име на бота</li>
                <li>Поставете ги по-долу и натиснете Свържи</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Токен на бота
                </label>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Потребителско име на бота
                </label>
                <input
                  type="text"
                  value={botUsername}
                  onChange={(e) => setBotUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your_bot_name"
                />
              </div>
            </div>

            <button
              onClick={handleConnectBot}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Свържи бота
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare size={16} className="text-green-600" />
                <span className="font-medium text-green-800">Ботът е активен</span>
              </div>
              <p className="text-green-700">
                Клиентите вече могат да пишат на @{botUsername} за резервации
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL (за разширена настройка)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={handleCopyWebhook}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span className="text-sm">{copied ? 'Копирано!' : 'Копирай'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Общо съобщения</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalMessages}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Създадени резервации</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.bookingsCreated}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Процент отговори</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.responseRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Средно време отговор</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgResponseTime}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Messages */}
      {isConnected && messages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Последни Telegram съобщения</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <div key={message.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {message.customer_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{message.customer_name}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                      {message.booking_created && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Резервация създадена
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          <strong>Клиент:</strong> {message.message}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          <strong>Бот:</strong> {message.response}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bot Commands Setup */}
      {isConnected && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Команди на бота</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-3">
              Настройте тези команди в @BotFather за по-добро потребителско изживяване:
            </p>
            <div className="space-y-2 text-sm font-mono text-gray-800">
              <div>/start - Започни процеса на резервация</div>
              <div>/book - Направи нова резервация</div>
              <div>/services - Виж наличните услуги</div>
              <div>/hours - Провери работното време</div>
              <div>/contact - Вземи контактна информация</div>
              <div>/help - Получи помощ и инструкции</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}