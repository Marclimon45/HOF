// pages/terms-of-service.js
import React from "react";
import styles from "../styles/terms-of-service.module.css"; // Create this CSS file

export default function TermsOfService() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last updated: March 18, 2025</p>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Terms of Service Statement</h2>
          <p className={styles.paragraph}>
            By accessing and using Xin’s Hall of Fame ("the Service"), you agree to comply with and be bound by these Terms of Service. If you disagree with these terms, you must discontinue your use of our services immediately.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>User Responsibilities</h2>
          <ul className={styles.list}>
            <li>You must provide accurate, truthful information when registering.</li>
            <li>Protect your account credentials and immediately report any unauthorized use.</li>
            <li>Use the Service responsibly, ethically, and legally.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Intellectual Property & User Content</h2>
          <p className={styles.paragraph}>
            Users retain ownership of all content they create and share.
          </p>
          <p className={styles.paragraph}>
            By uploading content, you grant Xin’s Hall of Fame a limited license to display, host, and distribute your content within the platform, solely to provide our service.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Acceptable Use</h2>
          <p className={styles.paragraph}>
            You agree NOT to:
          </p>
          <ul className={styles.list}>
            <li>Harass or threaten other users.</li>
            <li>Post or distribute offensive or illegal content.</li>
            <li>Attempt to gain unauthorized access to other user accounts or private information.</li>
          </ul>
          <p className={styles.paragraph}>
            Violation of these rules may result in immediate suspension or termination of your account.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Limitation of Liability</h2>
          <p className={styles.paragraph}>
            Xin’s Hall of Fame is provided "as is." We make no warranties regarding uninterrupted or error-free service. We are not liable for indirect, incidental, or consequential damages arising from your use of or inability to use our platform.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Termination</h2>
          <p className={styles.paragraph}>
            We reserve the right to terminate or suspend access to your account if you violate these Terms of Service.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Governing Law</h2>
          <p className={styles.paragraph}>
            These terms are governed by and construed in accordance with applicable laws and regulations within your jurisdiction.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Modifications</h2>
          <p className={styles.paragraph}>
            Xin’s Hall of Fame may update these terms periodically. Users will be notified of significant changes.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact Us</h2>
          <p className={styles.paragraph}>
            If you have questions regarding our terms, please contact us at:
          </p>
          <p className={styles.contact}>
            <a href="mailto:xin.qin@csulb.edu" className={styles.contactLink}>
              terms@xinshof.com
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}