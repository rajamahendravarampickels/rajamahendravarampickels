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
          <Link to="/" className="flex items-center space-x-3">
            <img src="/badge.svg" alt="Badge" className="h-10 w-10 object-contain drop-shadow-sm" />
            <span className="text-xl sm:text-2xl font-serif font-bold text-brand-700">Rajamahendravaram Pickles</span>
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
          <div className="md:hidden flex items-center space-x-2 sm:space-x-4">
            <Link to="/cart" className="relative p-2 text-brand-900">
              <ShoppingCart size={22} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-brand-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {items.length}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-brand-900 p-2">
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-brand-100 shadow-xl overflow-hidden">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-lg text-brand-900 font-bold border-b border-brand-50">Home</Link>
            <Link to="/products" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-lg text-brand-900 font-bold border-b border-brand-50">Shop</Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-lg text-brand-900 font-bold border-b border-brand-50">Admin Panel</Link>
            )}
            {user && (
              <Link to="/orders" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-lg text-brand-900 font-bold border-b border-brand-50">Orders History</Link>
            )}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-lg text-brand-900 font-bold border-b border-brand-50">My Profile</Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }} 
                  className="w-full text-left px-3 py-4 text-lg text-red-600 font-bold"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-4">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center bg-brand-600 text-white py-4 rounded-2xl font-bold">
                  Login / Signup
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
