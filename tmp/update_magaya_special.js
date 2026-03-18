
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
async function updateMagayaSpecially() {
  const querySnapshot = await getDocs(collection(db, 'products'));
  for (const productDoc of querySnapshot.docs) {
    const name = productDoc.data().name;
    const nameLower = name.toLowerCase();
    if (nameLower === "magaya" || nameLower.includes("magaya")) {
      console.log(`Updating "${name}" (ID: ${productDoc.id}) to /images/products/magaya.jpeg`);
      if (nameLower !== "bellam magaya") { // Don't overwrite Bellam Magaya if it's already correct
          await updateDoc(doc(db, 'products', productDoc.id), {
            image: "/images/products/magaya.jpeg"
          });
      }
    }
  }
}
updateMagayaSpecially().then(() => console.log("Done")).catch(console.error);
