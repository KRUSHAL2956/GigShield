import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Trophy, FileText, Activity, User, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';

const RIDER_NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/score', label: 'Rider Score', icon: Trophy },
  { to: '/policy', label: 'My Policy', icon: FileText },
  { to: '/claims', label: 'Claims', icon: Activity },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { rider, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Even if the API call fails, we should clear local state and redirect
      navigate('/login');
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed inset-y-0 left-0 bg-white border-r border-border p-5 z-40">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-10 px-2 mt-2">
        <img src="/logo.png" alt="GigShield Logo" className="h-8 object-contain" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-3 px-3">Main Menu</p>
        
        {RIDER_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-black transition-all ${
                isActive 
                  ? 'bg-forest text-mint shadow-lg shadow-mint/5' 
                  : 'text-ink-muted hover:bg-mint/5 hover:text-forest'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="pt-5 border-t border-border mt-auto">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-mint/10 flex items-center justify-center text-forest font-black text-sm border border-mint/20">
            {rider?.name?.charAt(0) || 'R'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{rider?.name || 'Rider'}</p>
            <p className="text-xs text-ink-muted truncate">{rider?.phone || 'Phone not available'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-coral hover:bg-coral-soft transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
