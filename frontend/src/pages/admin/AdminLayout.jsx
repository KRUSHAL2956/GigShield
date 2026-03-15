import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Radio, AlertTriangle, TrendingUp, LogOut } from 'lucide-react';

const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'Company Overview', icon: LayoutDashboard },
  { to: '/admin/riders', label: 'Riders Directory', icon: Users },
  { to: '/admin/triggers', label: 'Live Triggers', icon: Radio },
  { to: '/admin/fraud', label: 'Fraud Detection', icon: AlertTriangle },
  { to: '/admin/analytics', label: 'Analytics & Fund', icon: TrendingUp },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('gigshield_token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed inset-y-0 left-0 bg-ink border-r border-[#2d204a] p-5 z-40 text-white">
        <div className="flex items-center gap-2.5 mb-10 px-2 mt-2 bg-white rounded-lg p-2 max-w-max">
          <img src="/logo.png" alt="GigShield Logo" className="h-8 object-contain" />
          <span className="text-indigo-400 text-xs tracking-normal ml-1 border rounded px-1.5 py-0.5 border-indigo-400/30">ADMIN</span>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="text-[10px] font-bold text-[#8c7baf] uppercase tracking-wider mb-3 px-3">Admin Panel</p>
          
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo text-white shadow-soft' 
                    : 'text-[#a295c2] hover:bg-[#251842] hover:text-white'
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

        <div className="pt-5 border-t border-[#2d204a] mt-auto">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-coral hover:bg-coral/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 relative min-h-screen">
        {/* Mobile Nav Header */}
        <header className="md:hidden sticky top-0 z-30 bg-ink text-white h-14 flex items-center justify-between px-5 border-b border-[#2d204a]">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 -ml-1 text-[#a295c2]"
            >
              <Users className="w-6 h-6" />
            </button>
            <span className="font-display font-bold text-lg">GigShield Admin</span>
          </div>
          <button onClick={handleLogout} className="text-coral">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside className={`fixed inset-y-0 left-0 w-64 bg-ink z-50 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-5 flex flex-col h-full text-white">
            <div className="flex items-center justify-between mb-8">
              <img src="/logo.png" alt="GigShield Logo" className="h-6 object-contain bg-white rounded p-1" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#a295c2]">
                <LogOut className="w-5 h-5 rotate-180" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {ADMIN_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive ? 'bg-indigo text-white shadow-soft' : 'text-[#a295c2]'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button onClick={handleLogout} className="mt-auto pt-5 border-t border-[#2d204a] flex items-center gap-3 text-coral">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>
        
        <main className="max-w-6xl mx-auto px-5 py-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
