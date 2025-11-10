import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../api/dummyApi';

export function Cart() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    address: '',
    pincode: '',
    phoneNumber: '',
    paymentMode: 'COD'
  });

  const handleCheckout = async () => {
    if (!checkoutData.address || !checkoutData.pincode || !checkoutData.phoneNumber) {
      toast.error('Please fill all delivery details');
      return;
    }

    setIsCheckingOut(true);

    try {
      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          product: item.productId || item.id, // Fix: ensure product field is set
          quantity: item.quantity,
          price: item.price,
          unit: item.unit
        })),
        address: checkoutData.address,
        phoneNumber: checkoutData.phoneNumber,   // ✅ add this
        paymentMode: checkoutData.paymentMode,
        totalAmount: getTotalPrice() + 20
      };

      // Call API to create order
      await api.createOrder(orderData);

      toast.success('Order placed successfully!');
      clearCart();
      navigate('/customer/orders');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error('Order creation error:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Discover fresh products from local farmers
            </p>
            <button
              onClick={() => navigate('/customer/browse')}
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      item.image
                        ? item.image.startsWith('http')
                          ? item.image.trim()
                          : item.image.startsWith('/uploads/')
                            ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.image.trim()}`
                            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${item.image.trim()}`
                        : 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=400'
                    }
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }}
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">From {item.farmerName}</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                      ₹{item.price}/{item.unit}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    
                    <span className="text-lg font-semibold text-gray-900 dark:text-white w-12 text-center">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{item.price * item.quantity}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mt-2 transition-colors duration-200"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Section */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{getTotalPrice()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹20</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">₹{getTotalPrice() + 20}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    rows={3}
                    value={checkoutData.address}
                    onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your complete address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={checkoutData.pincode}
                      onChange={(e) => setCheckoutData({ ...checkoutData, pincode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="110001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={checkoutData.phoneNumber}
                      onChange={(e) => setCheckoutData({ ...checkoutData, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutData({ ...checkoutData, paymentMode: 'COD' })}
                      className={`flex items-center justify-center space-x-2 p-3 border rounded-md transition-colors duration-200 ${
                        checkoutData.paymentMode === 'COD'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <CreditCard className="h-5 w-5" />
                      <span className="text-sm font-medium">Cash on Delivery</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCheckoutData({ ...checkoutData, paymentMode: 'UPI' })}
                      className={`flex items-center justify-center space-x-2 p-3 border rounded-md transition-colors duration-200 ${
                        checkoutData.paymentMode === 'UPI'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Smartphone className="h-5 w-5" />
                      <span className="text-sm font-medium">UPI</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                {isCheckingOut ? 'Placing Order...' : `Place Order - ₹${getTotalPrice() + 20}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}