import { db } from '../firebase/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';

import type { NewProductInput, Product } from '../types/product';

const PRODUCTS_COL = 'products';

export async function createProduct(input: NewProductInput) {
  const ref = await addDoc(collection(db, PRODUCTS_COL), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listProducts(): Promise<Product[]> {
  const q = query(collection(db, PRODUCTS_COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Product, 'id'>),
  }));
}

export async function updateProduct(productId: string, patch: Partial<NewProductInput>) {
  await updateDoc(doc(db, PRODUCTS_COL, productId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}
