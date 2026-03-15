import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'py-3 bg-[#06060f]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]'
        : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-[0_0_16px_rgba(139,92,246,0.4)]">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">GigShield</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: 'Problem', href: '#problem' },
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Cities', href: '#cities' },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all duration-200"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-white/70 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all duration-200"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
              boxShadow: '0 4px 16px rgba(109,40,217,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            Get Coverage
          </Link>
        </div>

      </div>
    </nav>
  );
}

