
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import dotenv from 'dotenv';
import fs from 'fs';

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

async function checkMissingImages() {
  const querySnapshot = await getDocs(collection(db, 'products'));
  const products = querySnapshot.docs.map(doc => ({
    name: doc.data().name,
    image: doc.data().image
  }));
  
  const unmatched = [];
  const matched = [];
  
  for (const product of products) {
    if (!product.image || product.image.includes('default') || product.image === "") {
        unmatched.push(product.name);
    } else {
        matched.push(product.name);
    }
  }
  
  console.log("Matched:", matched.length);
  console.log("Unmatched:", unmatched.length);
  console.log("Unmatched Products:", unmatched);
  fs.writeFileSync('tmp/unmatched_products.json', JSON.stringify(unmatched, null, 2));
}

checkMissingImages().catch(console.error);
