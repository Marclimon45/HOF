// pages/login.js
import React, { useState } from "react";
import styles from "../styles/login.module.css";
import { FaArrowRight, FaEnvelope, FaLock } from "react-icons/fa";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseconfig";
import { useRouter } from "next/router";
import Link from "next/link"; // ✅ Added missing import for Link

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/homepage"); // Redirect to homepage on successful login
    } catch (err) {
      setError("Incorrect email or password. Please try again.");
      setTimeout(() => setError(""), 3000); // Clear error after 3 seconds
    }
  };

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
          Don’t have an account?{" "}
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