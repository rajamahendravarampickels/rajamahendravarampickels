import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Order } from '../types';
import { 
  Package, MapPin, Phone, Mail, User, 
  Settings, LogOut, ShoppingBag, 
  Calendar, CreditCard, ChevronRight,
  UserCheck, ShieldCheck, Clock, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'address'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile?.name || '',
    address: profile?.address || '',
    phone: profile?.phone || ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        address: profile.address || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), editForm);
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
      // Wait a bit and reload or rely on AuthContext if it listener
      window.location.reload(); // Simple way to refresh profile from context
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'shipped': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'processing': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="p-6 bg-orange-50 rounded-full text-orange-500">
          <User size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Please Login to view Profile</h2>
        <Link to="/login" className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Cover Section */}
      <div className="h-64 md:h-80 bg-gradient-to-r from-orange-400 to-amber-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar / Brief Profile */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-white p-8">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 bg-orange-100 rounded-[2rem] flex items-center justify-center text-5xl font-black text-orange-600 shadow-inner rotate-3 hover:rotate-0 transition-transform duration-500">
                  {profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-orange-500">
                  <UserCheck size={20} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-3xl font-serif font-black text-gray-900">{profile?.name || 'Happy Customer'}</h2>
                  {isAdmin && <ShieldCheck size={20} className="text-sky-500" title="Admin User" />}
                </div>
                <p className="text-gray-500 font-medium flex items-center">
                  <Mail size={14} className="mr-2" />
                  {user.email}
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'overview' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  <div className="flex items-center">
                    <User size={18} className="mr-3" />
                  <span>Overview</span>
                  </div>
                  <ChevronRight size={16} className={activeTab === 'overview' ? 'opacity-100' : 'opacity-30'} />
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'orders' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  <div className="flex items-center">
                    <ShoppingBag size={18} className="mr-3" />
                  <span>My Orders</span>
                  </div>
                  <div className="flex items-center">
                    {!loading && orders.length > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full mr-2 ${activeTab === 'orders' ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}`}>
                        {orders.length}
                      </span>
                    )}
                    <ChevronRight size={16} className={activeTab === 'orders' ? 'opacity-100' : 'opacity-30'} />
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('address')}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'address' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-3" />
                  <span>Address</span>
                  </div>
                  <ChevronRight size={16} className={activeTab === 'address' ? 'opacity-100' : 'opacity-30'} />
                </button>
              </div>

              <div className="mt-8 pt-8 space-y-4">
                <Link to="/cart" className="w-full flex items-center justify-center p-4 bg-orange-50 text-orange-700 rounded-2xl font-bold hover:bg-orange-100 transition-all border border-orange-100">
                  <CreditCard size={18} className="mr-2" />
                  Manage Payments
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </button>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <ShoppingBag size={120} />
              </div>
              <h4 className="text-xl font-bold mb-2">Need help?</h4>
              <p className="text-emerald-200 text-sm mb-6">Our authentic Rajamahendravaram team is here for you 24/7.</p>
              <button className="bg-white text-emerald-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl">
                Contact Support
              </button>
            </div>
          </motion.div>

          {/* Main Display Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl inline-block mb-4">
                        <ShoppingBag size={24} />
                      </div>
                      <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Total Orders</p>
                      <h3 className="text-3xl font-black text-gray-900 mt-1">{orders.length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl inline-block mb-4">
                        <Calendar size={24} />
                      </div>
                      <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Member Since</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-1">March 2026</h3>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl inline-block mb-4">
                        <Package size={24} />
                      </div>
                      <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Total Savours</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-1">12 Pickles</h3>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                      <div className="flex items-center">
                        <Settings size={20} className="text-orange-600 mr-2" />
                        <h3 className="text-2xl font-serif font-bold text-gray-900">Personal Information</h3>
                      </div>
                      <button 
                        onClick={() => setShowEditModal(true)}
                        className="text-orange-600 font-bold text-sm hover:underline"
                      >
                        Edit Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Full Name</label>
                        <p className="text-lg font-bold text-gray-900">{profile?.name || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Email Address</label>
                        <p className="text-lg font-bold text-gray-900">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Phone</label>
                        <p className="text-lg font-bold text-gray-900">
                          {profile?.phone || <span className="italic text-gray-300">Not linked yet</span>}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Account Type</label>
                        <p className="text-lg font-bold text-gray-900 capitalize">{isAdmin ? 'Administrator' : 'Premium Member'}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-3xl font-serif font-black text-gray-900">Order History</h3>
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                      <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-xs font-bold">Recent</button>
                      <button className="px-4 py-1.5 text-xs text-gray-500 font-bold">Oldest</button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="bg-white rounded-[2.5rem] p-24 shadow-sm border border-gray-50 flex justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-50 border-b-orange-600"></div>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 group overflow-hidden">
                          <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center space-x-6">
                              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                <Package size={28} />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">ORDER</span>
                                  <p className="font-black text-gray-900">#{order.id.slice(-6).toUpperCase()}</p>
                                </div>
                                <div className="flex items-center mt-1 space-x-4">
                                  <p className="text-xs text-gray-500 flex items-center font-medium">
                                    <Calendar size={12} className="mr-1" />
                                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recently'}
                                  </p>
                                  <p className="text-xs text-gray-500 flex items-center font-bold">
                                    <ShoppingBag size={12} className="mr-1" />
                                    {order.items.length} Items
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-8">
                              <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Amount</p>
                                <p className="text-xl font-black text-orange-600">₹{order.total}</p>
                              </div>
                              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyles(order.status)}`}>
                                {order.status}
                              </span>
                              <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                                <ChevronRight size={18} />
                              </button>
                            </div>
                          </div>
                          
                          {/* Inner items preview */}
                          <div className="px-8 pb-8 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
                             {order.items.slice(0, 5).map((item, idx) => (
                               <div key={idx} className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border-2 border-white shadow-sm" title={item.name}>
                                  <div className="w-full h-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                                    {item.name.charAt(0)}
                                  </div>
                               </div>
                             ))}
                             {order.items.length > 5 && (
                               <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-500">
                                 +{order.items.length - 5}
                               </div>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-[3rem] p-20 border-2 border-dashed border-gray-100 text-center">
                      <div className="p-6 bg-gray-50 rounded-full inline-block mb-6 text-gray-300">
                        <ShoppingBag size={64} />
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 mb-2">Your pantry is empty!</h3>
                      <p className="text-gray-500 max-w-xs mx-auto mb-8 font-medium">Capture the authentic flavours of Rajamahendravaram today.</p>
                      <Link to="/products" className="bg-orange-600 text-white px-10 py-4 rounded-[1.5rem] font-bold shadow-xl shadow-orange-100 hover:scale-105 transition-all">
                        Browse Pickles
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'address' && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-serif font-black text-gray-900">Saved Addresses</h3>
                    <button className="bg-orange-50 text-orange-600 px-6 py-2.5 rounded-xl font-bold text-sm border border-orange-100 hover:bg-orange-600 hover:text-white transition-all">
                      Add New
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border-2 border-orange-100 shadow-xl shadow-orange-50/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                      <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl">
                        <MapPin size={24} />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="px-3 py-1 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md">Main Residence</span>
                    </div>

                    <div className="space-y-6 max-w-sm">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Shipping Destination</p>
                        <p className="text-lg font-bold text-gray-800 leading-relaxed">
                          {profile?.address || 'Rajamahendravaram, Andhra Pradesh'}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-8 pt-4 border-t border-gray-50">
                        <div className="flex items-center text-gray-500 text-sm font-bold">
                          <Phone size={14} className="mr-2" />
                          +91 ••••• •••••
                        </div>
                        <div className="flex items-center text-emerald-600 text-sm font-bold">
                          <Clock size={14} className="mr-2" />
                          Express Delivery Area
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex space-x-3">
                      <button 
                        onClick={() => setShowEditModal(true)}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-xl"
                      >
                        Edit Address
                      </button>
                      <button className="px-6 py-2.5 bg-white text-gray-400 rounded-xl font-bold text-sm border border-gray-100">Remove</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-12 relative"
          >
            <button 
              onClick={() => setShowEditModal(false)} 
              className="absolute top-8 right-8 text-brand-400 hover:text-brand-900"
            >
              <X size={24} />
            </button>
            <h2 className="text-3xl font-serif font-bold text-brand-900 mb-8">Update Details</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-700 ml-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-700 ml-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-700 ml-2">Delivery Address</label>
                <textarea
                  required
                  rows={3}
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={updating}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 disabled:opacity-50"
              >
                {updating ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
