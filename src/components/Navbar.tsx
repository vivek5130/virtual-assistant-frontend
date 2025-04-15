import React, { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-indigo-600 animate-bounce" />
            <span className="ml-2 text-2xl font-bold text-indigo-700 tracking-wide">
              Shop<span className="text-yellow-400">Smart</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="nav-link">Home</Link>
            <a href="#shopByCategory" className="nav-link">Categories</a>
            <a href="#" className="nav-link">Deals</a>
            <Link to="/cart" className="nav-link">Cart</Link>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="text-indigo-700 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 px-6 pt-2 pb-4 shadow-md">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-800 font-medium">Home</Link>
          <a href="#shopByCategory" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-800 font-medium">Categories</a>
          <a href="#" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-800 font-medium">Deals</a>
          <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-800 font-medium">Cart</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
