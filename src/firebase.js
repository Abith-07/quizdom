// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import getStorage for Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5Xl9YJYoJwW7lul1l9pIqROTFi6L-zkk",
  authDomain: "quiz-generator-14598.firebaseapp.com",
  databaseURL: "https://quiz-generator-14598-default-rtdb.firebaseio.com",
  projectId: "quiz-generator-14598",
  storageBucket: "quiz-generator-14598.appspot.com",
  messagingSenderId: "760827227069",
  appId: "1:760827227069:web:830c0ca73c3044b82e40d4",
  measurementId: "G-ECC0BKM6QH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Initialize and export Firebase Storage
