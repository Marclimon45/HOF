import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/index.module.css'; // ✅ Import local CSS

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Left Side - Image */}
      <div className={styles.leftSection}>
        <Image
          src="/MainScreen.png"
          alt="CSULB Pyramid"
          fill
          className={styles.image}
          priority
        />
      </div>

      {/* Right Side - Login Section */}
      <div className={styles.rightSection}>
        <h1 className={styles.title}>CPX LAB</h1>
        <p className={styles.subtitle}>
          Focusing on ensuring the safety and <br />
          reliability of cyber-physical systems
        </p>

        {/* Sign-In Button */}
        <Link href="/register">
          <button className={styles.signInButton}>
            Sign in with Single Sign-On
          </button>
        </Link>

        <p className={styles.terms}>
          By signing in, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>

        <footer className={styles.footer}>
          © 2024 California State University Long Beach
        </footer>
      </div>
    </div>
  );
}
