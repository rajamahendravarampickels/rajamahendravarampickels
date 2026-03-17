import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-900 text-brand-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <img src="/badge.svg" alt="Badge" className="h-16 w-16 object-contain mb-2 brightness-0 invert" />
            <h3 className="text-2xl font-serif font-bold">Rajamahendravaram Pickles</h3>
            <p className="text-brand-200 text-sm leading-relaxed">
              Bringing you the authentic taste of tradition. Handcrafted with love, sun-dried, and preserved using age-old recipes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-brand-400 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-brand-400 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-brand-400 transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3 text-brand-200 text-sm">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-wider">Categories</h4>
            <ul className="space-y-3 text-brand-200 text-sm">
              <li><Link to="/products?category=Veg" className="hover:text-white transition-colors">VEG</Link></li>
              <li><Link to="/products?category=NV pickles" className="hover:text-white transition-colors">NON VEG</Link></li>
              <li><Link to="/products?category=podis" className="hover:text-white transition-colors">PODIS</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Contact Info</h4>
            <ul className="space-y-4 text-brand-200 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span>
                  42-13-5<br />
                  Segidi Street, Beside Siva Gayatri Ramalayam<br />
                  Mangavaripeta<br />
                  Rajamahendravaram<br />
                  East Godavari, Andhra Pradesh<br />
                  533101
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="flex-shrink-0" />
                <span>+91 9502945153</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="flex-shrink-0" />
                <span>rajamehendravarampickles@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-brand-800 pt-8 text-center text-brand-400 text-xs">
          <p>&copy; {new Date().getFullYear()} Rajamahendravaram Pickles. All rights reserved. Handcrafted with ❤️ in India.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
