// Navbar — gradient header with live clock, user badge, and logout
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Activity, Clock } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [time, setTime] = useState(new Date());

  // Live clock — updates every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatDate = (d) =>
    d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const roleColors = {
    admin:        'bg-violet-500/30 text-violet-100 border border-violet-400/40',
    doctor:       'bg-emerald-500/30 text-emerald-100 border border-emerald-400/40',
    receptionist: 'bg-sky-500/30 text-sky-100 border border-sky-400/40',
  };

  return (
    <header className="navbar-gradient text-white shadow-xl sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 backdrop-blur p-2 rounded-xl border border-white/30 animate-pulse-glow">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">Rural PHC Healthcare Portal</h1>
            <p className="text-xs text-teal-100/80 font-medium mt-0.5">Primary Health Centre Patient & Visit Manager</p>
          </div>
        </div>

        {/* Live Clock */}
        <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-xl border border-white/20">
          <Clock className="h-3.5 w-3.5 text-teal-200" />
          <div className="text-right">
            <p className="text-sm font-bold font-mono tracking-wider">{formatTime(time)}</p>
            <p className="text-xs text-teal-200/80">{formatDate(time)}</p>
          </div>
        </div>

        {/* User + Logout */}
        {user && (
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none">
                {user.full_name || user.fullName || user.name || 'User'}
              </p>
              <span className={`text-xs inline-block mt-1 px-2 py-0.5 rounded-full capitalize font-semibold ${roleColors[user.role] || 'bg-white/20'}`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition backdrop-blur"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
