// components/Profile.js
import React, { useEffect, useState } from "react";
import styles from "../styles/profile.module.css";
import { FaCopy } from "react-icons/fa";

const Profile = ({ router }) => {
  const [userData, setUserData] = useState(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import("../firebase/firebaseconfig").then(({ db, auth }) => {
      import("firebase/firestore").then(({ doc, getDoc }) => {
        import("firebase/auth").then(({ onAuthStateChanged }) => {
          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
              const userDocRef = doc(db, "users", user.uid);
              try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                  setUserData(userDoc.data());
                } else {
                  console.log("No such user document!");
                }
              } catch (error) {
                console.error("Error fetching user data:", error);
              }
            } else {
              console.log("User is not signed in.");
              router.push("/login"); // Redirect to login if not authenticated
            }
            setIsLoading(false);
          });

          return () => unsubscribe();
        });
      });
    });
  }, [router]);

  const handleCopy = (text, type) => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setCopyMessage(`${type} copied to clipboard!`);
        setTimeout(() => setCopyMessage(""), 2000);
      }).catch((err) => console.error("Copy failed:", err));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>User Profile</div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>{`${userData.firstName || ''} ${userData.lastName || ''}`}</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>
          <div className={styles.infoItem}>
            <span>Email:</span>
            <div className={styles.copyContainer}>
              <span>{userData.email || 'N/A'}</span>
              <FaCopy
                className={styles.copyIcon}
                onClick={() => handleCopy(userData.email, "Email")}
              />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Social & Professional Links</h2>
          <div className={styles.infoItem}>
            <span>Discord:</span>
            <div className={styles.copyContainer}>
              <span>{userData.discordUsername || 'N/A'}</span>
              <FaCopy
                className={styles.copyIcon}
                onClick={() => handleCopy(userData.discordUsername, "Discord")}
              />
            </div>
          </div>
          <div className={styles.infoItem}>
            <span>LinkedIn:</span>
            <a href={userData.linkedinUrl || '#'} target="_blank" rel="noreferrer">
              {userData.linkedinUrl || 'N/A'}
            </a>
          </div>
          <div className={styles.infoItem}>
            <span>GitHub:</span>
            <a href={userData.githubUrl || '#'} target="_blank" rel="noreferrer">
              {userData.githubUrl || 'N/A'}
            </a>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills & Expertise</h2>
          <div className={styles.list}>
            {(userData.skills || []).map((skill, index) => (
              <span key={index} className={styles.listItem}>
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tools & Platforms</h2>
          <div className={styles.list}>
            {(userData.tools || []).map((tool, index) => (
              <span key={index} className={styles.listItem}>
                {tool}
              </span>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Availability</h2>
          <div className={styles.list}>
            {Object.entries(userData.availability || {}).map(([day, times], index) => (
              times && times.length > 0 && (
                <span key={index} className={styles.listItem}>
                  {day}: {times.map((time) => `${time.start} - ${time.end}`).join(", ")}
                </span>
              )
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Areas of Interest</h2>
          <div className={styles.list}>
            {(userData.areaOfInterest || []).map((interest, index) => (
              <span key={index} className={styles.listItem}>
                {interest}
              </span>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Badges & Achievements</h2>
          {(userData.projects && userData.projects.length > 0) ? (
            <div className={styles.projects}>
              {userData.projects.map((project, index) => (
                <div key={index} className={styles.projectCard}>
                  <h3>{project.name}</h3>
                  <p>Role: {project.role}</p>
                </div>
              ))}
            </div>
          ) : (
            <div>No projects available.</div>
          )}
        </section>
      </main>

      {copyMessage && (
        <div className={styles.popup}>
          {copyMessage}
        </div>
      )}
    </div>
  );
};

export default Profile;