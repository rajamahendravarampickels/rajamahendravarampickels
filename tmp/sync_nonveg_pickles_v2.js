
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
  { name: "Kodi Mamsam Pachadi B/L", prices: [343, 748, 1486], image: "/images/products/kodi mamsam pachadi.jpeg" },
  { name: "Meka Mamsam Pachadi B/L", prices: [487, 946, 1792], image: "/images/products/meka mamsam pachadi.jpeg" },
  { name: "Royyalu Pachadi", prices: [487, 946, 1792], image: "/images/products/royyalu pachadi.jpeg" },
  { name: "Gongura Kodi Mamsam Pachadi B/L", prices: [343, 748, 1486], image: "/images/products/gongura kodi mamsam pachadi.jpeg" },
  { name: "Gongura Mekamamsam Pachadi B/L", prices: [487, 946, 1792], image: "/images/products/gongura mutton pachadi.jpeg" },
  { name: "Gongura Royyalu", prices: [487, 946, 1792], image: "/images/products/gongura royallu.jpeg" },
  { name: "Chapala Pachadi B/L", prices: [487, 946, 1792], image: "/images/products/chappala pachadi.jpeg" }
];

const sizesLabels = ["200g", "400g", "900g"];

async function updateNonVegPickles() {
  console.log("Fetching current products...");
  const querySnapshot = await getDocs(collection(db, 'products'));
  const allProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const newNames = newNonVegPickles.map(p => p.name);

  for (const newItem of newNonVegPickles) {
    const existing = allProducts.find(p => p.name === newItem.name);
    
    const sizes = sizesLabels.map((label, index) => ({
      label,
      price: newItem.prices[index]
    }));

    if (existing) {
      console.log(`Updating ${newItem.name}`);
      await updateDoc(doc(db, 'products', existing.id), {
        category: 'nonveg',
        sizes: sizes,
        image: newItem.image
      });
    } else {
      console.log(`Adding ${newItem.name}`);
      await addDoc(collection(db, 'products'), {
        name: newItem.name,
        category: 'nonveg',
        description: `Authentic homemade ${newItem.name} from Rajamahendravaram.`,
        image: newItem.image,
        sizes: sizes
      });
    }
  }

  console.log("Non-Veg pickles update complete!");
}

updateNonVegPickles().catch(console.error);
