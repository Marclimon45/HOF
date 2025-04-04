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
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
    teamSizeMin: "",
    teamSizeMax: "",
    customTags: [],
    roles: [],
    timeCompletion: ""
  });

  // Add new state for input fields
  const [filterInputs, setFilterInputs] = useState({
    skillSearch: "",
    tagSearch: "",
    roleSearch: ""
  });

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
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
        router.push("/");
      }
    });

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

    return () => {
      unsubscribe();
      unsubscribeAuth();
    };
  }, [router, bookmarkedProjects]);

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
    const { value } = event.target;
    setProjectDetails(prev => ({
      ...prev,
      skillsRequired: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleTagsChange = (event) => {
    const { value } = event.target;
    setProjectDetails(prev => ({
      ...prev,
      projectTags: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const addCustomSkill = () => {
    if (customSkill && !projectDetails.skillsRequired.includes(customSkill) && customSkill.trim() !== "") {
      setProjectDetails(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, customSkill.trim()]
      }));
      setCustomSkill("");
    }
  };

  const addCustomTag = () => {
    if (customTag && !projectDetails.projectTags.includes(customTag) && customTag.trim() !== "") {
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

  const applyFilters = () => {
    let filtered = [...projects];

    if (filter.projectTypes.length > 0) {
      filtered = filtered.filter(project => 
        filter.projectTypes.includes(project.category)
      );
    }

    if (filter.progressStatuses.length > 0) {
      filtered = filtered.filter(project => 
        filter.progressStatuses.includes(project.status)
      );
    }

    if (filter.timeCompletion) {
      filtered = filtered.filter(project => {
        const startDate = new Date();
        const completionDate = new Date(project.expectedCompletionDate);
        const monthsDiff = (completionDate.getFullYear() - startDate.getFullYear()) * 12 + 
                          (completionDate.getMonth() - startDate.getMonth());

        switch (filter.timeCompletion) {
          case 'less_than_1_month':
            return monthsDiff < 1;
          case '1_to_3_months':
            return monthsDiff >= 1 && monthsDiff <= 3;
          case '3_to_6_months':
            return monthsDiff > 3 && monthsDiff <= 6;
          case '6_to_12_months':
            return monthsDiff > 6 && monthsDiff <= 12;
          case 'more_than_12_months':
            return monthsDiff > 12;
          default:
            return true;
        }
      });
    }

    if (filter.skillsRequired.length > 0) {
      filtered = filtered.filter(project =>
        filter.skillsRequired.some(skill => project.tags?.includes(skill))
      );
    }

    if (filter.customTags.length > 0) {
      filtered = filtered.filter(project =>
        filter.customTags.some(tag => project.projectTags?.includes(tag))
      );
    }

    if (filter.teamSizeMin !== "") {
      filtered = filtered.filter(project => 
        project.teamSize >= parseInt(filter.teamSizeMin)
      );
    }

    if (filter.teamSizeMax !== "") {
      filtered = filtered.filter(project => 
        project.teamSize <= parseInt(filter.teamSizeMax)
      );
    }

    if (filter.roles.length > 0) {
      filtered = filtered.filter(project =>
        filter.roles.some(role => 
          project.roles?.some(projectRole => 
            projectRole.toLowerCase().includes(role.toLowerCase())
          ) || 
          project.userRole?.toLowerCase().includes(role.toLowerCase())
        )
      );
    }

    setFilteredProjects(filtered);
    setPage(1);
    setOpenFilter(false);
  };

  const removeFilter = (category, value) => {
    setFilter(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item !== value)
    }));
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const startIndex = (page - 1) * PROJECTS_PER_PAGE;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + PROJECTS_PER_PAGE);

  if (loading) {
    return (
      <>
        <Navbar />
        <Container>
          <Typography variant="h6" sx={{ mt: 4, textAlign: "center" }}>
            Loading projects...
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Projects
            {filter.projectTypes.length > 0 && (
              <Box sx={{ display: 'inline-flex', ml: 2, gap: 1 }}>
                {filter.projectTypes.map(type => (
                  <Chip
                    key={type}
                    label={type}
                    onDelete={() => removeFilter("projectTypes", type)}
                  />
                ))}
              </Box>
            )}
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
              onClick={handleOpenCreateProject}
            >
              + New Project
            </Button>
            <IconButton onClick={() => setOpenFilter(true)}>
              <FilterListIcon />
            </IconButton>
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

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Skills Required *</InputLabel>
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

            <Box sx={{ display: 'flex', mt: 1 }}>
              <TextField
                fullWidth
                label="Add Custom Skill"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
              />
              <IconButton onClick={addCustomSkill}>
                <AddIcon />
              </IconButton>
            </Box>

            <FormControl fullWidth sx={{ mt: 2 }}>
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
                {defaultSkillsOptions.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    <Checkbox checked={projectDetails.projectTags.indexOf(tag) > -1} />
                    <ListItemText primary={tag} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', mt: 1 }}>
              <TextField
                fullWidth
                label="Add Custom Tag"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
              />
              <IconButton onClick={addCustomTag}>
                <AddIcon />
              </IconButton>
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
        <Dialog 
          open={openFilter} 
          onClose={() => setOpenFilter(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              p: 1
            }
          }}
        >
          <DialogTitle sx={{ fontSize: '20px', fontWeight: 500 }}>
            Filters
            <IconButton
              onClick={() => setOpenFilter(false)}
              sx={{ 
                position: 'absolute', 
                right: 8, 
                top: 8,
                color: 'text.secondary'
              }}
            >
              ×
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: '16px', fontWeight: 500, mb: 2 }}>Project Type</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 3 }}>
              {[
                { type: 'Software Development', icon: <CodeIcon sx={{ fontSize: 20 }} /> },
                { type: 'Research', icon: <SearchIcon sx={{ fontSize: 20 }} /> },
                { type: 'Marketing', icon: <CampaignIcon sx={{ fontSize: 20 }} /> },
                { type: 'Design', icon: <DesignServicesIcon sx={{ fontSize: 20 }} /> },
                { type: 'Business', icon: <BusinessIcon sx={{ fontSize: 20 }} /> },
                { type: 'Engineering', icon: <BuildIcon sx={{ fontSize: 20 }} /> }
              ].map(({ type, icon }) => (
                <FormControlLabel
                  key={type}
                  control={
                    <Checkbox
                      checked={filter.projectTypes.includes(type)}
                      onChange={() => handleFilterChange("projectTypes", type)}
                      sx={{ 
                        '&.Mui-checked': {
                          color: 'primary.main',
                        }
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {icon}
                      <Typography sx={{ fontSize: '14px' }}>{type}</Typography>
                    </Box>
                  }
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '8px',
                    p: 1,
                    m: 0,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                />
              ))}
            </Box>

            <Typography sx={{ fontSize: '16px', fontWeight: 500, mb: 2 }}>Progress Status</Typography>
            <Box sx={{ mb: 3 }}>
              {[
                { status: 'Active', icon: <PlayCircleOutlineIcon sx={{ fontSize: 20 }} /> },
                { status: 'Completed', icon: <CheckCircleOutlineIcon sx={{ fontSize: 20 }} /> },
                { status: 'Looking for Members', icon: <GroupAddIcon sx={{ fontSize: 20 }} /> }
              ].map(({ status, icon }) => (
                <FormControlLabel
                  key={status}
                  control={
                    <Radio
                      checked={filter.progressStatuses.includes(status)}
                      onChange={() => setFilter(prev => ({
                        ...prev,
                        progressStatuses: [status]
                      }))}
                      sx={{
                        '&.Mui-checked': {
                          color: 'primary.main',
                        }
                      }}
                    />
                  }
                  label={status}
                  sx={{ 
                    display: 'block', 
                    mb: 1,
                    '& .MuiTypography-root': {
                      fontSize: '14px'
                    }
                  }}
                />
              ))}
            </Box>

            <Typography sx={{ fontSize: '16px', fontWeight: 500, mb: 2 }}>Time Completion</Typography>
            <Box sx={{ mb: 3 }}>
              {[
                { value: 'less_than_1_month', label: 'Less than 1 month' },
                { value: '1_to_3_months', label: '1-3 months' },
                { value: '3_to_6_months', label: '3-6 months' },
                { value: '6_to_12_months', label: '6-12 months' },
                { value: 'more_than_12_months', label: 'More than 12 months' }
              ].map(({ value, label }) => (
                <FormControlLabel
                  key={value}
                  control={
                    <Radio
                      checked={filter.timeCompletion === value}
                      onChange={() => setFilter(prev => ({
                        ...prev,
                        timeCompletion: value
                      }))}
                      sx={{
                        '&.Mui-checked': {
                          color: 'primary.main',
                        }
                      }}
                    />
                  }
                  label={label}
                  sx={{ 
                    display: 'block', 
                    mb: 1,
                    '& .MuiTypography-root': {
                      fontSize: '14px'
                    }
                  }}
                />
              ))}
            </Box>

            <Typography sx={{ fontSize: '16px', fontWeight: 500, mb: 2 }}>Team Size</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                type="number"
                size="small"
                label="Min"
                value={filter.teamSizeMin}
                onChange={(e) => setFilter(prev => ({ ...prev, teamSizeMin: e.target.value }))}
                InputProps={{ inputProps: { min: 1 } }}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
              <TextField
                type="number"
                size="small"
                label="Max"
                value={filter.teamSizeMax}
                onChange={(e) => setFilter(prev => ({ ...prev, teamSizeMax: e.target.value }))}
                InputProps={{ inputProps: { min: 1 } }}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Box>

            <Typography sx={{ fontSize: '16px', fontWeight: 500, mb: 2 }}>Skills Required</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search skills..."
              value={filterInputs.skillSearch}
              onChange={(e) => setFilterInputs(prev => ({ ...prev, skillSearch: e.target.value }))}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && filterInputs.skillSearch.trim()) {
                  setFilter(prev => ({
                    ...prev,
                    skillsRequired: [...new Set([...prev.skillsRequired, filterInputs.skillSearch.trim()])]
                  }));
                  setFilterInputs(prev => ({ ...prev, skillSearch: '' }));
                }
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {filter.skillsRequired.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => {
                    setFilter(prev => ({
                      ...prev,
                      skillsRequired: prev.skillsRequired.filter(s => s !== skill)
                    }));
                  }}
                  sx={{
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    '& .MuiChip-deleteIcon': {
                      color: 'primary.main'
                    }
                  }}
                />
              ))}
            </Box>

            <Typography sx={{ fontSize: '16px', fontWeight: 500, mb: 2 }}>Project Tags</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search tags..."
              value={filterInputs.tagSearch}
              onChange={(e) => setFilterInputs(prev => ({ ...prev, tagSearch: e.target.value }))}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && filterInputs.tagSearch.trim()) {
                  setFilter(prev => ({
                    ...prev,
                    customTags: [...new Set([...prev.customTags, filterInputs.tagSearch.trim()])]
                  }));
                  setFilterInputs(prev => ({ ...prev, tagSearch: '' }));
                }
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {filter.customTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => {
                    setFilter(prev => ({
                      ...prev,
                      customTags: prev.customTags.filter(t => t !== tag)
                    }));
                  }}
                  sx={{
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    '& .MuiChip-deleteIcon': {
                      color: 'primary.main'
                    }
                  }}
                />
              ))}
            </Box>

            <Typography sx={{ fontSize: '16px', fontWeight: 500, mb: 2 }}>Roles</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search roles..."
              value={filterInputs.roleSearch}
              onChange={(e) => setFilterInputs(prev => ({ ...prev, roleSearch: e.target.value }))}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && filterInputs.roleSearch.trim()) {
                  setFilter(prev => ({
                    ...prev,
                    roles: [...new Set([...prev.roles, filterInputs.roleSearch.trim()])]
                  }));
                  setFilterInputs(prev => ({ ...prev, roleSearch: '' }));
                }
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {filter.roles.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  onDelete={() => {
                    setFilter(prev => ({
                      ...prev,
                      roles: prev.roles.filter(r => r !== role)
                    }));
                  }}
                  sx={{
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    '& .MuiChip-deleteIcon': {
                      color: 'primary.main'
                    }
                  }}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 2 }}>
            <Button
              onClick={() => {
                setFilter({
                  projectTypes: [],
                  progressStatuses: [],
                  skillsRequired: [],
                  teamSizeMin: "",
                  teamSizeMax: "",
                  customTags: [],
                  roles: [],
                  timeCompletion: ""
                });
                setFilteredProjects(projects);
                setOpenFilter(false);
              }}
              sx={{ 
                flex: 1,
                textTransform: 'none',
                fontSize: '14px'
              }}
            >
              Clear all
            </Button>
            <Button 
              onClick={applyFilters} 
              variant="contained" 
              color="primary"
              sx={{ 
                flex: 1,
                textTransform: 'none',
                fontSize: '14px'
              }}
            >
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