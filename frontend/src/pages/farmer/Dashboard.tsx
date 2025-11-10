import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { translations } from '../../i18n/translations';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Plus,
  Eye,
  Edit
} from 'lucide-react';
import { WeatherCard } from '../../components/WeatherCard';
import { api } from '../../api/dummyApi';

export function FarmerDashboard() {
  const { user } = useAuth();
  const { language } = useTheme();
  const [recentOrders, setRecentOrders] = useState([]);
  const [myProducts, setMyProducts] = useState([]);

  const t = (key: string, params?: Record<string, any>) => {
    let text = (translations[language] as any)[key] || key;
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      });
    }
    return text;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        const orders = await api.getOrders('farmer');
        setRecentOrders(orders.slice(0, 3));
      }
    };
    fetchOrders();
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (user) {
        const products = await api.getProducts();
        const farmerProducts = products.filter((p: any) => p.farmer._id === user.id);
        setMyProducts(farmerProducts);
      }
    };
    fetchProducts();
  }, [user]);

  const totalEarnings = recentOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
  const pendingOrders = recentOrders.filter((order: any) => order.status !== 'delivered').length;
  const uniqueCustomerIds = Array.from(new Set(recentOrders.map((order: any) => order.customerId)));
  const activeCustomers = uniqueCustomerIds.length;



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('welcome_back', { name: user?.name })}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('manage_farm_products')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('total_products')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{myProducts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <ShoppingCart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('pending_orders')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('this_month')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalEarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('active_customers')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCustomers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('recent_orders')}</h2>
                  <Link
                    to="/farmer/orders"
                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium transition-colors duration-200"
                  >
                    {t('view_all')}
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order: any) => (
                      <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {t('order_number', { id: recentOrders.indexOf(order) + 1 })}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t('from_customer', { customerName: order.customerName })}
                            </p>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            {order.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t('items_count', { count: order.items.length })}
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
                    <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">{t('no_orders_yet')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('quick_actions')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/farmer/add-product"
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <Plus className="h-5 w-5" />
                  <span>{t('add_product')}</span>
                </Link>

                <Link
                  to="/farmer/listings"
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Eye className="h-5 w-5" />
                  <span>{t('view_listings')}</span>
                </Link>

                <Link
                  to="/farmer/orders"
                  className="flex items-center justify-center space-x-2 bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors duration-200"
                >
                  <Package className="h-5 w-5" />
                  <span>{t('manage_orders')}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Weather Card */}
          <div className="lg:col-span-1">
            <WeatherCard pincode={user?.pincode || '110001'} />
          </div>
        </div>
      </div>
    </div>
  );
}