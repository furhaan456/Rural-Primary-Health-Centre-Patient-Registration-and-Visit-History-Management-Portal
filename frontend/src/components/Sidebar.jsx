// Sidebar navigation component tailored to logged-in user role
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, UserPlus, Search, Stethoscope, Calendar, BarChart3, Users } from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  if (!user) return null;

  const getDashboardPath = () => {
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/reception/dashboard';
  };

  const navItems = [
    { label: 'Dashboard', path: getDashboardPath(), icon: LayoutDashboard, roles: ['admin', 'doctor', 'receptionist'] },
    { label: 'Register Patient', path: '/patients/register', icon: UserPlus, roles: ['admin', 'receptionist'] },
    { label: 'Search Patients', path: '/patients/search', icon: Search, roles: ['admin', 'doctor', 'receptionist'] },
    { label: 'Follow-ups Today', path: '/follow-ups', icon: Calendar, roles: ['admin', 'doctor', 'receptionist'] },
    { label: 'PHC Analytics', path: '/admin/reports', icon: BarChart3, roles: ['admin'] },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between">
      <nav className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Navigation Menu
        </div>

        {navItems
          .filter(item => item.roles.includes(user.role))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Rural PHC Node #102</p>
        <p>System Status: Active</p>
      </div>
    </aside>
  );
};

export default Sidebar;
