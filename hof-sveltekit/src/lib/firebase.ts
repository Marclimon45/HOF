import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA2uc4XlwTgXh9yvawGv9XWOkLDOc7DrYI",
  authDomain: "xin-s-hall-of-fame.firebaseapp.com",
  projectId: "xin-s-hall-of-fame",
  storageBucket: "xin-s-hall-of-fame.firebasestorage.app",
  messagingSenderId: "692691719687",
  appId: "1:692691719687:web:6b9f13cf1d3f9328a87ca2",
  measurementId: "G-4F4QM0QENJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
