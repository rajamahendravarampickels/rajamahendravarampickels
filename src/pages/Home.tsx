import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, ShieldCheck, Truck, Utensils } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

import { useProducts } from '../context/ProductContext';

const Home: React.FC = () => {
  const { products: featuredProducts, loading } = useProducts();

  const categories = [
    { name: 'veg', label: 'Veg', icon: '🥗', count: featuredProducts.filter(p => p.category === 'veg').length },
    { name: 'nonveg', label: 'Non-Veg', icon: '🍖', count: featuredProducts.filter(p => p.category === 'nonveg').length },
    { name: 'podi', label: 'Podis', icon: '🌶️', count: featuredProducts.filter(p => p.category === 'podi').length },
  ];

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/products/v1.png"
            alt="Pickle Background"
            className="w-full h-full object-cover blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-6xl md:text-7xl font-serif font-bold leading-tight mb-6">
              Authentic Taste of <span className="text-brand-400 italic">Tradition</span>
            </h1>
            <p className="text-xl text-brand-100 mb-8 leading-relaxed">
              Handcrafted homemade pickles made with premium ingredients and age-old family recipes. No preservatives, just pure love.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/products"
                className="bg-brand-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-600 transition-all flex items-center justify-center group"
              >
                Shop Now
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 12 }}
          transition={{ delay: 0.8, duration: 1, type: "spring" }}
          className="absolute right-[10%] top-1/4 hidden lg:block z-20"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-brand-400/20 blur-3xl rounded-full group-hover:bg-brand-400/30 transition-colors" />
            <img 
              src="/badge.svg" 
              alt="Quality Badge" 
              className="w-48 h-48 md:w-64 md:h-64 object-contain animate-float drop-shadow-2xl relative z-10" 
            />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Utensils, title: 'Traditional Recipes', desc: 'Passed down through generations' },
            { icon: ShieldCheck, title: '100% Natural', desc: 'No artificial preservatives or colors' },
            { icon: Truck, title: 'Fast Delivery', desc: 'Freshly packed and shipped to you' },
            { icon: Star, title: 'Premium Quality', desc: 'Hand-picked ingredients only' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl border border-brand-100 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className="inline-flex p-4 bg-brand-50 rounded-2xl text-brand-600 mb-4">
                <feature.icon size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-brand-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-serif font-bold text-brand-900 mb-4">Shop by Category</h2>
            <p className="text-brand-600">Explore our wide range of traditional flavors</p>
          </div>
          <Link to="/products" className="text-brand-600 font-bold hover:text-brand-800 flex items-center">
            View All <ArrowRight size={20} className="ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <Link
              key={i}
              to={`/products?category=${cat.name}`}
              className="group bg-white p-8 rounded-3xl border border-brand-100 shadow-sm hover:bg-brand-600 transition-all duration-500 text-center"
            >
              <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform">{cat.icon}</span>
              <h3 className="font-bold text-xl text-brand-900 group-hover:text-white mb-1 uppercase tracking-wider">{cat.label}</h3>
              <p className="text-brand-500 group-hover:text-brand-100 text-sm">{cat.count} Products</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Product Sections */}
      <section className="space-y-24">
        {/* Veg Section */}
        {featuredProducts.filter(p => p.category === 'veg').length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12 border-b border-brand-100 pb-6">
              <div>
                <h2 className="text-4xl font-serif font-bold text-brand-900 mb-2">VEG</h2>
                <p className="text-brand-600 italic font-medium">Traditional vegetarian delicacies</p>
              </div>
              <Link to="/products?category=veg" className="bg-brand-50 text-brand-600 px-6 py-2 rounded-full font-bold hover:bg-brand-600 hover:text-white transition-all text-sm border border-brand-200">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.filter(p => p.category === 'veg').slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* NV Section */}
        {featuredProducts.filter(p => p.category === 'nonveg').length > 0 && (
          <div className="bg-brand-50/50 py-24 border-y border-brand-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-12 border-b border-brand-200 pb-6">
                <div>
                  <h2 className="text-4xl font-serif font-bold text-brand-900 mb-2 font-uppercase">NON VEG SECTION</h2>
                  <p className="text-brand-600 italic font-medium">Spicy and authentic meat pickles</p>
                </div>
                <Link to="/products?category=nonveg" className="bg-brand-600 text-white px-6 py-2 rounded-full font-bold hover:bg-brand-700 transition-all text-sm shadow-md">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.filter(p => p.category === 'nonveg').slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Podis Section */}
        {featuredProducts.filter(p => p.category === 'podi').length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12 border-b border-brand-100 pb-6">
              <div>
                <h2 className="text-4xl font-serif font-bold text-brand-900 mb-2">PODIES SECTION</h2>
                <p className="text-brand-600 italic font-medium">Homemade spice powders and pastes</p>
              </div>
              <Link to="/products?category=podi" className="bg-brand-50 text-brand-600 px-6 py-2 rounded-full font-bold hover:bg-brand-600 hover:text-white transition-all text-sm border border-brand-200">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.filter(p => p.category === 'podi').slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>




    </div>
  );
};

export default Home;
