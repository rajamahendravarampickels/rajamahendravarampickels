import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { Product, Order, UserProfile } from '../types';
import { 
  Plus, Trash2, Edit2, Package, ShoppingBag, 
  Users, DollarSign, X, Check, FileDown, RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

const AdminPanel: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users' | 'settings'>('products');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState({
    heroTitle: 'Authentic Taste of Tradition',
    heroSubtitle: 'Handcrafted homemade pickles made with premium ingredients and age-old family recipes. No preservatives, just pure love.',
    siteEmail: 'rajamahendravarampickels@gmail.com',
    sitePhone: '+91 ••••• •••••',
    siteAddress: 'Rajamahendravaram, Andhra Pradesh'
  });
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'veg',
    description: '',
    image: '',
    sizes: [
      { label: '200g', price: 0 },
      { label: '400g', price: 0 },
      { label: '900g', price: 0 }
    ],
    stock: 0,
    isSoldOut: false
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setNewProduct(prev => ({ ...prev, image: url }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error('Access denied. Admins only.');
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    setLoading(true);
    
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
      setLoading(false);
    });

    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setTotalUsers(snap.size);
      setUsers(snap.docs.map(doc => ({ ...doc.data() })) as UserProfile[]);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubUsers();
    };
  }, [isAdmin]);

  // Removed hardcoded bulk import as requested (No manual coding/sample data)


  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData: any = {
        name: newProduct.name,
        category: newProduct.category,
        description: newProduct.description,
        image: newProduct.image,
        sizes: newProduct.sizes,
        stock: newProduct.stock,
        isSoldOut: newProduct.stock === 0 ? true : newProduct.isSoldOut,
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Product updated successfully!');
      } else {
        productData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'products'), productData);
        toast.success('Product added successfully!');
      }
      setShowAddModal(false);
      setEditingProduct(null);
      setNewProduct({
        name: '',
        category: 'veg',
        description: '',
        image: '',
        sizes: [
          { label: '250g', price: 0 },
          { label: '500g', price: 0 },
          { label: '1kg', price: 0 }
        ],
        stock: 0,
        isSoldOut: false
      });
    } catch (error) {
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to add product');
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      description: product.description,
      image: product.image,
      sizes: product.sizes || [
        { label: '250g', price: 0 },
        { label: '500g', price: 0 },
        { label: '1kg', price: 0 }
      ],
      stock: product.stock || 0,
      isSoldOut: product.isSoldOut || false
    });
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const updateOrderStatus = async (orderId: string, updates: any) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), updates);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, ...updates } : null);
      }
      const statusLabel = updates.orderStatus || updates.paymentStatus || 'updated';
      toast.success(`Order marked as ${statusLabel}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteOrder = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteDoc(doc(db, 'orders', id));
      toast.success('Order deleted');
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };
  const handleClearAllOrders = async () => {
    if (!window.confirm('CRITICAL WARNING: This will permanently delete ALL orders from the database. This action cannot be undone. Are you sure you want to start fresh?')) return;
    
    const password = window.prompt('Please type "DELETE" to confirm:');
    if (password !== 'DELETE') {
      toast.error('Deletions cancelled. Confirmation failed.');
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);
      orders.forEach((order) => {
        batch.delete(doc(db, 'orders', order.id));
      });
      await batch.commit();
      toast.success('All orders have been cleared. You are starting fresh!');
    } catch (error) {
      console.error('Error clearing orders:', error);
      toast.error('Failed to clear all orders. Some might remain.');
    } finally {
      setLoading(false);
    }
  };




  const exportOrdersToExcel = () => {
    if (orders.length === 0) {
      toast.error('No orders to export');
      return;
    }

    try {
      const flatData = orders.map(order => ({
        'Order ID': order.id,
        'Name': order.name || 'N/A',
        'Phone': order.phone,
        'Address': order.address,
        'City': order.city || 'N/A',
        'Pincode': order.pincode || 'N/A',
        'Items': order.items?.map(i => `${i.name} x${i.quantity || (i as any).qty || 0}`).join(', ') || 'N/A',
        'Total Price': order.total || order.totalPrice || 0,
        'Payment Method': order.paymentMethod || 'N/A',
        'Payment Status': order.paymentStatus || 'pending',
        'Status': order.orderStatus?.toUpperCase() || 'PENDING',
        'Created At': order.createdAt?.toDate ? order.createdAt.toDate().toString() : 'Recently'
      }));

      const worksheet = XLSX.utils.json_to_sheet(flatData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      const timestamp = new Date().toLocaleString().replace(/[\/:]/g, '-');
      saveAs(data, `orders rajamahendravarampickels_${timestamp}.xlsx`);
      
      toast.success('Excel downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export orders');
    }
  };

  if (authLoading || loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <h1 className="text-4xl font-serif font-black text-brand-900 tracking-tight">Admin Dashboard</h1>
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-brand-100 shadow-sm overflow-x-auto max-w-full">
          {(['products', 'orders', 'users'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'text-brand-500 hover:bg-brand-50'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-brand-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-brand-50 rounded-2xl text-brand-600"><ShoppingBag /></div>
            <span className="text-2xl font-bold text-brand-900">{products.length}</span>
          </div>
          <p className="text-brand-500 font-medium">Total Products</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-brand-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-brand-50 rounded-2xl text-brand-600"><Package /></div>
            <span className="text-2xl font-bold text-brand-900">{orders.length}</span>
          </div>
          <p className="text-brand-500 font-medium">Total Orders</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-brand-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-brand-50 rounded-2xl text-brand-600"><Users /></div>
            <span className="text-2xl font-bold text-brand-900">{totalUsers}</span>
          </div>
          <p className="text-brand-500 font-medium">Total Customers</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-brand-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-brand-50 rounded-2xl text-brand-600"><DollarSign /></div>
            <span className="text-2xl font-bold text-brand-900">₹{orders.reduce((sum, o) => sum + (o.totalPrice || o.total || 0), 0).toLocaleString('en-IN')}</span>
          </div>
          <p className="text-brand-500 font-medium">Total Revenue</p>
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-serif font-bold text-brand-900">Product Management</h2>
            <div className="flex flex-wrap gap-3">

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-brand-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-brand-700 transition-all shadow-lg shadow-brand-100"
              >
                <Plus size={20} className="mr-2" /> Add Product
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-brand-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-brand-50 text-brand-900 font-bold">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-4">
                      <img 
                        src={product.image || '/images/products/veg_default.png'} 
                        alt="" 
                        className="w-12 h-12 rounded-xl object-cover" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const category = product.category.toLowerCase();
                          if (category.includes('non') || category.includes('nv')) {
                            target.src = '/images/products/nv_default.png';
                          } else if (category.includes('podi')) {
                            target.src = '/images/products/podi_default.png';
                          } else {
                            target.src = '/images/products/veg_default.png';
                          }
                        }}
                      />
                      <span className="font-bold text-brand-900">{product.name}</span>
                    </td>
                    <td className="px-6 py-4 text-brand-600">{product.category}</td>
                    <td className="px-6 py-4 font-bold text-brand-900">
                      {product.sizes && product.sizes.length > 0 ? `₹${product.sizes[0].price}+` : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${product.isSoldOut ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {product.isSoldOut ? 'Sold Out' : `${product.stock || 0} in stock`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="p-2 text-brand-400 hover:text-brand-600 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-serif font-bold text-brand-900">Order Management</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleClearAllOrders}
                className="bg-red-50 text-red-600 px-5 py-3 rounded-2xl font-bold flex items-center hover:bg-red-600 hover:text-white transition-all border border-red-100"
              >
                <Trash2 size={18} className="mr-2" /> Clear All
              </button>
              <button
                onClick={exportOrdersToExcel}
                className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                <FileDown size={20} className="mr-2" /> Download Excel
              </button>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] border border-brand-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-brand-50 text-brand-900 font-bold border-b border-brand-100">
                  <tr>
                    <th className="px-6 py-5">Order ID</th>
                    <th className="px-6 py-5">Customer</th>
                    <th className="px-6 py-5">Items</th>
                    <th className="px-6 py-5">Total</th>
                    <th className="px-6 py-5">Payment</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {orders.map((order) => (
                    <tr 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-brand-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-5 font-black text-brand-600 tracking-tighter">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-brand-900">{order.name || 'Not provided'}</span>
                          <span className="text-[10px] text-brand-400 font-medium">{order.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col space-y-1">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex flex-col text-[10px] py-1 border-b border-brand-50 last:border-0">
                              <span className="font-bold text-brand-800">{item.name}</span>
                              <div className="flex justify-between items-center text-brand-500">
                                <span className="uppercase font-black text-orange-600">{item.size}</span>
                                <span className="font-medium">x{item.quantity || (item as any).qty || 0}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 font-black text-brand-900 text-lg">₹{order.totalPrice || order.total}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">{order.paymentMethod}</span>
                          <span className={`text-[10px] font-bold ${order.paymentStatus === 'confirmed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {order.paymentStatus?.toUpperCase() || 'PENDING'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          order.orderStatus === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          order.orderStatus === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          order.orderStatus === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="p-3 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-600 hover:text-white transition-all shadow-sm"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteOrder(e, order.id)}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-brand-900">Customer Management</h2>
            <div className="bg-brand-50 px-4 py-2 rounded-xl text-brand-600 font-bold text-sm">
              {users.length} Registered Users
            </div>
          </div>
          <div className="bg-white rounded-[2rem] border border-brand-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-brand-50 text-brand-900 font-bold border-b border-brand-100">
                  <tr>
                    <th className="px-6 py-5">Name</th>
                    <th className="px-6 py-5">Email</th>
                    <th className="px-6 py-5">Role</th>
                    <th className="px-6 py-5">Phone</th>
                    <th className="px-6 py-5">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {users.map((user, idx) => (
                    <tr key={idx} className="hover:bg-brand-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center font-bold text-xs">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-bold text-brand-900">{user.name || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-brand-600 font-medium">{user.email}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-sky-100 text-sky-700' : 'bg-brand-100 text-brand-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-brand-500 font-medium">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-5 text-brand-500 text-sm truncate max-w-xs">{user.address || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden relative shadow-2xl"
          >
            {/* Header */}
            <div className="bg-brand-50 px-8 py-6 border-b border-brand-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-serif font-bold text-brand-900">Order Details</h2>
                <p className="text-brand-400 text-xs font-bold uppercase tracking-widest">#{selectedOrder.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-2 bg-white text-brand-400 hover:text-brand-900 rounded-xl shadow-sm transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-brand-300 tracking-widest">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2 border-l-2 border-brand-100 pl-4 py-1">
                      <div>
                        <p className="text-[10px] font-black uppercase text-brand-300">Name</p>
                        <p className="font-bold text-brand-900">{selectedOrder.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-brand-300">Phone</p>
                        <p className="font-bold text-brand-900">{selectedOrder.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-brand-300">Address Line</p>
                        <p className="font-medium text-brand-800 text-sm">{selectedOrder.address || 'N/A'}</p>
                      </div>
                      <div className="flex space-x-8">
                        <div>
                          <p className="text-[10px] font-black uppercase text-brand-300">City</p>
                          <p className="font-bold text-brand-900">{selectedOrder.city || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-brand-300">Pincode</p>
                          <p className="font-black text-brand-600 tracking-tight">{selectedOrder.pincode || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-brand-300 tracking-widest">Payment Information</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2 border-l-2 border-brand-100 pl-4 py-1">
                      <div>
                        <p className="text-[10px] font-black uppercase text-brand-300">Method</p>
                        <p className="font-bold text-brand-900">{selectedOrder.paymentMethod || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-brand-300">Payment Status</p>
                        <p className="font-bold text-brand-900 capitalize">{selectedOrder.paymentStatus || 'pending'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-brand-300">Payment Info</p>
                        <p className="font-medium text-brand-800 text-sm">{selectedOrder.paymentInfo || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase text-brand-300">Quick Actions</p>
                      <div className="grid grid-cols-1 gap-2">
                        <button 
                          onClick={() => updateOrderStatus(selectedOrder.id, { paymentStatus: 'confirmed', orderStatus: 'processing' })}
                          className="px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all border border-emerald-100 text-left"
                        >
                          Confirm Payment
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(selectedOrder.id, { orderStatus: 'shipped' })}
                          className="px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all border border-blue-100 text-left"
                        >
                          Mark as Shipped
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(selectedOrder.id, { orderStatus: 'delivered' })}
                          className="px-4 py-2.5 bg-green-50 text-green-700 rounded-xl font-bold text-xs hover:bg-green-100 transition-all border border-green-100 text-left"
                        >
                          Mark as Delivered
                        </button>
                      </div>
                      <select 
                        value={selectedOrder.orderStatus}
                        onChange={(e) => updateOrderStatus(selectedOrder.id, { orderStatus: e.target.value })}
                        className="w-full p-4 bg-brand-50 border border-brand-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-bold text-brand-900 appearance-none cursor-pointer mt-4"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-brand-300 tracking-widest">Ordered Items</h3>
                <div className="bg-brand-50/50 rounded-3xl border border-brand-50 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-brand-50 text-[10px] font-black uppercase text-brand-400 tracking-tighter">
                      <tr>
                        <th className="px-6 py-3">Product</th>
                        <th className="px-6 py-3 text-center">Qty</th>
                        <th className="px-6 py-3 text-right">Price</th>
                        <th className="px-6 py-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-50">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} className="text-sm font-bold text-brand-900">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span>{item.name}</span>
                              <span className="text-[10px] text-orange-600 uppercase tracking-widest">{item.size}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">{item.quantity || (item as any).qty}</td>
                          <td className="px-6 py-4 text-right text-brand-500">₹{item.price}</td>
                          <td className="px-6 py-4 text-right">₹{(item.quantity || (item as any).qty) * item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total */}
              <div className="pt-6 border-t border-brand-50 flex justify-between items-center">
                <div className="flex items-center text-brand-400">
                  <DollarSign size={24} className="mr-2" />
                  <span className="font-bold">Total Payable</span>
                </div>
                <div className="text-4xl font-black text-brand-600">₹{selectedOrder.total}</div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-brand-50 p-8 border-t border-brand-100">
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="w-full bg-brand-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl"
              >
                Close Details
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 md:p-12 relative max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => {
                setShowAddModal(false);
                setEditingProduct(null);
                setNewProduct({
                  name: '',
                  category: 'veg',
                  description: '',
                  image: '',
                  sizes: [
                    { label: '250g', price: 0 },
                    { label: '500g', price: 0 },
                    { label: '1kg', price: 0 }
                  ],
                  stock: 0,
                  isSoldOut: false
                });
              }} 
              className="absolute top-8 right-8 text-brand-400 hover:text-brand-900"
            >
              <X size={24} />
            </button>
            <h2 className="text-3xl font-serif font-bold text-brand-900 mb-8">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-700 ml-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. Avakai"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-700 ml-2">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="veg">Veg</option>
                  <option value="nonveg">Non-Veg</option>
                  <option value="podi">Podi</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-700 ml-2">Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-700 ml-2">Status</label>
                <div 
                  onClick={() => setNewProduct({ ...newProduct, isSoldOut: !newProduct.isSoldOut })}
                  className={`w-full px-4 py-3 border-2 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${
                    newProduct.isSoldOut 
                      ? 'bg-red-50 border-red-200 text-red-700' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  <span className="font-bold">{newProduct.isSoldOut ? 'Sold Out' : 'In Stock'}</span>
                  {newProduct.isSoldOut ? <X size={20} /> : <Check size={20} />}
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <label className="text-sm font-bold text-brand-700 ml-2">Prices by Size (₹)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {newProduct.sizes.map((size, index) => (
                    <div key={size.label} className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-brand-400 ml-2">{size.label}</p>
                      <input
                        type="number"
                        required
                        value={size.price}
                        onChange={(e) => {
                          const updatedSizes = [...newProduct.sizes];
                          updatedSizes[index].price = Number(e.target.value);
                          setNewProduct({ ...newProduct, sizes: updatedSizes });
                        }}
                        className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-brand-700 ml-2">Product Image (Upload or URL)</label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="product-image-upload"
                    />
                    <label 
                      htmlFor="product-image-upload"
                      className="w-full flex items-center justify-center px-4 py-3 bg-brand-50 border-2 border-dashed border-brand-200 rounded-2xl cursor-pointer hover:border-brand-500 transition-all text-brand-600 font-bold"
                    >
                      {uploading ? 'Uploading...' : 'Click to upload image'}
                    </label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newProduct.image}
                      onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                      className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Or paste Image URL"
                    />
                  </div>
                </div>
                {newProduct.image && (
                  <div className="mt-2 flex items-center space-x-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                    <Check size={16} className="text-emerald-600" />
                    <span className="text-xs text-emerald-700 font-medium truncate">{newProduct.image}</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-brand-700 ml-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  placeholder="Describe the authentic flavor..."
                />
              </div>
              <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-100">
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
