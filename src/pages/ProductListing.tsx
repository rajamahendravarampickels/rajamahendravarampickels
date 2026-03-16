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

  const categories = ['All', 'Veg', 'NV pickles', 'podis'];

  const restoreProducts = async () => {
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
      { name: "Karvepaku Karam Podi", category: "podis", description: "Spicy curry leaf powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisPremium() },
      { name: "Vellulli Karam Podi", category: "podis", description: "Spicy garlic powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisPremium() },
      { name: "Palli Karam Podi", category: "podis", description: "Roasted peanut powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getPodisPremium() },
      { name: "3 Mango Chilli Powder", category: "podis", description: "High-quality red chilli powder.", image: "https://images.unsplash.com/photo-1601000919720-991bc3125d0c?w=800", sizes: getChilliPowder() }
    ];

    try {
      const productsRef = collection(db, 'products');
      sampleProducts.forEach((p) => {
        const newDocRef = doc(productsRef);
        batch.set(newDocRef, p);
      });
      await batch.commit();
      toast.success('Pickles restored successfully!');
      refreshProducts();
    } catch (e) {
      toast.error('Failed to restore pickles');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'All': return 'All Varieties';
      case 'Veg': return 'Veg Pickles';
      case 'NV pickles': return 'Non-Veg Picks';
      case 'podis': return 'Podis & Powders';
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
            <RefreshCw size={48} className="text-gray-200 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No pickles found</h3>
            <p className="text-gray-500 italic mb-6">Database is empty or no matches found.</p>
            <button 
              onClick={restoreProducts}
              className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg"
            >
              Restore Sample Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListing;


