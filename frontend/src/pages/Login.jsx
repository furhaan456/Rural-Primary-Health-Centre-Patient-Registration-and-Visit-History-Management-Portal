// User authentication login page with role demo presets
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') navigate('/admin/dashboard');
      else if (loggedUser.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/reception/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillPreset = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-teal-700 p-6 text-white text-center">
          <div className="inline-flex bg-white text-teal-700 p-3 rounded-full mb-3 shadow">
            <Activity className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Rural PHC Portal</h2>
          <p className="text-teal-100 text-sm mt-1">Patient Registration & Visit Manager</p>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center space-x-2 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="h-5 w-5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@phc.org"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="h-5 w-5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg shadow-md transition text-sm"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Demo Login Presets */}
          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>Quick Demo Sign-In Presets</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillPreset('admin@phc.org', 'Admin@123')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-1.5 px-2 rounded border border-slate-300 transition text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillPreset('doctor@phc.org', 'Doctor@123')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-1.5 px-2 rounded border border-slate-300 transition text-center"
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => fillPreset('receptionist@phc.org', 'Recept@123')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-1.5 px-2 rounded border border-slate-300 transition text-center"
              >
                Receptionist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
