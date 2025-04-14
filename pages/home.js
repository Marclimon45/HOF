import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Container,
  Grid,
  Button,
  IconButton,
  Typography,
  Box,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  Chip,
  Alert,
  FormControlLabel,
  Menu,
  Radio,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import CodeIcon from "@mui/icons-material/Code"; // Development
import SearchIcon from "@mui/icons-material/Search"; // Research
import CampaignIcon from "@mui/icons-material/Campaign"; // Marketing
import DesignServicesIcon from "@mui/icons-material/DesignServices"; // Design
import BusinessIcon from "@mui/icons-material/Business"; // Business
import BuildIcon from "@mui/icons-material/Build"; // Engineering
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline"; // Active
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"; // Completed
import GroupAddIcon from "@mui/icons-material/GroupAdd"; // Looking for Members
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import BiotechIcon from '@mui/icons-material/Biotech';
import PaletteIcon from '@mui/icons-material/Palette';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import Navbar from "../components/navbar";
import ProjectCard from "../components/projectcard";
import { db, auth } from "../firebase/firebaseconfig";
import { 
  collection, 
  onSnapshot, 
  query, 
  where,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
} from "firebase/firestore";

const PROJECTS_PER_PAGE = 12;

const defaultSkillsOptions = ["Project", "Python", "UI/UX Design", "Data Analysis", "Marketing", "Project Management", "Research", "Content Writing"];
const areasOfInterestOptions = ["Technology", "Education", "Health", "Business", "Environment"];
const defaultProjectTypes = ["Development", "Research", "Marketing", "Design", "Business", "Engineering"];
const defaultProgressStatuses = ["Active", "Completed", "Looking for Members"];

const defaultRoleTypes = [
  { label: "Developer", icon: <CodeIcon /> },
  { label: "Designer", icon: <PaletteIcon /> },
  { label: "Researcher", icon: <BiotechIcon /> },
  { label: "Project Manager", icon: <AccountTreeIcon /> },
  { label: "Student", icon: <SchoolIcon /> },
  { label: "Professional", icon: <WorkIcon /> }
];

const durationOptions = [
  { label: "Less than 1 month", value: "0-1" },
  { label: "1-3 months", value: "1-3" },
  { label: "3-6 months", value: "3-6" },
  { label: "6-12 months", value: "6-12" },
  { label: "Over 12 months", value: "12+" }
];

// Map project types to icons
const projectTypeIcons = {
  Development: <CodeIcon />,
  Research: <SearchIcon />,
  Marketing: <CampaignIcon />,
  Design: <DesignServicesIcon />,
  Business: <BusinessIcon />,
  Engineering: <BuildIcon />,
};

// Map progress statuses to icons
const progressStatusIcons = {
  Active: <PlayCircleOutlineIcon />,
  Completed: <CheckCircleOutlineIcon />,
  "Looking for Members": <GroupAddIcon />,
};

const Home = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [page, setPage] = useState(1);
  const [bookmarkedProjects, setBookmarkedProjects] = useState([]);
  const [openCreateProject, setOpenCreateProject] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [customSkill, setCustomSkill] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Project creation state
  const [projectDetails, setProjectDetails] = useState({
    title: "",
    teamSize: "",
    expectedCompletionDate: "",
    skillsRequired: [],
    projectTags: [],
    areaOfInterest: "",
    projectSummary: "",
    userRole: "",
  });

  // Filter state
  const [filter, setFilter] = useState({
    projectTypes: [],
    progressStatuses: [],
    skillsRequired: [],
    roleTypes: [],
    duration: "",
    teamSizeMin: "",
    teamSizeMax: "",
    customSkills: [],
    customRoles: []
  });

  // Add new state for input fields
  const [filterInputs, setFilterInputs] = useState({
    skillSearch: "",
    tagSearch: "",
    roleSearch: ""
  });

  // Add custom input state
  const [customInput, setCustomInput] = useState({
    skill: "",
    role: ""
  });

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  // Add mounted effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Separate auth effect
  useEffect(() => {
    if (!mounted) return;

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          console.log("User signed in:", user.uid);
          setUser(user);
          
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            await setDoc(userDocRef, { bookmarkedProjects: [] });
            setBookmarkedProjects([]);
          } else {
            setBookmarkedProjects(userDoc.data().bookmarkedProjects || []);
          }
        } else {
          console.log("No user signed in");
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setAuthChecked(true);
      }
    });

    return () => unsubscribeAuth();
  }, [mounted]);

  // Separate routing effect
  useEffect(() => {
    if (!mounted) return;
    if (authChecked && !user) {
      router.replace("/");
    }
  }, [authChecked, user, router, mounted]);

  // Projects fetch effect
  useEffect(() => {
    if (!mounted || !user) return;

    const unsubscribe = onSnapshot(
      collection(db, "projects"),
      (snapshot) => {
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isBookmarked: bookmarkedProjects.includes(doc.id)
        }));
        setProjects(projectsData);
        setFilteredProjects(projectsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, bookmarkedProjects, mounted]);

  useEffect(() => {
    const teamSize = parseInt(projectDetails.teamSize) || 0;
    if (teamSize > 0) {
      const currentRoles = [...roles];
      if (teamSize > currentRoles.length) {
        // Initialize new roles with empty objects
        const newRoles = Array(teamSize - currentRoles.length).fill('');
        setRoles([...currentRoles, ...newRoles]);
      } else if (teamSize < currentRoles.length) {
        setRoles(currentRoles.slice(0, teamSize));
      }
    } else {
      setRoles([]);
    }
  }, [projectDetails.teamSize]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const startIndex = (page - 1) * PROJECTS_PER_PAGE;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + PROJECTS_PER_PAGE);

  const handleBookmarkToggle = async (index) => {
    if (!user) return;

    const projectId = currentProjects[index].id;
    const userDocRef = doc(db, "users", user.uid);

    try {
      if (bookmarkedProjects.includes(projectId)) {
        await updateDoc(userDocRef, {
          bookmarkedProjects: arrayRemove(projectId)
        });
        setBookmarkedProjects(prev => prev.filter(id => id !== projectId));
      } else {
        await updateDoc(userDocRef, {
          bookmarkedProjects: arrayUnion(projectId)
        });
        setBookmarkedProjects(prev => [...prev, projectId]);
      }

      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, isBookmarked: !bookmarkedProjects.includes(projectId) }
          : project
      ));
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Project creation handlers
  const handleOpenCreateProject = () => {
    if (!user) {
      router.push("/");
      return;
    }
    setOpenCreateProject(true);
  };

  const handleCloseCreateProject = () => {
    setOpenCreateProject(false);
    setProjectDetails({
      title: "",
      teamSize: "",
      expectedCompletionDate: "",
      skillsRequired: [],
      projectTags: [],
      areaOfInterest: "",
      projectSummary: "",
      userRole: "",
    });
    setRoles([]);
    setCustomSkill("");
    setCustomTag("");
    setErrorMessage("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (event) => {
    const selectedSkills = event.target.value;
    setProjectDetails(prev => ({
      ...prev,
      skillsRequired: selectedSkills,
      projectTags: [...new Set([...selectedSkills, ...prev.projectTags])] // Add skills to tags while keeping existing tags
    }));
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !projectDetails.skillsRequired.includes(customSkill.trim())) {
      setProjectDetails(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, customSkill.trim()],
        projectTags: [...new Set([...prev.projectTags, customSkill.trim()])] // Add custom skill to tags
      }));
      setCustomSkill("");
    }
  };

  const handleTagsChange = (event) => {
    setProjectDetails(prev => ({
      ...prev,
      projectTags: event.target.value
    }));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !projectDetails.projectTags.includes(customTag.trim())) {
      setProjectDetails(prev => ({
        ...prev,
        projectTags: [...prev.projectTags, customTag.trim()]
      }));
      setCustomTag("");
    }
  };

  const handleCreateProject = async () => {
    if (!user) {
      router.push("/");
      return;
    }

    if (!projectDetails.title || !projectDetails.teamSize || !projectDetails.expectedCompletionDate || 
        !projectDetails.skillsRequired.length || !projectDetails.areaOfInterest || 
        !projectDetails.projectSummary || !projectDetails.userRole) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    try {
      // Create roles array with creator's role as first entry
      const projectRoles = roles.map((role, index) => ({
        role: role,
        userId: index === 0 ? user.uid : null // Assign creator to first role
      }));

      const newProject = {
        title: projectDetails.title,
        category: projectDetails.areaOfInterest,
        description: projectDetails.projectSummary,
        tags: projectDetails.projectTags,
        teamSize: parseInt(projectDetails.teamSize),
        createdAt: new Date().toISOString(),
        expectedCompletionDate: projectDetails.expectedCompletionDate,
        creatorUid: user.uid,
        userRole: projectDetails.userRole,
        roles: projectRoles, // Use the updated roles array
        members: 1, // Start with 1 member (the creator)
        status: "Looking for Members",
      };

      // Create the project
      const projectRef = await addDoc(collection(db, "projects"), newProject);

      // Update the user's profile with their current project
      await updateDoc(doc(db, "users", user.uid), {
        currentProject: {
          projectId: projectRef.id,
          name: projectDetails.title,
          role: projectDetails.userRole,
          joinedAt: new Date().toISOString()
        }
      });

      setSuccessOpen(true);
      setTimeout(() => {
        setSuccessOpen(false);
        handleCloseCreateProject();
      }, 2000);
    } catch (error) {
      console.error("Error creating project:", error);
      setErrorMessage("Failed to create project. Please try again.");
    }
  };

  // Filter handlers
  const handleFilterChange = (category, value) => {
    setFilter(prev => {
      const updatedCategory = prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value];
      return { ...prev, [category]: updatedCategory };
    });
  };

  // Update useEffect for search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = projects.filter(project => {
      // Add null checks for all properties
      const title = project?.title?.toLowerCase() || '';
      const description = project?.description?.toLowerCase() || '';
      const tags = project?.tags || [];
      const category = project?.category?.toLowerCase() || '';
      
      return title.includes(query) ||
             description.includes(query) ||
             tags.some(tag => (tag || '').toLowerCase().includes(query)) ||
             category.includes(query);
    });
    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  // Update applyFilters function
  const applyFilters = () => {
    let filtered = [...projects];

    // Project type filter
    if (filter.projectTypes.length > 0) {
      filtered = filtered.filter(project => 
        project?.category && filter.projectTypes.includes(project.category)
      );
    }

    // Progress status filter
    if (filter.progressStatuses.length > 0) {
      filtered = filtered.filter(project => 
        project?.status && filter.progressStatuses.includes(project.status)
      );
    }

    // Skills filter (including custom skills)
    if (filter.skillsRequired.length > 0 || filter.customSkills.length > 0) {
      const allSkills = [...filter.skillsRequired, ...filter.customSkills];
      filtered = filtered.filter(project => 
        project?.tags && allSkills.some(skill => 
          project.tags.includes(skill)
        )
      );
    }

    // Role types filter (including custom roles)
    if (filter.roleTypes.length > 0 || filter.customRoles.length > 0) {
      const allRoles = [...filter.roleTypes, ...filter.customRoles];
      filtered = filtered.filter(project => 
        project?.roles && project.roles.some(role => 
          allRoles.includes(role.role)
        )
      );
    }

    // Duration filter
    if (filter.duration) {
      filtered = filtered.filter(project => {
        if (!project?.expectedCompletionDate) return false;
        const start = new Date(project.createdAt);
        const end = new Date(project.expectedCompletionDate);
        const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                          (end.getMonth() - start.getMonth());
        
        const [min, max] = filter.duration.split('-');
        if (max === '+') {
          return monthsDiff >= parseInt(min);
        } else {
          return monthsDiff >= parseInt(min) && monthsDiff <= parseInt(max);
        }
      });
    }

    setFilteredProjects(filtered);
  };

  const removeFilter = (category, value) => {
    setFilter(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item !== value)
    }));
  };

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  // Show loading state
  if (!authChecked || loading) {
    return (
      <>
        <Navbar />
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Projects
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search projects..."
              size="small"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                const query = e.target.value.toLowerCase();
                const filtered = projects.filter(project => {
                  // Add null checks for all properties
                  const title = project?.title?.toLowerCase() || '';
                  const description = project?.description?.toLowerCase() || '';
                  const tags = project?.tags || [];
                  const category = project?.category?.toLowerCase() || '';
                  
                  return title.includes(query) ||
                         description.includes(query) ||
                         tags.some(tag => (tag || '').toLowerCase().includes(query)) ||
                         category.includes(query);
                });
                setFilteredProjects(filtered);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setOpenFilter(true)}
            >
              Filter
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateProject}
            >
              NEW PROJECT
            </Button>
          </Box>
        </Box>

        <Grid
          container
          spacing={3}
          sx={{
            padding: "24px",
            margin: 0,
            width: "100%",
          }}
        >
          {currentProjects.map((project, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={project.id || index}
              sx={{
                display: "flex",
                height: "100%",
              }}
            >
              <Link 
                href={`/project/${project.id}`} 
                passHref 
                style={{ 
                  textDecoration: "none",
                  width: "100%",
                  display: "block",
                }}
              >
                <ProjectCard
                  project={{
                    ...project,
                    isBookmarked: bookmarkedProjects.includes(project.id)
                  }}
                  onBookmarkToggle={() => handleBookmarkToggle(index)}
                />
              </Link>
            </Grid>
          ))}
        </Grid>

        {filteredProjects.length === 0 ? (
          <Typography variant="h6" sx={{ textAlign: "center", mt: 4 }}>
            No projects found. Create a new project to get started!
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              mt: 4,
              mb: 2,
            }}
          >
            <Button
              variant="outlined"
              disabled={page === 1}
              onClick={() => handlePageChange(null, page - 1)}
            >
              Previous
            </Button>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
            <Button
              variant="outlined"
              disabled={page === totalPages}
              onClick={() => handlePageChange(null, page + 1)}
            >
              Next
            </Button>
          </Box>
        )}

        {/* Create Project Dialog */}
        <Dialog open={openCreateProject} onClose={handleCloseCreateProject} maxWidth="md" fullWidth>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Project Title *"
              type="text"
              fullWidth
              value={projectDetails.title}
              onChange={handleInputChange}
              variant="outlined"
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Team Size *</InputLabel>
                <Select
                  name="teamSize"
                  value={projectDetails.teamSize}
                  onChange={handleInputChange}
                  label="Team Size *"
                >
                  {[...Array(50)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="expectedCompletionDate"
                label="Expected Completion Date *"
                type="date"
                fullWidth
                value={projectDetails.expectedCompletionDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: minDate }}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Skills Required</InputLabel>
              <Select
                multiple
                value={projectDetails.skillsRequired}
                onChange={handleSkillsChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {defaultSkillsOptions.map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    <Checkbox checked={projectDetails.skillsRequired.indexOf(skill) > -1} />
                    <ListItemText primary={skill} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Custom Skills
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Add a custom skill"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                />
                <Button
                  onClick={addCustomSkill}
                  disabled={!customSkill.trim()}
                >
                  Add
                </Button>
              </Box>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Project Tags</InputLabel>
              <Select
                multiple
                value={projectDetails.projectTags}
                onChange={handleTagsChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {[...new Set([...defaultSkillsOptions, ...projectDetails.projectTags])].map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    <Checkbox checked={projectDetails.projectTags.indexOf(tag) > -1} />
                    <ListItemText primary={tag} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Custom Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Add a custom tag"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                />
                <Button
                  onClick={addCustomTag}
                  disabled={!customTag.trim()}
                >
                  Add
                </Button>
              </Box>
            </Box>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Area of Interest *</InputLabel>
              <Select
                name="areaOfInterest"
                value={projectDetails.areaOfInterest}
                onChange={handleInputChange}
                label="Area of Interest *"
              >
                {areasOfInterestOptions.map((area) => (
                  <MenuItem key={area} value={area}>{area}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="dense"
              name="projectSummary"
              label="Project Summary *"
              multiline
              rows={4}
              fullWidth
              value={projectDetails.projectSummary}
              onChange={handleInputChange}
              sx={{ mt: 2 }}
            />

            <TextField
              margin="dense"
              name="userRole"
              label="Your Role *"
              fullWidth
              value={projectDetails.userRole}
              onChange={handleInputChange}
              sx={{ mt: 2 }}
            />

            {roles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Team Roles</Typography>
                {roles.map((role, index) => (
                  <TextField
                    key={index}
                    fullWidth
                    label={`Role ${index + 1}${index === 0 ? ' (You)' : ''}`}
                    value={role}
                    onChange={(e) => {
                      const newRoles = [...roles];
                      newRoles[index] = e.target.value;
                      setRoles(newRoles);
                    }}
                    sx={{ mt: 1 }}
                  />
                ))}
              </Box>
            )}

            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMessage}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateProject}>Cancel</Button>
            <Button onClick={handleCreateProject} variant="contained" color="primary">
              Create Project
            </Button>
          </DialogActions>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={openFilter} onClose={() => setOpenFilter(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Filter Projects</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Project Type section */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>Project Type</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {defaultProjectTypes.map((type) => (
                    <Chip
                      key={type}
                      label={type}
                      onClick={() => handleFilterChange('projectTypes', type)}
                      color={filter.projectTypes.includes(type) ? 'primary' : 'default'}
                      icon={projectTypeIcons[type]}
                    />
                  ))}
                </Box>
              </Box>

              {/* Status section */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>Status</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {defaultProgressStatuses.map((status) => (
                    <Chip
                      key={status}
                      label={status}
                      onClick={() => handleFilterChange('progressStatuses', status)}
                      color={filter.progressStatuses.includes(status) ? 'primary' : 'default'}
                      icon={progressStatusIcons[status]}
                    />
                  ))}
                </Box>
              </Box>

              {/* Duration section */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>Duration</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {durationOptions.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      onClick={() => setFilter(prev => ({ ...prev, duration: option.value }))}
                      color={filter.duration === option.value ? 'primary' : 'default'}
                      icon={<AccessTimeIcon />}
                    />
                  ))}
                </Box>
              </Box>

              {/* Skills section */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>Skills Required</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {defaultSkillsOptions.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        onClick={() => handleFilterChange('skillsRequired', skill)}
                        color={filter.skillsRequired.includes(skill) ? 'primary' : 'default'}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add custom skill"
                      value={customInput.skill}
                      onChange={(e) => setCustomInput(prev => ({ ...prev, skill: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && customInput.skill.trim()) {
                          setFilter(prev => ({
                            ...prev,
                            customSkills: [...prev.customSkills, customInput.skill.trim()]
                          }));
                          setCustomInput(prev => ({ ...prev, skill: '' }));
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (customInput.skill.trim()) {
                          setFilter(prev => ({
                            ...prev,
                            customSkills: [...prev.customSkills, customInput.skill.trim()]
                          }));
                          setCustomInput(prev => ({ ...prev, skill: '' }));
                        }
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                  {filter.customSkills.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {filter.customSkills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          onDelete={() => setFilter(prev => ({
                            ...prev,
                            customSkills: prev.customSkills.filter(s => s !== skill)
                          }))}
                          color="primary"
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Role Types section */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>Role Types</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {defaultRoleTypes.map((role) => (
                      <Chip
                        key={role.label}
                        label={role.label}
                        onClick={() => handleFilterChange('roleTypes', role.label)}
                        color={filter.roleTypes.includes(role.label) ? 'primary' : 'default'}
                        icon={role.icon}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add custom role"
                      value={customInput.role}
                      onChange={(e) => setCustomInput(prev => ({ ...prev, role: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && customInput.role.trim()) {
                          setFilter(prev => ({
                            ...prev,
                            customRoles: [...prev.customRoles, customInput.role.trim()]
                          }));
                          setCustomInput(prev => ({ ...prev, role: '' }));
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (customInput.role.trim()) {
                          setFilter(prev => ({
                            ...prev,
                            customRoles: [...prev.customRoles, customInput.role.trim()]
                          }));
                          setCustomInput(prev => ({ ...prev, role: '' }));
                        }
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                  {filter.customRoles.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {filter.customRoles.map((role) => (
                        <Chip
                          key={role}
                          label={role}
                          onDelete={() => setFilter(prev => ({
                            ...prev,
                            customRoles: prev.customRoles.filter(r => r !== role)
                          }))}
                          color="primary"
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setFilter({
                projectTypes: [],
                progressStatuses: [],
                skillsRequired: [],
                roleTypes: [],
                duration: "",
                teamSizeMin: "",
                teamSizeMax: "",
                customSkills: [],
                customRoles: []
              });
              setCustomInput({ skill: "", role: "" });
              setFilteredProjects(projects);
            }}>
              Clear All
            </Button>
            <Button onClick={() => {
              setOpenFilter(false);
              applyFilters();
            }} variant="contained">
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={successOpen} onClose={() => setSuccessOpen(false)}>
          <DialogContent>
            <Alert severity="success">
              Project created successfully!
            </Alert>
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
};

export default Home; 