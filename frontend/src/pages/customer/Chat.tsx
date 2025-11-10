import React, { useState } from 'react';
import { ChatWidget } from '../../components/ChatWidget';
import { dummyFarmers } from '../../api/dummyApi';
import { MessageCircle, Search, Users } from 'lucide-react';

export function CustomerChat() {
  const [selectedFarmer, setSelectedFarmer] = useState(dummyFarmers[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFarmers = dummyFarmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Chat with Farmers
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect directly with farmers to discuss products and orders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Farmers List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search farmers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  {filteredFarmers.map((farmer) => (
                    <button
                      key={farmer.id}
                      onClick={() => setSelectedFarmer(farmer)}
                      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                        selectedFarmer.id === farmer.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {farmer.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {farmer.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {farmer.location}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {selectedFarmer ? (
              <ChatWidget
                recipientId={selectedFarmer.id}
                recipientName={selectedFarmer.name}
                recipientRole="farmer"
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-96 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Select a farmer to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}