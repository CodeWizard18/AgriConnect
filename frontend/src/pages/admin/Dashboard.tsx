import React, { useEffect, useState } from 'react';
import { Users, Package, ShoppingCart, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { api, dummyFarmers, dummyProducts, dummyOrders } from '../../api/dummyApi';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalCustomers: 0,
    totalAdmins: 0,
    activeProducts: 0,
    weeklyOrders: 0,
    totalRevenue: 0,
    pendingModeration: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ day: string; orders: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activityData, weeklyDataRes] = await Promise.all([
          api.getAdminStats(),
          api.getRecentActivity(),
          api.getWeeklyOrders()
        ]);
        setStats(statsData);
        setRecentActivity(activityData);
        setWeeklyData(weeklyDataRes);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set default values on error
        setStats({
          totalFarmers: 0,
          totalCustomers: 0,
          totalAdmins: 0,
          activeProducts: 0,
          weeklyOrders: 0,
          totalRevenue: 0,
          pendingModeration: 0
        });
        setRecentActivity([]);
        setWeeklyData([
          { day: 'Mon', orders: 0 },
          { day: 'Tue', orders: 0 },
          { day: 'Wed', orders: 0 },
          { day: 'Thu', orders: 0 },
          { day: 'Fri', orders: 0 },
          { day: 'Sat', orders: 0 },
          { day: 'Sun', orders: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const maxOrders = weeklyData.length > 0 ? Math.max(...weeklyData.map(d => d.orders)) : 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor platform activity and manage the marketplace
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Farmers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.totalFarmers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.activeProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <ShoppingCart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.weeklyOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Moderation</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.pendingModeration}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : `₹${stats.totalRevenue.toLocaleString()}`}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Orders Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Weekly Orders</h3>
            <div className="space-y-4">
              {weeklyData.map((data) => (
                <div key={data.day} className="flex items-center space-x-4">
                  <span className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {data.day}
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(data.orders / maxOrders) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-12 text-sm font-semibold text-gray-900 dark:text-white text-right">
                    {data.orders}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'order' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    activity.type === 'farmer' ? 'bg-green-100 dark:bg-green-900/30' :
                    'bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    {activity.type === 'order' ? (
                      <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : activity.type === 'farmer' ? (
                      <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}