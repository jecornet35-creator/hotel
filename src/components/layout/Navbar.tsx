import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useHotel } from '@/Hotelcontext';
import { Menu, X, Hotel } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const { config } = useHotel();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Chambres', path: '/rooms' },
    { name: 'Galerie', path: '/gallery' },
    { name: 'Services', path: '/#services' },
    { name: 'Contact', path: '/#contact' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith('/#')) {
      const id = path.substring(2);
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsOpen(false);
      }
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-zinc-100 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Hotel className="text-white" size={18} />
          </div>
          <span className="text-xl font-serif font-bold tracking-tight text-zinc-900">
            {config.hotelName}
          </span>
        </Link>
 
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-8 text-sm font-medium text-zinc-500">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={(e) => handleNavClick(e, link.path)}
                className={cn(
                  "hover:text-zinc-900 transition-colors relative py-1",
                  location.pathname === link.path && "text-zinc-900 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-zinc-900"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <Link 
            to="/booking" 
            className="bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10 active:scale-95"
          >
            Réserver
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={toggleMenu}
          className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-zinc-100 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link.path)}
                  className={cn(
                    "text-lg font-medium py-2 transition-colors",
                    location.pathname === link.path ? "text-zinc-900" : "text-zinc-500"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link 
                to="/booking" 
                onClick={() => setIsOpen(false)}
                className="bg-zinc-900 text-white px-6 py-4 rounded-2xl text-center font-bold shadow-xl shadow-zinc-900/10"
              >
                Réserver mon séjour
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
