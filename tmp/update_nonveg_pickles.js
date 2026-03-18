
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore/lite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const newNonVegPickles = [
  { name: "Kodi Mamsam Pachadi B/L", prices: [343, 748, 1486], image: "/images/products/chicken-pickle.jpg" },
  { name: "Meka Mamsam Pachadi B/L", prices: [487, 946, 1792], image: "/images/products/mutton-pickle.jpg" },
  { name: "Royyalu Pachadi", prices: [487, 946, 1792], image: "/images/products/prawn-pickle.jpg" },
  { name: "Gongura Kodi Mamsam Pachadi B/L", prices: [343, 748, 1486], image: "/images/products/gongura-chicken.jpg" },
  { name: "Gongura Mekamamsam Pachadi B/L", prices: [487, 946, 1792], image: "/images/products/gongura-mutton.jpg" },
  { name: "Gongura Royyalu", prices: [487, 946, 1792], image: "/images/products/gongura-prawns.jpg" },
  { name: "Chapala Pachadi B/L", prices: [487, 946, 1792], image: "/images/products/fish-pickle.jpg" }
];

const sizesLabels = ["200 grams", "400 grams", "900 grams"];

async function updateNonVegPickles() {
  console.log("Fetching current products...");
  const querySnapshot = await getDocs(collection(db, 'products'));
  const allProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Identify ALL products that could be considered "non-veg"
  const nonVegProducts = allProducts.filter(p => {
    const cat = (p.category || "").toLowerCase();
    const name = (p.name || "").toLowerCase();
    return cat === 'nonveg' || cat === 'non-veg' || cat === 'non veg' || cat === 'nv' || name.includes('pachadi');
  });
  
  console.log(`Found ${nonVegProducts.length} potential non-veg products.`);

  const newNames = newNonVegPickles.map(p => p.name);

  // 1. Delete products not in the new list OR duplicates
  const keptNames = new Set();
  for (const product of nonVegProducts) {
    if (!newNames.includes(product.name) || keptNames.has(product.name)) {
      console.log(`Deleting extra/duplicate: ${product.name}`);
      await deleteDoc(doc(db, 'products', product.id));
    } else {
      keptNames.add(product.name);
    }
  }

  // Reload non-veg products after deletions
  const querySnapshot2 = await getDocs(collection(db, 'products'));
  const allProducts2 = querySnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const nonVegProducts2 = allProducts2.filter(p => p.category === 'nonveg');

  // 2. Update or Add products in the new list
  for (const newItem of newNonVegPickles) {
    const existing = allProducts2.find(p => p.name === newItem.name);
    
    const sizes = sizesLabels.map((label, index) => ({
      label,
      price: newItem.prices[index]
    }));

    if (existing) {
      console.log(`Updating ${newItem.name}`);
      await updateDoc(doc(db, 'products', existing.id), {
        category: 'nonveg',
        sizes: sizes
      });
    } else {
      console.log(`Adding ${newItem.name}`);
      await addDoc(collection(db, 'products'), {
        name: newItem.name,
        category: 'nonveg',
        description: `Authentic homemade ${newItem.name}.`,
        image: newItem.image,
        sizes: sizes
      });
    }
  }

  console.log("Non-Veg pickles update complete!");
  
  // Final check count
  const finalSnapshot = await getDocs(collection(db, 'products'));
  const finalNonVeg = finalSnapshot.docs.filter(d => d.data().category === 'nonveg');
  console.log(`Final non-veg count: ${finalNonVeg.length}`);
  finalNonVeg.forEach(d => console.log(`- ${d.data().name}`));
}

updateNonVegPickles().catch(console.error);
