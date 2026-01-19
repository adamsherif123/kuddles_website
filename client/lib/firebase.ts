import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
    apiKey: "AIzaSyANPeV9UtlmkIXD5gLiv01RIzTnLWQTxos",
    authDomain: "kuddles-c8a7c.firebaseapp.com",
    projectId: "kuddles-c8a7c",
    storageBucket: "kuddles-c8a7c.firebasestorage.app",
    messagingSenderId: "752073894478",
    appId: "1:752073894478:web:cbb2e4906ac4f0c624f11f"
};

// Initialize Firebase app (works for both server and client)
let app;
try {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
} catch (error) {
    // If initialization fails, try to get existing app
    app = getApp();
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export { app };
