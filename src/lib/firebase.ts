// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDvTwZBFLChPZtcn98zBQp2j8ezcXVUrEM",
    authDomain: "ptc-furniture.firebaseapp.com",
    projectId: "ptc-furniture",
    storageBucket: "ptc-furniture.firebasestorage.app",
    messagingSenderId: "402177517323",
    appId: "1:402177517323:web:df2e212d11c94f374ee40e",
    measurementId: "G-5H9D8GSDTB"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Safe Analytics initialization (only in client-side environments)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;