import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, Sparkles, CreditCard, Lock } from 'lucide-react';

export const PaymentModal = ({ order, isOpen, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const { clearCart } = useCart();
  const navigate = useNavigate();

  if (!isOpen || !order) return null;

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b00', '#e63946', '#f59e0b', '#22c55e']
    });
  };

  // Launch Razorpay Standard Test Checkout OR Safe Sandbox Simulation
  const handlePayment = async (isSimulation = false) => {
    setProcessing(true);
    setError(null);

    try {
      // 1. Create Razorpay Order on server
      const orderRes = await api.post('/payment/create-order', {
        amount: order.pricing.totalAmount,
        currency: 'INR',
        receipt: `receipt_${order.orderNumber}`,
      });

      const { keyId, order: rzpOrder, isSimulation: serverSimulation } = orderRes.data;

      // If simulated or if user chose test simulation
      if (isSimulation || serverSimulation || !window.Razorpay) {
        console.log('Running safe Razorpay Sandbox Simulation checkout...');
        
        // Brief artificial delay for realistic payment gateway response
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify with backend
        const verifyRes = await api.post('/payment/verify', {
          orderId: order._id,
          razorpayOrderId: rzpOrder.id,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpaySignature: 'simulated_valid_signature',
          isSimulation: true,
        });

        if (verifyRes.data.success) {
          triggerCelebration();
          clearCart();
          onClose();
          navigate(`/orders/${order._id}`, { state: { orderSuccess: true } });
        }
        return;
      }

      // Live Razorpay Checkout SDK options
      const options = {
        key: keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'PizzaVerse Delivery',
        description: `Order ${order.orderNumber}`,
        image: 'https://cdn-icons-png.flaticon.com/512/3595/3595458.png',
        order_id: rzpOrder.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/payment/verify', {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              isSimulation: false,
            });

            if (verifyRes.data.success) {
              triggerCelebration();
              clearCart();
              onClose();
              navigate(`/orders/${order._id}`, { state: { orderSuccess: true } });
            }
          } catch (verErr) {
            setError(verErr.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: order.deliveryInformation?.fullName || '',
          email: '',
          contact: order.deliveryInformation?.phone || '',
        },
        theme: {
          color: '#ff6b00',
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp) {
        setError(resp.error.description || 'Payment failed. Please retry.');
        setProcessing(false);
      });
      razorpayInstance.open();
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(err.response?.data?.message || 'Failed to initialize payment gateway.');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-charcoal-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Background orange glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-pizza-orange/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-pizza-orange/20 border border-pizza-orange/30 flex items-center justify-center text-pizza-orange">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Razorpay Secure Checkout</h3>
              <p className="text-xs text-slate-400">Order Ref: {order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="text-slate-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Details & Summary Box */}
        <div className="bg-charcoal-950/60 p-4 rounded-xl border border-white/5 space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Customer:</span>
            <span className="text-white font-medium">{order.deliveryInformation.fullName}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Delivery City:</span>
            <span className="text-white font-medium">{order.deliveryInformation.city}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Total Items:</span>
            <span className="text-white font-medium">{order.items.length} artisan pizzas</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-200">Amount Payable:</span>
            <span className="text-xl font-bold text-pizza-orange">₹{order.pricing.totalAmount}</span>
          </div>
        </div>

        {/* Security / Test Mode Notice */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-white/5 p-2.5 rounded-lg">
          <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>Razorpay Test Sandbox Enabled. 128-bit SSL encrypted.</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Simulation Sandbox Button (Primary 1-click test checkout) */}
          <button
            onClick={() => handlePayment(true)}
            disabled={processing}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm neon-glow-btn flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authorizing Test Payment...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Pay ₹{order.pricing.totalAmount} (Razorpay Sandbox Demo)
              </>
            )}
          </button>

          {/* Standard Razorpay Modal Trigger */}
          <button
            onClick={() => handlePayment(false)}
            disabled={processing}
            className="w-full py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-charcoal-800 hover:bg-charcoal-700 border border-white/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            Launch Standard Razorpay Gateway Popup
          </button>
        </div>

      </div>
    </div>
  );
};
