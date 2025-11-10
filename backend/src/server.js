import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan'; // ✅ for logging requests
import { connectDB } from './config/db.js';
import authRouter from './routes/auth.js';
import productRouter from "./routes/product.js";
import orderRouter from "./routes/order.js";
import messageRouter from "./routes/message.js";
import adminRouter from "./routes/admin.js";


const app = express();

// Middlewares
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev')); 
// Serve static files from uploads directory

// Before your routes
app.use('/uploads', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Authorization']
}), (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));

// Routes
app.use('/api/auth', authRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/messages", messageRouter);
app.use("/api/admin", adminRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'AgriConnect API',
    time: new Date().toISOString()
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server after DB connect
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
