import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 inset-x-0 z-50">
      {/* Main Navbar */}
      <nav className={`transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-white py-4'
      }`}>
        <div className="container-custom flex items-center justify-between">
          
          {/* Minimal Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.16, 1, 0.3, 1]
              }}
              className="relative"
            >
              <img src="/logo.png" alt="GigShield Logo" className="h-8 md:h-10 relative z-10" />
            </motion.div>
          </Link>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#problem" className="text-sm font-bold text-forest hover:text-mint transition-colors">Problem</a>
            <a href="#how-it-works" className="text-sm font-bold text-forest hover:text-mint transition-colors">How it works</a>
            <a href="#cities" className="text-sm font-bold text-forest hover:text-mint transition-colors">Cities</a>
            <Link to="/faq" className="text-sm font-bold text-forest hover:text-mint transition-colors">FAQ</Link>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-4">
             <Link to="/login" className="hidden lg:block text-sm font-bold text-forest hover:text-mint transition-colors mr-2">Log in</Link>
             
             {/* Mobile Menu Toggle */}
             <button 
               className="lg:hidden w-10 h-10 flex items-center justify-center text-forest"
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               aria-label="Toggle mobile menu"
               aria-expanded={mobileMenuOpen}
               aria-controls="mobile-menu"
             >
               {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
          
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-border overflow-hidden"
            id="mobile-menu"
          >
            <div className="container-custom py-8 flex flex-col gap-6">
              {[
                { name: 'Problem', href: '#problem' },
                { name: 'How it works', href: '#how-it-works' },
                { name: 'Cities', href: '#cities' },
                { name: 'FAQ', to: '/faq' },
              ].map((item) => (
                item.to ? (
                  <Link 
                    key={item.name} 
                    to={item.to} 
                    className="text-lg font-bold text-forest hover:text-mint transition-colors flex items-center justify-between"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                    <ArrowRight size={18} className="opacity-20" />
                  </Link>
                ) : (
                  <a 
                    key={item.name} 
                    href={item.href} 
                    className="text-lg font-bold text-forest hover:text-mint transition-colors flex items-center justify-between"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                    <ArrowRight size={18} className="opacity-20" />
                  </a>
                )
              ))}
              <div className="pt-6 border-t border-border flex flex-col gap-4">
                <Link to="/login" className="text-lg font-bold text-forest w-full text-center py-4 bg-forest text-white rounded-xl" onClick={() => setMobileMenuOpen(false)}>Log in / Sign Up</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
