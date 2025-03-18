import React, { useState, useEffect } from "react";
import { Container, Grid, Button, Pagination, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, Checkbox, ListItemText, Chip, Alert, FormControlLabel, Box } from "@mui/material";
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
import styles from "../styles/homepage.module.css";
import { db, auth } from "../firebase/firebaseconfig";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, setDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Initial project data
const initialProjectsData = [
  {
    title: "AI-Powered Learning Platform",
    category: "Development",
    description: "Building an adaptive learning system using machine learning algorithms...",
    tags: ["Machine Learning", "Education", "Python"],
    members: 7,
    date: "Dec 15, 2024",
    createdAt: new Date("Dec 15, 2024").toISOString(),
    expectedCompletionDate: "2025-06-15",
    liked: false,
  },
  {
    title: "Sustainable Campus Initiative",
    category: "Research",
    description: "Research project focused on implementing sustainable practices...",
    tags: ["Sustainability", "Research", "Environmental"],
    members: 7,
    date: "Jan 30, 2024",
    createdAt: new Date("Jan 30, 2024").toISOString(),
    expectedCompletionDate: "2025-03-30",
    liked: false,
  },
  {
    title: "Student Wellness App",
    category: "Design",
    description: "Designing a mobile application to help students manage stress...",
    tags: ["UI/UX", "Mental Health", "Mobile"],
    members: 7,
    date: "Nov 28, 2024",
    createdAt: new Date("Nov 28, 2024").toISOString(),
    expectedCompletionDate: "2025-05-28",
    liked: false,
  },
  {
    title: "Market Research Analysis",
    category: "Business",
    description: "Conducting comprehensive market research for a new startup...",
    tags: ["Market Research", "Analytics", "Business"],
    members: 7,
    date: "Feb 15, 2024",
    createdAt: new Date("Feb 15, 2024").toISOString(),
    expectedCompletionDate: "2025-04-15",
    liked: false,
  },
  {
    title: "Academic Journal Platform",
    category: "Writing",
    description: "Creating a platform for peer-reviewed academic journal publications...",
    tags: ["Publishing", "Academic", "Writing"],
    members: 7,
    date: "Mar 1, 2024",
    createdAt: new Date("Mar 1, 2024").toISOString(),
    expectedCompletionDate: "2025-06-01",
    liked: false,
  },
  {
    title: "Virtual Lab Simulator",
    category: "Development",
    description: "Developing a virtual laboratory simulation system for remote science...",
    tags: ["VR", "Education", "Science"],
    members: 7,
    date: "Apr 10, 2024",
    createdAt: new Date("Apr 10, 2024").toISOString(),
    expectedCompletionDate: "2025-07-10",
    liked: false,
  },
];

const defaultSkillsOptions = ["Project", "Python", "UI/UX Design", "Data Analysis", "Marketing", "Project Management", "Research", "Content Writing"];
const areasOfInterestOptions = ["Technology", "Education", "Health", "Business", "Environment"];
const defaultProjectTypes = ["Development", "Research", "Marketing", "Design", "Business", "Engineering"];
const defaultProgressStatuses = ["Active", "Completed", "Looking for Members"];
const commonRoleTypes = ["Project Leader", "Full Stack Developer", "Frontend Developer", "Backend Developer", "UI/UX Designer", "Data Analyst", "Researcher", "Content Writer", "Marketing Specialist", "Business Analyst"];

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

const HomePage = () => {
  const [page, setPage] = useState(1);
  const [openCreateProject, setOpenCreateProject] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [projectsData, setProjectsData] = useState(initialProjectsData);
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
  const [roles, setRoles] = useState([]);
  const [customSkill, setCustomSkill] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [customFilterSkill, setCustomFilterSkill] = useState("");
  const [customFilterRole, setCustomFilterRole] = useState("");
  const [filterSkills, setFilterSkills] = useState(defaultSkillsOptions);
  const [filterRoles, setFilterRoles] = useState(commonRoleTypes);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loginDetails, setLoginDetails] = useState({ email: "", password: "" });
  const [filter, setFilter] = useState({
    projectTypes: [],
    progressStatuses: [],
    expectedCompletionDate: "",
    durationMin: "",
    durationMax: "",
    skillsRequired: [],
    roleTypes: [],
  });

  const today = new Date("2025-03-18");
  const minDate = today.toISOString().split("T")[0];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User signed in:", user.uid);
        setUser(user);
      } else {
        console.log("No user signed in");
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const teamSize = parseInt(projectDetails.teamSize) || 0;
    if (teamSize > 0) {
      const currentRoles = [...roles];
      if (teamSize > currentRoles.length) {
        const newRoles = Array(teamSize - currentRoles.length).fill("");
        setRoles([...currentRoles, ...newRoles]);
      } else if (teamSize < currentRoles.length) {
        setRoles(currentRoles.slice(0, teamSize));
      }
    } else {
      setRoles([]);
    }
  }, [projectDetails.teamSize]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleOpenCreateProject = () => {
    if (!user) {
      setOpenLogin(true);
    } else {
      setOpenCreateProject(true);
    }
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

  const handleCloseLogin = () => {
    setOpenLogin(false);
    setLoginDetails({ email: "", password: "" });
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
    setFilter({
      projectTypes: [],
      progressStatuses: [],
      expectedCompletionDate: "",
      durationMin: "",
      durationMax: "",
      skillsRequired: [],
      roleTypes: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (event) => {
    const { value } = event.target;
    setProjectDetails((prev) => ({ ...prev, skillsRequired: typeof value === "string" ? value.split(",") : value }));
  };

  const handleTagsChange = (event) => {
    const { value } = event.target;
    setProjectDetails((prev) => ({ ...prev, projectTags: typeof value === "string" ? value.split(",") : value }));
  };

  const handleFilterChange = (category, value) => {
    setFilter((prev) => {
      const updatedCategory = prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value];
      return { ...prev, [category]: updatedCategory };
    });
  };

  const handleFilterDateChange = (e) => {
    setFilter((prev) => ({ ...prev, expectedCompletionDate: e.target.value }));
  };

  const handleFilterDurationChange = (minMax, value) => {
    setFilter((prev) => ({ ...prev, [minMax]: value }));
  };

  const addCustomSkill = () => {
    if (customSkill && !projectDetails.skillsRequired.includes(customSkill) && customSkill.trim() !== "") {
      setProjectDetails((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, customSkill.trim()],
      }));
      setCustomSkill("");
    }
  };

  const addCustomTag = () => {
    if (customTag && !projectDetails.projectTags.includes(customTag) && customTag.trim() !== "") {
      setProjectDetails((prev) => ({
        ...prev,
        projectTags: [...prev.projectTags, customTag.trim()],
      }));
      setCustomTag("");
    }
  };

  const addCustomFilterSkill = () => {
    if (customFilterSkill && !filterSkills.includes(customFilterSkill) && customFilterSkill.trim() !== "") {
      setFilterSkills((prev) => [...prev, customFilterSkill.trim()]);
      setCustomFilterSkill("");
    }
  };

  const addCustomFilterRole = () => {
    if (customFilterRole && !filterRoles.includes(customFilterRole) && customFilterRole.trim() !== "") {
      setFilterRoles((prev) => [...prev, customFilterRole.trim()]);
      setCustomFilterRole("");
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, loginDetails.email, loginDetails.password);
      setOpenLogin(false);
    } catch (error) {
      console.error("Login failed:", error.code, error.message);
      setErrorMessage(`Login failed: ${error.message}`);
    }
  };

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, loginDetails.email, loginDetails.password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: loginDetails.email,
        contributionCount: 0,
        createdAt: new Date().toISOString(),
      });
      setOpenLogin(false);
    } catch (error) {
      console.error("Signup failed:", error.code, error.message);
      setErrorMessage(`Signup failed: ${error.message}`);
    }
  };

  const handleCreateProject = async () => {
    if (!user) {
      alert("You must be signed in to create a project. Please log in or sign up.");
      setOpenLogin(true);
      return;
    }
    if (!projectDetails.title || !projectDetails.teamSize || !projectDetails.expectedCompletionDate || !projectDetails.skillsRequired.length || !projectDetails.areaOfInterest || !projectDetails.projectSummary || !projectDetails.userRole) {
      alert("Please fill all required fields, including your role.");
      return;
    }
    const teamSize = parseInt(projectDetails.teamSize);
    if (teamSize > 50) {
      alert("Team size cannot exceed 50.");
      return;
    }
    const hasEmptyRole = teamSize > 0 && roles.some(role => !role.trim());
    if (hasEmptyRole) {
      alert("Please provide a role for each team member.");
      return;
    }
    if (teamSize > 0 && !roles[0]?.trim()) {
      alert("Please assign a role for yourself as the first role.");
      return;
    }

    const selectedDate = new Date(projectDetails.expectedCompletionDate);
    if (selectedDate < today) {
      alert("Expected completion date cannot be earlier than today.");
      return;
    }

    const projectsQuery = query(collection(db, "projects"), where("title", "==", projectDetails.title));
    const querySnapshot = await getDocs(projectsQuery);
    if (!querySnapshot.empty) {
      alert("A project with this title already exists. Please choose a unique title.");
      return;
    }

    const newProject = {
      title: projectDetails.title,
      category: projectDetails.areaOfInterest,
      description: projectDetails.projectSummary,
      tags: projectDetails.projectTags,
      members: teamSize,
      date: "Mar 18, 2025",
      createdAt: new Date().toISOString(),
      expectedCompletionDate: projectDetails.expectedCompletionDate,
      liked: false,
      creatorUid: user.uid,
      userRole: projectDetails.userRole,
    };

    try {
      await addDoc(collection(db, "projects"), newProject);
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
      let currentCount = 0;
      userDoc.forEach((doc) => {
        currentCount = doc.data().contributionCount || 0;
      });
      await updateDoc(userRef, {
        contributionCount: currentCount + 1,
      }, { merge: true });

      console.log("Project added to Firestore:", newProject);
      setProjectsData((prev) => [...prev, newProject]);
      setSuccessOpen(true);
      setTimeout(() => {
        setSuccessOpen(false);
        handleCloseCreateProject();
      }, 5000);
    } catch (error) {
      console.error("Error adding project to Firestore:", error.code, error.message);
      setErrorMessage(`Failed to create project: ${error.message}`);
    }
  };

  const handleLikeToggle = (index) => {
    setProjectsData((prev) => {
      const updatedProjects = [...prev];
      updatedProjects[index] = {
        ...updatedProjects[index],
        liked: !updatedProjects[index].liked,
      };
      return updatedProjects;
    });
  };

  const applyFilters = () => {
    let filteredProjects = [...initialProjectsData];

    if (filter.projectTypes.length > 0) {
      filteredProjects = filteredProjects.filter((project) =>
        filter.projectTypes.includes(project.category)
      );
    }

    if (filter.progressStatuses.length > 0) {
      filteredProjects = filteredProjects.filter((project) => {
        const created = new Date(project.createdAt);
        const completion = new Date(project.expectedCompletionDate);
        const now = new Date("2025-03-18");
        if (filter.progressStatuses.includes("Active") && created <= now && completion > now) return true;
        if (filter.progressStatuses.includes("Completed") && completion <= now) return true;
        if (filter.progressStatuses.includes("Looking for Members") && project.members < 7) return true;
        return false;
      });
    }

    if (filter.expectedCompletionDate) {
      filteredProjects = filteredProjects.filter((project) =>
        new Date(project.expectedCompletionDate) >= new Date(filter.expectedCompletionDate)
      );
    }

    if (filter.durationMin || filter.durationMax) {
      filteredProjects = filteredProjects.filter((project) => {
        const created = new Date(project.createdAt);
        const completion = new Date(project.expectedCompletionDate);
        const durationDays = Math.ceil((completion - created) / (1000 * 60 * 60 * 24));
        const minDays = parseInt(filter.durationMin) || 0;
        const maxDays = parseInt(filter.durationMax) || Infinity;
        return durationDays >= minDays && durationDays <= maxDays;
      });
    }

    if (filter.skillsRequired.length > 0) {
      filteredProjects = filteredProjects.filter((project) =>
        filter.skillsRequired.some((skill) => project.tags.includes(skill))
      );
    }

    if (filter.roleTypes.length > 0) {
      filteredProjects = filteredProjects.filter((project) =>
        filter.roleTypes.includes(project.userRole || "")
      );
    }

    setProjectsData(filteredProjects);
    setOpenFilter(false);
  };

  const calculateDuration = (createdAt, expectedCompletionDate) => {
    const created = new Date(createdAt);
    const completion = new Date(expectedCompletionDate);
    const durationDays = Math.ceil((completion - created) / (1000 * 60 * 60 * 24));
    return durationDays > 0 ? `${durationDays} days` : "Ongoing";
  };

  return (
    <>
      <Navbar />
      <div className={styles.pageBackground}>
        <Container maxWidth="lg">
          <div className={styles.header}>
            <h2>Projects</h2>
            <div>
              <Button variant="contained" color="primary" className={styles.newProjectButton} onClick={handleOpenCreateProject}>
                + New Project
              </Button>
              <IconButton className={styles.filterButton} onClick={() => setOpenFilter(true)}>
                <FilterListIcon />
              </IconButton>
            </div>
          </div>

          <Grid container spacing={3}>
            {projectsData.map((project, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ProjectCard
                  project={project}
                  onLikeToggle={() => handleLikeToggle(index)}
                  duration={calculateDuration(project.createdAt, project.expectedCompletionDate)}
                />
              </Grid>
            ))}
          </Grid>

          <div className={styles.pagination}>
            <Button variant="outlined">Previous</Button>
            <Pagination count={8} page={page} onChange={handlePageChange} color="primary" />
            <Button variant="outlined">Next</Button>
          </div>
        </Container>
      </div>

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
          <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
            <FormControl margin="dense" fullWidth variant="outlined">
              <InputLabel id="team-size-label">Team Size *</InputLabel>
              <Select
                labelId="team-size-label"
                name="teamSize"
                value={projectDetails.teamSize}
                onChange={handleInputChange}
                fullWidth
              >
                <MenuItem value="">Select team size</MenuItem>
                {[...Array(50).keys()].map((i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="expectedCompletionDate"
              label="Expected Completion Date *"
              type="date"
              fullWidth
              value={projectDetails.expectedCompletionDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: minDate }}
              variant="outlined"
            />
          </div>
          <FormControl margin="dense" fullWidth variant="outlined">
            <InputLabel id="skills-required-label">Skills Required *</InputLabel>
            <Select
              labelId="skills-required-label"
              multiple
              value={projectDetails.skillsRequired}
              onChange={handleSkillsChange}
              renderValue={(selected) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </div>
              )}
            >
              {defaultSkillsOptions.map((skill) => (
                <MenuItem key={skill} value={skill}>
                  <Checkbox checked={projectDetails.skillsRequired.indexOf(skill) > -1} />
                  <ListItemText primary={skill} />
                </MenuItem>
              ))}
            </Select>
            <div style={{ display: "flex", alignItems: "center", marginTop: "5px" }}>
              <TextField
                label="Add Custom Skill"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyPress={(e) => { if (e.key === "Enter") addCustomSkill(); }}
                fullWidth
                size="small"
                variant="outlined"
              />
              <IconButton color="primary" onClick={addCustomSkill} style={{ marginLeft: "5px" }}>
                <AddIcon />
              </IconButton>
            </div>
          </FormControl>
          <FormControl margin="dense" fullWidth variant="outlined">
            <InputLabel id="project-tags-label">Project Tags</InputLabel>
            <Select
              labelId="project-tags-label"
              multiple
              value={projectDetails.projectTags}
              onChange={handleTagsChange}
              renderValue={(selected) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </div>
              )}
            >
              {defaultSkillsOptions.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  <Checkbox checked={projectDetails.projectTags.indexOf(tag) > -1} />
                  <ListItemText primary={tag} />
                </MenuItem>
              ))}
            </Select>
            <div style={{ display: "flex", alignItems: "center", marginTop: "5px" }}>
              <TextField
                label="Add Custom Tag"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => { if (e.key === "Enter") addCustomTag(); }}
                fullWidth
                size="small"
                variant="outlined"
              />
              <IconButton color="primary" onClick={addCustomTag} style={{ marginLeft: "5px" }}>
                <AddIcon />
              </IconButton>
            </div>
          </FormControl>
          <FormControl margin="dense" fullWidth variant="outlined">
            <InputLabel id="area-of-interest-label">Area of Interest *</InputLabel>
            <Select
              labelId="area-of-interest-label"
              name="areaOfInterest"
              value={projectDetails.areaOfInterest}
              onChange={handleInputChange}
              fullWidth
            >
              <MenuItem value="">Select area of interest</MenuItem>
              {areasOfInterestOptions.map((area) => (
                <MenuItem key={area} value={area}>
                  {area}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="projectSummary"
            label="Project Summary *"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={projectDetails.projectSummary}
            onChange={handleInputChange}
            helperText="Provide a brief description of your project"
            variant="outlined"
          />
          <div style={{ marginTop: "10px" }}>
            <TextField
              margin="dense"
              name="userRole"
              label="Your Role *"
              type="text"
              fullWidth
              value={projectDetails.userRole}
              onChange={handleInputChange}
              variant="outlined"
            />
          </div>

          {projectDetails.teamSize && parseInt(projectDetails.teamSize) > 0 && (
            <>
              <h3 style={{ marginTop: "20px" }}>Assign Roles to Team</h3>
              {roles.map((role, index) => (
                <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <TextField
                    margin="dense"
                    label={`Role ${index + 1}`}
                    type="text"
                    value={role}
                    onChange={(e) => {
                      const newRoles = [...roles];
                      newRoles[index] = e.target.value;
                      setRoles(newRoles);
                    }}
                    fullWidth
                    size="small"
                    variant="outlined"
                    helperText={index === 0 ? "Assign a role for yourself" : ""}
                  />
                </div>
              ))}
            </>
          )}
          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage("")}>
              {errorMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateProject} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateProject} color="primary" variant="contained">
            Create Project
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openLogin} onClose={handleCloseLogin} maxWidth="sm" fullWidth>
        <DialogTitle>Login or Sign Up</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={loginDetails.email}
            onChange={handleLoginInputChange}
            variant="outlined"
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            value={loginDetails.password}
            onChange={handleLoginInputChange}
            variant="outlined"
          />
          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage("")}>
              {errorMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLogin} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogin} color="primary" variant="contained">
            Login
          </Button>
          <Button onClick={handleSignup} color="secondary" variant="contained">
            Sign Up
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openFilter} onClose={handleCloseFilter} maxWidth="sm" fullWidth>
        <DialogTitle>Filters <IconButton onClick={handleCloseFilter} style={{ float: "right" }}><span style={{ fontSize: "24px" }}>×</span></IconButton></DialogTitle>
        <DialogContent>
          <h3 style={{ marginBottom: "10px" }}>Project Type</h3>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {defaultProjectTypes.map((type) => (
              <Chip
                key={type}
                icon={projectTypeIcons[type]}
                label={type}
                onClick={() => handleFilterChange("projectTypes", type)}
                color={filter.projectTypes.includes(type) ? "primary" : "default"}
                style={{ margin: "5px" }}
              />
            ))}
          </Box>
          <h3 style={{ marginBottom: "10px", marginTop: "20px" }}>Progress Status</h3>
          {defaultProgressStatuses.map((status) => (
            <FormControlLabel
              key={status}
              control={<Checkbox checked={filter.progressStatuses.includes(status)} onChange={() => handleFilterChange("progressStatuses", status)} />}
              label={
                <Box display="flex" alignItems="center">
                  {progressStatusIcons[status]}
                  <span style={{ marginLeft: "8px" }}>{status}</span>
                </Box>
              }
            />
          ))}
          <h3 style={{ marginBottom: "10px", marginTop: "20px" }}>Expected Completion Date</h3>
          <TextField
            margin="dense"
            type="date"
            fullWidth
            value={filter.expectedCompletionDate}
            onChange={handleFilterDateChange}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: minDate }}
            variant="outlined"
          />
          <h3 style={{ marginBottom: "10px", marginTop: "20px" }}>Duration (Days)</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <TextField
              margin="dense"
              label="Min"
              type="number"
              fullWidth
              value={filter.durationMin}
              onChange={(e) => handleFilterDurationChange("durationMin", e.target.value)}
              variant="outlined"
            />
            <TextField
              margin="dense"
              label="Max"
              type="number"
              fullWidth
              value={filter.durationMax}
              onChange={(e) => handleFilterDurationChange("durationMax", e.target.value)}
              variant="outlined"
            />
          </div>
          <h3 style={{ marginBottom: "10px", marginTop: "20px" }}>Skills Required</h3>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {filterSkills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                onClick={() => handleFilterChange("skillsRequired", skill)}
                onDelete={() => setFilterSkills((prev) => prev.filter((s) => s !== skill))}
                color={filter.skillsRequired.includes(skill) ? "primary" : "default"}
                style={{ margin: "5px" }}
              />
            ))}
          </Box>
          <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
            <TextField
              label="Add Custom Skill"
              value={customFilterSkill}
              onChange={(e) => setCustomFilterSkill(e.target.value)}
              onKeyPress={(e) => { if (e.key === "Enter") addCustomFilterSkill(); }}
              fullWidth
              size="small"
              variant="outlined"
            />
            <IconButton color="primary" onClick={addCustomFilterSkill} style={{ marginLeft: "5px" }}>
              <AddIcon />
            </IconButton>
          </div>
          <h3 style={{ marginBottom: "10px", marginTop: "20px" }}>Role Type</h3>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {filterRoles.map((role) => (
              <Chip
                key={role}
                label={role}
                onClick={() => handleFilterChange("roleTypes", role)}
                onDelete={() => setFilterRoles((prev) => prev.filter((r) => r !== role))}
                color={filter.roleTypes.includes(role) ? "primary" : "default"}
                style={{ margin: "5px" }}
              />
            ))}
          </Box>
          <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
            <TextField
              label="Add Custom Role"
              value={customFilterRole}
              onChange={(e) => setCustomFilterRole(e.target.value)}
              onKeyPress={(e) => { if (e.key === "Enter") addCustomFilterRole(); }}
              fullWidth
              size="small"
              variant="outlined"
            />
            <IconButton color="primary" onClick={addCustomFilterRole} style={{ marginLeft: "5px" }}>
              <AddIcon />
            </IconButton>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { handleCloseFilter(); setProjectsData(initialProjectsData); }} color="primary">
            Clear all
          </Button>
          <Button onClick={applyFilters} color="primary" variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={successOpen} onClose={() => setSuccessOpen(false)}>
        <DialogContent>
          <Alert severity="success" onClose={() => setSuccessOpen(false)}>
            Congrats on creating the project!
          </Alert>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HomePage;