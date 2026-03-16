import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ProductGrid from '../components/ProductGrid';
import { Search, RefreshCw } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import toast from 'react-hot-toast';

const ProductListing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, refreshProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const selectedCategory = searchParams.get('category') || 'All';

  const categories = ['All', 'veg', 'nonveg', 'podi'];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'All': return 'All Varieties';
      case 'veg': return 'Veg Pickles';
      case 'nonveg': return 'Non-Veg Picks';
      case 'podi': return 'Podis & Powders';
      default: return cat;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col items-center text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif font-black text-gray-900 tracking-tight">Premium Homemade Pickles</h1>
        <p className="text-gray-500 max-w-lg text-lg">Authentic organic flavors from Rajamahendravaram.</p>
        <div className="w-24 h-1 bg-orange-500 rounded-full mt-2"></div>
      </div>

      <div className="flex flex-col space-y-8">
        {/* Category Filter UI */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSearchParams({ category: cat })}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-200 border-2 ${
                selectedCategory === cat
                  ? 'bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-100'
                  : 'bg-white border-gray-100 text-gray-500 hover:border-orange-200 hover:text-orange-700'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto w-full">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search pickles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-orange-400 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="mt-16">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-50 border-b-orange-600"></div>
            <p className="text-gray-400 font-bold italic">Loading traditional flavors...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 max-w-xl mx-auto flex flex-col items-center">
            <p className="text-gray-500 italic font-bold">No pickles found in this category.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductListing;


