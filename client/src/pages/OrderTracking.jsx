import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { OrderTimeline } from '../components/tracking/OrderTimeline';
import api from '../services/api';
import {
  Printer,
  Sparkles,
  ArrowLeft,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle,
  Phone,
  User,
  ShoppingBag,
  ExternalLink,
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export const OrderTracking = () => {
  const { id } = useParams();
  const location = useLocation();
  const { joinOrderRoom, leaveOrderRoom, lastOrderUpdate } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const isOrderSuccess = location.state?.orderSuccess;

  // Fetch order details
  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(err.response?.data?.message || 'Failed to retrieve order tracking information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Join real-time socket room
    joinOrderRoom(id);

    // Fallback polling every 8s
    const pollInterval = setInterval(() => {
      fetchOrder();
    }, 8000);

    return () => {
      leaveOrderRoom(id);
      clearInterval(pollInterval);
    };
  }, [id]);

  // Listen to Socket.IO real-time status update
  useEffect(() => {
    if (lastOrderUpdate && lastOrderUpdate.orderId === id) {
      console.log('⚡ Updating order in state via Socket.IO push:', lastOrderUpdate);
      setOrder((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          orderStatus: lastOrderUpdate.orderStatus,
          timeline: lastOrderUpdate.timeline || prev.timeline,
          estimatedDeliveryTime: lastOrderUpdate.estimatedDeliveryTime || prev.estimatedDeliveryTime,
        };
      });
    }
  }, [lastOrderUpdate, id]);

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      const res = await api.put(`/orders/${id}/cancel`, { reason: cancelReason });
      if (res.data.success) {
        setOrder(res.data.order);
        setIsCancelModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-pizza-orange border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Connecting to real-time order radar...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 glass-panel rounded-2xl p-8">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-lg font-bold text-white">Order Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Could not locate this order.'}</p>
        <Link
          to="/orders"
          className="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold text-white neon-glow-btn mt-2"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:m-0">
      
      {/* Celebration Banner for New Orders */}
      {isOrderSuccess && order.orderStatus !== 'Cancelled' && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 text-emerald-300 print:hidden animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Payment Verified & Confirmed!</h3>
              <p className="text-xs text-emerald-300/80">
                Your order is confirmed and our pizzaiolos have received the recipe ticket in the kitchen.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-500/20 px-3 py-1 rounded-lg">
            {order.orderNumber}
          </span>
        </div>
      )}

      {/* Cancellation Notice Banner */}
      {order.orderStatus === 'Cancelled' && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center gap-3 text-red-300 print:hidden animate-in fade-in">
          <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-white">Order Cancelled & Refund Initiated</h3>
            <p className="text-xs text-red-200/80">
              This order has been cancelled. Kitchen preparation was halted, ingredients were restocked, and payment was flagged for refund.
            </p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 print:border-none">
        <div>
          <Link
            to="/orders"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors mb-2 print:hidden"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              Order {order.orderNumber}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                order.orderStatus === 'Cancelled'
                  ? 'bg-red-500/15 text-red-400 border-red-500/30'
                  : 'bg-pizza-orange/15 text-pizza-orange border-pizza-orange/30'
              }`}
            >
              {order.orderStatus}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 print:hidden">
          {/* Cancel Order Button */}
          {['Order Received', 'In Kitchen'].includes(order.orderStatus) && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              Cancel Order
            </button>
          )}

          {/* Print Invoice Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-charcoal-800 hover:text-white border border-white/10 transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Official Invoice
          </button>
        </div>
      </div>

      {/* Real-time Visual Timeline */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 print:hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pizza-orange animate-ping" />
            Live Kitchen & Delivery Radar
          </h2>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            ⚡ Socket.IO Connected
          </span>
        </div>

        <OrderTimeline
          currentStatus={order.orderStatus}
          timeline={order.timeline}
          estimatedDeliveryTime={order.estimatedDeliveryTime}
        />
      </div>

      {/* Invoice Details Layout */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
        
        {/* Printable Header */}
        <div className="flex justify-between items-start border-b border-white/10 pb-6">
          <div>
            <span className="text-xl font-display font-extrabold text-white tracking-tight">
              PIZZA<span className="text-pizza-orange">VERSE</span>
            </span>
            <p className="text-xs text-slate-400 mt-0.5">Artisan Delivery & 3D Culinary Platform</p>
            <p className="text-[11px] text-slate-500">Tax Invoice / Receipt: {order.orderNumber}</p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Payment Status</span>
            <span className={`text-sm font-bold ${order.paymentInfo.status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
              ● {order.paymentInfo.status} via {order.paymentInfo.method}
            </span>
            {order.paymentInfo.paymentId && (
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Ref: {order.paymentInfo.paymentId}</p>
            )}
          </div>
        </div>

        {/* Customer & Delivery Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-b border-white/10 pb-6">
          <div className="space-y-2">
            <h3 className="text-slate-400 uppercase tracking-wider font-semibold text-[11px]">Customer</h3>
            <p className="text-sm font-bold text-white">{order.deliveryInformation.fullName}</p>
            <p className="text-slate-300 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-500" /> {order.deliveryInformation.phone}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-slate-400 uppercase tracking-wider font-semibold text-[11px]">Delivery Address</h3>
            <p className="text-slate-200">{order.deliveryInformation.street}</p>
            <p className="text-slate-200">{order.deliveryInformation.city}, {order.deliveryInformation.state} - {order.deliveryInformation.zipCode}</p>
            {order.deliveryInformation.deliveryNotes && (
              <p className="text-slate-400 italic">Notes: {order.deliveryInformation.deliveryNotes}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-4">
          <h3 className="text-slate-400 uppercase tracking-wider font-semibold text-[11px]">Pizzas & Selections</h3>
          <div className="divide-y divide-white/5">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    {item.isCustom && (
                      <span className="text-[10px] bg-pizza-orange/20 text-pizza-orange px-1.5 py-0.2 rounded font-medium">
                        Custom 3D
                      </span>
                    )}
                  </div>
                  {item.configuration && (
                    <p className="text-xs text-slate-400">
                      Crust: {item.configuration.base} • Sauce: {item.configuration.sauce} • Cheese: {item.configuration.cheese}
                      {item.configuration.vegetables?.length > 0 && (
                        <span> • Toppings: {item.configuration.vegetables.join(', ')}</span>
                      )}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500">
                    Quantity: {item.quantity} × ₹{item.unitPrice}
                  </p>
                </div>

                <span className="text-sm font-bold text-white font-mono">
                  ₹{item.totalPrice}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Financial Summary */}
        <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="font-mono">₹{order.pricing.subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Delivery Fee</span>
            <span className="font-mono">{order.pricing.deliveryFee === 0 ? 'FREE' : `₹${order.pricing.deliveryFee}`}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Taxes & GST</span>
            <span className="font-mono">₹{order.pricing.tax}</span>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between text-base font-bold text-white">
            <span>Grand Total Paid</span>
            <span className="text-xl text-pizza-orange font-mono">₹{order.pricing.totalAmount}</span>
          </div>
        </div>

      </div>

      {/* Cancellation Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-charcoal-900 border border-red-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="text-base font-bold text-white">Cancel Order #{order.orderNumber}?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel this order? Since the pizza is currently in early preparation, we will halt kitchen work, restock the ingredients, and process a full refund.
            </p>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Reason for cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-950 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="Changed my mind / No longer hungry">Changed my mind / No longer hungry</option>
                <option value="Ordered incorrect pizza / ingredients">Ordered incorrect pizza / ingredients</option>
                <option value="Delivery address needs correction">Delivery address needs correction</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-charcoal-800"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center gap-1.5 shadow-lg shadow-red-600/30"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Cancelling Order...
                  </>
                ) : (
                  'Yes, Cancel Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
