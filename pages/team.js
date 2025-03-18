import React from "react";
import styles from "../styles/team.module.css";
import { FaCog, FaQuestionCircle } from "react-icons/fa";

const Team = () => {
  // Sample team member data
  const teamMembers = [
    { name: "Joseph Davis", rank: "Contributor", contributions: 3, degree: "Computer Science, 4th year", website: "https://josephdavis.com" },
    { name: "Ryo Fujimara", rank: "Master", contributions: 15, degree: "Computer Science, 4th year", website: "https://ryofujimara.com" },
    { name: "Aleksander Alderete", rank: "Top 500", contributions: 10, degree: "Computer Science, 4th year", website: "https://aleksanderaberto.com" },
    { name: "Shivang Patel", rank: "Unranked", contributions: 0, degree: "Computer Science, 4th year", website: "https://shivangpatel.com" },
    { name: "Tanaya Krishna Japalli", rank: "Contributor", contributions: 2, degree: "Computer Science, 4th year", website: "https://tanayajapalli.com" },
    { name: "Aleksander Alderete", rank: "Top 500", contributions: 5, degree: "Economics, 4th year", website: "https://aleksanderaberto.com" },
    { name: "Jonah Rani", rank: "Contributor", contributions: 1, degree: "Computer Science, 4th year", website: "https://jonahrani.com" },
    { name: "Thung Le", rank: "Master", contributions: 15, degree: "Computer Science, 4th year", website: "https://thungle.com" },
    { name: "Aleksander Alderete", rank: "Top 500", contributions: 10, degree: "Economics, 4th year", website: "https://aleksanderaberto.com" },
  ];

  // Founder data
  const founder = {
    name: "Xin Qin",
    description: "MD in Computer Science, Professor monitoring safety of cyber-physical systems using formal methods, postdoctoral monitoring, verification, and machine learning applied to FPGAs. PhD in Computer Science from University of California, MS from Peking University, and BS from Peking University.",
    avatar: "/assets/xin-qin-avatar.png", // Placeholder avatar image
  };

  // Mapping ranks to Overwatch-style icons (assumed to be in /assets)
  const rankIcons = {
    GrandMaster: "/assets/grandmaster.png",
    Master: "/assets/master.png",
    "Top 500": "/assets/top500.png",
    Contributor: "/assets/contributor.png",
    Unranked: null, // No icon for Unranked
  };

  // Determine badge based on contributions
  const getBadge = (contributions) => {
    if (contributions >= 15) return "Master";
    if (contributions >= 10) return "Diamond";
    if (contributions >= 5) return "Platinum";
    if (contributions >= 3) return "Gold";
    if (contributions >= 2) return "Silver";
    if (contributions >= 1) return "Bronze";
    return "Unranked";
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>Xin's Hall of Fame</div>
        <nav className={styles.nav}>
          <a href="#">Home</a>
          <a href="#">Projects & Publications</a>
          <a href="#">About us</a>
          <FaCog className={styles.settingsIcon} />
        </nav>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <h1 className={styles.title}>Meet Our Team</h1>

        {/* Questions Section */}
        <div className={styles.questions}>
          <div className={styles.question}>
            <FaQuestionCircle className={styles.questionIcon} />
            <span>How do we provide safety guarantees for the CPS system?</span>
          </div>
          <div className={styles.question}>
            <FaQuestionCircle className={styles.questionIcon} />
            <span>Can we use the analysis results to improve the system design?</span>
          </div>
          <div className={styles.question}>
            <FaQuestionCircle className={styles.questionIcon} />
            <span>How can we enable the system to understand multiple complex requirements?</span>
          </div>
          <div className={styles.question}>
            <FaQuestionCircle className={styles.questionIcon} />
            <span>How do we find requirements that best suitable for the system and the environment?</span>
          </div>
        </div>

        {/* Founder Section */}
        <div className={styles.founderSection}>
          <h2 className={styles.sectionTitle}>Founder</h2>
          <a href="#" className={styles.visionLink}>View our vision and strategy</a>
          <div className={styles.founderCard}>
            <img src={founder.avatar} alt="Xin Qin Avatar" className={styles.avatar} />
            <div className={styles.founderInfo}>
              <h3>{founder.name}</h3>
              <p>{founder.description}</p>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className={styles.membersSection}>
          <h2 className={styles.sectionTitle}>Members</h2>
          <div className={styles.membersGrid}>
            {teamMembers.map((member, index) => (
              <div key={index} className={styles.memberCard}>
                <div className={styles.memberInfo}>
                  {rankIcons[member.rank] ? (
                    <img
                      src={rankIcons[member.rank]}
                      alt={`${member.rank} icon`}
                      className={styles.rankIcon}
                    />
                  ) : (
                    <span className={styles.noIcon}></span>
                  )}
                  <h3>{member.name}</h3>
                </div>
                <p>{member.degree}</p>
                <a href={member.website} target="_blank" rel="noreferrer" className={styles.websiteLink}>
                  Personal Website
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.cta}>
          <h2>Join Our Growing Team</h2>
          <p>Please send your information to join our team! A brief letter of CV or brief self-introduction or research interests.</p>
          <a
            href="https://forms.gle/6uk8q2qiLSHBRfWDA"
            target="_blank"
            rel="noreferrer"
            className={styles.emailLink}
          >
            Email us
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Team;