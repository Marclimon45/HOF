// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import { getAuth } from "firebase/auth"; 
import { getAnalytics } from "firebase/analytics"; 

// ✅ Replace with your actual Firebase project config (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyA2uc4XlwTgXh9yvawGv9XWOkLDOc7DrYI",
  authDomain: "xin-s-hall-of-fame.firebaseapp.com",
  projectId: "xin-s-hall-of-fame",
  storageBucket: "xin-s-hall-of-fame.appspot.com",
  messagingSenderId: "692691719687",
  appId: "1:692691719687:web:7bd1656dec1613e2a87ca2",
  measurementId: "G-5Q7JKXX6Q2"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// ✅ Export Firebase services for use in other parts of your app
export { db, auth, analytics };