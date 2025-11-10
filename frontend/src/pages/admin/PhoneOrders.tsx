import React, { useState, useEffect } from 'react';
import { Phone, Plus, Search, Package } from 'lucide-react';
import { api } from '../../api/dummyApi';
import toast from 'react-hot-toast';

export function PhoneOrders() {
  const [orderForm, setOrderForm] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    customerState: '',
    customerPincode: '',
    farmerId: '',
    farmerPhone: '',
    farmerAddress: '',
    selectedProducts: [] as any[],
    notes: ''
  });

  const [productSearch, setProductSearch] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [farmers, setFarmers] = useState([] as any[]);
  const [products, setProducts] = useState([] as any[]);
  const [customers, setCustomers] = useState([] as any[]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [stats, setStats] = useState({
    ordersCreated: 0,
    totalValue: 0,
    avgOrderSize: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await api.getUsersForModeration();
        const productsData = await api.getProductsForModeration();
        const statsData = await api.getPhoneOrdersStats();

        setFarmers(usersData.filter((u: any) => u.role === 'farmer'));
        setCustomers(usersData.filter((u: any) => u.role === 'customer'));
        setProducts(productsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddProduct = (product: any) => {
    const existingProduct = orderForm.selectedProducts.find(p => p._id === product._id);
    
    if (existingProduct) {
      setOrderForm({
        ...orderForm,
        selectedProducts: orderForm.selectedProducts.map(p =>
          p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p
        )
      });
    } else {
      setOrderForm({
        ...orderForm,
        selectedProducts: [...orderForm.selectedProducts, { ...product, quantity: 1 }]
      });
    }
    
    toast.success(`${product.name} added to order`);
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderForm({
        ...orderForm,
        selectedProducts: orderForm.selectedProducts.filter(p => p._id !== productId)
      });
    } else {
      setOrderForm({
        ...orderForm,
        selectedProducts: orderForm.selectedProducts.map(p =>
          p._id === productId ? { ...p, quantity } : p
        )
      });
    }
  };

  const calculateTotal = () => {
    return orderForm.selectedProducts.reduce((total, product) => 
      total + (product.price * product.quantity), 0
    );
  };

  const handleCustomerSelect = (customer: any) => {
    setOrderForm({
      ...orderForm,
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: customer.phone || '',
      customerAddress: customer.address || '',
      customerCity: customer.city || '',
      customerState: customer.state || '',
      customerPincode: customer.pincode || ''
    });
  };

  const handleFarmerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFarmerId = e.target.value;
    setOrderForm(prev => {
      const selectedFarmer = farmers.find(f => f._id === selectedFarmerId);
      return {
        ...prev,
        farmerId: selectedFarmerId,
        farmerPhone: selectedFarmer?.phone || '',
        farmerAddress: selectedFarmer?.address || '',
        selectedProducts: []
      };
    });
  };



  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderForm.customerName || !orderForm.customerPhone || !orderForm.customerAddress || !orderForm.farmerId || orderForm.selectedProducts.length === 0) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const orderData = {
        customerId: orderForm.customerId || '',
        customerName: orderForm.customerName,
        customerPhone: orderForm.customerPhone,
        customerAddress: orderForm.customerAddress,
        customerCity: orderForm.customerCity,
        customerState: orderForm.customerState,
        customerPincode: orderForm.customerPincode,
        farmerId: orderForm.farmerId,
        farmerPhone: orderForm.farmerPhone,
        farmerAddress: orderForm.farmerAddress,
        selectedProducts: orderForm.selectedProducts.map(p => ({
          product: p._id,
          quantity: p.quantity,
          price: p.price,
          unit: p.unit
        })),
        notes: orderForm.notes,
        totalAmount: calculateTotal()
      };

      await api.createPhoneOrder(orderData);

      toast.success('Phone order created successfully!');

      // Reset form
      setOrderForm({
        customerId: '',
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        customerCity: '',
        customerState: '',
        customerPincode: '',
        farmerId: '',
        farmerPhone: '',
        farmerAddress: '',
        selectedProducts: [],
        notes: ''
      });
    } catch (error) {
      console.error('Failed to create phone order:', error);
      toast.error('Failed to create phone order. Please try again.');
    }
  };

  const filteredProducts = products.filter((product: any) =>
    (!orderForm.farmerId || product.farmer?._id === orderForm.farmerId) &&
    (productSearch === '' || product.name.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Phone Order Intake
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create orders for customers who call in
          </p>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-orange-600" />
                Customer Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Customer Name *
                  </label>
                  <select
                    required
                    value={orderForm.customerId}
                    onChange={(e) => {
                      const selectedCustomer = customers.find(c => c._id === e.target.value);
                      if (selectedCustomer) {
                        handleCustomerSelect(selectedCustomer);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Choose a customer</option>
                    {customers.map((customer: any) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  rows={3}
                  required
                  value={orderForm.customerAddress}
                  onChange={(e) => setOrderForm({ ...orderForm, customerAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter complete delivery address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={orderForm.customerCity}
                    onChange={(e) => setOrderForm({ ...orderForm, customerCity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={orderForm.customerState}
                    onChange={(e) => setOrderForm({ ...orderForm, customerState: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={orderForm.customerPincode}
                    onChange={(e) => setOrderForm({ ...orderForm, customerPincode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Pincode"
                  />
                </div>
              </div>


            </div>

            {/* Farmer Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select Farmer *
              </h3>

              <select
                required
                value={orderForm.farmerId}
                onChange={handleFarmerSelect}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Choose a farmer</option>
                {farmers.map((farmer: any) => (
                  <option key={farmer._id} value={farmer._id}>
                    {farmer.name} - {farmer.city}, {farmer.state || 'Location not specified'}
                  </option>
                ))}
              </select>

              {/* Farmer Details */}
              {orderForm.farmerId && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Farmer Phone
                    </label>
                    <input
                      type="tel"
                      value={orderForm.farmerPhone}
                      onChange={(e) => setOrderForm({ ...orderForm, farmerPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Farmer phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Farmer Address
                    </label>
                    <input
                      type="text"
                      value={orderForm.farmerAddress}
                      onChange={(e) => setOrderForm({ ...orderForm, farmerAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Farmer address"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Product Selection */}
            {orderForm.farmerId && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Select Products
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowProductSelector(!showProductSelector)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Products</span>
                  </button>
                </div>

                {/* Selected Products */}
                {orderForm.selectedProducts.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {orderForm.selectedProducts.map((product) => (
                      <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">₹{product.price}/{product.unit}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => updateProductQuantity(product._id, product.quantity - 1)}
                            className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                            {product.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateProductQuantity(product._id, product.quantity + 1)}
                            className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
                          >
                            +
                          </button>
                          <span className="font-semibold text-gray-900 dark:text-white ml-4">
                            ₹{product.price * product.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Product Selector */}
                {showProductSelector && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => handleAddProduct(product)}
                          className="text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{product.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">₹{product.price}/{product.unit}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Notes
              </h3>
              <textarea
                rows={3}
                value={orderForm.notes}
                onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                placeholder="Any special instructions or notes..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>
              
              {orderForm.selectedProducts.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {orderForm.selectedProducts.map((product) => (
                    <div key={product._id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {product.name} × {product.quantity}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{product.price * product.quantity}
                      </span>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        ₹{calculateTotal()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No products selected
                </p>
              )}

              <button
                type="submit"
                disabled={orderForm.selectedProducts.length === 0}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                Create Phone Order
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Today's Phone Orders
              </h3>
              
              <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Orders Created</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{loading ? '...' : stats.ordersCreated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Value</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{loading ? '...' : `₹${stats.totalValue.toLocaleString()}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Avg Order Size</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{loading ? '...' : `₹${stats.avgOrderSize.toLocaleString()}`}</span>
                    </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}