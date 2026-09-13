import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Save,
  ShieldCheck
} from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '');

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      await updateProfile({
        name,
        phone,
        address: { street, city, state, zipCode },
      });
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
          Account Profile & Security
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your contact credentials, saved delivery location, and verification status.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/20 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Account Status Overview Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-pizza-orange to-pizza-red mx-auto flex items-center justify-center text-3xl font-bold text-white shadow-glow-orange uppercase">
              {user?.name ? user.name[0] : 'U'}
            </div>

            <div>
              <h2 className="text-base font-bold text-white">{user?.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-charcoal-800 text-slate-300 border border-white/10 uppercase">
                {user?.role}
              </span>
            </div>

            {/* Account Status Badge */}
            <div className="pt-4 border-t border-white/10">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-2">
                Account Status
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Account
              </div>
            </div>
          </div>
        </div>

        {/* Right: Editable Profile Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-pizza-orange" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pizza-orange"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-950/60 border border-white/5 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pizza-orange"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pizza-orange" />
                <span>Saved Delivery Location</span>
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 42 Silicon Boulevard"
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pizza-orange"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pizza-orange"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pizza-orange"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pizza-orange"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl font-bold text-white text-xs neon-glow-btn flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
