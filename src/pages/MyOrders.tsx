import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { 
  Package, Calendar, ShoppingBag, 
  ChevronRight, Clock, CheckCircle, Truck, AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const MyOrders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef, 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getPaymentStatusDisplay = (status: string) => {
    if (status === 'pending') return 'Waiting for payment confirmation';
    if (status === 'confirmed') return 'Payment Confirmed';
    return status;
  };

  const getOrderStatusDisplay = (status: string) => {
    if (status === 'shipped') return 'Shipped';
    if (status === 'delivered') return 'Delivered';
    if (status === 'processing') return 'Processing';
    if (status === 'pending') return 'Pending Verification';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="text-emerald-500" size={18} />;
      case 'shipped': return <Truck className="text-blue-500" size={18} />;
      case 'processing': return <Package className="text-amber-500" size={18} />;
      case 'confirmed': return <CheckCircle className="text-brand-500" size={18} />;
      case 'pending': return <Clock className="text-amber-500" size={18} />;
      default: return <AlertCircle className="text-gray-400" size={18} />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="p-6 bg-brand-50 rounded-full text-brand-500">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-brand-900">Please Login to view your orders</h2>
        <Link to="/login" className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-brand-900 mb-2">My Orders</h1>
          <p className="text-brand-500 font-medium">Track and manage your delicious pickle orders</p>
        </div>
        <Link 
          to="/products" 
          className="inline-flex items-center text-brand-600 font-bold hover:text-brand-700 transition-colors"
        >
          Explore More Pickles <ChevronRight size={20} className="ml-1" />
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={order.id} 
              className="bg-white rounded-[2.5rem] border border-brand-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-brand-100/20 transition-all duration-300"
            >
              <div className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8 pb-8 border-b border-brand-50">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                      <Package size={32} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-300">Order ID</span>
                        <p className="font-bold text-brand-900 capitalize">#{order.orderId || order.id.slice(0, 8)}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="text-sm text-brand-500 flex items-center">
                          <Calendar size={14} className="mr-1.5" />
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="px-5 py-3 bg-brand-50 rounded-2xl border border-brand-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-300 mb-1">Payment Status</p>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.paymentStatus)}
                        <p className="font-bold text-brand-900 text-sm">{getPaymentStatusDisplay(order.paymentStatus)}</p>
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-brand-50 rounded-2xl border border-brand-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-300 mb-1">Order Status</p>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.orderStatus)}
                        <p className="font-bold text-brand-900 text-sm">{getOrderStatusDisplay(order.orderStatus)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-brand-300 mb-6">Items Ordered</h3>
                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-brand-50/50 rounded-2xl border border-brand-50">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-brand-600 border border-brand-100">
                              {item.quantity}x
                            </div>
                            <div>
                              <p className="font-bold text-brand-900">{item.name}</p>
                              <p className="text-[10px] font-bold text-brand-400 uppercase tracking-tighter">{item.size}</p>
                            </div>
                          </div>
                          <p className="font-bold text-brand-900">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-brand-900 rounded-[2rem] p-8 text-white h-full flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-brand-400 mb-6">Order Total</h3>
                        <p className="text-4xl font-black mb-2">₹{order.totalPrice || order.total}</p>
                        <p className="text-brand-400 text-sm font-medium">Includes GST and Delivery charges</p>
                      </div>
                      <div className="mt-8 pt-8 border-t border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-2">Shipping to</p>
                        <p className="text-sm font-bold text-brand-100 leading-relaxed truncate">{order.address}</p>
                        <p className="text-sm font-medium text-brand-400">{order.city}, {order.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-20 border-2 border-dashed border-brand-100 text-center">
          <div className="p-8 bg-brand-50 rounded-full inline-block mb-8 text-brand-200">
            <ShoppingBag size={80} />
          </div>
          <h3 className="text-3xl font-serif font-bold text-brand-900 mb-4">No orders yet</h3>
          <p className="text-brand-500 max-w-sm mx-auto mb-10 text-lg font-medium">
            You haven't placed any orders yet. Start your journey with our authentic Rajamahendravaram flavours.
          </p>
          <Link 
            to="/products" 
            className="inline-block bg-brand-600 text-white px-12 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-100 hover:scale-105 transition-all"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
