import React, { useState } from 'react';
import { ChatWidget } from '../../components/ChatWidget';
import { Search, MessageCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { translations } from '../../i18n/translations';

const dummyCustomers = [
  { id: '2', name: 'Priya Sharma', location: 'Gurgaon, Haryana' },
  { id: '4', name: 'Amit Patel', location: 'Faridabad, Haryana' },
  { id: '5', name: 'Neha Singh', location: 'Noida, UP' }
];

export function FarmerChat() {
  const [selectedCustomer, setSelectedCustomer] = useState(dummyCustomers[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const { language } = useTheme();
  const t = translations[language];

  const filteredCustomers = dummyCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t.customer_messages}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.communicate_orders_products}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Customers List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t.search_customers}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                        selectedCustomer.id === customer.id
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {customer.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {customer.location}
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
            {selectedCustomer ? (
              <ChatWidget
                recipientId={selectedCustomer.id}
                recipientName={selectedCustomer.name}
                recipientRole="customer"
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-96 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">{t.select_customer_chat}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}