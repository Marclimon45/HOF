// components/Profile.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../styles/profile.module.css';
import { FaEnvelope, FaDiscord, FaLinkedin, FaGithub, FaGit } from 'react-icons/fa';
import { DiVisualstudio } from 'react-icons/di';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Typography } from '@mui/material';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toolIcons = {
    'git': <FaGit />,
    'Git': <FaGit />,
    'VS Code': <DiVisualstudio />
  };

  const getRankImage = (contributions) => {
    if (contributions >= 15) return '/Master.webp';
    if (contributions >= 10) return '/Diamond.webp';
    if (contributions >= 5) return '/Platinum.webp';
    if (contributions >= 3) return '/Gold.webp';
    if (contributions >= 2) return '/Silver.webp';
    if (contributions >= 1) return '/Bronze.webp';
    return '/Unranked.webp';
  };

  const getRankTitle = (contributions) => {
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
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserData(userData);
            
            // Fetch project data if user has a current project
            if (userData.currentProject && userData.currentProject.projectId) {
              const projectDoc = await getDoc(doc(db, 'projects', userData.currentProject.projectId));
              if (projectDoc.exists()) {
                const projectData = projectDoc.data();
                // Update userData with project roles
                setUserData(prev => ({
                  ...prev,
                  currentProject: {
                    ...prev.currentProject,
                    availableRoles: projectData.roles || []
                  }
                }));
              }
            }
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!userData) {
    return <div className={styles.error}>User not found</div>;
  }

  const handleEdit = () => {
    router.push('/edit-profile');
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            <Image
              src="/jeff1.jpg"
              alt="Profile"
              width={120}
              height={120}
              priority
            />
          </div>
          <h1 className={styles.userName}>{`${userData.firstName} ${userData.lastName}`}</h1>
          <div className={styles.rankContainer}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Rank:
              </Typography>
              {userData.rank && userData.rank !== 'Unranked' ? (
                <>
                  <img 
                    src={`/ranks/${userData.rank.toLowerCase()}.png`} 
                    alt={userData.rank} 
                    style={{ width: 20, height: 20 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {userData.rank}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Unranked
                </Typography>
              )}
            </Box>
          </div>
        </div>

        <div className={styles.socialLinks}>
          <Link href={`mailto:${userData.email}`} className={styles.socialLink}>
            <FaEnvelope />
          </Link>
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
            <Link href={userData.githubUrl} className={styles.socialLink}>
              <FaGithub />
            </Link>
          )}
        </div>

        <button onClick={handleEdit} className={styles.editButton}>
          Edit
        </button>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.badgeIcon}>🏆</span> Current Project
        </h2>
        <div className={styles.badgesGrid}>
          {userData?.currentProject ? (
            <div className={styles.badgeCard}>
              <h3>{userData.currentProject.role}</h3>
              <p>{userData.currentProject.name}</p>
              <span>Joined: {new Date(userData.currentProject.joinedAt).toLocaleDateString()}</span>
              {userData.currentProject.availableRoles && userData.currentProject.availableRoles.length > 0 && (
                <div className={styles.projectRoles}>
                  <p className={styles.rolesTitle}>Available Roles:</p>
                  <div className={styles.rolesList}>
                    {userData.currentProject.availableRoles.map((role, index) => (
                      <span key={index} className={styles.roleTag}>
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.badgeCard}>
              <h3>No Active Project</h3>
              <p>Not currently assigned to any project</p>
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
              {userData.skills?.map((skill, index) => (
                <span key={index} className={styles.skillTag}>{skill}</span>
              ))}
            </div>
          </div>
          <div className={styles.skillColumn}>
            <h3>Tools & Platforms</h3>
            <div className={styles.skillTags}>
              {userData.tools?.map((tool, index) => (
                <span key={index} className={styles.skillTag}>
                  {toolIcons[tool]} {tool}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.skillColumn}>
            <h3>Interest</h3>
            <div className={styles.skillTags}>
              {userData.areaOfInterest?.map((interest, index) => (
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
          {daysOfWeek.map((day) => {
            const dayKey = day.charAt(0).toLowerCase() + day.slice(1);
            const dayData = userData.availability && userData.availability[dayKey];
            const slots = dayData ? Object.values(dayData).map(slot => ({
              start: slot.start,
              end: slot.end
            })) : [];
            
            return (
              <div key={day} className={styles.dayColumn}>
                <h3>{day}</h3>
                {slots.length > 0 ? (
                  slots.map((slot, index) => (
                    <div key={index} className={styles.timeSlot}>
                      <span>{slot.start} - {slot.end}</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.busySlot}>Busy</div>
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