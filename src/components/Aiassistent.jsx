import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minimize2, Maximize2, Sparkles, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "";

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'assistant', 
      content: '👋 Hi! I\'m your AI shopping assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Clean text function to remove markdown
  const cleanText = (text) => {
    if (!text) return text;
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
      .replace(/__(.*?)__/g, '$1')     // Remove __underline__
      .replace(/_(.*?)_/g, '$1')       // Remove _italic_
      .replace(/`(.*?)`/g, '$1')       // Remove `code`
      .replace(/#{1,6}\s?(.*)/g, '$1') // Remove # headings
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove [text](url)
      .replace(/\*/g, '')               // Remove any remaining *
      .replace(/_/g, '')                // Remove any remaining _
      .replace(/`/g, '')                 // Remove any remaining `
      .trim();
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get last 5 messages for context
      const recentHistory = messages.slice(-5);

      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          history: recentHistory
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Clean the AI response before adding to messages
        const cleanedResponse = cleanText(data.response);
        
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          role: 'assistant',
          content: cleanedResponse,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Get product recommendations
  const getRecommendations = async (query) => {
    setIsTyping(true);
    try {
      const response = await fetch(`${API_URL}/api/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.success) {
        // Clean the recommendations response
        const cleanedRecommendations = cleanText(data.recommendations);
        
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          role: 'assistant',
          content: cleanedRecommendations,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Recommendations error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // Quick FAQ questions
  const faqQuestions = [
    { text: 'Return policy', query: 'What is your return policy?' },
    { text: 'Shipping time', query: 'How long does shipping take?' },
    { text: 'Track order', query: 'How do I track my order?' },
    { text: 'Discounts', query: 'Any current discounts?' },
    { text: 'Size guide', query: 'How do I find my size?' },
  ];

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        id: 1, 
        role: 'assistant', 
        content: '👋 Hi! I\'m your AI shopping assistant. How can I help you today?',
        timestamp: new Date()
      }
    ]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 group bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-50 animate-bounce"
        aria-label="Open AI Assistant"
      >
        <Bot size={28} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
          1
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-96 transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[600px]'}`}>
      {/* Chat Container */}
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-full border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                NammaCart AI Assistant
                <Sparkles size={14} className="text-yellow-300" />
              </h3>
              {/* <p className="text-xs text-white/80">Powered by Cohere AI</p> */}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
              aria-label={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Quick FAQ Buttons */}
            <div className="px-4 py-2 bg-gray-50 border-b flex flex-wrap gap-2">
              {faqQuestions.map((faq, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(faq.query)}
                  className="text-xs bg-white px-3 py-1 rounded-full border border-gray-300 hover:border-purple-500 hover:text-purple-600 transition-colors"
                >
                  {faq.text}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none'
                        : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  {isTyping ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={clearChat}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear chat
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => getRecommendations('trending products')}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Trending
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => getRecommendations('summer collection')}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Summer picks
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
