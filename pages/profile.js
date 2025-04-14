// components/Profile.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseconfig';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../styles/profile.module.css';
import { FaEnvelope, FaDiscord, FaLinkedin, FaGithub, FaGit, FaGlobe } from 'react-icons/fa';
import { DiVisualstudio } from 'react-icons/di';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toolIcons = {
    'git': <FaGit />,
    'Git': <FaGit />,
    'VS Code': <DiVisualstudio />
  };

  const getRankImage = (contributions, isCPSMember) => {
    if (isCPSMember) return '/CPS.webp';
    if (contributions >= 15) return '/Master.webp';
    if (contributions >= 10) return '/Diamond.webp';
    if (contributions >= 5) return '/Platinum.webp';
    if (contributions >= 3) return '/Gold.webp';
    if (contributions >= 2) return '/Silver.webp';
    if (contributions >= 1) return '/Bronze.webp';
    return '/Unranked.webp';
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
    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log('No user logged in');
          setError('Please log in to view your profile');
          setLoading(false);
          return;
        }

        console.log('Fetching data for user:', user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          console.log('No user document found');
          setError('User profile not found');
          setLoading(false);
          return;
        }

        const data = userDoc.data();
        console.log('Raw user data:', data);

        // Fetch all projects
        const projectsRef = collection(db, 'projects');
        const projectsSnapshot = await getDocs(projectsRef);
        const userProjects = [];
        
        // Filter projects where user is a member
        for (const projectDoc of projectsSnapshot.docs) {
          const projectData = projectDoc.data();
          console.log('Checking project:', projectDoc.id, 'Roles:', projectData.roles);
          
          // Ensure roles is an array and handle potential undefined
          const roles = Array.isArray(projectData.roles) ? projectData.roles : [];
          
          // Find role where user is a member
          const userRole = roles.find(role => 
            role && typeof role === 'object' && role.userId === user.uid
          );
          
          if (userRole) {
            console.log('Found user role in project:', projectDoc.id, userRole);
            userProjects.push({
              id: projectDoc.id,
              title: projectData.title || 'Untitled Project',
              role: userRole.role || 'Member',
              joinedAt: userRole.joinedAt || projectData.createdAt,
              status: projectData.status || 'Active'
            });
          }
        }

        console.log('User projects found:', userProjects);

        // Calculate contributions based on active projects
        const contributions = userProjects.length;

        // Update user's contributions in Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          contributions: contributions
        });

        // Update user data with projects and contributions
        setUserData({
          ...data,
          currentProjects: userProjects,
          contributions: contributions
        });
        
        console.log('Updated user data:', {
          ...data,
          currentProjects: userProjects,
          contributions: contributions
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchUserData:', error);
        setError('Failed to load profile data: ' + error.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/')} className={styles.editButton}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading profile data...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Profile Not Found</h2>
          <p>Unable to load user profile</p>
          <button onClick={() => router.push('/')} className={styles.editButton}>
            Go Home
          </button>
        </div>
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
              src={userData.photoURL || "/jeff1.jpg"}
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
            <Link
              href={userData.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <FaGithub className={styles.socialIcon} />
            </Link>
          )}
          {userData.websiteUrl && (
            <Link
              href={userData.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <FaGlobe className={styles.socialIcon} />
            </Link>
          )}
        </div>

        <button 
          onClick={() => router.push('/edit-profile')} 
          className={styles.editButton}
          aria-label="Edit Profile"
        >
          Edit Profile
        </button>
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
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push('/projects')}
              >
                Browse Projects
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.badgeIcon}>🎯</span> Completed Projects
        </h2>
        <div className={styles.projectsGrid}>
          {userData?.currentProjects?.filter(p => p.status === 'Completed')?.length > 0 ? (
            userData.currentProjects
              .filter(p => p.status === 'Completed')
              .map((project, index) => (
                <div key={index} className={`${styles.projectCard} ${styles.completed}`}>
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
              <p>You haven't completed any projects yet</p>
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
            <h3>Interest</h3>
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
          {daysOfWeek.map((day) => {
            // Use the exact day name as it appears in Firebase (with first letter capitalized)
            const dayData = userData.availability?.[day];
            console.log(`Checking availability for ${day}:`, dayData);
            
            // Handle the array structure from Firebase
            let timeSlots = [];
            if (Array.isArray(dayData)) {
              timeSlots = dayData.map(slot => ({
                start: slot.start,
                end: slot.end
              }));
            }
            
            return (
              <div key={day} className={styles.dayColumn}>
                <h3>{day}</h3>
                {timeSlots.length > 0 ? (
                  timeSlots.map((slot, index) => (
                    <div key={index} className={styles.timeSlot}>
                      <span className={styles.timeRange}>
                        {slot.start} - {slot.end}
                      </span>
                </div>
                  ))
                ) : (
                  <div className={styles.busySlot}>Not Available</div>
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