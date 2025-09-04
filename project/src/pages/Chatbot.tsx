import React, { useState } from 'react';
import { 
  Send, 
  Mic, 
  Globe, 
  Bot,
  User,
  MapPin,
  Phone,
  AlertTriangle
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your emergency assistance chatbot. How can I help you today? I can provide information about shelters, emergency contacts, disaster updates, and safety guidelines.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const languages = [
    { code: 'english', name: 'English', flag: '🇺🇸' },
    { code: 'hindi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'tamil', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'bengali', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'telugu', name: 'తెలుగు', flag: '🇮🇳' }
  ];

  const quickActions = [
    { text: 'Find nearest shelter', icon: MapPin },
    { text: 'Emergency helpline numbers', icon: Phone },
    { text: 'Current disaster alerts', icon: AlertTriangle },
    { text: 'Safety guidelines', icon: Bot }
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getBotResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('shelter')) {
      return 'Based on your location, the nearest emergency shelters are:\n\n1. Government School, Sector 15 (2.3 km)\n2. Community Center, Main Road (3.1 km)\n3. District Collectorate (4.5 km)\n\nAll shelters have food, water, and medical facilities available.';
    } else if (lowerInput.includes('helpline') || lowerInput.includes('phone')) {
      return 'Emergency Helpline Numbers:\n\n🚨 National Emergency: 108\n🚒 Fire Service: 101\n👮 Police: 100\n🏥 Medical Emergency: 102\n\n📞 NDRF Helpline: 011-26701728\n📞 Disaster Management: 1078';
    } else if (lowerInput.includes('alert') || lowerInput.includes('disaster')) {
      return 'Current Active Alerts:\n\n🌊 Flood Warning - Kerala (High)\n🌪️ Cyclone Watch - Odisha (High)\n🔥 Heat Wave - Rajasthan (Medium)\n\nStay indoors and follow official instructions. Emergency teams are deployed.';
    } else if (lowerInput.includes('safety')) {
      return 'General Safety Guidelines:\n\n✅ Keep emergency kit ready\n✅ Stay informed through official channels\n✅ Follow evacuation orders immediately\n✅ Keep important documents safe\n✅ Maintain emergency contact list\n\nWould you like specific safety tips for a particular disaster type?';
    } else {
      return 'I understand you need assistance. I can help you with:\n\n• Finding nearest shelters and safe zones\n• Emergency contact numbers\n• Current disaster alerts and updates\n• Safety guidelines and procedures\n• Evacuation routes and transportation\n\nPlease let me know what specific information you need, or use the quick action buttons below.';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Emergency Assistance Chatbot</h1>
              <p className="text-gray-600">AI-powered multilingual emergency support</p>
            </div>
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`p-2 rounded-full ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    setInputMessage(action.text);
                    handleSendMessage();
                  }}
                  className="flex items-center space-x-2 p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Icon className="h-3 w-3" />
                  <span>{action.text}</span>
                </button>
              );
            })}
          </div>

          {/* Message Input */}
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
              <Mic className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message... (Available in multiple languages)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Chatbot Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-blue-900 mb-1">Multilingual Support</h4>
            <p className="text-sm text-blue-700">Available in 22+ Indian languages</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Mic className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-green-900 mb-1">Voice Recognition</h4>
            <p className="text-sm text-green-700">Speak your queries naturally</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Bot className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h4 className="font-medium text-orange-900 mb-1">Smart Responses</h4>
            <p className="text-sm text-orange-700">Context-aware emergency guidance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;