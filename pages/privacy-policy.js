// pages/privacy-policy.js
import React from "react";
import styles from "../styles/privacy-policy.module.css";

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: March 18, 2025</p>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Privacy Policy Statement</h2>
          <p className={styles.paragraph}>
            At Xin’s Hall of Fame, accessible from our website, protecting the privacy and security of your personal data is paramount. This Privacy Policy outlines our practices regarding the collection, use, and protection of your information.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Information Collection and Usage</h2>
          <p className={styles.paragraph}>
            When creating an account, we may collect personal data, such as:
          </p>
          <ul className={styles.list}>
            <li>Name, email address, and contact information.</li>
            <li>Professional and social profile links (GitHub, LinkedIn, Discord).</li>
            <li>Skillsets, expertise, availability, and interests.</li>
          </ul>
          <p className={styles.paragraph}>
            We use this information solely to:
          </p>
          <ul className={styles.list}>
            <li>Provide and improve our services.</li>
            <li>Facilitate collaboration and community interactions.</li>
            <li>Manage project permissions, role assignments, and contribution tracking.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Protection & Compliance</h2>
          <p className={styles.paragraph}>
            Your personal information is securely stored and accessed only by authorized personnel.
          </p>
          <p className={styles.paragraph}>
            Our systems comply fully with applicable privacy laws, including the General Data Protection Regulation (GDPR) and the Family Educational Rights and Privacy Act (FERPA).
          </p>
          <p className={styles.paragraph}>
            We will never sell, trade, or otherwise transfer your personal data without your explicit consent.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Retention & Removal</h2>
          <p className={styles.paragraph}>
            We retain your information only as long as necessary to fulfill purposes for which it was collected. You may request deletion or correction of your personal data anytime by contacting us directly.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Security</h2>
          <p className={styles.paragraph}>
            We employ appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your data.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Third-party Access</h2>
          <p className={styles.paragraph}>
            We utilize trusted third-party providers (e.g., Firebase) to support our services. These providers are contractually obligated to protect your information with the highest standards.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Changes to This Policy</h2>
          <p className={styles.paragraph}>
            We reserve the right to update our privacy practices. Users will be notified promptly of any significant changes.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact</h2>
          <p className={styles.paragraph}>
            If you have questions or concerns regarding your data privacy, please contact us at:
          </p>
          <p className={styles.contact}>
            <a href="mailto:xin.qin@csulb.edu" className={styles.contactLink}>
              xin.qin@csulb.edu
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}