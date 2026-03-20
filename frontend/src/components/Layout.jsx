import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trophy, FileText, Activity, Shield } from 'lucide-react';
import Sidebar from './Sidebar';

const MOBILE_NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/score', label: 'Score', icon: Trophy },
  { to: '/policy', label: 'Policy', icon: FileText },
  { to: '/claims', label: 'Claims', icon: Activity },
];

export default function Layout() {
  const loc = useLocation();

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 relative min-h-screen pb-20 md:pb-0">
        
        {/* Mobile Top Header */}
        <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border h-14 flex items-center px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-forest flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-mint" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-forest tracking-tight">GigShield</span>
          </Link>
        </header>

        {/* Page Content */}
        <main className="max-w-5xl mx-auto px-5 py-8 md:p-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-border md:hidden z-50 pb-safe">
          <div className="flex">
            {MOBILE_NAV.map((n) => {
              const Icon = n.icon;
              const active = loc.pathname === n.to || 
                            loc.pathname.startsWith(n.to + '/') || 
                            (n.to === '/dashboard' && loc.pathname === '/');
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex-1 flex flex-col items-center py-2.5 transition-colors ${
                    active ? 'text-forest' : 'text-ink-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                  <span className={`text-[11px] font-bold mt-0.5 ${active ? 'text-forest' : 'text-ink-muted'}`}>{n.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
