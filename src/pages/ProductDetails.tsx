import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, Star, ShieldCheck, Utensils, Truck, Package } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

import { useProducts } from '../context/ProductContext';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      // Try to find in global state first for instant loading
      const cachedProduct = products.find(p => p.id === id);
      if (cachedProduct) {
        setProduct(cachedProduct);
        const sizes = cachedProduct.sizes && cachedProduct.sizes.length > 0 ? cachedProduct.sizes : [{ label: 'Standard', price: (cachedProduct as any).price || 0 }];
        setSelectedSize(sizes[0]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(data);
          const sizes = data.sizes && data.sizes.length > 0 ? data.sizes : [{ label: 'Standard', price: (data as any).price || 0 }];
          setSelectedSize(sizes[0]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, products]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!product || !selectedSize) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-brand-900">Product not found</h2>
        <button onClick={() => navigate('/products')} className="mt-4 text-brand-600 hover:underline">
          Back to Shop
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, selectedSize.label, selectedSize.price, quantity);
    toast.success(`${quantity} x ${product.name} (${selectedSize.label}) added to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-brand-600 hover:text-brand-800 mb-8 font-medium group"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Collection
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-brand-100 aspect-square"
        >
          <img
            src={product.image || '/images/products/veg_default.png'}
            alt={product.name}
            className="w-full h-full object-cover"
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
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-brand-700 font-bold text-sm shadow-sm">
            {product.category}
          </div>
          {product.isSoldOut && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center uppercase tracking-tighter">
              <span className="bg-red-600 text-white px-10 py-4 rounded-full font-black text-2xl shadow-2xl border-4 border-white mb-4 animate-bounce">
                Sold Out
              </span>
              <p className="text-red-700 font-black text-xs tracking-[0.3em]">Restocking Soon</p>
            </div>
          )}
        </motion.div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} className="fill-brand-400 text-brand-400" />)}
              <span className="text-brand-500 text-sm ml-2">(48 Reviews)</span>
            </div>
            <h1 className="text-5xl font-serif font-bold text-brand-900 mb-4">{product.name}</h1>
            <div className="flex items-center gap-6">
              <p className="text-3xl font-bold text-brand-600">₹{selectedSize.price}</p>
              {product.stock > 0 && !product.isSoldOut && (
                <span className="bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl animate-pulse border border-orange-100 italic">
                  Only {product.stock} pieces left!
                </span>
              )}
            </div>
          </div>

          <p className="text-brand-600 leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="space-y-6 pt-6 border-t border-brand-100">
            {/* Size Selector */}
            <div className="space-y-4">
              <label className="text-sm font-black text-orange-600 ml-1 uppercase tracking-[0.2em] flex items-center">
                <Package size={18} className="mr-2" /> Select Pack Size
              </label>
              <div className="flex flex-wrap gap-4">
                {(product.sizes && product.sizes.length > 0 ? product.sizes : [{ label: 'Standard', price: (product as any).price || 0 }]).map((size) => (
                  <button
                    key={size.label}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-2xl font-bold transition-all border-2 ${
                      selectedSize.label === size.label
                        ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-100'
                        : 'bg-white text-brand-600 border-brand-100 hover:border-brand-300'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className={`flex items-center bg-brand-50 rounded-2xl p-2 border border-brand-100 ${product.isSoldOut ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <button
                  disabled={product.isSoldOut}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-colors text-brand-900 font-bold"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-brand-900 text-lg">{quantity}</span>
                <button
                  disabled={product.isSoldOut}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-colors text-brand-900 font-bold"
                >
                  +
                </button>
              </div>
              <button
                disabled={product.isSoldOut}
                onClick={handleAddToCart}
                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center shadow-lg ${
                  product.isSoldOut 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                    : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-600/20'
                }`}
              >
                <ShoppingCart size={24} className="mr-2" />
                {product.isSoldOut ? 'Sold Out' : 'Add to Cart'}
              </button>
            </div>

            <button
              disabled={product.isSoldOut}
              onClick={() => {
                if (product.isSoldOut) return;
                handleAddToCart();
                navigate('/cart');
              }}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                product.isSoldOut 
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed hidden' 
                  : 'bg-brand-900 text-white hover:bg-black'
              }`}
            >
              Buy It Now
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-2xl border border-brand-100">
              <ShieldCheck className="text-brand-500" />
              <span className="text-sm font-medium text-brand-700">100% Natural</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-2xl border border-brand-100">
              <Utensils className="text-brand-500" />
              <span className="text-sm font-medium text-brand-700">Traditional Recipe</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-2xl border border-brand-100">
              <Truck className="text-brand-500" />
              <span className="text-sm font-medium text-brand-700">Fast Shipping</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-2xl border border-brand-100">
              <Star className="text-brand-500" />
              <span className="text-sm font-medium text-brand-700">Premium Quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
