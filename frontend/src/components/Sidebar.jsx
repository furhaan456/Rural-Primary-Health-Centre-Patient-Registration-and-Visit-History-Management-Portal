// Sidebar — role-based nav with gradient active state and system status
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, UserPlus, Search, Calendar, BarChart3, Wifi } from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  if (!user) return null;

  const getDashboardPath = () => {
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/reception/dashboard';
  };

  const navItems = [
    { label: 'Dashboard',       path: getDashboardPath(),      icon: LayoutDashboard, roles: ['admin', 'doctor', 'receptionist'] },
    { label: 'Register Patient',path: '/patients/register',   icon: UserPlus,         roles: ['admin', 'receptionist'] },
    { label: 'Search Patients', path: '/patients/search',     icon: Search,           roles: ['admin', 'doctor', 'receptionist'] },
    { label: 'Follow-ups Today',path: '/follow-ups',          icon: Calendar,         roles: ['admin', 'doctor', 'receptionist'] },
    { label: 'PHC Analytics',   path: '/admin/reports',       icon: BarChart3,        roles: ['admin'] },
  ];

  const roleGradient = {
    admin:        'from-violet-600 to-indigo-600',
    doctor:       'from-teal-600 to-emerald-600',
    receptionist: 'from-sky-600 to-cyan-600',
  };

  return (
    <aside className="w-64 bg-white/80 backdrop-blur border-r border-slate-200/80 min-h-[calc(100vh-65px)] p-3 flex flex-col justify-between shadow-sm">
      {/* Role Badge */}
      <div>
        <div className={`mb-4 rounded-xl p-3 bg-gradient-to-r ${roleGradient[user.role] || 'from-teal-600 to-cyan-600'} text-white`}>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Logged in as</p>
          <p className="text-sm font-bold mt-0.5">{user.full_name || user.fullName || user.name}</p>
          <p className="text-xs opacity-70 capitalize">{user.role}</p>
        </div>

        <p className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Navigation Menu</p>

        <nav className="space-y-0.5">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'nav-item-active bg-teal-50/80 text-teal-700 font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-teal-100 text-teal-700' : 'text-slate-400'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
        </nav>
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-slate-50 to-teal-50/50 p-3 rounded-xl border border-slate-200/60 text-xs">
        <div className="flex items-center space-x-2 mb-1">
          <span className="status-dot"></span>
          <p className="font-bold text-slate-700">Rural PHC Node #102</p>
        </div>
        <div className="flex items-center space-x-1 text-slate-500">
          <Wifi className="h-3 w-3 text-teal-500" />
          <p>System Status: <span className="text-emerald-600 font-semibold">Active</span></p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
