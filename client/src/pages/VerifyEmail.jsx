import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const doVerify = async () => {
      if (!token) {
        setLoading(false);
        setSuccess(false);
        setMessage('Missing or invalid verification token.');
        return;
      }

      try {
        const res = await verifyEmail(token);
        setSuccess(true);
        setMessage(res.message || 'Email successfully verified! You can now place orders.');
      } catch (err) {
        setSuccess(false);
        setMessage(err.response?.data?.message || 'Verification token is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    doVerify();
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl text-center space-y-6">
        {loading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-pizza-orange animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Verifying Account...</h2>
            <p className="text-xs text-slate-400">Communicating with the security token authority.</p>
          </div>
        ) : success ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Account Verified!</h2>
            <p className="text-xs text-slate-300">{message}</p>
            <div className="pt-2">
              <Link
                to="/dashboard"
                className="w-full py-3.5 rounded-xl font-bold text-white text-xs neon-glow-btn inline-flex items-center justify-center gap-2"
              >
                Go to Dashboard & Build Pizza
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-xs text-slate-400">{message}</p>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full py-3.5 rounded-xl font-bold text-white text-xs bg-charcoal-800 hover:bg-charcoal-700 inline-block border border-white/10"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
