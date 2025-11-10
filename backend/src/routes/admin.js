import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  getAnalyticsData,
  getUsersForModeration,
  getProductsForModeration,
  updateUserStatus,
  deleteProduct,
  createPhoneOrder,
  getPhoneOrdersStats,
  getRecentActivity,
  getWeeklyOrders
} from '../controllers/adminController.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
});

// Dashboard stats
router.get('/stats', getDashboardStats);

// Analytics data
router.get('/analytics', getAnalyticsData);

// Moderation
router.get('/users', getUsersForModeration);
router.get('/products', getProductsForModeration);
router.put('/users/:userId/status', updateUserStatus);
router.delete('/products/:productId', deleteProduct);

// Phone orders
router.post('/phone-orders', createPhoneOrder);
router.get('/phone-orders/stats', getPhoneOrdersStats);

// Recent activity and weekly orders
router.get('/recent-activity', getRecentActivity);
router.get('/weekly-orders', getWeeklyOrders);

export default router;
