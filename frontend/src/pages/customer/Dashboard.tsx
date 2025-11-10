import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Heart, Package, TrendingUp, Phone } from 'lucide-react';
import { api } from '../../api/dummyApi';

interface Order {
  id: string;
  farmer: {
    name: string;
    phoneNumber?: string;
  };
  farmerPhoneNumber?: string;
  status: string;
  items: any[];
  totalAmount: number;
}

export function CustomerDashboard() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        const orders = await api.getOrders(user.id);
        setRecentOrders(orders.slice(0, 3)); // last 3 orders
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      case 'packed': return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30';
      case 'accepted': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30';
    }
  };

  // ✅ Extract unique farmers from orders
  const uniqueFarmers = Array.from(
    new Map(
      recentOrders
        .filter(order => order.farmerPhoneNumber || order.farmer.phoneNumber) // Only include farmers with phone numbers
        .map(order => [order.farmerPhoneNumber || order.farmer.phoneNumber, {
          ...order.farmer,
          phoneNumber: order.farmerPhoneNumber || order.farmer.phoneNumber
        }]) // group by phone
    ).values()
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Discover fresh products from local farmers
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div key="total-orders" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentOrders.length}</p>
              </div>
            </div>
          </div>

          <div key="saved-farmers" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Farmers Contacted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueFarmers.length}</p>
              </div>
            </div>
          </div>

          <div key="this-month" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{recentOrders.reduce((total, order) => total + order.totalAmount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
                  <Link
                    to="/customer/orders"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                  >
                    View All
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order: Order, index: number) => (
                      <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Order #{index + 1}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              From {order.farmer.name}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {order.items.length} item(s)
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ₹{order.totalAmount}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                  </div>
                  
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
                    <Link
                      to="/customer/browse"
                      className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Farmers List */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Farmers from Your Orders</h3>
              <div className="space-y-3">
                {uniqueFarmers.length > 0 ? (
                  uniqueFarmers.map((farmer, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {farmer.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{farmer.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{farmer.phoneNumber}</p>
                        </div>
                      </div>
                      {/* WhatsApp button */}
                      <a
                        href={`https://wa.me/${farmer.phoneNumber}?text=Hi ${farmer.name}, I ordered from you recently via AgriConnect. Could you please confirm the delivery details?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700"
                      >
                        <Phone className="h-5 w-5" />
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No farmers yet. Place an order to see them here.
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/customer/browse"
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
