// firebase/firebaseconfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2uc4XlwTgXh9yvawGv9XWOkLDOc7DrYI",
  authDomain: "xin-s-hall-of-fame.firebaseapp.com",
  projectId: "xin-s-hall-of-fame",
  storageBucket: "xin-s-hall-of-fame.appspot.com",
  messagingSenderId: "692691719687",
  appId: "1:692691719687:web:7bd1656dec1613e2a87ca2",
  measurementId: "G-5Q7JKXX6Q2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

// Set auth persistence to LOCAL
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error("Error setting auth persistence:", error);
    });
}

const storage = getStorage(app);

// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    } else {
      console.log("Firebase Analytics is not supported in this environment.");
    }
  }).catch((error) => {
    console.error("Error checking Analytics support:", error);
  });
} else {
  console.log("Firebase Analytics skipped: Not running in a browser environment.");
}

export { db, auth, analytics, storage };