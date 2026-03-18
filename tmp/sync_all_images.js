
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

const sourceFolders = ['all images/VEG', 'all images/NON VEG', 'all images/PODIS'];
const destFolder = 'public/images/products';

async function syncAllImages() {
  if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
  }

  const allSourceImages = [];
  for (const folder of sourceFolders) {
    if (fs.existsSync(folder)) {
      const files = fs.readdirSync(folder);
      for (const file of files) {
        if (file.match(/\.(jpe?g|png|webp)$/i)) {
          const srcPath = path.join(folder, file);
          const destPath = path.join(destFolder, file);
          fs.copyFileSync(srcPath, destPath);
          allSourceImages.push(file);
        }
      }
    }
  }

  console.log(`Copied ${allSourceImages.length} images to ${destFolder}`);

  const querySnapshot = await getDocs(collection(db, 'products'));
  const products = querySnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name
  }));

  console.log(`Found ${products.length} products in database.`);

  for (const product of products) {
    const productName = product.name.toLowerCase();
    
    // Find matching image
    const matchingImage = allSourceImages.find(imgName => {
      const baseName = path.parse(imgName).name.toLowerCase();
      
      // Exact match
      if (baseName === productName) return true;
      
      // Normalized match (ignore some common suffixes/prefixes if they differ)
      const normalizedName = productName.replace(/ pachadi| karam| podi| b\/l| b\/c/g, '').trim();
      const normalizedBase = baseName.replace(/ pachadi| karam| podi| b\/l| b\/c/g, '').trim();
      
      if (normalizedName === normalizedBase && normalizedName.length > 3) return true;
      
      // Includes check for specific products
      if (productName.includes(normalizedBase) && normalizedBase.length > 5) return true;
      if (normalizedBase.includes(normalizedName) && normalizedName.length > 5) return true;
      
      return false;
    });

    if (matchingImage) {
      console.log(`Matching: ${product.name} => ${matchingImage}`);
      await updateDoc(doc(db, 'products', product.id), {
        image: `/images/products/${matchingImage}`
      });
    } else {
      console.warn(`No match found for: ${product.name}`);
    }
  }
}

syncAllImages().then(() => console.log('Sync complete.')).catch(console.error);
