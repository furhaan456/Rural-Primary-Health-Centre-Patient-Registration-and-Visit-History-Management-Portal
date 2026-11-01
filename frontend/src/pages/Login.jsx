// Login — full-screen gradient with glassmorphism card and animated background
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, Lock, Mail, AlertCircle, ShieldCheck, Heart, Stethoscope } from 'lucide-react';

const Login = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const u = await login(email, password);
      if (u.role === 'admin')        navigate('/admin/dashboard');
      else if (u.role === 'doctor')  navigate('/doctor/dashboard');
      else                           navigate('/reception/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const presets = [
    { role: 'Admin',        email: 'admin@phc.org',         pass: 'Admin@123',   color: 'from-violet-500 to-indigo-600' },
    { role: 'Doctor',       email: 'doctor@phc.org',        pass: 'Doctor@123',  color: 'from-teal-500 to-emerald-600' },
    { role: 'Receptionist', email: 'receptionist@phc.org',  pass: 'Recept@123',  color: 'from-sky-500 to-cyan-600' },
  ];

  const fillPreset = (p) => {
    setEmail(p.email);
    setPassword(p.pass);
    setActivePreset(p.role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
         style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0369a1 50%, #4f46e5 100%)' }}>

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay:'1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay:'0.5s'}}></div>
      </div>

      {/* Floating icons */}
      <div className="absolute top-16 left-16 opacity-10 animate-bounce" style={{animationDuration:'3s'}}><Heart className="h-12 w-12 text-white" /></div>
      <div className="absolute bottom-16 right-16 opacity-10 animate-bounce" style={{animationDuration:'4s',animationDelay:'1s'}}><Stethoscope className="h-12 w-12 text-white" /></div>

      {/* Card */}
      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="p-8 pb-6 text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-2xl border border-white/30 mb-4 animate-pulse-glow">
              <Activity className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Rural PHC Portal</h2>
            <p className="text-white/70 text-sm mt-1">Patient Registration & Visit Management System</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-t-3xl p-8 pt-6">
            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm animate-fade-in">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="h-4.5 w-4.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@phc.org"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none bg-slate-50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="h-4.5 w-4.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password" required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none bg-slate-50 transition"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-white shadow-lg transition text-sm disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0f766e, #0369a1)' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <span>Authenticating...</span>
                  </span>
                ) : 'Sign In to Portal →'}
              </button>
            </form>

            {/* Quick Demo Presets */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center space-x-1">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
                <span>Quick Demo Sign-In</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.role} type="button"
                    onClick={() => fillPreset(p)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold text-white transition shadow-md bg-gradient-to-br ${p.color} ${
                      activePreset === p.role ? 'ring-2 ring-offset-1 ring-teal-400 scale-105' : 'hover:scale-105'
                    } transform`}
                  >
                    {p.role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
