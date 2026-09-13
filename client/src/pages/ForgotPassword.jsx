import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccessData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display font-extrabold text-white">Reset Password</h1>
          <p className="text-xs text-slate-400">
            Enter your registered email address and we'll dispatch a secure password reset token.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successData ? (
          <div className="space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If an account with <span className="text-white font-semibold">{email}</span> exists, we've dispatched a reset link.
            </p>

            {/* Dev mode quick reset link */}
            {successData.resetToken && (
              <div className="p-3 bg-charcoal-950/80 border border-pizza-orange/30 rounded-xl text-left space-y-1.5">
                <span className="text-[10px] text-pizza-orange uppercase tracking-wider font-bold block flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Dev Simulation Action
                </span>
                <p className="text-[11px] text-slate-400">
                  Direct token link generated:
                </p>
                <Link
                  to={`/reset-password?token=${successData.resetToken}`}
                  className="text-xs text-pizza-orange font-semibold hover:underline block truncate"
                >
                  Click Here to Set New Password →
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="inline-block text-xs text-slate-400 hover:text-white pt-2"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pizza-orange transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-xs neon-glow-btn flex items-center justify-center gap-2 shadow-xl"
            >
              {loading ? 'Generating Token...' : 'Send Reset Link'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-slate-400 hover:text-white">
                Back to Login
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
