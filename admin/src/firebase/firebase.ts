import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyANPeV9UtlmkIXD5gLiv01RIzTnLWQTxos",
    authDomain: "kuddles-c8a7c.firebaseapp.com",
    projectId: "kuddles-c8a7c",
    storageBucket: "kuddles-c8a7c.firebasestorage.app",
    messagingSenderId: "752073894478",
    appId: "1:752073894478:web:072f30b570c864c124f11f"
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
