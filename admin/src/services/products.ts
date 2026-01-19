import { db } from '../firebase/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore';

import type { NewProductInput, Product } from '../types/product';

const PRODUCTS_COL = 'products';

/**
 * CREATE
 */
export async function createProduct(input: NewProductInput) {
  const ref = await addDoc(collection(db, PRODUCTS_COL), {
    ...input,
    isActive: input.isActive ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * ADMIN — list ALL products (active + inactive)
 */
export async function listAllProducts(): Promise<Product[]> {
  const q = query(
    collection(db, PRODUCTS_COL),
    orderBy('createdAt', 'desc')
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Product, 'id'>),
  }));
}

/**
 * CLIENT — list ONLY active products
 */
export async function listActiveProducts(): Promise<Product[]> {
  const q = query(
    collection(db, PRODUCTS_COL),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Product, 'id'>),
  }));
}

/**
 * UPDATE
 */
export async function updateProduct(
  productId: string,
  patch: Partial<NewProductInput>
) {
  await updateDoc(doc(db, PRODUCTS_COL, productId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

/**
 * DELETE (hard delete)
 */
export async function deleteProduct(productId: string) {
  await deleteDoc(doc(db, PRODUCTS_COL, productId));
}
