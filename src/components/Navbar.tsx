import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

const Navbar: React.FC = () => {
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

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="nav-link">Home</Link>
            <a href="#" className="nav-link">Categories</a>
            <a href="#" className="nav-link">Deals</a>
            <Link to="/cart" className="nav-link">Cart</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
