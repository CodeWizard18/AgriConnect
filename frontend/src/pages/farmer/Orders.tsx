import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Package,
  MapPin,
  Phone,
  CreditCard,
  Smartphone,
  Search
} from 'lucide-react';
import { api } from '../../api/dummyApi';
import { translations } from '../../i18n/translations';
import toast from 'react-hot-toast';

export function FarmerOrders() {
  const { user } = useAuth();
  const { language } = useTheme();
  const t = translations[language];

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
      name?: string;
    } | null;
    phoneNumber?: string;   // ✅ phone comes directly here
    farmer: {
      name: string;
    };
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

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const data = await api.getOrders('farmer');
          console.log("Fetched Orders:", data);
          setOrders(data);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchOrders();
  }, [user]);

  // WhatsApp message
  const generateWhatsAppMessage = (order: Order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    let message = `Hello ${order.customer?.name || order.customerName || 'Customer'},%0A%0A` +
      `I am contacting you regarding your order placed on ${date}.%0AOrder details:%0A`;
    order.items.forEach(item => {
      if (item.product) {
        message += `- ${item.product.name}: ${item.quantity} ${item.unit} × ₹${item.price}%0A`;
      }
    });
    const deliveryAddress = order.orderType === 'phone'
      ? (order as any).customerAddress || order.address
      : order.address;
    message += `%0ATotal Amount: ₹${order.totalAmount}%0A` +
      `Address: ${deliveryAddress}%0A%0APlease confirm the order status.%0AThank you!`;
    return message;
  };

  const generateWhatsAppLink = (order: Order) => {
    const baseUrl = 'https://wa.me/';
    const phoneNumber = order.phoneNumber || order.customerPhone || (order as any).customerPhone || ''; // ✅ use correct field
    return `${baseUrl}${phoneNumber}?text=${generateWhatsAppMessage(order)}`;
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(current =>
        current.map(order =>
          order._id === orderId ? { ...order, status: newStatus as Order['status'] } : order
        )
      );
      toast.success('Order status updated successfully!');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30';
      case 'packed': return 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30';
      case 'delivered': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30';
    }
  };

  if (loading) {
    return <div className="p-6">Loading orders...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {t.customer_orders}
        </h1>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-3 border rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="packed">Packed</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders */}
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{t.order_number.replace('{{id}}', (filteredOrders.indexOf(order) + 1).toString())}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {t.from_customer}: {order.customer?.name || order.customerName || 'Phone Customer'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.phone}: {order.phoneNumber || order.customerPhone || (order as any).customerPhone || 'N/A'} {/* ✅ show correct phone */}
                    </p>
                  </div>

                  <div className="text-right">
                    <label htmlFor={`status-select-${order._id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t.update_status}
                    </label>
                    <select
                      id={`status-select-${order._id}`}
                      value={order.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value as 'pending' | 'packed' | 'delivered';
                        await updateOrderStatus(order._id, newStatus);
                      }}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="packed">Packed</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Items */}
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{t.order_items}</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        item.product ? (
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
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">Product Deleted</p>
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
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{t.delivery_information}</h4>
                    <div className="space-y-3">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                              <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">{t.delivery_address}</p>
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
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{t.payment}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {order.paymentMode === 'COD' ? 'Cash on Delivery' : 'UPI Payment'}
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
                              <p className="font-medium text-gray-900 dark:text-white text-sm">{t.order_image}</p>
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
                {(order.phoneNumber || order.customerPhone || (order as any).customerPhone) ? (
                  <a
                    href={generateWhatsAppLink(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    {t.contact_customer_whatsapp}
                  </a>
                ) : (
                  <span className="text-gray-500">No phone number available</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div>{t.no_orders_yet}</div>
        )}
      </div>
    </div>
  );
}
