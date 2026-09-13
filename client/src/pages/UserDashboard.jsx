import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import {
  Sparkles,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Flame,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const UserDashboard = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Compute statistics
  const totalOrdersCount = orders.length;
  const completedOrdersCount = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const activeOrder = orders.find((o) =>
    ['Order Received', 'In Kitchen', 'Sent to Delivery'].includes(o.orderStatus)
  );

  const handleReorder = (order) => {
    order.items.forEach((it) => {
      addToCart({
        name: it.name,
        isCustom: it.isCustom,
        configuration: it.configuration,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
      });
    });
    navigate('/cart');
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Kitchen work will be halted and a refund will be initiated.')) {
      return;
    }
    try {
      const res = await api.put(`/orders/${orderId}/cancel`, { reason: 'Cancelled by customer' });
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: 'Cancelled' } : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold text-pizza-orange uppercase tracking-wider">
            Customer Dashboard
          </span>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1">
            Welcome Back, {user?.name?.split(' ')[0] || 'Pizza Lover'}! 🍕
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your artisan orders, craft new 3D custom pies, and view order receipts.
          </p>
        </div>

        <Link
          to="/build-pizza"
          className="px-6 py-3 rounded-xl font-bold text-white text-xs neon-glow-btn flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          Build New Pizza in 3D
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Total Orders</span>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono">{totalOrdersCount}</p>
          <span className="text-[11px] text-slate-500 block">Lifetime orders placed</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Delivered</span>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">{completedOrdersCount}</p>
          <span className="text-[11px] text-slate-500 block">Completed deliveries</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Active Order</span>
          <p className="text-2xl sm:text-3xl font-bold text-pizza-orange font-mono">
            {activeOrder ? '1' : '0'}
          </p>
          <span className="text-[11px] text-slate-500 block">
            {activeOrder ? activeOrder.orderStatus : 'No active delivery'}
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Favorite Style</span>
          <p className="text-lg sm:text-xl font-bold text-white truncate">Cheese Burst</p>
          <span className="text-[11px] text-slate-500 block">Most ordered base</span>
        </div>
      </div>

      {/* Active Order Spotlight Banner */}
      {activeOrder && (
        <div className="glass-panel p-6 rounded-2xl border border-pizza-orange/30 shadow-glow-orange relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pizza-orange animate-ping" />
                <span className="text-xs font-bold text-pizza-orange uppercase tracking-wider">
                  Live Active Order in Progress
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Order #{activeOrder.orderNumber}
              </h3>
              <p className="text-xs text-slate-400">
                Current Status: <span className="text-white font-semibold">{activeOrder.orderStatus}</span>
              </p>
            </div>

            <Link
              to={`/orders/${activeOrder._id}`}
              className="px-5 py-2.5 rounded-xl font-semibold text-white text-xs neon-glow-btn flex items-center gap-2"
            >
              Open Live Tracking Radar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Past Orders History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-pizza-orange" />
          <span>Order History ({orders.length})</span>
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="glass-panel h-24 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl text-center space-y-3 border border-white/5">
            <p className="text-sm text-slate-400">You haven't placed any orders yet.</p>
            <Link to="/menu" className="text-xs font-bold text-pizza-orange hover:underline">
              Explore our artisan menu →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord._id}
                className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/10 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-white font-mono">{ord.orderNumber}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : ord.orderStatus === 'Cancelled'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-pizza-orange/20 text-pizza-orange'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    {ord.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {new Date(ord.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} • ₹{ord.pricing.totalAmount}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {['Order Received', 'In Kitchen'].includes(ord.orderStatus) && (
                    <button
                      onClick={() => handleCancelOrder(ord._id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    onClick={() => handleReorder(ord)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-charcoal-800 hover:text-white border border-white/10 transition-colors"
                  >
                    Reorder
                  </button>

                  <Link
                    to={`/orders/${ord._id}`}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-pizza-orange bg-pizza-orange/10 hover:bg-pizza-orange/20 border border-pizza-orange/30 transition-colors flex items-center gap-1"
                  >
                    Track / Invoice
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
