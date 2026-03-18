
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore/lite';
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

async function renameProduct() {
  const productId = "WPfAlZenqcCDjgbE8gK1";
  const oldName = "Gongura Kodi Mamsam Pachadi B/C";
  const newName = "Gongura Kodi Mamsam Pachadi B/L";

  console.log(`Updating product ID: ${productId}`);
  console.log(`From: ${oldName}`);
  console.log(`To: ${newName}`);

  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      name: newName
    });
    console.log("Product renamed successfully!");
  } catch (error) {
    console.error("Error renaming product:", error);
  }
}

renameProduct().catch(console.error);
