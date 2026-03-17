
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
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

async function checkAll() {
  const querySnapshot = await getDocs(collection(db, 'products'));
  const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  console.log("ALL NON-VEG RELATED PRODUCTS:");
  products.forEach(p => {
    const cat = p.category ? p.category.toLowerCase() : '';
    if (cat.includes('non') || p.name.toLowerCase().includes('chicken') || p.name.toLowerCase().includes('mutton') || p.name.toLowerCase().includes('prawn') || p.name.toLowerCase().includes('fish')) {
      console.log(`- ${p.name} | Category: ${p.category} | ID: ${p.id}`);
    }
  });
}

checkAll().catch(console.error);
