'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  IconButton, 
  Button, 
  Menu, 
  MenuItem, 
  CircularProgress,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ClearIcon from '@mui/icons-material/Clear';
import { auth, db } from '../firebase/firebaseconfig';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import styles from '../styles/projects.module.css';
import Navbar from '../components/navbar';
import dynamic from 'next/dynamic';

const ITEMS_PER_PAGE = 9;
const CATEGORIES = ['Machine Learning', 'Sustainability', 'Education', 'Design', 'Business', 'Technology'];
const TEAM_SIZES = [
  'Solo (1 person)',
  'Small (2-3 people)',
  'Medium (4-6 people)',
  'Large (7-10 people)',
  'Extra Large (10+ people)'
];
const COMMON_SKILLS = [
  'JavaScript',
  'Python',
  'React',
  'Node.js',
  'Machine Learning',
  'Data Analysis',
  'UI/UX Design',
  'Cloud Computing',
  'Mobile Development',
  'Database Management'
];

// Disable SSR for this component
const ProjectsAndPublications = dynamic(() => Promise.resolve(ProjectsAndPublicationsContent), {
  ssr: false
});

function ProjectsAndPublicationsContent() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFilter, setOpenFilter] = useState(false);
  const [teamSize, setTeamSize] = useState('');
  const [customSkills, setCustomSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [areaOfInterest, setAreaOfInterest] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsRef = collection(db, 'projects');
      const projectsSnapshot = await getDocs(projectsRef);
      const projectsList = [];

      for (const projectDoc of projectsSnapshot.docs) {
        const projectData = projectDoc.data();
        const teamSize = projectData.roles?.length || 0;
        
        // Get bookmarked status if user is logged in
        let isBookmarked = false;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          isBookmarked = userData.bookmarkedProjects?.includes(projectDoc.id) || false;
        }

        projectsList.push({
          id: projectDoc.id,
          ...projectData,
          teamSize,
          isBookmarked
        });
      }

      const sortedProjects = projectsList.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setProjects(sortedProjects);
      setFilteredProjects(sortedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    filterProjects(query, teamSize, customSkills);
  };

  const filterProjects = (query, size, skills) => {
    let filtered = projects;

    if (query) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query)
      );
    }

    if (size) {
      filtered = filtered.filter(project => project.teamSize === size);
    }

    if (areaOfInterest) {
      filtered = filtered.filter(project => 
        project.category === areaOfInterest
      );
    }

    if (skills.length > 0) {
      filtered = filtered.filter(project =>
        skills.every(skill =>
          project.requiredSkills?.some(projectSkill =>
            projectSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    setFilteredProjects(filtered);
    setCurrentPage(1);
  };

  const handleAddSkill = (skill) => {
    if (!customSkills.includes(skill)) {
      const newSkills = [...customSkills, skill];
      setCustomSkills(newSkills);
      filterProjects(searchQuery, teamSize, newSkills);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    const newSkills = customSkills.filter(skill => skill !== skillToRemove);
    setCustomSkills(newSkills);
    filterProjects(searchQuery, teamSize, newSkills);
  };

  const handleTeamSizeChange = (event) => {
    const size = event.target.value;
    setTeamSize(size);
    filterProjects(searchQuery, size, customSkills);
  };

  const handleAreaChange = (event) => {
    const area = event.target.value;
    setAreaOfInterest(area);
    filterProjects(searchQuery, teamSize, customSkills);
  };

  const clearFilter = (type) => {
    switch (type) {
      case 'area':
        setAreaOfInterest('');
        filterProjects(searchQuery, teamSize, customSkills);
        break;
      case 'size':
        setTeamSize('');
        filterProjects(searchQuery, '', customSkills);
        break;
      case 'skill':
        setCustomSkills([]);
        filterProjects(searchQuery, teamSize, []);
        break;
      case 'search':
        setSearchQuery('');
        filterProjects('', teamSize, customSkills);
        break;
    }
  };

  const handleBookmark = async (projectId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const bookmarkedProjects = userData.bookmarkedProjects || [];
      const isCurrentlyBookmarked = bookmarkedProjects.includes(projectId);

      await updateDoc(userRef, {
        bookmarkedProjects: isCurrentlyBookmarked 
          ? arrayRemove(projectId)
          : arrayUnion(projectId)
      });

      // Update local state
      setProjects(projects.map(project => 
        project.id === projectId 
          ? { ...project, isBookmarked: !isCurrentlyBookmarked }
          : project
      ));
      setFilteredProjects(filteredProjects.map(project => 
        project.id === projectId 
          ? { ...project, isBookmarked: !isCurrentlyBookmarked }
          : project
      ));
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelect = (sortType) => {
    let sorted = [...filteredProjects];
    switch (sortType) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'team-size':
        sorted.sort((a, b) => b.teamSize - a.teamSize);
        break;
      default:
        break;
    }
    setFilteredProjects(sorted);
    handleSortClose();
  };

  // Calculate current projects for pagination
  const indexOfLastProject = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstProject = indexOfLastProject - ITEMS_PER_PAGE;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  if (!mounted) {
    return (
      <>
        <Navbar />
        <Box className={styles.container}>
          <Box className={styles.loadingContainer}>
            <CircularProgress />
            <Typography>Loading...</Typography>
          </Box>
        </Box>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <Box className={styles.container}>
          <Box className={styles.loadingContainer}>
            <CircularProgress />
            <Typography>Loading projects...</Typography>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box className={styles.container}>
        <Typography variant="h4" className={styles.pageTitle}>
          Projects & Publications
        </Typography>
        
        <Box className={styles.searchAndFilters}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={handleSearch}
            className={styles.searchField}
          />
          
          <Box className={styles.filterControls}>
            <IconButton onClick={() => setOpenFilter(true)}>
              <FilterListIcon />
            </IconButton>
            <IconButton onClick={handleSortClick}>
              <SortIcon />
            </IconButton>
          </Box>

          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={handleSortClose}
          >
            <MenuItem onClick={() => handleSortSelect('recent')}>Most Recent</MenuItem>
            <MenuItem onClick={() => handleSortSelect('oldest')}>Oldest First</MenuItem>
            <MenuItem onClick={() => handleSortSelect('team-size')}>Team Size</MenuItem>
          </Menu>
        </Box>

        {/* Active Filter Indicators */}
        {(searchQuery || teamSize || areaOfInterest || customSkills.length > 0) && (
          <Box className={styles.activeFilters}>
            {searchQuery && (
              <Chip
                label={`Search: ${searchQuery}`}
                onDelete={() => clearFilter('search')}
                className={styles.filterIndicator}
                deleteIcon={<ClearIcon />}
              />
            )}
            {areaOfInterest && (
              <Chip
                label={`Area: ${areaOfInterest}`}
                onDelete={() => clearFilter('area')}
                className={styles.filterIndicator}
                deleteIcon={<ClearIcon />}
              />
            )}
            {teamSize && (
              <Chip
                label={`Team Size: ${teamSize}`}
                onDelete={() => clearFilter('size')}
                className={styles.filterIndicator}
                deleteIcon={<ClearIcon />}
              />
            )}
            {customSkills.map((skill) => (
              <Chip
                key={skill}
                label={`Skill: ${skill}`}
                onDelete={() => handleRemoveSkill(skill)}
                className={styles.filterIndicator}
                deleteIcon={<ClearIcon />}
              />
            ))}
          </Box>
        )}

        <Grid container spacing={3} className={styles.projectsGrid}>
          {currentProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card className={styles.projectCard}>
                <CardContent>
                  <Box className={styles.cardHeader}>
                    <Typography variant="h6" className={styles.projectTitle}>
                      {project.title}
                    </Typography>
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(project.id);
                      }}
                      className={styles.bookmarkButton}
                    >
                      {project.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  </Box>

                  <Box className={styles.categoryChips}>
                    <Chip 
                      label={project.category || 'Uncategorized'} 
                      className={styles.categoryChip}
                    />
                    <Chip 
                      label={`Team: ${project.teamSize}`} 
                      className={styles.teamChip}
                    />
                  </Box>

                  <Typography variant="body2" className={styles.projectDescription}>
                    {project.description}
                  </Typography>

                  <Box className={styles.tags}>
                    {project.tags?.map((tag, index) => (
                      <Chip 
                        key={index} 
                        label={tag} 
                        size="small" 
                        className={styles.tag}
                      />
                    ))}
                  </Box>

                  <Box className={styles.projectActions}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => router.push(`/project/${project.id}`)}
                    >
                      View Details
                    </Button>
                    {project.status === 'looking for members' && (
                      <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={() => router.push(`/project/${project.id}?join=true`)}
                      >
                        Join Project
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredProjects.length > ITEMS_PER_PAGE && (
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
        )}

        <Dialog 
          open={openFilter} 
          onClose={() => setOpenFilter(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Filter Projects</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Area of Interest
              </Typography>
              <TextField
                select
                fullWidth
                value={areaOfInterest}
                onChange={handleAreaChange}
              >
                <MenuItem value="">Any Area</MenuItem>
                {CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Team Size
              </Typography>
              <TextField
                select
                fullWidth
                value={teamSize}
                onChange={handleTeamSizeChange}
              >
                <MenuItem value="">Any Size</MenuItem>
                {TEAM_SIZES.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Required Skills
              </Typography>
              <Box sx={{ mb: 1 }}>
                {customSkills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
              <TextField
                fullWidth
                placeholder="Add a skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && skillInput.trim()) {
                    handleAddSkill(skillInput.trim());
                  }
                }}
              />
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Suggested Skills:
                </Typography>
                <Box>
                  {COMMON_SKILLS.filter(skill => !customSkills.includes(skill))
                    .map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        onClick={() => handleAddSkill(skill)}
                        className={styles.suggestionChip}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFilter(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}

export default ProjectsAndPublications; 