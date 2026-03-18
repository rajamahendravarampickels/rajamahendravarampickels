
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore/lite';
import dotenv from 'dotenv';
import fs from 'fs';
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

const mappings = [
  // VEG
  { dbName: "Grape Avakaya", folder: "VEG", imgName: "Grape Avakaya.jpeg" },
  { dbName: "Chintakaya Pandu Mirchi Pachadi", folder: "VEG", imgName: "Chintakaya Pandu Mirchi Pachadi.jpeg" },
  { dbName: "Pandu Mirchi Gongura Pachadi", folder: "VEG", imgName: "Pandu Mirchi Gongura Pachadi.jpeg" },
  { dbName: "Kothamerra Pachadi", folder: "VEG", imgName: "kothemerra pachadi.jpeg" },
  { dbName: "Guava Avakaya", folder: "VEG", imgName: "guava avakaya.jpeg" },
  { dbName: "Bellam Avakaya", folder: "VEG", imgName: "bellam avakaya.jpeg" },
  { dbName: "Pesara Avakaya", folder: "VEG", imgName: "pesara avakaya.jpeg" },
  { dbName: "Allam Pachchadi", folder: "VEG", imgName: "allam pachadi.jpeg" },
  { dbName: "Magaya", folder: "VEG", imgName: "magaya.jpeg" },
  { dbName: "Avakaya", folder: "VEG", imgName: "Avakaya.jpeg" },
  { dbName: "Vellulli Avakaya", folder: "VEG", imgName: "velluli avakaya.jpeg" },
  { dbName: "Usirikaya Avakaya Pachadi", folder: "VEG", imgName: "usirikaya avakaya pachadi.jpeg" },
  { dbName: "Pineapple Avakaya", folder: "VEG", imgName: "pineapple avakaya.jpeg" },
  { dbName: "Pudina Pachadi", folder: "VEG", imgName: "pudhina pachadi.jpeg" },

  // NON VEG
  { dbName: "Gongura Kodi Mamsam Pachadi B/L", folder: "NON VEG", searchNames: ["Gongura Kodi Mamsam Pachadi"], imgName: "gongura kodi mamsam pachadi.jpeg" },
  { dbName: "Gongura Royyalu", folder: "NON VEG", imgName: "gongura royallu.jpeg" },
  { dbName: "Gongura Mekamamsam Pachadi B/L", folder: "NON VEG", imgName: "gongura mutton pachadi.jpeg" },

  // PODIS
  { dbName: "Idly Karam Podi", folder: "PODIS", imgName: "idli karam podi.jpeg" },
  { dbName: "Avasiginjala Karam Podi", folder: "PODIS", imgName: "avisaginjala karam podi.jpeg" },
  { dbName: "Putnala Karam Podi", folder: "PODIS", imgName: "putanala karam podi.jpeg" },
  { dbName: "Usiri Karam Podi", folder: "PODIS", imgName: "usirikaya karam podi.jpeg" }
];

async function applyUpdates() {
  const destFolder = 'public/images/products';
  if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });

  for (const m of mappings) {
    const srcPath = `all images/${m.folder}/${m.imgName}`;
    const destPath = path.join(destFolder, m.imgName);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${m.imgName}`);
    } else {
      console.error(`ERROR: Source file not found: ${srcPath}`);
    }
  }

  const querySnapshot = await getDocs(collection(db, 'products'));
  const docs = querySnapshot.docs.map(d => ({ id: d.id, name: d.data().name }));

  for (const m of mappings) {
    let matchedDoc = docs.find(d => d.name.toLowerCase() === m.dbName.toLowerCase());
    
    // Fuzzy matching fallback if it happens to be named slightly differently
    if (!matchedDoc && m.searchNames) {
       matchedDoc = docs.find(d => m.searchNames.some(sn => d.name.toLowerCase().includes(sn.toLowerCase())));
    }
    
    if (matchedDoc) {
      const publicPath = `/images/products/${m.imgName}`;
      await updateDoc(doc(db, 'products', matchedDoc.id), { image: publicPath });
      console.log(`Updated DB: ${matchedDoc.name} => ${publicPath}`);
    } else {
      console.error(`ERROR: Product not found in DB: ${m.dbName}`);
    }
  }
}

applyUpdates().then(() => console.log('All updates complete.')).catch(console.error);
