// Navbar component displaying PHC Portal header, user badge, and logout button
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-teal-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg text-teal-700">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Rural PHC Healthcare Portal</h1>
            <p className="text-xs text-teal-100 font-medium">Primary Health Centre Patient & Visit Manager</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none">{user.fullName || user.name}</p>
              <span className="text-xs inline-block mt-1 px-2 py-0.5 rounded-full bg-teal-800 text-teal-200 capitalize font-medium">
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-1 bg-teal-800 hover:bg-teal-900 text-teal-100 px-3 py-1.5 rounded-md text-sm transition"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
