import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';

// Pages
import { Landing } from './pages/Landing';
import { Menu } from './pages/Menu';
import { PizzaBuilder } from './pages/PizzaBuilder';
import { Cart } from './pages/Cart';
import { OrderTracking } from './pages/OrderTracking';
import { UserDashboard } from './pages/UserDashboard';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Protected Route for Customer
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Protected Route for Admin
const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
};

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <div className="min-h-screen flex flex-col bg-charcoal-950 text-slate-100 bg-grid-pattern">
              <Navbar />
              
              <main className="flex-grow">
                <Routes>
                  {/* Public Customer Pages */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/build-pizza" element={<PizzaBuilder />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/orders/:id" element={<OrderTracking />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Customer Protected Pages */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Specific Pages */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <CartDrawer />
              <Footer />
            </div>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
