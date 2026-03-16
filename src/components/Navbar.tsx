import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { items } = useCart();
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-brand-700">Rajamahendravaram Pickles</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-brand-900 hover:text-brand-600 font-medium">Home</Link>
            <Link to="/products" className="text-brand-900 hover:text-brand-600 font-medium">Shop</Link>
            {isAdmin && (
              <Link to="/admin" className="text-brand-900 hover:text-brand-600 font-medium">Admin</Link>
            )}
            {user && (
              <Link to="/orders" className="text-brand-900 hover:text-brand-600 font-medium">Orders</Link>
            )}
            <div className="flex items-center space-x-4 border-l border-brand-200 pl-8">
              <Link to="/cart" className="relative p-2 text-brand-900 hover:text-brand-600">
                <ShoppingCart size={24} />
                {items.length > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Link>
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="p-2 text-brand-900 hover:text-brand-600">
                    <User size={24} />
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-brand-900 hover:text-brand-600">
                    <LogOut size={24} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-brand-600 text-white px-6 py-2 rounded-full font-medium hover:bg-brand-700 transition-colors">
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-brand-900">
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-brand-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-brand-900">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-brand-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-brand-900 font-medium">Home</Link>
            <Link to="/products" className="block px-3 py-2 text-brand-900 font-medium">Shop</Link>
            {isAdmin && (
              <Link to="/admin" className="block px-3 py-2 text-brand-900 font-medium">Admin</Link>
            )}
            {user && (
              <Link to="/orders" className="block px-3 py-2 text-brand-900 font-medium">Orders</Link>
            )}
            {user ? (
              <>
                <Link to="/profile" className="block px-3 py-2 text-brand-900 font-medium">Profile</Link>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-brand-900 font-medium">Logout</button>
              </>
            ) : (
              <Link to="/login" className="block px-3 py-2 text-brand-900 font-medium">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
