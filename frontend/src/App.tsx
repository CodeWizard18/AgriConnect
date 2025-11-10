import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';

// Customer Pages
import { CustomerDashboard } from './pages/customer/Dashboard';
import { Browse } from './pages/customer/Browse';
import { Cart } from './pages/customer/Cart';
import { Orders } from './pages/customer/Orders';


// Farmer Pages
import { FarmerDashboard } from './pages/farmer/Dashboard';
import { FarmerListings } from './pages/farmer/Listings';
import { AddProduct } from './pages/farmer/AddProduct';
import { FarmerOrders } from './pages/farmer/Orders';


// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { Moderation } from './pages/admin/Moderation';
import { PhoneOrders } from './pages/admin/PhoneOrders';
import { Analytics } from './pages/admin/Analytics';

// Landing Page
import { LandingPage } from './pages/LandingPage';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {user && <Navbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Signup />} />

        {/* Customer Routes */}
        <Route path="/customer/dashboard" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/customer/browse" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Browse />
          </ProtectedRoute>
        } />
        <Route path="/customer/cart" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/customer/orders" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Orders />
          </ProtectedRoute>
        } />


        {/* Farmer Routes */}
        <Route path="/farmer/dashboard" element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/farmer/listings" element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerListings />
          </ProtectedRoute>
        } />
        <Route path="/farmer/add-product" element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <AddProduct />
          </ProtectedRoute>
        } />
        <Route path="/farmer/orders" element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerOrders />
          </ProtectedRoute>
        } />


        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/moderation" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Moderation />
          </ProtectedRoute>
        } />
        <Route path="/admin/phone-orders" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PhoneOrders />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Analytics />
          </ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {user && <Footer />}
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;