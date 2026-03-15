import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl border-b border-border/50 py-3 shadow-sm' 
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="GigShield Logo" className="h-8 md:h-10 object-contain" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#problem" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors">Problem</a>
          <a href="#how-it-works" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors">How it works</a>
          <a href="#cities" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors">Cities</a>
          <Link to="/dashboard" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors">Dashboard Preview</Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/verify" className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-ink hover:text-indigo transition-colors">
            Log in
          </Link>
          <Link to="/register" className="btn-primary !py-2.5 !px-5 !text-sm !shadow-none">
            Get Coverage
          </Link>
        </div>
        
      </div>
    </nav>
  );
}
