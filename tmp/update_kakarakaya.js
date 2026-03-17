
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

async function updateKakarakaya() {
  const querySnapshot = await getDocs(collection(db, 'products'));
  for (const productDoc of querySnapshot.docs) {
    const data = productDoc.data();
    const nameLower = data.name.toLowerCase();
    
    if (nameLower.includes("kakarakaya karam") || nameLower.includes("kakarkaya karam")) {
      console.log(`Updating ${data.name} to use image: /images/products/kakarkaya karam podi.jpeg`);
      await updateDoc(doc(db, 'products', productDoc.id), {
        image: "/images/products/kakarkaya karam podi.jpeg"
      });
    }
  }
}

updateKakarakaya().then(() => console.log("Update complete")).catch(console.error);
