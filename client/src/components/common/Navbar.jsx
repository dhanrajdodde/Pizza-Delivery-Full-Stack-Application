import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag,
  User,
  LogOut,
  Layers,
  Sparkles,
  Menu as MenuIcon,
  X,
  Compass,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-pizza-red via-pizza-orange to-pizza-cheese flex items-center justify-center shadow-glow-orange group-hover:scale-105 transition-transform">
              <span className="text-2xl">🍕</span>
            </div>
            <div>
              <span className="text-xl font-display font-extrabold tracking-tight text-white flex items-center gap-1.5">
                PIZZA<span className="text-pizza-orange">VERSE</span>
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 block -mt-1 uppercase font-medium">
                Artisan 3D Studio
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'text-pizza-orange bg-white/5' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/menu') ? 'text-pizza-orange bg-white/5' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Menu
            </Link>
            <Link
              to="/build-pizza"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/build-pizza')
                  ? 'text-pizza-orange bg-white/5'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-pizza-orange animate-pulse" />
              Build Pizza (3D)
            </Link>
            <Link
              to="/orders"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/orders') ? 'text-pizza-orange bg-white/5' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Track Order
            </Link>
            
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Ops
              </Link>
            )}
          </div>

          {/* Right Actions (Cart + Auth) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-charcoal-800/80 border border-white/10 hover:border-pizza-orange/40 hover:bg-charcoal-700 transition-all text-slate-200"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pizza-orange text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-glow-orange animate-bounce">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* Auth State */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-charcoal-800 border border-white/10 hover:border-white/20 transition-all text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pizza-orange to-pizza-red flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <span className="text-slate-200 max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl glass-panel border border-white/10 shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Dashboard
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      My Orders
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <User className="w-3.5 h-3.5" />
                      Account Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-amber-400 hover:bg-white/5 border-t border-white/10"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Operations Center
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 border-t border-white/10 text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white neon-glow-btn"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-lg bg-charcoal-800 text-slate-200"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pizza-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-charcoal-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5"
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5"
          >
            Menu
          </Link>
          <Link
            to="/build-pizza"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-pizza-orange hover:bg-white/5"
          >
            Build Pizza (3D)
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5"
          >
            Track Order
          </Link>

          {user ? (
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="px-3 text-xs text-slate-400">Signed in as {user.name}</div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5"
              >
                Profile
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-amber-400 hover:bg-white/5"
                >
                  Admin Operations Center
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-medium bg-charcoal-800 text-slate-200"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white neon-glow-btn"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
