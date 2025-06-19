// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBhJ2s77Tcul4W9k6-xJBS-n4l5_YEjlPQ",
    authDomain: "monify2-f6e83.firebaseapp.com",
    projectId: "monify2-f6e83",
    storageBucket: "monify2-f6e83.firebasestorage.app",
    messagingSenderId: "402531533927",
    appId: "1:402531533927:web:0e5eea2a06224a0e8040c2",
    measurementId: "G-ZG6DESPN5V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
