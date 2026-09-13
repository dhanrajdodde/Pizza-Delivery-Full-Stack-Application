import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Flame, Bike, Home, Clock, AlertCircle } from 'lucide-react';

const STEPS = [
  {
    key: 'Order Received',
    label: 'Order Received',
    description: 'Payment verified & sent to kitchen',
    icon: CheckCircle2,
  },
  {
    key: 'In Kitchen',
    label: 'In Kitchen',
    description: 'Dough stretched & baked in 450°C stone oven',
    icon: Flame,
  },
  {
    key: 'Sent to Delivery',
    label: 'Sent to Delivery',
    description: 'Hot-bag rider dispatched with your pizza',
    icon: Bike,
  },
  {
    key: 'Delivered',
    label: 'Delivered',
    description: 'Enjoy your hot artisan pizza!',
    icon: Home,
  },
];

export const OrderTimeline = ({ currentStatus, timeline = [], estimatedDeliveryTime }) => {
  const getStepIndex = (status) => {
    switch (status) {
      case 'Order Received': return 0;
      case 'In Kitchen': return 1;
      case 'Sent to Delivery': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);
  const isCancelled = currentStatus === 'Cancelled';

  if (isCancelled) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-semibold">Order Cancelled</h4>
          <p className="text-xs text-red-300/80">This order has been cancelled and refunded.</p>
        </div>
      </div>
    );
  }

  // Get timestamp for step if logged in timeline
  const getTimestampForStep = (stepKey) => {
    const entry = timeline.find((t) => t.status === stepKey);
    if (!entry) return null;
    const d = new Date(entry.timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Visual Step Progress Bar */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-5 left-6 right-6 h-1 bg-charcoal-800 -z-0" />
        
        {/* Active progress line */}
        <div
          className="absolute top-5 left-6 h-1 bg-gradient-to-r from-pizza-orange to-pizza-red transition-all duration-700 -z-0"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        <div className="grid grid-cols-4 relative z-10">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const stepTime = getTimestampForStep(step.key);

            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                {/* Step Circle */}
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                    isCompleted
                      ? 'bg-pizza-orange text-white shadow-glow-orange'
                      : isCurrent
                      ? 'bg-charcoal-900 border-2 border-pizza-orange text-pizza-orange shadow-glow-orange'
                      : 'bg-charcoal-800 text-slate-500 border border-white/10'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                  
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-pizza-orange rounded-full animate-ping" />
                  )}
                </div>

                {/* Step Text */}
                <div className="mt-3 space-y-0.5 max-w-[110px]">
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-pizza-orange'
                        : isCompleted
                        ? 'text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  {stepTime && (
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {stepTime}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Delivery Animation Badge */}
      <div className="p-4 bg-charcoal-950/60 rounded-xl border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pizza-orange/10 border border-pizza-orange/30 flex items-center justify-center text-pizza-orange">
            {currentIndex === 0 && <Clock className="w-5 h-5 animate-pulse" />}
            {currentIndex === 1 && <Flame className="w-5 h-5 text-pizza-red animate-bounce" />}
            {currentIndex === 2 && <Bike className="w-5 h-5 text-pizza-orange animate-pulse" />}
            {currentIndex === 3 && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          </div>
          <div>
            <h5 className="text-sm font-semibold text-white">
              {STEPS[currentIndex].description}
            </h5>
            <p className="text-xs text-slate-400">
              Live status synced via WebSocket
            </p>
          </div>
        </div>

        {estimatedDeliveryTime && currentIndex < 3 && (
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Est. Delivery</span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {new Date(estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
