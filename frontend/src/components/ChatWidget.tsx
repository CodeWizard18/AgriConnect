import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, MessageCircle } from 'lucide-react';
import { api } from '../api/dummyApi';
import { useAuth } from '../context/AuthContext';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
  };
  recipient: {
    _id: string;
    name: string;
  };
  message: string;
  read: boolean;
  createdAt: string;
}

interface ChatWidgetProps {
  recipientId: string;
  recipientName: string;
  recipientRole: 'farmer' | 'customer';
}

export function ChatWidget({ recipientId, recipientName, recipientRole }: ChatWidgetProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<number>();

  // Fetch messages on component mount and set up polling
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await api.getMessages(recipientId);
        setMessages(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    };

    fetchMessages();

    // Mark messages as read when opening chat
    api.markMessagesAsRead(recipientId).catch(console.error);

    // Set up polling for new messages every 3 seconds
    pollingRef.current = setInterval(fetchMessages, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [recipientId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const sentMessage = await api.sendMessage(recipientId, newMessage);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col h-96">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {recipientName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{recipientName}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{recipientRole}</span>
          </div>
        </div>
        <button className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors duration-200">
          <Phone className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Start a conversation with {recipientName}</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender._id === user?.id;
            const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={message._id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <span className="text-xs opacity-75 mt-1 block">{timestamp}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}