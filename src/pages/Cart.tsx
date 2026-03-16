import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="bg-white rounded-[3rem] p-16 border border-brand-100 shadow-sm">
          <ShoppingBag size={80} className="mx-auto text-brand-200 mb-6" />
          <h2 className="text-3xl font-serif font-bold text-brand-900 mb-4">Your cart is empty</h2>
          <p className="text-brand-600 mb-8 max-w-md mx-auto">
            Looks like you haven't added any delicious pickles to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center bg-brand-600 text-white px-8 py-4 rounded-full font-bold hover:bg-brand-700 transition-all"
          >
            Start Shopping
            <ArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-brand-900 mb-12">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={`${item.id}-${item.size}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-6 rounded-3xl border border-brand-100 shadow-sm flex flex-col sm:flex-row items-center gap-6"
              >
                <img
                  src={item.image || '/images/products/veg_default.png'}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded-2xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const category = item.category.toLowerCase();
                    if (category.includes('non') || category.includes('nv')) {
                      target.src = '/images/products/nv_default.png';
                    } else if (category.includes('podi')) {
                      target.src = '/images/products/podi_default.png';
                    } else {
                      target.src = '/images/products/veg_default.png';
                    }
                  }}
                />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-serif font-bold text-brand-900 mb-1">{item.name}</h3>
                  <p className="text-brand-500 text-sm mb-1">{item.category}</p>
                  <p className="text-orange-600 text-xs font-bold mb-4 uppercase tracking-wider bg-orange-50 inline-block px-2 py-0.5 rounded-md">Size: {item.size}</p>

                  <div className="flex items-center justify-center sm:justify-start space-x-4">
                    <div className="flex items-center bg-brand-50 rounded-xl p-1 border border-brand-100">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-brand-600"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center font-bold text-brand-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-brand-600"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-brand-900">₹{item.price * item.quantity}</p>
                  <p className="text-sm text-brand-400">₹{item.price} / unit</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-sm sticky top-24">
            <h2 className="text-2xl font-serif font-bold text-brand-900 mb-8">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-brand-600">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between text-brand-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="border-t border-brand-100 pt-4 flex justify-between text-xl font-bold text-brand-900">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-700 transition-all flex items-center justify-center group"
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-center text-brand-400 text-xs mt-6">
              Secure checkout powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
