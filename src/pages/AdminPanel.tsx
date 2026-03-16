import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Order } from '../types';
import { 
  Plus, Trash2, Edit2, Package, ShoppingBag, 
  Users, DollarSign, X, Check, FileDown 
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
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Veg',
    description: '',
    image: '',
    sizes: [
      { label: '250g', price: 0 },
      { label: '500g', price: 0 },
      { label: '1kg', price: 0 }
    ]
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error('Access denied. Admins only.');
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productsSnap = await getDocs(collection(db, 'products'));
        setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);

        const ordersSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]);

        const usersSnap = await getDocs(collection(db, 'users'));
        setTotalUsers(usersSnap.size);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) fetchData();
  }, [isAdmin]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), newProduct);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...newProduct, id: editingProduct.id } as Product : p));
        toast.success('Product updated successfully!');
      } else {
        const docRef = await addDoc(collection(db, 'products'), newProduct);
        setProducts([...products, { id: docRef.id, ...newProduct } as Product]);
        toast.success('Product added successfully!');
      }
      setShowAddModal(false);
      setEditingProduct(null);
      setNewProduct({
        name: '',
        category: 'Veg',
        description: '',
        image: '',
        sizes: [
          { label: '250g', price: 0 },
          { label: '500g', price: 0 },
          { label: '1kg', price: 0 }
        ]
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
      ]
    });
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: status as any } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: status as any } : null);
      }
      toast.success(`Order marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const seedSampleData = async () => {
    const { writeBatch, doc } = await import('firebase/firestore');
    const batch = writeBatch(db);
    const getVegStandard = () => [{ label: "200g", price: 127 }, { label: "400g", price: 244 }, { label: "900g", price: 496 }];
    const getVegPremium = () => [{ label: "200g", price: 145 }, { label: "400g", price: 296 }, { label: "900g", price: 595 }];
    const getVegExotic = () => [{ label: "200g", price: 208 }, { label: "400g", price: 415 }, { label: "900g", price: 829 }];
    
    const getNVStandard = () => [{ label: "200g", price: 343 }, { label: "400g", price: 748 }, { label: "900g", price: 1486 }];
    const getNVPremium = () => [{ label: "200g", price: 487 }, { label: "400g", price: 946 }, { label: "900g", price: 1792 }];
    
    const getPodisStandard = () => [{ label: "200g", price: 154 }, { label: "400g", price: 298 }, { label: "900g", price: 595 }];
    const getPodisPremium = () => [{ label: "200g", price: 172 }, { label: "400g", price: 325 }, { label: "900g", price: 604 }];
    const getChilliPowder = () => [{ label: "200g", price: 199 }, { label: "400g", price: 397 }, { label: "900g", price: 775 }];

    const sampleProducts = [
      // Veg Pickles
      { name: "Avakaya", category: "Veg", description: "Traditional Andhra mango pickle.", image: "https://images.unsplash.com/photo-1589135398302-388bd658fb2c?w=800", sizes: getVegStandard() },
      { name: "Magaya", category: "Veg", description: "Sun-dried mango pickle.", image: "https://images.unsplash.com/photo-1589135398302-388bd658fb2c?w=800", sizes: getVegStandard() },
      { name: "Bellam Avakaya", category: "Veg", description: "Sweet and spicy mango pickle with jaggery.", image: "https://images.unsplash.com/photo-1589135398302-388bd658fb2c?w=800", sizes: getVegPremium() },
      { name: "Bellam Magaya", category: "Veg", description: "Sweet and spicy sun-dried mango pickle.", image: "https://images.unsplash.com/photo-1589135398302-388bd658fb2c?w=800", sizes: getVegPremium() },
      { name: "Gongura", category: "Veg", description: "Tangy sorrel leaves pickle.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800", sizes: getVegPremium() },
      { name: "Vellulli Avakaya", category: "Veg", description: "Garlic mango pickle.", image: "https://images.unsplash.com/photo-1589135398302-388bd658fb2c?w=800", sizes: getVegPremium() },
      { name: "Allam Pachchadi", category: "Veg", description: "Spicy ginger pickle.", image: "https://images.unsplash.com/photo-1590089415225-403ed3f96ca0?w=800", sizes: getVegPremium() },
      { name: "Tomato Pachchadi", category: "Veg", description: "Tangy tomato preserve.", image: "https://images.unsplash.com/photo-1590089415225-403ed3f96ca0?w=800", sizes: getVegPremium() },
      { name: "Grape Avakaya", category: "Veg", description: "Unique and tangy grape pickle.", image: "https://images.unsplash.com/photo-1590089415225-403ed3f96ca0?w=800", sizes: getVegExotic() },
      { name: "Pineapple Avakaya", category: "Veg", description: "Tropical pineapple with Andhra spices.", image: "https://images.unsplash.com/photo-1590089415225-403ed3f96ca0?w=800", sizes: getVegExotic() },
      { name: "Apple Avakaya", category: "Veg", description: "Crispy apple pieces in traditional spices.", image: "https://images.unsplash.com/photo-1590089415225-403ed3f96ca0?w=800", sizes: getVegExotic() },
      { name: "Guava Avakaya", category: "Veg", description: "Fresh guava with a spicy twist.", image: "https://images.unsplash.com/photo-1590089415225-403ed3f96ca0?w=800", sizes: getVegExotic() },
      { name: "Kakarkaya Pachchadi", category: "Veg", description: "Healthy and spicy bitter gourd pickle.", image: "https://images.unsplash.com/photo-1590089415225-403ed3f96ca0?w=800", sizes: getVegPremium() },
      { name: "Cauliflower Pachchadi", category: "Veg", description: "Crunchy cauliflower florets in pickle mix.", image: "https://images.unsplash.com/photo-1590089415225-403ed3f96ca0?w=800", sizes: getVegPremium() },
      { name: "Pandu Mirapakaya Pachchadi", category: "Veg", description: "Fiery red chilli pickle.", image: "https://images.unsplash.com/photo-1590089415225-403ed3f96ca0?w=800", sizes: getVegPremium() },
      { name: "Usirikaya Avakaya Pachchadi", category: "Veg", description: "Traditional amla gooseberry pickle.", image: "https://images.unsplash.com/photo-1590089415225-403ed3f96ca0?w=800", sizes: getVegPremium() },
      { name: "Chintakayala Pandu Mirchi Pachchadi", category: "Veg", description: "Tangy tamarind and red chilli mix.", image: "https://images.unsplash.com/photo-1590089415225-403ed3f96ca0?w=800", sizes: getVegPremium() },
      { name: "Pandu Mirchi Gongura Pachchadi", category: "Veg", description: "Sorrel leaves with hot red chillies.", image: "https://images.unsplash.com/photo-1590089415225-403ed3f96ca0?w=800", sizes: getVegPremium() },
      { name: "Pesara Avakaya", category: "Veg", description: "Mango pickle with moong dal powder.", image: "https://images.unsplash.com/photo-1589135398302-388bd658fb2c?w=800", sizes: getVegPremium() },
      { name: "Kothameera Pachchadi", category: "Veg", description: "Fresh coriander leaf pickle.", image: "https://images.unsplash.com/photo-1590089415225-403ed3f96ca0?w=800", sizes: getVegStandard() },
      { name: "Pudina Pachchadi", category: "Veg", description: "Aromatic mint leaf pickle.", image: "https://images.unsplash.com/photo-1590089415225-403ed3f96ca0?w=800", sizes: getVegStandard() },
      
      // NV Pickles
      { name: "Kodi Mamsam Pachadi (B/L)", category: "NV pickles", description: "Spicy boneless chicken pickle.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800", sizes: getNVStandard() },
      { name: "Meka Mamsam Pachadi (B/L)", category: "NV pickles", description: "Rich and spicy mutton pickle.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800", sizes: getNVPremium() },
      { name: "Royallu Pachadi", category: "NV pickles", description: "Flavorful prawn pickle.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800", sizes: getNVPremium() },
      { name: "Gongura Kodi Mamsam Pachadi (B/C)", category: "NV pickles", description: "Chicken pickle with tangy gongura.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800", sizes: getNVStandard() },
      { name: "Gongura Meka Mamsam Pachadi (B/L)", category: "NV pickles", description: "Mutton cooked with gongura leaves.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800", sizes: getNVPremium() },
      { name: "Gongura Royallu", category: "NV pickles", description: "Prawns cooked with gongura leaves.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800", sizes: getNVPremium() },
      { name: "Chapala Pachadi (B/L)", category: "NV pickles", description: "Delicious fish pickle.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800", sizes: getNVPremium() },

      // Podis
      { name: "Kandi Podi", category: "podis", description: "Traditional roasted dal powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisStandard() },
      { name: "Idly Karam Podi", category: "podis", description: "Spicy idly powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisStandard() },
      { name: "Putanala Karam Podi", category: "podis", description: "Roasted chickpea powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisStandard() },
      { name: "Munagaku Karam Podi", category: "podis", description: "Nutritious drumstick leaf powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisPremium() },
      { name: "Kobbari Karam", category: "podis", description: "Spicy coconut powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisPremium() },
      { name: "Nalla Karam Podi", category: "podis", description: "Traditional black spice mix.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisPremium() },
      { name: "Kothimeera Karam Podi", category: "podis", description: "Spicy coriander leaf powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisPremium() },
      { name: "Kakarakaya Karam Podi", category: "podis", description: "Spicy bitter gourd powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisPremium() },
      { name: "Usiri Karam Podi", category: "podis", description: "Amla spice powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisPremium() },
      { name: "Nuvvula Karam Podi", category: "podis", description: "Nutritious sesame seed powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisPremium() },
      { name: "Avisaginjala Karam Podi", category: "podis", description: "Healthy flax seed powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisPremium() },
      { name: "Karivepaku Karam Podi", category: "podis", description: "Spicy curry leaf powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisPremium() },
      { name: "Vellulli Karam Podi", category: "podis", description: "Spicy garlic powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisPremium() },
      { name: "Palli Karam Podi", category: "podis", description: "Roasted peanut powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisPremium() },
      { name: "3 Mango Chilli Powder", category: "podis", description: "High-quality red chilli powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getChilliPowder() }
    ];

    setLoading(true);
    try {
      const productsRef = collection(db, 'products');
      sampleProducts.forEach((p) => {
        const newDocRef = doc(productsRef);
        batch.set(newDocRef, p);
      });
      await batch.commit();
      
      const productsSnap = await getDocs(collection(db, 'products'));
      setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
      toast.success('Database seeded successfully!');
    } catch (error) {
      toast.error('Failed to seed database');
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
        'Status': order.status?.toUpperCase() || 'PENDING',
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
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-brand-900">Admin Dashboard</h1>
        <div className="flex bg-white p-1 rounded-2xl border border-brand-100">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-brand-600 text-white' : 'text-brand-600 hover:bg-brand-50'}`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-brand-600 text-white' : 'text-brand-600 hover:bg-brand-50'}`}
          >
            Orders
          </button>
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
            <span className="text-2xl font-bold text-brand-900">₹{orders.reduce((sum, o) => sum + o.total, 0)}</span>
          </div>
          <p className="text-brand-500 font-medium">Total Revenue</p>
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-brand-900">Product Management</h2>
            <div className="flex gap-4">
              {products.length === 0 && (
                <button
                  onClick={seedSampleData}
                  className="bg-brand-50 text-brand-600 px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-brand-100 transition-all border border-brand-200"
                >
                  <Package size={20} className="mr-2" /> Seed Sample Data
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-brand-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
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
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-4">
                      <img src={product.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <span className="font-bold text-brand-900">{product.name}</span>
                    </td>
                    <td className="px-6 py-4 text-brand-600">{product.category}</td>
                    <td className="px-6 py-4 font-bold text-brand-900">
                      {product.sizes && product.sizes.length > 0 ? `₹${product.sizes[0].price}+` : 'N/A'}
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
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-brand-900">Order Management</h2>
            <button
              onClick={exportOrdersToExcel}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              <FileDown size={20} className="mr-2" /> Download Orders Excel
            </button>
          </div>
          <div className="bg-white rounded-3xl border border-brand-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-brand-50 text-brand-900 font-bold">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {orders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-brand-50/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-bold text-brand-900">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-brand-600">
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-900">{order.phone}</span>
                        <span className="text-[10px] text-brand-400 truncate max-w-[150px]">{order.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex flex-col text-[10px] border-b border-brand-50 py-1 last:border-0">
                            <span className="font-bold text-brand-800">{item.name}</span>
                            <div className="flex justify-between items-center">
                              <span className="text-orange-600 font-bold uppercase">{item.size}</span>
                              <span className="text-brand-500 font-medium">x{item.quantity || (item as any).qty || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-900">₹{order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="p-2 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit2 size={18} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                        <p className="font-bold text-brand-900">{selectedOrder.name || 'N/A'}</p>
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

                {/* Status Update */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-brand-300 tracking-widest">Update Order Status</h3>
                  <div className="space-y-3">
                    <select 
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      className="w-full p-4 bg-brand-50 border border-brand-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-bold text-brand-900 appearance-none cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    <div className="flex items-center justify-center p-3 bg-brand-50 font-bold text-xs text-brand-500 rounded-xl italic">
                      Current: {selectedOrder.status.toUpperCase()}
                    </div>
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
                  category: 'Veg',
                  description: '',
                  image: '',
                  sizes: [
                    { label: '250g', price: 0 },
                    { label: '500g', price: 0 },
                    { label: '1kg', price: 0 }
                  ]
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
                  <option value="Veg">Veg</option>
                  <option value="NV pickles">NV pickles</option>
                  <option value="podis">podis</option>
                </select>
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
                <label className="text-sm font-bold text-brand-700 ml-2">Image URL</label>
                <input
                  type="url"
                  required
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="https://images.unsplash.com/..."
                />
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
