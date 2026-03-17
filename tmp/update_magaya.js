
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore/lite';
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

async function updateMagaya() {
  console.log("Starting update...");
  const querySnapshot = await getDocs(collection(db, 'products'));
  console.log(`Found ${querySnapshot.size} products.`);
  
  for (const productDoc of querySnapshot.docs) {
    const data = productDoc.data();
    const nameLower = data.name.toLowerCase();
    
    if (nameLower === "bellam magaya") {
      console.log(`Updating ${data.name}...`);
      await updateDoc(doc(db, 'products', productDoc.id), {
        image: "/images/products/bellam magaya.jpeg"
      });
    } else if (nameLower === "magaya") {
      console.log(`Updating ${data.name}...`);
      await updateDoc(doc(db, 'products', productDoc.id), {
        image: "/images/products/magaya.jpeg"
      });
    }
  }
}

updateMagaya().then(() => console.log("Update complete")).catch(console.error);
