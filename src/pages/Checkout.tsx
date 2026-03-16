import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MapPin, Phone, User, CreditCard, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: '',
    address: profile?.address || '',
    city: '',
    pincode: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: user.uid,
        items,
        total,
        address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
        phone: formData.phone,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      // Update user profile with latest shipping info if it's missing or if we want to keep it updated
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          address: formData.address,
          phone: formData.phone,
          name: formData.name
        });
      }

      toast.success('Order placed successfully!');
      clearCart();
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-brand-900 mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-brand-900 mb-8 flex items-center">
                <User className="mr-3 text-brand-500" /> Shipping Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-700 ml-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-4 bg-brand-50 border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-700 ml-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-4 bg-brand-50 border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-brand-700 ml-2">Full Address</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-4 bg-brand-50 border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-700 ml-2">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-4 bg-brand-50 border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-700 ml-2">Pincode</label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-4 py-4 bg-brand-50 border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-brand-900 mb-8 flex items-center">
                <CreditCard className="mr-3 text-brand-500" /> Payment Method
              </h2>
              <div className="p-6 border-2 border-brand-500 bg-brand-50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="text-brand-600 mr-4" />
                  <div>
                    <p className="font-bold text-brand-900">Cash on Delivery</p>
                    <p className="text-sm text-brand-600">Pay when you receive your pickles</p>
                  </div>
                </div>
                <span className="text-brand-600 font-bold">FREE</span>
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-sm sticky top-24">
            <h2 className="text-2xl font-serif font-bold text-brand-900 mb-8">Order Summary</h2>
            <div className="space-y-4 mb-8 max-h-64 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-brand-600">{item.quantity}x</span>
                    <div>
                      <p className="text-brand-900 font-medium truncate max-w-[120px]">{item.name}</p>
                      <p className="text-[10px] text-brand-400 uppercase font-bold">{item.size}</p>
                    </div>
                  </div>
                  <span className="font-medium text-brand-900">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-brand-100 pt-6 space-y-4 mb-8">
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
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-700 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : 'Place Order Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
