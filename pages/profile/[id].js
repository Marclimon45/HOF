import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebaseconfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import styles from '../../styles/profile.module.css';
import { FaEnvelope, FaDiscord, FaLinkedin, FaGithub, FaGit, FaGlobe } from 'react-icons/fa';
import { DiVisualstudio } from 'react-icons/di';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Typography, Button } from '@mui/material';

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  const toolIcons = {
    'git': <FaGit />,
    'Git': <FaGit />,
    'VS Code': <DiVisualstudio />
  };

  const getRankImage = (contributions, isCPSMember) => {
    if (isCPSMember) return '/CPS.png';
    if (contributions >= 15) return '/Master.png';
    if (contributions >= 10) return '/Diamond.png';
    if (contributions >= 5) return '/Platinum.png';
    if (contributions >= 3) return '/Gold.png';
    if (contributions >= 2) return '/Silver.png';
    if (contributions >= 1) return '/Bronze.png';
    return '/Unranked.png';
  };

  const getRankTitle = (contributions, isCPSMember) => {
    if (isCPSMember) return 'CPS';
    if (contributions >= 15) return 'Master';
    if (contributions >= 10) return 'Diamond';
    if (contributions >= 5) return 'Platinum';
    if (contributions >= 3) return 'Gold';
    if (contributions >= 2) return 'Silver';
    if (contributions >= 1) return 'Bronze';
    return 'Unranked';
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', id));
        
        if (!userDoc.exists()) {
          setError('User profile not found');
          setLoading(false);
          return;
        }

        const data = userDoc.data();

        // Fetch all projects
        const projectsRef = collection(db, 'projects');
        const projectsSnapshot = await getDocs(projectsRef);
        const userProjects = [];
        
        // Filter projects where user is a member
        for (const projectDoc of projectsSnapshot.docs) {
          const projectData = projectDoc.data();
          
          // Ensure roles is an array and handle potential undefined
          const roles = Array.isArray(projectData.roles) ? projectData.roles : [];
          
          // Find role where user is a member
          const userRole = roles.find(role => 
            role && typeof role === 'object' && role.userId === id
          );
          
          if (userRole) {
            userProjects.push({
              id: projectDoc.id,
              title: projectData.title || 'Untitled Project',
              role: userRole.role || 'Member',
              joinedAt: userRole.joinedAt || projectData.createdAt,
              status: projectData.status || 'Active'
            });
          }
        }

        // Update user data with projects
        setUserData({
          ...data,
          currentProjects: userProjects
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/team')} className={styles.editButton}>
            Back to Team
          </button>
        </div>
      </div>
    );
  }

  if (loading || !userData) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading profile data...</div>
      </div>
    );
  }

  // Filter projects to only show active and looking for members
  const currentProjects = userData.currentProjects.filter(project => {
    const status = (project.status || '').toLowerCase();
    return status === 'active' || status === 'looking for members';
  });

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.rankAndAvatar}>
            <div className={styles.avatar}>
              <Image
                src={userData.profilePicture || "/images/default-avatar.png"}
                alt="Profile"
                width={120}
                height={120}
                priority
              />
            </div>
            <div className={styles.rankDisplay}>
              <img 
                src={getRankImage(userData.contributions, userData.isCPSMember)}
                alt={getRankTitle(userData.contributions, userData.isCPSMember)}
                className={styles.rankIcon}
                data-rank={getRankTitle(userData.contributions, userData.isCPSMember)}
              />
              <Typography variant="body2" className={styles.rankTitle}>
                {getRankTitle(userData.contributions, userData.isCPSMember)}
              </Typography>
            </div>
          </div>
          <h1 className={styles.userName}>
            {`${userData.firstName || ''} ${userData.middleName ? userData.middleName + ' ' : ''}${userData.lastName || ''}`}
          </h1>
        </div>

        <div className={styles.socialLinks}>
          {userData.email && (
            <Link href={`mailto:${userData.email}`} className={styles.socialLink}>
              <FaEnvelope />
            </Link>
          )}
          {userData.discordUsername && (
            <Link href="#" className={styles.socialLink}>
              <FaDiscord />
            </Link>
          )}
          {userData.linkedinUrl && (
            <Link href={userData.linkedinUrl} className={styles.socialLink}>
              <FaLinkedin />
            </Link>
          )}
          {userData.githubUrl && (
            <Link href={userData.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FaGithub className={styles.socialIcon} />
            </Link>
          )}
          {userData.websiteUrl && (
            <Link href={userData.websiteUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FaGlobe className={styles.socialIcon} />
            </Link>
          )}
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.badgeIcon}>🏆</span> Current Projects
        </h2>
        <div className={styles.projectsGrid}>
          {currentProjects.length > 0 ? (
            currentProjects.map((project) => (
              <div key={project.id} className={`${styles.projectCard} ${styles[project.status.toLowerCase()]}`}>
                <div className={styles.projectHeader}>
                  <h3>{project.title}</h3>
                  <span className={`${styles.statusBadge} ${styles[project.status.toLowerCase()]}`}>
                    {project.status}
                  </span>
                </div>
                <div className={styles.projectContent}>
                  <div className={styles.roleInfo}>
                    <span className={styles.roleIcon}>👤</span>
                    <p className={styles.roleText}>{project.role}</p>
                  </div>
                  <div className={styles.dateInfo}>
                    <span className={styles.dateIcon}>📅</span>
                    <span className={styles.joinDate}>
                      Joined: {new Date(project.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className={styles.projectActions}>
                  <Link href={`/project/${project.id}`} passHref>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small" 
                      className={styles.viewButton}
                    >
                      View Project
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noProjects}>
              <p>No active projects</p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.badgeIcon}>🎯</span> Completed Projects
        </h2>
        <div className={styles.projectsGrid}>
          {userData.currentProjects?.filter(p => p.status === 'Completed')?.length > 0 ? (
            userData.currentProjects
              .filter(p => p.status === 'Completed')
              .map((project) => (
                <div key={project.id} className={`${styles.projectCard} ${styles.completed}`}>
                  <div className={styles.projectHeader}>
                    <h3>{project.title}</h3>
                    <span className={`${styles.statusBadge} ${styles.completed}`}>
                      Completed
                    </span>
                  </div>
                  <div className={styles.projectContent}>
                    <div className={styles.roleInfo}>
                      <span className={styles.roleIcon}>👤</span>
                      <p className={styles.roleText}>{project.role}</p>
                    </div>
                    <div className={styles.dateInfo}>
                      <span className={styles.dateIcon}>📅</span>
                      <span className={styles.joinDate}>
                        Completed: {new Date(project.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.projectActions}>
                    <Link href={`/project/${project.id}`} passHref>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small" 
                        className={styles.viewButton}
                      >
                        View Project
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
          ) : (
            <div className={styles.noProjectCard}>
              <h3>No Completed Projects</h3>
              <p>No completed projects yet</p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Skills & Expertise</h2>
        <div className={styles.skillsGrid}>
          <div className={styles.skillColumn}>
            <h3>Technical Skills</h3>
            <div className={styles.skillTags}>
              {(userData.skills || []).map((skill, index) => (
                <span key={index} className={styles.skillTag}>{skill}</span>
              ))}
            </div>
          </div>
          <div className={styles.skillColumn}>
            <h3>Tools & Platforms</h3>
            <div className={styles.skillTags}>
              {(userData.tools || []).map((tool, index) => (
                <span key={index} className={styles.skillTag}>
                  {toolIcons[tool] || null} {tool}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.skillColumn}>
            <h3>Areas of Interest</h3>
            <div className={styles.skillTags}>
              {(userData.areaOfInterest || []).map((interest, index) => (
                <span key={index} className={styles.skillTag}>{interest}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.timeIcon}>⏰</span> Time Availability
        </h2>
        <div className={styles.availabilityGrid}>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
            const dayAvailability = userData.availability?.[day];
            return (
              <div key={day} className={styles.dayColumn}>
                <h3>{day}</h3>
                {dayAvailability && dayAvailability.length > 0 ? (
                  dayAvailability.map((slot, index) => (
                    <div key={index} className={styles.timeSlot} style={{ backgroundColor: '#e8f5e9' }}>
                      <span className={styles.timeRange}>
                        {slot.start} - {slot.end}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className={styles.busySlot}>
                    Not Available
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <footer className={styles.footer}>
        © 2025 Xin's Hall of Fame. All rights reserved.
      </footer>
    </div>
  );
} 