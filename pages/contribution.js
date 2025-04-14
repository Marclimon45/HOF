import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, IconButton, Button, Menu, MenuItem, CircularProgress } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import styles from '../styles/contribution.module.css';
import { auth, db } from '../firebase/firebaseconfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import Navbar from '../components/navbar';

const formatDate = (dateString) => {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Recently';
  }
};

const getRankClass = (contributions, isCPSMember) => {
  if (isCPSMember) {
    // CPS members get gold rank with platinum layout
    return 'cps';
  }
  if (contributions >= 20) return 'grandmaster';
  if (contributions >= 15) return 'master';
  if (contributions >= 10) return 'diamond';
  if (contributions >= 5) return 'platinum';
  if (contributions >= 3) return 'gold';
  if (contributions >= 2) return 'silver';
  if (contributions >= 1) return 'bronze';
  return 'unranked';
};

export default function Contribution() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedView, setSelectedView] = useState('all');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const router = useRouter();
  const projectsPerPage = 9;

  // Project statistics and filtered lists
  const projectLists = {
    all: projects,
    active: projects.filter(p => {
      const status = (p.status || '').toLowerCase();
      return status === 'active' || status === 'looking for members';
    }),
    completed: projects.filter(p => (p.status || '').toLowerCase() === 'completed'),
    liked: projects.filter(p => p.isBookmarked),
    archived: projects.filter(p => (p.status || '').toLowerCase() === 'archived')
  };

  const stats = {
    total: projects.length,
    active: projectLists.active.length,
    completed: projectLists.completed.length,
    liked: projectLists.liked.length,
    archived: projectLists.archived.length,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Get user document for projects and bookmarks
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          console.log('User document not found');
          return;
        }

        const userDataFromDb = userDoc.data();
        setUserData(userDataFromDb);
        const userProjects = userDataFromDb.projects || {};
        const bookmarkedProjects = userDataFromDb.bookmarkedProjects || [];
        const currentProject = userDataFromDb.currentProject;

        // First, get all projects where user is directly involved
        const projectIds = [...new Set([
          ...Object.keys(userProjects),
          ...bookmarkedProjects,
          ...(currentProject?.projectId ? [currentProject.projectId] : [])
        ])];

        // Also fetch projects where user is listed in roles array
        const rolesQuery = query(
          collection(db, 'projects'),
          where('roles', 'array-contains', {
            role: "Full Stack Developer",
            userId: user.uid
          })
        );
        
        const rolesSnapshot = await getDocs(rolesQuery);
        rolesSnapshot.forEach(doc => {
          if (!projectIds.includes(doc.id)) {
            projectIds.push(doc.id);
          }
        });

        // Fetch all projects to check roles manually as well
        const allProjectsQuery = query(collection(db, 'projects'));
        const allProjectsSnapshot = await getDocs(allProjectsQuery);
        
        allProjectsSnapshot.forEach(doc => {
          const projectData = doc.data();
          const userInRoles = projectData.roles?.some(role => role.userId === user.uid);
          if (userInRoles && !projectIds.includes(doc.id)) {
            projectIds.push(doc.id);
          }
        });
        
        // Fetch full project details
        const projectPromises = projectIds.map(async (projectId) => {
          try {
            const projectDoc = await getDoc(doc(db, 'projects', projectId));
            if (projectDoc.exists()) {
              const projectData = projectDoc.data();
              const userProjectData = userProjects[projectId] || {};
              const isCurrentProject = currentProject?.projectId === projectId;
              const isBookmarked = bookmarkedProjects.includes(projectId);

              // Find user's role in project roles array
              const roleInArray = projectData.roles?.find(r => r.userId === user.uid);
              const userRole = roleInArray?.role ||
                             userProjectData.role || 
                             (isCurrentProject ? currentProject.role : '') || 
                             projectData.userRole || 
                             'Member';

              // Get joined date from different possible sources
              const joinedAt = userProjectData.joinedAt || 
                             (isCurrentProject ? currentProject.joinedAt : '') ||
                             projectData.createdAt;

              // Get status with proper fallback
              const status = projectData.status?.toLowerCase() || 'active';

              return {
                id: projectId,
                ...projectData,
                userRole: userRole,
                joinedAt: joinedAt,
                status: status,
                isBookmarked: isBookmarked,
                category: projectData.category || projectData.projectType || 'Not specified'
              };
            }
            console.log(`Project ${projectId} not found`);
            return null;
          } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error);
            return null;
          }
        });

        const fetchedProjects = (await Promise.all(projectPromises)).filter(Boolean);
        console.log('Fetched projects:', fetchedProjects); // Debug log
        
        // Sort projects by joined date
        const sortedProjects = fetchedProjects.sort((a, b) => {
          return new Date(b.joinedAt || 0) - new Date(a.joinedAt || 0);
        });

        setProjects(sortedProjects);
        setFilteredProjects(sortedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    // Update filtered projects when view changes
    const currentList = projectLists[selectedView] || projects;
    console.log(`Filtered projects for ${selectedView}:`, currentList); // Debug log
    setFilteredProjects(currentList);
  }, [selectedView, projects]);

  const handleViewChange = (view) => {
    setSelectedView(view);
    setFilteredProjects(projectLists[view] || projects);
    setCurrentPage(1);
  };

  // Filter handlers
  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelect = (sortType) => {
    setSortBy(sortType);
    let sorted = [...filteredProjects];

    switch (sortType) {
      case 'a-z':
        sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'z-a':
        sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'recent':
        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'updated':
        sorted.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        break;
      default:
        break;
    }

    setFilteredProjects(sorted);
    handleSortClose();
  };

  // Pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
        <Typography>Loading your projects...</Typography>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <Box className={styles.container}>
        <Box className={styles.statsContainer}>
          <Card 
            className={`${styles.statCard} ${styles[getRankClass(userData?.contributions, userData?.isCPSMember)]} ${selectedView === 'all' ? styles.selectedCard : ''}`}
            onClick={() => handleViewChange('all')}
          >
            <CardContent>
              <Typography variant="h3">{stats.total}</Typography>
              <Typography color="inherit">Total Projects</Typography>
            </CardContent>
          </Card>
          <Card 
            className={`${styles.statCard} ${styles.activeStats} ${selectedView === 'active' ? styles.selectedCard : ''}`}
            onClick={() => handleViewChange('active')}
          >
            <CardContent>
              <Typography variant="h3">{stats.active}</Typography>
              <Typography color="inherit">Active Projects</Typography>
            </CardContent>
          </Card>
          <Card 
            className={`${styles.statCard} ${styles.completedStats} ${selectedView === 'completed' ? styles.selectedCard : ''}`}
            onClick={() => handleViewChange('completed')}
          >
            <CardContent>
              <Typography variant="h3">{stats.completed}</Typography>
              <Typography color="inherit">Completed Projects</Typography>
            </CardContent>
          </Card>
          <Card 
            className={`${styles.statCard} ${styles.likedStats} ${selectedView === 'liked' ? styles.selectedCard : ''}`}
            onClick={() => handleViewChange('liked')}
          >
            <CardContent>
              <Typography variant="h3">{stats.liked}</Typography>
              <Typography color="inherit">Liked Projects</Typography>
            </CardContent>
          </Card>
          <Card 
            className={`${styles.statCard} ${styles.archivedStats} ${selectedView === 'archived' ? styles.selectedCard : ''}`}
            onClick={() => handleViewChange('archived')}
          >
            <CardContent>
              <Typography variant="h3">{stats.archived}</Typography>
              <Typography color="inherit">Archived Projects</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box className={styles.filterSection}>
          <Typography variant="h6">
            {selectedView === 'all' ? 'Your Projects' : 
             selectedView === 'liked' ? 'Liked Projects' :
             `${selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Projects`}
          </Typography>
          <Box className={styles.controls}>
            <IconButton onClick={handleSortClick} className={styles.controlButton}>
              <SortIcon />
            </IconButton>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
            >
              <MenuItem onClick={() => handleSortSelect('a-z')}>Sort A-Z</MenuItem>
              <MenuItem onClick={() => handleSortSelect('z-a')}>Sort Z-A</MenuItem>
              <MenuItem onClick={() => handleSortSelect('recent')}>Most Recent</MenuItem>
              <MenuItem onClick={() => handleSortSelect('updated')}>Last Updated</MenuItem>
            </Menu>
          </Box>
        </Box>

        {filteredProjects.length === 0 ? (
          <Box className={styles.noProjects}>
            <Typography variant="h6" color="textSecondary">
              {selectedView === 'liked' ? "You haven't liked any projects yet." :
               selectedView === 'completed' ? "You don't have any completed projects." :
               selectedView === 'archived' ? "You don't have any archived projects." :
               selectedView === 'active' ? "You don't have any active projects." :
               "You haven't joined any projects yet."}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/projects')}
              sx={{ mt: 2 }}
            >
              Browse Projects
            </Button>
          </Box>
        ) : (
          <>
            <Box className={styles.projectsGrid}>
              {currentProjects.map((project) => {
                const isActive = project.status?.toLowerCase() === 'active' || 
                                project.status?.toLowerCase() === 'looking for members';
                const cardClassName = `${styles.projectCard} ${
                  isActive && project.isBookmarked 
                    ? styles.likedActive
                    : project.status?.toLowerCase() === 'archived' && project.isBookmarked
                    ? styles.likedArchived
                    : project.status?.toLowerCase() === 'completed' && project.isBookmarked
                    ? styles.likedCompleted
                    : project.isBookmarked
                    ? styles.likedCard
                    : project.status?.toLowerCase() === 'completed'
                    ? styles.completedCard
                    : project.status?.toLowerCase() === 'archived'
                    ? styles.archivedCard
                    : styles.activeCard
                }`;

                return (
                  <Card 
                    key={project.id} 
                    className={cardClassName}
                    onClick={() => router.push(`/project/${project.id}`)}
                  >
                    <CardContent>
                      <Typography variant="h6" className={styles.projectTitle}>
                        {project.title}
                      </Typography>
                      <Box className={styles.roleInfo}>
                        <Typography variant="body2" color="textSecondary" className={styles.projectType}>
                          {project.userRole}
                        </Typography>
                        <Chip 
                          label={project.status?.toUpperCase() || 'ACTIVE'} 
                          size="small" 
                          className={`${styles.statusChip} ${styles[project.status?.toLowerCase() || 'active']}`}
                        />
                      </Box>
                      <Typography variant="body2" className={styles.projectDescription}>
                        {project.description || 'No description available'}
                      </Typography>
                      <Box className={styles.tags}>
                        {project.tags?.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" className={styles.tag} />
                        ))}
                      </Box>
                      <Box className={styles.projectMeta}>
                        <Typography variant="body2">
                          {project.isBookmarked ? 'Bookmarked' : `Joined: ${formatDate(project.joinedAt)}`}
                        </Typography>
                        <Typography variant="body2">
                          Category: {project.category}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            <Box className={styles.pagination}>
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <Typography>
                Page {currentPage} of {totalPages}
              </Typography>
              <Button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}

function ProjectCard({ project }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/project/${project.id}`);
  };

  return (
    <Card className={styles.projectCard} onClick={handleClick}>
      <CardContent>
        <Typography variant="h6" className={styles.projectTitle}>
          {project.title}
        </Typography>
        <Box className={styles.roleInfo}>
          <Typography variant="body2" color="textSecondary" className={styles.projectType}>
            {project.userRole}
          </Typography>
          <Chip 
            label={project.status?.toUpperCase() || 'ACTIVE'} 
            size="small" 
            className={`${styles.statusChip} ${styles[project.status?.toLowerCase() || 'active']}`}
          />
        </Box>
        <Typography variant="body2" className={styles.projectDescription}>
          {project.description || 'No description available'}
        </Typography>
        <Box className={styles.tags}>
          {project.tags?.map((tag, index) => (
            <Chip key={index} label={tag} size="small" className={styles.tag} />
          ))}
        </Box>
        <Box className={styles.projectMeta}>
          <Typography variant="body2">
            {project.isBookmarked ? 'Bookmarked' : `Joined: ${formatDate(project.joinedAt)}`}
          </Typography>
          <Typography variant="body2">
            Category: {project.category}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
} 