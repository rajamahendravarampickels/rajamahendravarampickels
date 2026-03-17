
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore/lite';
import dotenv from 'dotenv';
import path from 'path';

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

const updates = [
  { keywords: ["munagaku", "munakaya"], image: "/images/products/munagaku karam podi.jpeg" },
  { keywords: ["3 mango"], image: "/images/products/3 mango chilli powder.jpeg" },
  { keywords: ["allam pachadi"], image: "/images/products/allam pachadi.jpeg" },
  { keywords: ["grape"], image: "/images/products/grapes pachadi.jpeg" },
  { keywords: ["vellulli avakaya"], image: "/images/products/velluli avakaya.jpeg" },
  { keywords: ["kakarkaya pachadi"], image: "/images/products/kakarkay pachadi.jpeg" }
];

async function updateProducts() {
  const querySnapshot = await getDocs(collection(db, 'products'));
  for (const productDoc of querySnapshot.docs) {
    const data = productDoc.data();
    const nameLower = data.name.toLowerCase();
    
    for (const update of updates) {
      if (update.keywords.some(kw => nameLower.includes(kw))) {
        console.log(`Updating ${data.name} to use image: ${update.image}`);
        await updateDoc(doc(db, 'products', productDoc.id), {
          image: update.image
        });
        break;
      }
    }
  }
  console.log("Finished updating products.");
}

updateProducts().catch(console.error);
