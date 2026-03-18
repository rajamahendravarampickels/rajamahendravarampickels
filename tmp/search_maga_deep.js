
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
async function searchMaga() {
  const querySnapshot = await getDocs(collection(db, 'products'));
  const found = querySnapshot.docs.filter(doc => doc.data().name.toLowerCase().includes("maga") || doc.data().name.toLowerCase().includes("magay")).map(doc => ({id: doc.id, name: doc.data().name, image: doc.data().image}));
  console.log(JSON.stringify(found, null, 2));
}
searchMaga().catch(console.error);
