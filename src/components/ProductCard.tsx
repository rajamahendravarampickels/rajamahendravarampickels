import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ShoppingCart, Plus, Minus, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  
  // Safety check for sizes to prevent crash
  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : [{ label: 'Standard', price: (product as any).price || 0 }];
  const [selectedSize, setSelectedSize] = useState(availableSizes[0]);

  const getBadgeColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('veg') && !cat.includes('non')) return 'bg-green-100 text-green-700 border-green-200';
    if (cat.includes('non') || cat.includes('nv')) return 'bg-red-100 text-red-700 border-red-200';
    if (cat.includes('podi')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <Link to={`/product/${product.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 ease-in-out border border-gray-100 hover:border-orange-200 flex flex-col h-full group hover:scale-[1.02] hover:-translate-y-1">
      {/* Product Image */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
        <img 
          src={product.image || '/images/products/veg_default.png'} 
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
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
        <div className="absolute top-3 left-3 z-10">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeColor(product.category)} shadow-sm`}>
            {product.category}
          </span>
        </div>
        {product.isSoldOut && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <span className="bg-red-600 text-white px-6 py-2 rounded-full font-black uppercase tracking-tighter shadow-xl transform -rotate-12 border-2 border-white scale-125">
              Sold Out
            </span>
          </div>
        )}
        {/* Subtle overlay glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-4 flex flex-col flex-grow bg-white">
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors duration-300">{product.name}</h3>
        <p className="text-gray-500 text-xs mb-4 line-clamp-2 h-8">{product.description}</p>
        
        <div className="mt-auto space-y-3">
          {/* Size Selector */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center">
                <Package size={12} className="mr-1" /> Select Weight
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((size) => (
                <button
                  key={size.label}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border-2 ${
                    selectedSize.label === size.label
                      ? 'bg-orange-600 border-orange-600 text-white shadow-sm'
                      : 'bg-white border-gray-100 text-gray-600 hover:border-orange-200'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-end">
            <span className="text-xl font-black text-gray-900 block">₹{selectedSize.price}</span>
            {product.stock > 0 && !product.isSoldOut && (
              <span className="text-[10px] font-bold text-orange-600 animate-pulse bg-orange-50 px-2 py-1 rounded-md mb-1">
                Only {product.stock} left
              </span>
            )}
          </div>
          
          {/* Quantity Selector - Below Price, Above Button */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100 group-hover:border-orange-100 transition-colors duration-300">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQty(Math.max(1, qty - 1));
                }}
                className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-orange-600 hover:shadow transition-all duration-200 border border-gray-100 active:scale-95"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-bold text-gray-800 text-sm">{qty}</span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQty(qty + 1);
                }}
                className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-orange-600 hover:shadow transition-all duration-200 border border-gray-100 active:scale-95"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              disabled={product.isSoldOut}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (product.isSoldOut) return;
                addToCart(product, selectedSize.label, selectedSize.price, qty);
              }}
              className={`flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 active:scale-95 shadow-sm ${
                product.isSoldOut 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed grayscale' 
                  : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-200'
              }`}
            >
              <ShoppingCart size={16} />
              <span>{product.isSoldOut ? 'Sold Out' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};


export default ProductCard;


