import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MapPin, Phone, User, CreditCard, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import upiQr from '../assets/upi-qr.jpg';

const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    pincode: profile?.pincode || '',
    paymentMethod: 'UPI' as const
  });

  React.useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || profile.name || '',
        phone: prev.phone || profile.phone || '',
        address: prev.address || profile.address || '',
        city: prev.city || (profile as any).city || '',
        pincode: prev.pincode || (profile as any).pincode || ''
      }));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const ordersRef = collection(db, 'orders');
      const newOrderDoc = doc(ordersRef);
      const orderId = newOrderDoc.id;

      const orderData = {
        orderId,
        userId: user.uid,
        items,
        total,
        totalPrice: total,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        createdAt: serverTimestamp()
      };

      await setDoc(newOrderDoc, orderData);
      
      // Update user profile with latest shipping info
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          address: formData.address,
          phone: formData.phone,
          name: formData.name,
          email: user.email,
          city: formData.city,
          pincode: formData.pincode
        }, { merge: true });
      }

      setPlacedOrderId(orderId);
      setOrderPlaced(true);
      toast.success('Order placed successfully!');
      clearCart();
      // Keep user on page for WhatsApp step
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-900 mb-8 sm:mb-12">
        {orderPlaced ? 'Order Confirmation' : 'Checkout'}
      </h1>

      {orderPlaced ? (
        <div className="max-w-2xl mx-auto text-center bg-white p-8 sm:p-12 rounded-[2.5rem] border border-brand-100 shadow-xl shadow-brand-100/20">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-brand-900 mb-4">Order Received!</h2>
          <p className="text-brand-600 mb-8 text-lg font-medium">
            Your order <strong>#{placedOrderId.slice(0, 8).toUpperCase()}</strong> has been saved. 
            <br />
            Please send your payment screenshot on WhatsApp to confirm your order.
          </p>
          
          <div className="space-y-4">
            <a 
              href="https://wa.me/918884473734"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white py-5 rounded-2xl font-bold text-lg hover:bg-[#128C7E] transition-all flex items-center justify-center shadow-lg shadow-green-100"
            >
              <Phone className="mr-3" size={24} />
              Send Screenshot on WhatsApp
            </a>
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-brand-50 text-brand-700 py-5 rounded-2xl font-bold text-lg hover:bg-brand-100 transition-all"
            >
              Go to My Orders
            </button>
          </div>
          
          <p className="mt-8 text-sm text-brand-400 font-medium italic">
            Once verified, we will start processing your delicious order.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-brand-100 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-900 mb-6 sm:mb-8 flex items-center">
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

            <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-brand-100 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-900 mb-6 sm:mb-8 flex items-center">
                <CreditCard className="mr-3 text-brand-500" /> Payment Method
              </h2>
              <div className="bg-brand-50 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-brand-100 space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                  <div className="bg-white p-4 rounded-3xl shadow-sm border border-brand-100">
                    <img 
                      src={upiQr} 
                      alt="UPI QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <div className="space-y-4 text-center md:text-left">
                    <div>
                      <p className="text-[10px] font-black uppercase text-brand-400 tracking-widest mb-1">UPI ID</p>
                      <p className="font-bold text-brand-900 text-lg">sailakshmisaripuru-3@okhdfcbank</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-brand-400 tracking-widest mb-1">Email</p>
                      <p className="font-medium text-brand-700">rajamehendravarampickles@gmail.com</p>
                    </div>
                    <div className="bg-white/50 p-4 rounded-2xl border border-brand-100">
                      <p className="text-sm font-bold text-brand-900">Instructions:</p>
                      <p className="text-sm text-brand-600">Scan QR and pay. After payment click "I have completed payment".</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-brand-100 shadow-sm sticky top-24">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-900 mb-6 sm:mb-8">Order Summary</h2>
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
              {loading ? 'Processing...' : 'I have completed payment'}
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Checkout;
