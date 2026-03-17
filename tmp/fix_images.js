
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore/lite';
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

const imageMappings = [
  { keywords: ["kodi mamsam"], image: "/images/products/kodi mamsam pachadi.jpeg" },
  { keywords: ["meka mamsam"], image: "/images/products/meka mamsam pachadi.jpeg" },
  { keywords: ["royyalu pachadi"], image: "/images/products/royyalu pachadi.jpeg" },
  { keywords: ["gongura kodi"], image: "/images/products/gongura kodi mamsam pachadi.jpeg" },
  { keywords: ["gongura mekamamsam", "gongura mutton"], image: "/images/products/gongura mutton pachadi.jpeg" },
  { keywords: ["gongura royyalu"], image: "/images/products/gongura royallu.jpeg" },
  { keywords: ["chapala"], image: "/images/products/chappala pachadi.jpeg" },
  { keywords: ["avakaya"], image: "/images/products/Avakaya.jpeg", exclude: ["bellam", "vellulli", "grape", "pineapple", "apple", "guava", "usirikaya", "pesara"] },
  { keywords: ["magaya"], image: "/images/products/veg_default.png", exclude: ["bellam"] }, // Missing magaya.jpeg in list
  { keywords: ["bellam avakaya"], image: "/images/products/bellam avakaya.jpeg" },
  { keywords: ["gongura"], image: "/images/products/gongura.jpeg", exclude: ["kodi", "mamsam", "royyalu", "mirchi"] },
  { keywords: ["vellulli avakaya"], image: "/images/products/velluli avakaya.jpeg" },
  { keywords: ["allam"], image: "/images/products/allam pachadi.jpeg" },
  { keywords: ["tomato"], image: "/images/products/tomato pachadi.jpeg" },
  { keywords: ["grape"], image: "/images/products/grapes pachadi.jpeg" },
  { keywords: ["pineapple"], image: "/images/products/pineapple avakaya.jpeg" },
  { keywords: ["apple"], image: "/images/products/apple avakaya.jpeg" },
  { keywords: ["guava"], image: "/images/products/guava avakaya.jpeg" },
  { keywords: ["kakarkaya"], image: "/images/products/kakarkay pachadi.jpeg", category: "veg" },
  { keywords: ["cauliflower"], image: "/images/products/cauliflower pachadi.jpeg" },
  { keywords: ["pandu mirapakaya"], image: "/images/products/pandu mirapakay pachadi.jpeg" },
  { keywords: ["usirikaya avakaya"], image: "/images/products/usirikaya avakaya pachadi.jpeg" },
  { keywords: ["chintakaya"], image: "/images/products/chintakayala pandu mirchi pachadi.jpeg" },
  { keywords: ["pandu mirchi gongura"], image: "/images/products/pandu mirchi gongura pachadi.jpeg" },
  { keywords: ["pesara"], image: "/images/products/pesara avakaya.jpeg" },
  { keywords: ["kothamerra", "kothemerra"], image: "/images/products/kothemerra pachadi.jpeg" },
  { keywords: ["pudina"], image: "/images/products/pudhina pachadi.jpeg" },
  { keywords: ["kandi"], image: "/images/products/kandi podi.jpeg" },
  { keywords: ["idly karam", "idli karam"], image: "/images/products/idli karam podi.jpeg" },
  { keywords: ["munagaku"], image: "/images/products/munagaku karam podi.jpeg" },
  { keywords: ["kobbari"], image: "/images/products/kobbari karam podi.jpeg" },
  { keywords: ["putnala", "putanala"], image: "/images/products/putanala karam podi.jpeg" },
  { keywords: ["nalla karam"], image: "/images/products/nalla karam podi.jpeg" },
  { keywords: ["kothimeera karam"], image: "/images/products/kothimeera karam podi.jpeg" },
  { keywords: ["kakarakaya karam"], image: "/images/products/kakarakaya karam podi.jpeg" },
  { keywords: ["usiri karam"], image: "/images/products/usirikaya karam podi.jpeg" },
  { keywords: ["nuvvula"], image: "/images/products/nuvvula karam podi.jpeg" },
  { keywords: ["avasiginjala", "avisaginjala"], image: "/images/products/avisaginjala karam podi.jpeg" },
  { keywords: ["karivepaku"], image: "/images/products/karivepaku karam podi.jpeg" },
  { keywords: ["vellulli karam"], image: "/images/products/vellulli karam podi.jpeg" },
  { keywords: ["palli"], image: "/images/products/palli karam podi.jpeg" },
  { keywords: ["3 mango"], image: "/images/products/3 mango chilli powder.jpeg" }
];

async function updateImages() {
  const querySnapshot = await getDocs(collection(db, 'products'));
  const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  for (const product of products) {
    const nameLower = product.name.toLowerCase();
    let bestMatch = null;

    for (const mapping of imageMappings) {
      if (mapping.keywords.some(kw => nameLower.includes(kw))) {
        if (mapping.exclude && mapping.exclude.some(ex => nameLower.includes(ex))) {
          continue;
        }
        if (mapping.category && product.category !== mapping.category) {
            continue;
        }
        bestMatch = mapping.image;
        break;
      }
    }

    if (bestMatch && product.image !== bestMatch) {
      console.log(`Updating ${product.name} image to: ${bestMatch}`);
      await updateDoc(doc(db, 'products', product.id), {
        image: bestMatch
      });
    }
  }
}

updateImages().catch(console.error);
