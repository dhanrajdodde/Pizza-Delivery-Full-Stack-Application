import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

export const CartDrawer = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    tax,
    totalAmount,
    totalItemCount,
  } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-charcoal-900 border-l border-white/10 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pizza-orange" />
              <h2 className="text-lg font-bold text-white">Your Cart</h2>
              <span className="text-xs bg-charcoal-800 text-slate-400 px-2 py-0.5 rounded-full">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-charcoal-800 flex items-center justify-center text-3xl">
                  🍕
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Your cart is empty</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Choose from our artisan signature pizzas or craft your own in 3D!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/menu');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white neon-glow-btn"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="glass-panel p-4 rounded-xl border border-white/5 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                        {item.isCustom && (
                          <span className="text-[10px] bg-pizza-orange/20 text-pizza-orange px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> 3D Custom
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-pizza-orange font-bold mt-0.5">
                        ₹{item.unitPrice}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Configuration specs if custom or signature */}
                  {item.configuration && (
                    <div className="text-[11px] text-slate-400 space-y-0.5 bg-charcoal-950/40 p-2 rounded-lg border border-white/5">
                      <div><span className="text-slate-500">Base:</span> {item.configuration.base}</div>
                      <div><span className="text-slate-500">Sauce:</span> {item.configuration.sauce}</div>
                      <div><span className="text-slate-500">Cheese:</span> {item.configuration.cheese}</div>
                      {item.configuration.vegetables?.length > 0 && (
                        <div>
                          <span className="text-slate-500">Toppings:</span>{' '}
                          {item.configuration.vegetables.join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quantity and Total */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 bg-charcoal-800 rounded-lg p-1 border border-white/10">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-semibold text-white px-1.5">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm font-bold text-white">
                      ₹{item.totalPrice}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-charcoal-950/60 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <span className="text-emerald-400 font-medium">FREE</span> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (5%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-pizza-orange text-base">₹{totalAmount}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm neon-glow-btn flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
