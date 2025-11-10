import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Package, ShoppingCart, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { api } from '../../api/dummyApi';

export function Analytics() {
  const [analyticsData, setAnalyticsData] = useState({
    salesData: [] as any[],
    monthlyGrowth: [] as any[],
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    avgOrderValue: 0,
    ordersGrowth: 0,
    revenueGrowth: 0,
    usersGrowth: 0,
    avgGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getAnalyticsData();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const salesData = analyticsData.salesData;
  const monthlyGrowth = analyticsData.monthlyGrowth;
  const maxRevenue = monthlyGrowth.length > 0 ? Math.max(...monthlyGrowth.map(m => m.revenue)) : 0;
  const maxOrders = monthlyGrowth.length > 0 ? Math.max(...monthlyGrowth.map(m => m.orders)) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Insights and trends for the AgriConnect marketplace
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalOrders.toLocaleString()}</p>
                <p className={`text-sm ${analyticsData.ordersGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analyticsData.ordersGrowth >= 0 ? '+' : ''}{analyticsData.ordersGrowth}% from last month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{analyticsData.totalRevenue.toLocaleString()}</p>
                <p className={`text-sm ${analyticsData.revenueGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analyticsData.revenueGrowth >= 0 ? '+' : ''}{analyticsData.revenueGrowth}% from last month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalUsers.toLocaleString()}</p>
                <p className={`text-sm ${analyticsData.usersGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analyticsData.usersGrowth >= 0 ? '+' : ''}{analyticsData.usersGrowth}% from last month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{analyticsData.avgOrderValue.toFixed(0)}</p>
                <p className={`text-sm ${analyticsData.avgGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analyticsData.avgGrowth >= 0 ? '+' : ''}{analyticsData.avgGrowth}% from last month
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Growth Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
              Monthly Growth
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Orders</h4>
                <div className="space-y-3">
                  {monthlyGrowth.map((data) => (
                    <div key={data.month} className="flex items-center space-x-4">
                      <span className="w-8 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {data.month}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
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

              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Revenue (₹)</h4>
                <div className="space-y-3">
                  {monthlyGrowth.map((data) => (
                    <div key={data.month} className="flex items-center space-x-4">
                      <span className="w-8 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {data.month}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                        ></div>
                      </div>
                      <span className="w-16 text-sm font-semibold text-gray-900 dark:text-white text-right">
                        ₹{(data.revenue / 1000).toFixed(0)}k
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sales by Category */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Package className="h-5 w-5 mr-2 text-orange-600" />
              Sales by Category
            </h3>
            
            <div className="space-y-4">
              {salesData.map((category, index) => (
                <div key={category.category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ₹{category.sales.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        index === 1 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                        index === 2 ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                        index === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gradient-to-r from-gray-400 to-gray-600'
                      }`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {category.percentage}% of total sales
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Health */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Platform Health Indicators
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">System Status</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">Healthy</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Growth Rate</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">+15%</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">User Satisfaction</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">4.8/5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
