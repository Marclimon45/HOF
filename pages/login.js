// pages/login.js
import React, { useState, useEffect } from "react";
import styles from "../styles/login.module.css";
import { FaArrowRight, FaEnvelope, FaLock } from "react-icons/fa";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseconfig";
import { useRouter } from "next/router";
import Link from "next/link"; // ✅ Added missing import for Link

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already signed in, redirect to home
        router.push("/home");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home"); // Redirect to home on successful login
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle specific Firebase auth errors
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address. Please check your email or create a new account.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/user-disabled') {
        setError("This account has been disabled. Please contact support.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later.");
      } else {
        setError("Login failed: " + err.message);
      }
      
      setTimeout(() => setError(""), 5000); // Clear error after 5 seconds
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h2 className={styles.title}>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>Sign In to CPX LAB</h2>
        <p className={styles.subtitle}>
          Enter your email and password to access your account
        </p>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <div className={styles.inputWithIcon}>
              <FaEnvelope className={styles.inputIcon} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputWithIcon}>
              <FaLock className={styles.inputIcon} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
              <button type="submit" className={styles.loginButton}>
                <FaArrowRight />
              </button>
            </div>
          </div>
        </form>

        <p className={styles.registerLink}>
          Don't have an account?{" "}
          <Link href="/register" className={styles.link}>
            Create one
          </Link>
        </p>

        {/* Error Popup */}
        {error && (
          <div className={styles.errorPopup}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;