import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  Container, 
  Typography, 
  Box, 
  Chip, 
  Button,
  Paper,
  Grid,
  IconButton,
  Avatar,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete
} from "@mui/material";
import { db, auth, storage } from "../../firebase/firebaseconfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Navbar from "../../components/navbar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const ProjectDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCurrentUserMember, setIsCurrentUserMember] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [newAchievement, setNewAchievement] = useState('');
  const [newTimelineEntry, setNewTimelineEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    media: null,
    mediaType: null,
    mediaUrl: ''
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previewMedia, setPreviewMedia] = useState(null);
  const [newRole, setNewRole] = useState({ role: '', subRole: '' });
  const [newSkill, setNewSkill] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false);
  const [showCustomRole, setShowCustomRole] = useState(false);
  const [showCustomSubRole, setShowCustomSubRole] = useState(false);
  const [customRole, setCustomRole] = useState('');
  const [customSubRole, setCustomSubRole] = useState('');
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedJoinRole, setSelectedJoinRole] = useState(null);

  // Get unique roles from the project
  const projectRoles = project?.roles
    ?.map(roleData => typeof roleData.role === 'string' ? roleData.role : roleData.role?.role)
    ?.filter((role, index, self) => role && self.indexOf(role) === index) || [];

  const projectSubRoles = project?.roles
    ?.map(roleData => typeof roleData.subRole === 'string' ? roleData.subRole : roleData.role?.subRole)
    ?.filter((role, index, self) => role && self.indexOf(role) === index) || [];

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        // Wait for auth to initialize
        if (!auth.currentUser) {
          const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
              try {
                const projectRef = doc(db, "projects", id);
                const projectSnap = await getDoc(projectRef);

                if (projectSnap.exists()) {
                  const projectData = { id: projectSnap.id, ...projectSnap.data() };
                  console.log("Project data:", projectData); // Debug log
                  setProject(projectData);
                  setIsCurrentUserMember(projectData.creatorUid === user.uid);
                  
                  // Fetch team members data
                  const memberPromises = projectData.roles?.map(async (roleData, index) => {
                    const roleTitle = typeof roleData.role === 'object' ? roleData.role.role : roleData.role;
                    const roleSubTitle = typeof roleData.role === 'object' ? roleData.role.subRole : roleData.subRole;
                    
                    if (roleData.userId) {
                      // Get user's data if role is assigned
                      const userDoc = await getDoc(doc(db, "users", roleData.userId));
                      if (userDoc.exists()) {
                        const userData = userDoc.data();
                        return {
                          uid: roleData.userId,
                          role: roleTitle || '',
                          subRole: roleSubTitle || '',
                          name: userData.name || userData.email || 'Anonymous',
                          email: userData.email || '',
                          photoURL: userData.photoURL || ''
                        };
                      }
                    }
                    return {
                      role: roleTitle || '',
                      subRole: roleSubTitle || '',
                      name: 'Open Position',
                      email: '',
                      photoURL: ''
                    };
                  }) || [];

                  const members = await Promise.all(memberPromises);
                  setTeamMembers(members);
                } else {
                  console.log("No project found with ID:", id);
                  setError("Project not found");
                }
              } catch (err) {
                console.error("Error fetching project details:", err);
                setError(`Failed to load project: ${err.message}`);
              }
            } else {
              console.log("No authenticated user");
              setError("Please sign in to view project details");
            }
            setLoading(false);
            unsubscribe();
          });
        } else {
          const projectRef = doc(db, "projects", id);
          const projectSnap = await getDoc(projectRef);

          if (projectSnap.exists()) {
            const projectData = { id: projectSnap.id, ...projectSnap.data() };
            console.log("Project data:", projectData);
            setProject(projectData);
            setIsCurrentUserMember(projectData.creatorUid === auth.currentUser.uid);

            // Fetch team members data
            const memberPromises = projectData.roles?.map(async (roleData, index) => {
              const roleTitle = typeof roleData.role === 'object' ? roleData.role.role : roleData.role;
              const roleSubTitle = typeof roleData.role === 'object' ? roleData.role.subRole : roleData.subRole;
              
              if (roleData.userId) {
                // Get user's data if role is assigned
                const userDoc = await getDoc(doc(db, "users", roleData.userId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  return {
                    uid: roleData.userId,
                    role: roleTitle || '',
                    subRole: roleSubTitle || '',
                    name: userData.name || userData.email || 'Anonymous',
                    email: userData.email || '',
                    photoURL: userData.photoURL || ''
                  };
                }
              }
              return {
                role: roleTitle || '',
                subRole: roleSubTitle || '',
                name: 'Open Position',
                email: '',
                photoURL: ''
              };
            }) || [];

            const members = await Promise.all(memberPromises);
            setTeamMembers(members);
          } else {
            console.log("No project found with ID:", id);
            setError("Project not found");
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Error in fetchProject:", err);
        setError(`Failed to load project: ${err.message}`);
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleEditOpen = () => {
    // Prefill the editedProject state with existing project data
    setEditedProject({
      title: project.title || '',
      description: project.description || '',
      category: project.category || '',
      tags: project.tags || [],
      achievements: project.achievements || [],
      timeline: project.timeline || [],
      duration: project.duration || '',
      teamSize: project.teamSize || 2,
      roles: project.roles?.map(roleData => ({
        role: roleData.role || '',
        subRole: roleData.subRole || '',
        userId: roleData.userId || null
      })) || [],
      projectType: project.projectType || '',
      projectLink: project.projectLink || '',
      status: project.status || 'Active',
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleSaveChanges = async () => {
    try {
      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, {
        title: editedProject.title,
        description: editedProject.description,
        category: editedProject.category,
        tags: editedProject.tags,
        achievements: editedProject.achievements,
        timeline: editedProject.timeline,
        duration: editedProject.duration,
        teamSize: editedProject.teamSize,
        roles: editedProject.roles,
        projectType: editedProject.projectType,
        projectLink: editedProject.projectLink,
        status: editedProject.status,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setProject({
        ...project,
        ...editedProject,
        updatedAt: new Date().toISOString()
      });

      handleEditClose();
    } catch (error) {
      console.error("Error updating project:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      setEditedProject({
        ...editedProject,
        achievements: [...(editedProject.achievements || []), newAchievement.trim()]
      });
      setNewAchievement('');
    }
  };

  const handleRemoveAchievement = (index) => {
    const newAchievements = [...editedProject.achievements];
    newAchievements.splice(index, 1);
    setEditedProject({
      ...editedProject,
      achievements: newAchievements
    });
  };

  const handleAddTimelineEntry = () => {
    if (newTimelineEntry.title && newTimelineEntry.description) {
      setEditedProject({
        ...editedProject,
        timeline: [...(editedProject.timeline || []), newTimelineEntry]
      });
      setNewTimelineEntry({
        date: new Date().toISOString().split('T')[0],
        title: '',
        description: '',
        media: null,
        mediaType: null,
        mediaUrl: ''
      });
    }
  };

  const handleRemoveTimelineEntry = (index) => {
    const newTimeline = [...editedProject.timeline];
    newTimeline.splice(index, 1);
    setEditedProject({
      ...editedProject,
      timeline: newTimeline
    });
  };

  const handleFileSelect = (file, index = null) => {
    if (!file) return;

    // Preview the file before upload
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = {
        url: e.target.result,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        file: file
      };
      setPreviewMedia({ preview, index });
    };
    reader.readAsDataURL(file);
  };

  const handleTimelineMediaUpload = async (file, index = null) => {
    if (!file) return null;

    setUploadLoading(true);
    try {
      const fileRef = ref(storage, `projects/${id}/timeline/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      
      if (index !== null) {
        // Update existing entry
        const newTimeline = [...editedProject.timeline];
        newTimeline[index] = {
          ...newTimeline[index],
          mediaUrl: downloadUrl,
          mediaType: file.type.startsWith('image/') ? 'image' : 'video'
        };
        setEditedProject({
          ...editedProject,
          timeline: newTimeline
        });
      } else {
        // Update new entry
        setNewTimelineEntry({
          ...newTimelineEntry,
          mediaUrl: downloadUrl,
          mediaType: file.type.startsWith('image/') ? 'image' : 'video'
        });
      }
      
      setSnackbar({
        open: true,
        message: 'Media uploaded successfully!',
        severity: 'success'
      });
      setPreviewMedia(null);
      return downloadUrl;
    } catch (error) {
      console.error("Error uploading media:", error);
      setSnackbar({
        open: true,
        message: 'Failed to upload media. Please try again.',
        severity: 'error'
      });
      return null;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEditTimelineEntry = (index, field, value) => {
    const newTimeline = [...editedProject.timeline];
    newTimeline[index] = {
      ...newTimeline[index],
      [field]: value
    };
    setEditedProject({
      ...editedProject,
      timeline: newTimeline
    });
  };

  const handleAddRole = () => {
    const newRole = {
      role: '',
      subRole: '',
      userId: null
    };
    setEditedProject(prev => ({
      ...prev,
      roles: [...(prev?.roles || []), newRole]
    }));
  };

  const handleRemoveRole = (index) => {
    setEditedProject(prev => {
      const newRoles = [...(prev?.roles || [])];
      // Only remove if the role doesn't have a user assigned
      if (!newRoles[index]?.userId) {
        newRoles.splice(index, 1);
      }
      return {
        ...prev,
        roles: newRoles
      };
    });
  };

  const handleEditRole = (index, field, value) => {
    const newRoles = [...(editedProject?.roles || [])];
    const currentRole = newRoles[index] || { role: '', subRole: '', userId: null };
    newRoles[index] = {
      ...currentRole,
      [field]: value
    };
    setEditedProject({
      ...editedProject,
      roles: newRoles
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setEditedProject({
        ...editedProject,
        tags: [...(editedProject.tags || []), newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRoleChange = (roleIndex) => {
    setSelectedRole(roleIndex);
    setRoleChangeDialogOpen(true);
  };

  const handleRoleUpdate = async (newRole) => {
    try {
      const projectRef = doc(db, "projects", id);
      const newRoles = [...project.roles];
      newRoles[selectedRole] = {
        ...newRoles[selectedRole],
        ...newRole
      };
      
      await updateDoc(projectRef, {
        roles: newRoles
      });

      // Update local state
      setProject({
        ...project,
        roles: newRoles
      });

      // Refresh team members
      const memberPromises = newRoles.map(async (roleData) => {
        if (roleData.userId) {
          const userDoc = await getDoc(doc(db, "users", roleData.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
              uid: roleData.userId,
              role: roleData.role || '',
              subRole: roleData.subRole || '',
              name: userData.name || userData.email || 'Anonymous',
              email: userData.email || '',
              photoURL: userData.photoURL || ''
            };
          }
        }
        return {
          role: roleData.role || '',
          subRole: roleData.subRole || '',
          name: roleData.userId ? 'Loading...' : 'Open Position',
          email: '',
          photoURL: ''
        };
      });

      const members = await Promise.all(memberPromises);
      setTeamMembers(members);
      setRoleChangeDialogOpen(false);
      setSelectedRole(null);
      setSnackbar({
        open: true,
        message: 'Role updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error updating role:", error);
      setSnackbar({
        open: true,
        message: 'Failed to update role. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleTeamSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    if (newSize > 0) {
      const currentRoles = editedProject.roles || [];
      const newRoles = [...currentRoles];
      
      // Add or remove roles based on new size
      if (newSize > currentRoles.length) {
        for (let i = currentRoles.length; i < newSize; i++) {
          newRoles.push({ role: '', subRole: '', userId: null });
        }
      } else if (newSize < currentRoles.length) {
        newRoles.splice(newSize);
      }

      setEditedProject({
        ...editedProject,
        teamSize: newSize,
        roles: newRoles
      });
    }
  };

  const handleJoinProject = async () => {
    try {
      const projectRef = doc(db, "projects", id);
      const newRoles = [...project.roles];
      
      // Find the first empty role position
      const emptyRoleIndex = newRoles.findIndex(role => !role.userId);
      
      if (emptyRoleIndex === -1) {
        setSnackbar({
          open: true,
          message: 'No available roles in this project',
          severity: 'error'
        });
        return;
      }

      // Update the role with the current user's ID
      newRoles[emptyRoleIndex] = {
        ...newRoles[emptyRoleIndex],
        userId: auth.currentUser.uid
      };

      await updateDoc(projectRef, {
        roles: newRoles
      });

      // Update local state
      setProject({
        ...project,
        roles: newRoles
      });

      // Refresh team members
      const memberPromises = newRoles.map(async (roleData) => {
        if (roleData.userId) {
          const userDoc = await getDoc(doc(db, "users", roleData.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
              uid: roleData.userId,
              role: roleData.role || '',
              subRole: roleData.subRole || '',
              name: userData.name || userData.email || 'Anonymous',
              email: userData.email || '',
              photoURL: userData.photoURL || ''
            };
          }
        }
        return {
          role: roleData.role || '',
          subRole: roleData.subRole || '',
          name: roleData.userId ? 'Loading...' : 'Open Position',
          email: '',
          photoURL: ''
        };
      });

      const members = await Promise.all(memberPromises);
      setTeamMembers(members);
      setJoinDialogOpen(false);
      setSelectedJoinRole(null);
      setIsCurrentUserMember(true);
      
      setSnackbar({
        open: true,
        message: 'Successfully joined the project!',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error joining project:", error);
      setSnackbar({
        open: true,
        message: 'Failed to join project. Please try again.',
        severity: 'error'
      });
    }
  };

  if (loading) return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
      <Typography>Loading project details...</Typography>
    </Box>
  );
  
  if (error) return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
      <Typography color="error">{error}</Typography>
    </Box>
  );
  
  if (!project) return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
      <Typography>No project data available</Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#F5F5F5', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 3, pb: 8 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton 
            onClick={() => router.back()} 
            sx={{ 
              mr: 2,
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 500 }}>
            {project.title}
          </Typography>
        </Box>

        {/* Status and Last Updated */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Chip 
            label={project.status || 'Active'} 
            size="small" 
            sx={{ 
              bgcolor: project.status === 'Completed' 
                ? '#EDE7F6' 
                : project.status === 'Archived'
                ? '#FFEBEE'
                : '#E8F5E9',
              color: project.status === 'Completed' 
                ? '#5E35B1' 
                : project.status === 'Archived'
                ? '#C62828'
                : '#2E7D32',
              mr: 1,
              height: '24px',
              fontSize: '0.75rem'
            }} 
          />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            Last updated: {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Project Overview</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                {project.description}
              </Typography>
            </Paper>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Key Achievements</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {project.achievements?.map((achievement, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <CheckCircleIcon sx={{ color: '#2E7D32', fontSize: 20, mt: 0.3 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {achievement}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Project Timeline</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Vertical line */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: '7px',
                    top: '24px',
                    bottom: '24px',
                    width: '2px',
                    bgcolor: '#E3F2FD',
                    zIndex: 0
                  }}
                />
                {project.timeline?.map((update, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 3, mb: 4, position: 'relative' }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      bgcolor: '#1976D2',
                      flexShrink: 0,
                      zIndex: 1
                    }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {new Date(update.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {update.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        {update.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Technologies Used</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {project.tags?.map((tech) => (
                  <Chip 
                    key={tech}
                    label={tech}
                    size="small"
                    sx={{ 
                      bgcolor: '#1976D2',
                      color: 'white',
                      fontSize: '0.75rem',
                      height: '24px',
                      borderRadius: '12px',
                      '& .MuiChip-label': {
                        px: 1.5
                      }
                    }}
                  />
                ))}
              </Box>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Duration
                  </Typography>
                  <Typography variant="body2">
                    {new Date(project.createdAt).toLocaleDateString()} - Present
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Team Size
                  </Typography>
                  <Typography variant="body2">
                    {teamMembers.filter(member => member.name !== 'Open Position').length}/{project.teamSize || 2}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Project Type
                  </Typography>
                  <Typography variant="body2">
                    {project.projectType || 'Not specified'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Team Members</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
                {teamMembers.map((member, index) => (
                  <Box key={index} sx={{ 
                    p: 2, 
                    bgcolor: '#F5F5F5', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Avatar 
                      src={member.photoURL || ''} 
                      sx={{ 
                        width: 40, 
                        height: 40,
                        bgcolor: member.name === 'Open Position' ? '#E0E0E0' : '#1976D2'
                      }}
                    >
                      {member.name && member.name !== 'Open Position' ? member.name.charAt(0) : '?'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500, color: member.name === 'Open Position' ? '#757575' : '#1976D2' }}>
                        {member.name || 'Open Position'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.role || 'No Role Assigned'}
                      </Typography>
                      {member.subRole && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {member.subRole}
                        </Typography>
                      )}
                    </Box>
                    {isCurrentUserMember && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleRoleChange(index)}
                        disabled={member.name === 'Open Position'}
                      >
                        Change Role
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                {isCurrentUserMember ? (
                  <Button
                    variant="outlined"
                    onClick={handleEditOpen}
                    sx={{ 
                      borderColor: '#1976D2',
                      color: '#1976D2',
                      '&:hover': {
                        borderColor: '#1565C0',
                        bgcolor: 'rgba(25, 118, 210, 0.04)'
                      }
                    }}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setJoinDialogOpen(true)}
                    sx={{ 
                      color: '#1976D2',
                      borderColor: '#1976D2',
                      '&:hover': {
                        borderColor: '#1565C0',
                        bgcolor: 'rgba(25, 118, 210, 0.04)'
                      }
                    }}
                  >
                    Join
                  </Button>
                )}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    if (project.projectLink) {
                      window.open(project.projectLink, '_blank');
                    } else {
                      setSnackbar({
                        open: true,
                        message: 'No project link available',
                        severity: 'info'
                      });
                    }
                  }}
                  sx={{ 
                    bgcolor: '#1976D2',
                    '&:hover': {
                      bgcolor: '#1565C0'
                    }
                  }}
                >
                  View
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Add the Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleEditClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Project Title and Status */}
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Project Title"
                  value={editedProject?.title || ''}
                  onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editedProject?.status || 'Active'}
                    onChange={(e) => setEditedProject({ ...editedProject, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Archived">Archived</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Project Type and Duration */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Project Type</InputLabel>
                  <Select
                    value={editedProject?.projectType || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, projectType: e.target.value })}
                    label="Project Type"
                  >
                    <MenuItem value="Education">Education</MenuItem>
                    <MenuItem value="Technology">Technology</MenuItem>
                    <MenuItem value="Business">Business</MenuItem>
                    <MenuItem value="Healthcare">Healthcare</MenuItem>
                    <MenuItem value="Entertainment">Entertainment</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  value={editedProject?.duration || ''}
                  onChange={(e) => setEditedProject({ ...editedProject, duration: e.target.value })}
                  placeholder="e.g., 3 months"
                />
              </Grid>
            </Grid>

            {/* Team Size */}
            <TextField
              fullWidth
              label="Team Size"
              type="number"
              value={editedProject?.teamSize || 2}
              onChange={(e) => {
                const newSize = parseInt(e.target.value);
                if (newSize > 0) {
                  const currentRoles = editedProject.roles || [];
                  const newRoles = [...currentRoles];
                  
                  // Add or remove roles based on new size
                  if (newSize > currentRoles.length) {
                    for (let i = currentRoles.length; i < newSize; i++) {
                      newRoles.push({ role: '', subRole: '', userId: null });
                    }
                  } else if (newSize < currentRoles.length) {
                    newRoles.splice(newSize);
                  }

                  setEditedProject({
                    ...editedProject,
                    teamSize: newSize,
                    roles: newRoles
                  });
                }
              }}
              InputProps={{
                inputProps: { min: 1 }
              }}
            />

            {/* Project Overview */}
            <TextField
              fullWidth
              label="Project Overview"
              multiline
              rows={4}
              value={editedProject?.description || ''}
              onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
            />

            {/* Project Category */}
            <FormControl fullWidth>
              <InputLabel>Project Category</InputLabel>
              <Select
                value={editedProject?.category || ''}
                onChange={(e) => setEditedProject({ ...editedProject, category: e.target.value })}
                label="Project Category"
              >
                <MenuItem value="Web Development">Web Development</MenuItem>
                <MenuItem value="Mobile Development">Mobile Development</MenuItem>
                <MenuItem value="Data Science">Data Science</MenuItem>
                <MenuItem value="Machine Learning">Machine Learning</MenuItem>
                <MenuItem value="UI/UX Design">UI/UX Design</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            {/* Skills */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Skills</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {editedProject?.tags?.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => {
                      const newSkills = [...editedProject.tags];
                      newSkills.splice(index, 1);
                      setEditedProject({ ...editedProject, tags: newSkills });
                    }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <Button onClick={handleAddSkill} variant="outlined">Add</Button>
              </Box>
            </Box>

            {/* Roles */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Roles</Typography>
              {editedProject?.roles?.map((roleData, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Role"
                    value={roleData.role || ''}
                    onChange={(e) => handleEditRole(index, 'role', e.target.value)}
                  />
                  <TextField
                    size="small"
                    placeholder="Sub-role (optional)"
                    value={roleData.subRole || ''}
                    onChange={(e) => handleEditRole(index, 'subRole', e.target.value)}
                  />
                  <IconButton 
                    onClick={() => handleRemoveRole(index)} 
                    color="error"
                    disabled={roleData.userId !== null} // Prevent removing roles that have assigned users
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button 
                variant="outlined" 
                onClick={handleAddRole}
                disabled={editedProject?.roles?.length >= (editedProject?.teamSize || 0)}
                sx={{ mt: 1 }}
              >
                Add Role
              </Button>
            </Box>

            {/* Key Achievements */}
            <Typography variant="h6" sx={{ mt: 2 }}>Key Achievements</Typography>
            {editedProject?.achievements?.map((achievement, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  value={achievement}
                  disabled
                />
                <IconButton onClick={() => handleRemoveAchievement(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="New Achievement"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
              />
              <Button onClick={handleAddAchievement} variant="contained">
                Add
              </Button>
            </Box>

            {/* Timeline */}
            <Typography variant="h6" sx={{ mt: 2 }}>Timeline</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {editedProject?.timeline?.map((entry, index) => (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      type="date"
                      value={entry.date}
                      onChange={(e) => handleEditTimelineEntry(index, 'date', e.target.value)}
                      sx={{ width: '150px' }}
                    />
                    <TextField
                      fullWidth
                      value={entry.title}
                      onChange={(e) => handleEditTimelineEntry(index, 'title', e.target.value)}
                      placeholder="Entry Title"
                    />
                    <IconButton onClick={() => handleRemoveTimelineEntry(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField
                    fullWidth
                    value={entry.description}
                    onChange={(e) => handleEditTimelineEntry(index, 'description', e.target.value)}
                    multiline
                    rows={2}
                    placeholder="Entry Description"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {entry.mediaUrl ? (
                      <Box sx={{ position: 'relative', width: 200, height: 'auto' }}>
                        {entry.mediaType === 'image' ? (
                          <img 
                            src={entry.mediaUrl} 
                            alt="Timeline media" 
                            style={{ 
                              width: '100%', 
                              height: 'auto', 
                              borderRadius: 4,
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <video 
                            src={entry.mediaUrl} 
                            controls 
                            style={{ 
                              width: '100%', 
                              height: 'auto', 
                              borderRadius: 4 
                            }}
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleEditTimelineEntry(index, 'mediaUrl', '')}
                          sx={{ 
                            position: 'absolute', 
                            top: 4, 
                            right: 4, 
                            bgcolor: 'rgba(0,0,0,0.5)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                          }}
                        >
                          <DeleteIcon sx={{ color: 'white' }} />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {previewMedia && previewMedia.index === index && (
                          <Box sx={{ position: 'relative', width: 200 }}>
                            {previewMedia.preview.type === 'image' ? (
                              <img 
                                src={previewMedia.preview.url} 
                                alt="Preview" 
                                style={{ 
                                  width: '100%', 
                                  height: 'auto', 
                                  borderRadius: 4,
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <video 
                                src={previewMedia.preview.url} 
                                controls 
                                style={{ 
                                  width: '100%', 
                                  height: 'auto', 
                                  borderRadius: 4 
                                }}
                              />
                            )}
                            <Box sx={{ 
                              position: 'absolute', 
                              top: '50%', 
                              left: '50%', 
                              transform: 'translate(-50%, -50%)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              {uploadLoading ? (
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                              ) : (
                                <>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleTimelineMediaUpload(previewMedia.preview.file, index)}
                                  >
                                    Upload
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setPreviewMedia(null)}
                                    sx={{ color: 'white', borderColor: 'white' }}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </Box>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            style={{ display: 'none' }}
                            id={`timeline-media-${index}`}
                            onChange={(e) => handleFileSelect(e.target.files[0], index)}
                          />
                          <label htmlFor={`timeline-media-${index}`}>
                            <Button
                              component="span"
                              variant="outlined"
                              size="small"
                              startIcon={<AddPhotoAlternateIcon />}
                              disabled={uploadLoading}
                            >
                              Add Photo
                            </Button>
                          </label>
                          <label htmlFor={`timeline-media-${index}`}>
                            <Button
                              component="span"
                              variant="outlined"
                              size="small"
                              startIcon={<VideoLibraryIcon />}
                              disabled={uploadLoading}
                            >
                              Add Video
                            </Button>
                          </label>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}

              {/* Add new timeline entry */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    type="date"
                    value={newTimelineEntry.date}
                    onChange={(e) => setNewTimelineEntry({ ...newTimelineEntry, date: e.target.value })}
                    sx={{ width: '150px' }}
                  />
                  <TextField
                    fullWidth
                    label="Title"
                    value={newTimelineEntry.title}
                    onChange={(e) => setNewTimelineEntry({ ...newTimelineEntry, title: e.target.value })}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={newTimelineEntry.description}
                  onChange={(e) => setNewTimelineEntry({ ...newTimelineEntry, description: e.target.value })}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {newTimelineEntry.mediaUrl ? (
                    <Box sx={{ position: 'relative', width: 200, height: 'auto' }}>
                      {newTimelineEntry.mediaType === 'image' ? (
                        <img 
                          src={newTimelineEntry.mediaUrl} 
                          alt="New timeline media" 
                          style={{ width: '100%', height: 'auto', borderRadius: 4 }}
                        />
                      ) : (
                        <video 
                          src={newTimelineEntry.mediaUrl} 
                          controls 
                          style={{ width: '100%', height: 'auto', borderRadius: 4 }}
                        />
                      )}
                      <IconButton
                        size="small"
                        onClick={() => setNewTimelineEntry({ ...newTimelineEntry, mediaUrl: '', mediaType: null })}
                        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)' }}
                      >
                        <DeleteIcon sx={{ color: 'white' }} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        style={{ display: 'none' }}
                        id="new-timeline-media"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                      />
                      <label htmlFor="new-timeline-media">
                        <Button
                          component="span"
                          variant="outlined"
                          size="small"
                          startIcon={<AddPhotoAlternateIcon />}
                          disabled={uploadLoading}
                        >
                          Add Photo
                        </Button>
                      </label>
                      <label htmlFor="new-timeline-media">
                        <Button
                          component="span"
                          variant="outlined"
                          size="small"
                          startIcon={<VideoLibraryIcon />}
                          disabled={uploadLoading}
                        >
                          Add Video
                        </Button>
                      </label>
                    </Box>
                  )}
                </Box>
                <Button onClick={handleAddTimelineEntry} variant="contained" sx={{ mt: 1 }}>
                  Add Timeline Entry
                </Button>
              </Box>
            </Box>

            {/* Project Link */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Link"
                value={editedProject?.projectLink || ''}
                onChange={(e) => setEditedProject({ ...editedProject, projectLink: e.target.value })}
                placeholder="Enter project URL (e.g., https://github.com/username/project)"
                helperText="Enter the URL where users can view the project"
              />
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleSaveChanges} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog
        open={roleChangeDialogOpen}
        onClose={() => setRoleChangeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Role</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole !== null && project.roles[selectedRole] ? 
                  (typeof project.roles[selectedRole].role === 'object' ? 
                    project.roles[selectedRole].role.role : 
                    project.roles[selectedRole].role) || '' 
                  : ''}
                onChange={(e) => {
                  if (e.target.value === 'Other') {
                    setShowCustomRole(true);
                  } else {
                    setShowCustomRole(false);
                    handleRoleUpdate({ role: e.target.value });
                  }
                }}
                label="Role"
              >
                {projectRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            {showCustomRole && (
              <TextField
                fullWidth
                label="Custom Role"
                value={customRole}
                onChange={(e) => {
                  setCustomRole(e.target.value);
                  handleRoleUpdate({ role: e.target.value });
                }}
                placeholder="Enter custom role"
              />
            )}

            <FormControl fullWidth>
              <InputLabel>Sub-role (optional)</InputLabel>
              <Select
                value={selectedRole !== null && project.roles[selectedRole] ? 
                  (typeof project.roles[selectedRole].role === 'object' ? 
                    project.roles[selectedRole].role.subRole : 
                    project.roles[selectedRole].subRole) || '' 
                  : ''}
                onChange={(e) => {
                  if (e.target.value === 'Other') {
                    setShowCustomSubRole(true);
                  } else {
                    setShowCustomSubRole(false);
                    handleRoleUpdate({ subRole: e.target.value });
                  }
                }}
                label="Sub-role (optional)"
              >
                <MenuItem value="">None</MenuItem>
                {projectSubRoles.map((subRole) => (
                  <MenuItem key={subRole} value={subRole}>
                    {subRole}
                  </MenuItem>
                ))}
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            {showCustomSubRole && (
              <TextField
                fullWidth
                label="Custom Sub-role"
                value={customSubRole}
                onChange={(e) => {
                  setCustomSubRole(e.target.value);
                  handleRoleUpdate({ subRole: e.target.value });
                }}
                placeholder="Enter custom sub-role"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRoleChangeDialogOpen(false);
            setShowCustomRole(false);
            setShowCustomSubRole(false);
            setCustomRole('');
            setCustomSubRole('');
          }}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Join Dialog */}
      <Dialog
        open={joinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Join Project</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Select a role to join the project:
            </Typography>
            {(project?.roles || []).map((roleData, index) => {
              const roleTitle = typeof roleData.role === 'object' ? roleData.role.role : roleData.role;
              const roleSubTitle = typeof roleData.role === 'object' ? roleData.role.subRole : roleData.subRole;
              
              return (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: selectedJoinRole === index ? '#1976D2' : '#E0E0E0',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                  onClick={() => setSelectedJoinRole(index)}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {roleTitle || 'Unnamed Role'}
                  </Typography>
                  {roleSubTitle && (
                    <Typography variant="body2" color="text.secondary">
                      {roleSubTitle}
                    </Typography>
                  )}
                  {roleData.userId ? (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      Position filled
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                      Available
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleJoinProject}
            variant="contained"
            disabled={selectedJoinRole === null || (project?.roles?.[selectedJoinRole]?.userId)}
          >
            Join Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectDetails; 