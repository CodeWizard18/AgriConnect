import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Get admin dashboard stats
 */
export async function getDashboardStats(req, res) {
  try {
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate weekly orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyOrders = await Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Calculate total revenue from delivered orders
    const deliveredOrders = await Order.find({ status: 'delivered' });
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Pending moderation - count pending orders
    const pendingModeration = await Order.countDocuments({ status: 'pending' });

    console.log('Dashboard Stats:', {
      totalFarmers,
      totalCustomers,
      totalAdmins,
      activeProducts,
      weeklyOrders,
      totalRevenue,
      pendingModeration
    });

    res.json({
      totalFarmers,
      totalCustomers,
      totalAdmins,
      activeProducts,
      weeklyOrders,
      totalRevenue,
      pendingModeration
    });
  } catch (err) {
    console.error('Error in getDashboardStats:', err);
    res.status(500).json({ message: err.message });
  }
}

/**
 * Get analytics data
 */
export async function getAnalyticsData(req, res) {
  try {
    console.log('Starting analytics data calculation...');

    // Sales by category
    const categorySales = {};

    // Get only regular orders with populated products
    const orders = await Order.find({ orderType: { $ne: 'phone' } }).populate('items.product');
    console.log(`Found ${orders.length} regular orders`);

    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.product && item.price && item.quantity) {
            const category = item.product?.category || 'Others';
            if (!categorySales[category]) {
              categorySales[category] = 0;
            }
            categorySales[category] += parseFloat(item.price || 0) * parseFloat(item.quantity || 0);
          }
        });
      }
    });

    const salesData = Object.entries(categorySales).map(([category, sales]) => ({
      category,
      sales,
      percentage: 0 // Will calculate after total
    }));

    const totalSales = salesData.reduce((sum, cat) => sum + cat.sales, 0);
    salesData.forEach(cat => {
      cat.percentage = totalSales > 0 ? Math.round((cat.sales / totalSales) * 100) : 0;
    });

    console.log('Sales data calculated:', salesData);

    // Monthly growth data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthOrders = await Order.find({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const ordersCount = monthOrders.length;
      const revenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      monthlyData.push({
        month: startOfMonth.toLocaleDateString('en-US', { month: 'short' }),
        orders: ordersCount,
        revenue
      });
    }

    console.log('Monthly data calculated:', monthlyData);

    // Platform metrics
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.find({ status: 'delivered' });
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    console.log('Platform metrics:', { totalUsers, totalOrders, totalRevenue, avgOrderValue });

    // Calculate growth percentages
    const lastMonthOrders = monthlyData[5]?.orders || 0;
    const prevMonthOrders = monthlyData[4]?.orders || 0;
    const ordersGrowth = prevMonthOrders > 0 ? ((lastMonthOrders - prevMonthOrders) / prevMonthOrders * 100).toFixed(1) : 0;

    const lastMonthRevenue = monthlyData[5]?.revenue || 0;
    const prevMonthRevenue = monthlyData[4]?.revenue || 0;
    const revenueGrowth = prevMonthRevenue > 0 ? ((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1) : 0;

    // Users growth (last month vs previous month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
    const usersLastMonth = await User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } });

    const prevMonth = new Date(lastMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const startOfPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
    const endOfPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
    const usersPrevMonth = await User.countDocuments({ createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } });
    const usersGrowth = usersPrevMonth > 0 ? ((usersLastMonth - usersPrevMonth) / usersPrevMonth * 100).toFixed(1) : 0;

    // Avg order value growth
    const lastMonthAvg = lastMonthOrders > 0 ? lastMonthRevenue / lastMonthOrders : 0;
    const prevMonthAvg = prevMonthOrders > 0 ? prevMonthRevenue / prevMonthOrders : 0;
    const avgGrowth = prevMonthAvg > 0 ? ((lastMonthAvg - prevMonthAvg) / prevMonthAvg * 100).toFixed(1) : 0;

    console.log('Growth calculations:', { ordersGrowth, revenueGrowth, usersGrowth, avgGrowth });

    res.json({
      salesData,
      monthlyGrowth: monthlyData,
      totalOrders,
      totalRevenue,
      totalUsers,
      avgOrderValue,
      ordersGrowth,
      revenueGrowth,
      usersGrowth,
      avgGrowth
    });
  } catch (err) {
    console.error('Error in getAnalyticsData:', err);
    res.status(500).json({ message: err.message });
  }
}

/**
 * Get users for moderation
 */
export async function getUsersForModeration(req, res) {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Get products for moderation
 */
export async function getProductsForModeration(req, res) {
  try {
    const products = await Product.find().populate('farmer', 'name email');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Update user status
 */
export async function updateUserStatus(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Delete product (moderation)
 */
export async function deleteProduct(req, res) {
  try {
    const { productId } = req.params;
    await Product.findByIdAndDelete(productId);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Create phone order
 */
export async function createPhoneOrder(req, res) {
  try {
    const { customerId, customerName, customerPhone, customerAddress, customerCity, customerState, customerPincode, farmerId, selectedProducts, notes, totalAmount } = req.body;
    const farmerPhone = req.body.farmerPhone || '';
    const farmerAddress = req.body.farmerAddress || '';

    // Validate required fields
    if (!customerName || !customerPhone || !customerAddress || !farmerId || !selectedProducts || selectedProducts.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find farmer
    const farmer = await User.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    // Parse selectedProducts if it's a string
    let products = selectedProducts;
    if (typeof selectedProducts === 'string') {
      products = JSON.parse(selectedProducts);
    }

    // Calculate total if not provided
    let finalTotalAmount = totalAmount;
    if (!finalTotalAmount) {
      finalTotalAmount = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Create order
    const order = await Order.create({
      orderType: 'phone',
      customer: customerId || undefined,
      customerName,
      customerPhone,
      customerAddress,
      customerCity,
      customerState,
      customerPincode,
      farmer: farmerId,
      farmerPhone,
      farmerAddress,
      items: products.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit
      })),
      totalAmount: finalTotalAmount,
      status: 'pending',
      paymentMode: 'COD',
      notes
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating phone order:', err);
    res.status(500).json({ message: err.message });
  }
}

/**
 * Get phone orders stats
 */
export async function getPhoneOrdersStats(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow },
      orderType: 'phone'
    });

    const ordersCreated = todayOrders.length;
    const totalValue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderSize = ordersCreated > 0 ? totalValue / ordersCreated : 0;

    res.json({
      ordersCreated,
      totalValue,
      avgOrderSize
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Get recent activity
 */
export async function getRecentActivity(req, res) {
  try {
    // Recent orders (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const recentOrders = await Order.find({ createdAt: { $gte: oneDayAgo } })
      .populate('customer', 'name')
      .populate('farmer', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent product additions
    const recentProducts = await Product.find({ createdAt: { $gte: oneDayAgo } })
      .populate('farmer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent user registrations
    const recentUsers = await User.find({ createdAt: { $gte: oneDayAgo } })
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Format activity
    const activity = [];

    // Orders
    recentOrders.forEach(order => {
      const customerName = order.orderType === 'phone' ? (order.customerName || 'Phone customer') : (order.customer?.name || 'Unknown customer');
      activity.push({
        id: `order-${order._id}`,
        type: 'order',
        message: `New ${order.orderType || 'regular'} order #${order._id.toString().slice(-6)} from ${customerName}`,
        time: `${Math.round((new Date().getTime() - order.createdAt.getTime()) / (1000 * 60))} minutes ago`,
        timestamp: order.createdAt
      });
    });

    // Product additions
    recentProducts.forEach(product => {
      if (product.farmer && product.farmer.name) { // Only add if farmer exists and has name
        activity.push({
          id: `product-${product._id}`,
          type: 'farmer',
          message: `${product.farmer.name} added ${product.name}`,
          time: `${Math.round((new Date().getTime() - product.createdAt.getTime()) / (1000 * 60))} minutes ago`,
          timestamp: product.createdAt
        });
      }
    });

    // User registrations
    recentUsers.forEach(user => {
      activity.push({
        id: `user-${user._id}`,
        type: 'customer',
        message: `New ${user.role} registration: ${user.name}`,
        time: `${Math.round((new Date().getTime() - user.createdAt.getTime()) / (1000 * 60))} minutes ago`,
        timestamp: user.createdAt
      });
    });

    // Sort by timestamp descending
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Take top 4
    const topActivity = activity.slice(0, 4);

    console.log('Recent Activity:', topActivity);

    res.json(topActivity);
  } catch (err) {
    console.error('Error in getRecentActivity:', err);
    res.status(500).json({ message: err.message });
  }
}

/**
 * Get weekly orders data for chart
 */
export async function getWeeklyOrders(req, res) {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Monday
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyData = [];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const ordersCount = await Order.countDocuments({
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });

      weeklyData.push({
        day: days[i],
        orders: ordersCount
      });
    }

    res.json(weeklyData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
