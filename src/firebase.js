// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import getStorage for Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA45I5f4Jf81n6ks-54Qb8MjQuaRNvOPIY",
  authDomain: "quizdom-3ce85.firebaseapp.com",
  databaseURL: "https://quizdom-3ce85-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quizdom-3ce85",
  storageBucket: "quizdom-3ce85.firebasestorage.app",
  messagingSenderId: "364493119142",
  appId: "1:364493119142:web:7456604382f2a46dd35e67",
  measurementId: "G-ZJLVZLLNG2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Initialize and export Firebase Storage
