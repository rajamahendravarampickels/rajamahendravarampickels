import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { products as localFallbackProducts } from '../data/products';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      if (querySnapshot.empty) {
        console.log("Firestore empty, using fallback local products.");
        setProducts(localFallbackProducts);
      } else {
        const productsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Prioritize imageUrl field, but fallback to image field if imageUrl is not present
            image: data.imageUrl || data.image || ""
          };
        }) as Product[];
        setProducts(productsData);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts(localFallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, refreshProducts: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};



