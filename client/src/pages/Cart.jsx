import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { PaymentModal } from '../components/checkout/PaymentModal';
import api from '../services/api';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  AlertCircle
} from 'lucide-react';

export const Cart = () => {
  const {
    items,
    totalItemCount,
    subtotal,
    deliveryFee,
    tax,
    totalAmount,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Delivery form state
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '42 Silicon Boulevard, Koramangala',
    city: user?.address?.city || 'Bangalore',
    state: user?.address?.state || 'Karnataka',
    zipCode: user?.address?.zipCode || '560001',
    deliveryNotes: '',
  });

  const [createdOrder, setCreatedOrder] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync user info into form if loaded after mount
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '+91 9876543210',
        street: prev.street || user.address?.street || '42 Silicon Boulevard, Koramangala',
        city: prev.city || user.address?.city || 'Bangalore',
        state: prev.state || user.address?.state || 'Karnataka',
        zipCode: prev.zipCode || user.address?.zipCode || '560001',
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.street || !formData.city || !formData.zipCode) {
      setErrorMessage('Please fill in all required delivery address fields.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create order in MongoDB backend
      const res = await api.post('/orders', {
        items,
        deliveryInformation: formData,
        pricing: {
          subtotal,
          deliveryFee,
          tax,
          totalAmount,
        },
      });

      if (res.data.success) {
        setCreatedOrder(res.data.order);
        setIsPaymentModalOpen(true);
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to initialize order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-charcoal-800 border border-white/10 flex items-center justify-center text-4xl mx-auto shadow-2xl">
          🍕
        </div>
        <h1 className="text-2xl font-bold text-white">Your Cart is Empty</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Explore our artisan signature pizza catalog or design your dream pizza with our live 3D custom builder.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            to="/menu"
            className="px-6 py-3 rounded-xl font-semibold text-white neon-glow-btn text-xs"
          >
            Explore Menu
          </Link>
          <Link
            to="/build-pizza"
            className="px-6 py-3 rounded-xl font-semibold text-slate-300 bg-charcoal-800 hover:text-white border border-white/10 text-xs"
          >
            Build in 3D
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
          Order Summary & Checkout
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your pizza selections, confirm your delivery address, and pay via Razorpay.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-xs text-red-300">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">Notice:</span>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-pizza-orange" />
              <span>Cart Items ({totalItemCount})</span>
            </h2>
            <Link
              to="/menu"
              className="text-xs text-pizza-orange hover:underline font-semibold"
            >
              + Add More Pizzas
            </Link>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.cartItemId}
                className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{item.name}</h3>
                      {item.isCustom && (
                        <span className="text-[10px] bg-pizza-orange/20 text-pizza-orange px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Custom 3D
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-pizza-orange font-mono">
                      ₹{item.unitPrice} each
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-slate-500 hover:text-red-400 p-1.5 transition-colors rounded-lg hover:bg-white/5"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Configuration Breakdown */}
                {item.configuration && (
                  <div className="grid grid-cols-2 gap-2 text-xs bg-charcoal-950/60 p-3 rounded-xl border border-white/5">
                    <div><span className="text-slate-500">Base:</span> <span className="text-slate-200">{item.configuration.base}</span></div>
                    <div><span className="text-slate-500">Sauce:</span> <span className="text-slate-200">{item.configuration.sauce}</span></div>
                    <div><span className="text-slate-500">Cheese:</span> <span className="text-slate-200">{item.configuration.cheese}</span></div>
                    <div>
                      <span className="text-slate-500">Toppings:</span>{' '}
                      <span className="text-slate-200">
                        {item.configuration.vegetables?.length > 0
                          ? item.configuration.vegetables.join(', ')
                          : 'None'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quantity & Row Subtotal */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 bg-charcoal-800 rounded-xl p-1 border border-white/10">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-white px-2">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-base font-bold text-white font-mono">
                    ₹{item.totalPrice}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Delivery Form & Payment Summary */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-pizza-orange" />
              <span>Delivery Details</span>
            </h2>

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Alex PizzaLover"
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pizza-orange"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pizza-orange"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Street Address *</label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Apartment, building, street..."
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pizza-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pizza-orange"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Postal Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pizza-orange"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Delivery Notes (Optional)</label>
                <input
                  type="text"
                  name="deliveryNotes"
                  value={formData.deliveryNotes}
                  onChange={handleInputChange}
                  placeholder="Drop at door, ring bell..."
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pizza-orange"
                />
              </div>

              {/* Price Calculation Bill */}
              <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Fee</span>
                  <span className="font-mono">
                    {deliveryFee === 0 ? <span className="text-emerald-400 font-semibold">FREE</span> : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (5%)</span>
                  <span className="font-mono">₹{tax}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-xl font-mono text-pizza-orange">₹{totalAmount}</span>
                </div>
              </div>

              {/* Form Validation Error Message right above button */}
              {errorMessage && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-start gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Notice: </span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl font-bold text-white text-sm neon-glow-btn flex items-center justify-center gap-2 shadow-xl"
              >
                {submitting ? 'Creating Order...' : user ? `Proceed to Razorpay (₹${totalAmount})` : `Sign In to Checkout (₹${totalAmount})`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Razorpay Test Sandbox Integration • 100% Guaranteed Delivery</span>
          </div>

        </div>

      </div>

      {/* Razorpay Test Payment Modal */}
      {createdOrder && (
        <PaymentModal
          order={createdOrder}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}

    </div>
  );
};
