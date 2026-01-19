import { storage } from '../firebase/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function uploadProductImages(productId: string, files: File[]) {
  const urls: string[] = [];

  for (const file of files) {
    const path = `products/${productId}/${Date.now()}_${safeFileName(file.name)}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, file, { contentType: file.type });
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }

  return urls;
}
