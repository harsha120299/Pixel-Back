import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import {getStorage} from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "figuralk.firebaseapp.com",
  projectId: "figuralk",
  storageBucket: "figuralk.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);