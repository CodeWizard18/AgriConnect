import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Phone, 
  CreditCard, 
  Smartphone,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { api } from '../../api/dummyApi';

interface OrderItem {
  product: {
    _id: string;
    name: string;
  };
  quantity: number;
  price: number;
  unit: string;
}

interface Order {
  _id: string;
  customer?: {
    name: string;
  };
  farmer: {
    name: string;
  };
  farmerPhoneNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'packed' | 'delivered';
  createdAt: string;
  address: string;
  paymentMode: 'COD' | 'UPI' | 'CARD';
  orderType?: 'regular' | 'phone';
  orderImage?: string;
  customerName?: string;
  customerPhone?: string;
}

export function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const data = await api.getOrders('customer');
          setOrders(data);
          setFilteredOrders(data);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [user]);

  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.product && item.product.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          color: 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30',
          icon: Clock
        };
      case 'packed':
        return {
          label: 'Packed',
          color: 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30',
          icon: Package
        };
      case 'delivered':
        return {
          label: 'Delivered',
          color: 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30',
          icon: CheckCircle
        };
      default:
        return {
          label: 'Unknown',
          color: 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30',
          icon: Clock
        };
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending': return 33;
      case 'packed': return 66;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your orders and view purchase history
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, farmers, or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="packed">Packed</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              // Generate WhatsApp message text
              const generateWhatsAppMessage = (order: Order) => {
                const date = formatDate(order.createdAt);
                let message = `Hello ${order.farmer.name},%0A%0AI would like to confirm my order placed on ${date}.%0AOrder details:%0A`;
                order.items.forEach(item => {
                  if (item.product) {
                    message += `- ${item.product.name}: ${item.quantity} ${item.unit} × ₹${item.price}%0A`;
                  }
                });
                const deliveryAddress = order.orderType === 'phone'
                  ? (order as any).customerAddress || order.address
                  : order.address;
                message += `%0ATotal Amount: ₹${order.totalAmount}%0ADelivery Address: ${deliveryAddress}%0A%0APlease confirm the delivery date.%0AThank you!`;
                return message;
              };

              // Generate WhatsApp URL
              const generateWhatsAppLink = (order: Order) => {
                const baseUrl = 'https://wa.me/';
                const phoneNumber = order.farmerPhoneNumber || (order as any).farmerPhone;
                const message = generateWhatsAppMessage(order);
                return `${baseUrl}${phoneNumber}?text=${message}`;
              };

              return (
                <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Order #{filteredOrders.indexOf(order) + 1}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            From {order.farmer.name}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          ₹{order.totalAmount}
                        </p>
                        <div className="flex items-center mt-1">
                          {order.paymentMode === 'COD' ? (
                            <CreditCard className="h-4 w-4 mr-1 text-gray-500" />
                          ) : (
                            <Smartphone className="h-4 w-4 mr-1 text-gray-500" />
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {order.paymentMode}
                          </span>
                        </div>
                      </div>
                    </div>



                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${getProgressPercentage(order.status)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Pending</span>
                        <span>Packed</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Order Items */}
                      <div className="lg:col-span-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Order Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            item.product && (
                              <div key={item.product._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                                    <Package className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {item.quantity} {item.unit} × ₹{item.price}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  ₹{item.quantity * item.price}
                                </span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                      {/* Delivery Information */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Delivery Information</h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">Delivery Address</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {order.address || (order as any).customerAddress || 'Address not available'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-2">
                              {order.paymentMode === 'COD' ? (
                                <CreditCard className="h-5 w-5 text-gray-500" />
                              ) : (
                                <Smartphone className="h-5 w-5 text-gray-500" />
                              )}
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">Payment</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {order.paymentMode === 'COD' ? 'Cash on Delivery' : 'UPI Payment'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">Customer</p>
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                  {order.customer?.name || order.customerName || 'Phone Customer'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Order Image for Phone Orders */}
                          {order.orderType === 'phone' && order.orderImage && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <Package className="h-5 w-5 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">Order Image</p>
                                  <img
                                    src={`http://localhost:5000/uploads/${order.orderImage}`}
                                    alt="Order"
                                    className="mt-2 max-w-full h-32 object-cover rounded-md cursor-pointer"
                                    onClick={() => window.open(`http://localhost:5000/uploads/${order.orderImage}`, '_blank')}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Button */}
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <a
                      href={generateWhatsAppLink(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Contact Farmer on WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm || statusFilter ? 'No matching orders found' : 'No orders yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter 
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Start shopping for fresh products from local farmers to see your orders here.'
                }
              </p>
              {!searchTerm && !statusFilter && (
                <button
                  onClick={() => window.location.href = '/customer/browse'}
                  className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Start Shopping
                </button>
              )}
            </div>
          </div>
        )}


        {/* Order Statistics */}
        {orders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {orders.filter(o => o.status !== 'delivered').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{orders.reduce((total, order) => total + order.totalAmount, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}