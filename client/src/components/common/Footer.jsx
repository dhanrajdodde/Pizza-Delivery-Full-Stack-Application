import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Shield, Clock, Heart, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-charcoal-900 border-t border-white/10 pt-16 pb-12 mt-20 relative overflow-hidden">
      {/* Decorative top ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-pizza-orange to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-pizza-red to-pizza-orange flex items-center justify-center shadow-glow-orange">
                <span className="text-xl">🍕</span>
              </div>
              <span className="text-lg font-display font-extrabold text-white tracking-tight">
                PIZZA<span className="text-pizza-orange">VERSE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The next-generation artisan pizza platform powered by real-time WebGL 3D customization, instant inventory synchronization, and live order tracking.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-pizza-orange" /> 450°C Stone Oven</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-400" /> 30-Min Fast</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/" className="hover:text-pizza-orange transition-colors">Home Experience</Link></li>
              <li><Link to="/menu" className="hover:text-pizza-orange transition-colors">Signature Menu</Link></li>
              <li><Link to="/build-pizza" className="hover:text-pizza-orange transition-colors">Interactive 3D Builder</Link></li>
              <li><Link to="/orders" className="hover:text-pizza-orange transition-colors">Live Order Tracking</Link></li>
            </ul>
          </div>

          {/* Operations & Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/dashboard" className="hover:text-pizza-orange transition-colors">User Dashboard</Link></li>
              <li><Link to="/profile" className="hover:text-pizza-orange transition-colors">Account & Security</Link></li>
              <li><Link to="/admin/login" className="hover:text-amber-400 transition-colors text-amber-500/80">Admin Operations Portal</Link></li>
              <li><span className="text-slate-500">Node-Cron Inventory Engine</span></li>
            </ul>
          </div>

          {/* Tech Architecture Badges */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Engineering</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Production Full-Stack Architecture featuring Three.js WebGL, React 18, Node Express, Mongoose, Socket.IO, and Razorpay Test Mode.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Three.js', 'React 18', 'Express', 'MongoDB', 'Socket.IO', 'Razorpay', 'Tailwind'].map((tech) => (
                <span key={tech} className="px-2 py-0.5 rounded bg-charcoal-800 text-[10px] text-slate-300 border border-white/5">
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PizzaVerse Inc. All rights reserved. Crafted for portfolio excellence.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> End-to-End Encrypted
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Award className="w-3.5 h-3.5 text-pizza-orange" /> Level 3 Production Full-Stack
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
