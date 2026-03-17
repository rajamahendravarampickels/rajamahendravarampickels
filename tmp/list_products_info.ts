
import { db } from '../src/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function listProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = querySnapshot.docs.map(doc => ({
      name: doc.data().name,
      image: doc.data().image
    }));
    console.log(JSON.stringify(products, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

listProducts();
