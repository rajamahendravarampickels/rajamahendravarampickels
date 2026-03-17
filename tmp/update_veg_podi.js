
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore/lite';
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

const vegPickles = [
  { name: "Avakaya", prices: [127, 244, 496] },
  { name: "Magaya", prices: [127, 244, 496] },
  { name: "Bellam Avakaya", prices: [145, 296, 595] },
  { name: "Bellam Magaya", prices: [145, 296, 595] },
  { name: "Gongura", prices: [145, 296, 595] },
  { name: "Vellulli Avakaya", prices: [145, 296, 595] },
  { name: "Allam Pachchadi", prices: [145, 296, 595] },
  { name: "Tomato Pachchadi", prices: [145, 296, 595] },
  { name: "Grape Avakaya", prices: [208, 415, 829] },
  { name: "Pineapple Avakaya", prices: [208, 415, 829] },
  { name: "Apple Avakaya", prices: [208, 415, 829] },
  { name: "Guava Avakaya", prices: [208, 415, 829] },
  { name: "Kakarkaya Pachadi", prices: [145, 296, 595] },
  { name: "Cauliflower Pachadi", prices: [145, 296, 595] },
  { name: "Pandu Mirapakaya Pachadi", prices: [145, 296, 595] },
  { name: "Usirikaya Avakaya Pachadi", prices: [145, 296, 595] },
  { name: "Chintakaya Pandu Mirchi Pachadi", prices: [145, 296, 595] },
  { name: "Pandu Mirchi Gongura Pachadi", prices: [145, 296, 595] },
  { name: "Pesara Avakaya", prices: [145, 296, 595] },
  { name: "Kothamerra Pachadi", prices: [127, 244, 496] },
  { name: "Pudina Pachadi", prices: [127, 244, 496] }
];

const podis = [
  { name: "Kandi Podi", prices: [154, 298, 595] },
  { name: "Idly Karam Podi", prices: [154, 298, 595] },
  { name: "Munagaku Karam Podi", prices: [172, 325, 604] },
  { name: "Kobbari Karam", prices: [172, 325, 604] },
  { name: "Putnala Karam Podi", prices: [154, 298, 595] },
  { name: "Nalla Karam Podi", prices: [172, 325, 604] },
  { name: "Kothimeera Karam Podi", prices: [172, 325, 604] },
  { name: "Kakarakaya Karam Podi", prices: [172, 325, 604] },
  { name: "Usiri Karam Podi", prices: [172, 325, 604] },
  { name: "Nuvvula Karam Podi", prices: [172, 325, 604] },
  { name: "Avasiginjala Karam Podi", prices: [172, 325, 604] },
  { name: "Karivepaku Karam Podi", prices: [172, 325, 604] },
  { name: "Vellulli Karam Podi", prices: [172, 325, 604] },
  { name: "Palli Karam Podi", prices: [172, 325, 604] },
  { name: "3 Mango Chilli Powder", prices: [199, 397, 775] }
];

const sizesLabels = ["200 grams", "400 grams", "900 grams"];

async function updateCategory(category, newList) {
  console.log(`Updating category: ${category}...`);
  const querySnapshot = await getDocs(collection(db, 'products'));
  const allProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const currentCategoryProducts = allProducts.filter(p => p.category === category);
  const newNames = newList.map(p => p.name);

  // 1. Delete extra items or duplicates
  const keptNames = new Set();
  for (const product of currentCategoryProducts) {
    if (!newNames.includes(product.name) || keptNames.has(product.name)) {
      console.log(`Deleting extra/duplicate in ${category}: ${product.name}`);
      await deleteDoc(doc(db, 'products', product.id));
    } else {
      keptNames.add(product.name);
    }
  }

  // 2. Add or Update
  for (const newItem of newList) {
    const existing = allProducts.find(p => p.name === newItem.name && p.category === category);
    const sizes = sizesLabels.map((label, index) => ({
      label,
      price: newItem.prices[index]
    }));

    if (existing) {
      console.log(`Updating ${newItem.name}`);
      await updateDoc(doc(db, 'products', existing.id), {
        sizes: sizes
      });
    } else {
      console.log(`Adding ${newItem.name}`);
      await addDoc(collection(db, 'products'), {
        name: newItem.name,
        category: category,
        description: `Authentic homemade ${newItem.name}.`,
        image: `/images/products/${newItem.name.toLowerCase().replace(/ /g, '_')}.jpeg`,
        sizes: sizes
      });
    }
  }
}

async function run() {
  await updateCategory('veg', vegPickles);
  await updateCategory('podi', podis);
  console.log("All updates complete!");
}

run().catch(console.error);
