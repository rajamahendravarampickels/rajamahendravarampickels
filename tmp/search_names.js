
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
async function searchNames() {
  const querySnapshot = await getDocs(collection(db, 'products'));
  for (const doc of querySnapshot.docs) {
    const name = doc.data().name;
    const image = doc.data().image;
    if (name.toLowerCase().includes("maga") || name.toLowerCase().includes("magai")) {
      console.log(`FOUND_MATCH: "${name}" | IMG: "${image}"`);
    }
  }
}
searchNames().catch(console.error);
