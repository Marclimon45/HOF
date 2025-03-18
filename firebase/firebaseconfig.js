// firebase/firebaseconfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA2uc4XlwTgXh9yvawGv9XWOkLDOc7DrYI",
  authDomain: "xin-s-hall-of-fame.firebaseapp.com",
  projectId: "xin-s-hall-of-fame",
  storageBucket: "xin-s-hall-of-fame.appspot.com",
  messagingSenderId: "692691719687",
  appId: "1:692691719687:web:7bd1656dec1613e2a87ca2",
  measurementId: "G-5Q7JKXX6Q2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    } else {
      console.log("Firebase Analytics is not supported in this environment.");
      analytics = null;
    }
  }).catch((error) => {
    console.error("Error checking Analytics support:", error);
    analytics = null;
  });
} else {
  console.log("Firebase Analytics skipped: Not running in a browser environment.");
  analytics = null;
}

export { db, auth, analytics };