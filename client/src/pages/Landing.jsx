import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeroPizzaCanvas } from '../components/3d/HeroPizzaCanvas';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  ShieldCheck,
  Star,
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';

export const Landing = () => {
  const [featuredPizzas, setFeaturedPizzas] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/pizzas?category=All');
        if (res.data.success) {
          setFeaturedPizzas(res.data.pizzas.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load featured pizzas:', err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 md:pt-12 overflow-hidden">
        {/* Background radial glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-pizza-orange/20 to-pizza-red/5 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-6 text-center lg:text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pizza-orange/10 border border-pizza-orange/30 text-pizza-orange text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Next-Gen WebGL 3D Pizza Experience</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1]">
                CRAFT YOUR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pizza-orange via-pizza-cheese to-pizza-red">
                  PERFECT PIZZA
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                Choose your base. Pick your sauce. Build your masterpiece in live 3D. 
                Baked to perfection in our 450°C stone ovens and delivered hot to your doorstep.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/build-pizza"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white text-base neon-glow-btn flex items-center justify-center gap-2.5 group"
                >
                  <Sparkles className="w-5 h-5 text-amber-200 group-hover:rotate-12 transition-transform" />
                  Build Your Pizza (3D)
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/menu"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-slate-200 bg-charcoal-800/80 hover:bg-charcoal-700 hover:text-white border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  Explore Menu
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div className="space-y-1">
                  <div className="flex items-center justify-center lg:justify-start gap-1.5 text-pizza-orange">
                    <Flame className="w-4 h-4" />
                    <span className="text-xs font-bold text-white">450°C Fire</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Authentic Stone Oven</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center lg:justify-start gap-1.5 text-amber-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold text-white">30 Minutes</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Lightning Delivery</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center lg:justify-start gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold text-white">Razorpay</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Secure Payments</p>
                </div>
              </div>

            </motion.div>

            {/* Right Hero 3D Canvas */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="lg:col-span-6 relative"
            >
              <HeroPizzaCanvas />
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS 3-STEP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-bold text-pizza-orange uppercase tracking-widest">
            The PizzaVerse Protocol
          </h2>
          <h3 className="text-3xl font-display font-extrabold text-white">
            How The 3D Studio Works
          </h3>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            From interactive WebGL design to wood-fired oven dispatch in under 35 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Design in Real-Time 3D',
              description: 'Select your artisan base, gourmet sauce, aged cheese, and fresh farm vegetables with instant 360° visual feedback.',
              icon: '🎨',
            },
            {
              step: '02',
              title: 'Stone Oven Fired',
              description: 'Our certified master pizzaiolos prepare your exact custom build and bake it in our imported 450°C stone ovens.',
              icon: '🔥',
            },
            {
              step: '03',
              title: 'Live WebSocket Tracking',
              description: 'Watch your order progress in real-time from prep table to insulated hot-bag dispatch straight to your door.',
              icon: '🚀',
            },
          ].map((item, idx) => (
            <div
              key={item.step}
              className="glass-panel glass-panel-hover p-8 rounded-2xl relative overflow-hidden group"
            >
              <span className="text-5xl font-black text-white/5 absolute top-4 right-4 font-display">
                {item.step}
              </span>
              <div className="text-4xl mb-4">{item.icon}</div>
              <h4 className="text-lg font-bold text-white group-hover:text-pizza-orange transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CHEF'S SIGNATURE CREATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-xs font-bold text-pizza-orange uppercase tracking-widest">
              Signature Collection
            </h2>
            <h3 className="text-3xl font-display font-extrabold text-white mt-1">
              Chef’s Handcrafted Specials
            </h3>
          </div>
          <Link
            to="/menu"
            className="text-xs font-semibold text-pizza-orange hover:text-white flex items-center gap-1.5 transition-colors"
          >
            View Entire Menu <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPizzas.map((pizza) => (
            <div
              key={pizza._id}
              className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col group border border-white/5"
            >
              <div className="h-44 relative overflow-hidden">
                <img
                  src={pizza.image}
                  alt={pizza.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-charcoal-900/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1 text-[11px] font-bold text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {pizza.rating}
                </div>
                <div className="absolute bottom-3 left-3 bg-charcoal-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] font-semibold text-slate-300">
                  {pizza.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-pizza-orange transition-colors">
                    {pizza.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {pizza.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Price</span>
                    <span className="text-base font-bold text-pizza-orange">₹{pizza.price}</span>
                  </div>

                  <button
                    onClick={() => {
                      addToCart({
                        pizzaId: pizza._id,
                        name: pizza.name,
                        isCustom: false,
                        configuration: pizza.defaultConfig,
                        unitPrice: pizza.price,
                        quantity: 1,
                      });
                    }}
                    className="p-2.5 rounded-xl bg-charcoal-800 hover:bg-pizza-orange hover:text-white text-slate-200 border border-white/10 transition-all flex items-center justify-center shadow-lg"
                    title="Quick Add to Cart"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-14 relative overflow-hidden border border-pizza-orange/30 shadow-2xl">
          <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-pizza-orange/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-6 relative z-10">
            <span className="text-xs font-bold text-pizza-orange uppercase tracking-widest">
              Unleash Your Inner Pizzaiolo
            </span>
            <h3 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              Ready to create a pizza that’s uniquely yours?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              Customize dough thickness, simmered sauces, cheese blends, and gourmet toppings with live real-time price tracking and dynamic 3D visual render.
            </p>
            <div className="pt-2">
              <Link
                to="/build-pizza"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white text-sm neon-glow-btn"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                Launch 3D Pizza Studio
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
