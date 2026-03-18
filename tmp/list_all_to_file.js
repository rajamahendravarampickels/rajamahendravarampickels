
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
async function listAllToFile() {
  const querySnapshot = await getDocs(collection(db, 'products'));
  const all = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, image: doc.data().image }));
  fs.writeFileSync('tmp/products_list.json', JSON.stringify(all, null, 2));
}
listAllToFile().then(() => console.log("List saved")).catch(console.error);
