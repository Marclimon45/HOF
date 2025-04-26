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
  Autocomplete,
  Divider
} from "@mui/material";
import { db, auth, storage } from "../../firebase/firebaseconfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
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
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EditIcon from '@mui/icons-material/Edit';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import SearchIcon from '@mui/icons-material/Search';
import CampaignIcon from '@mui/icons-material/Campaign';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import BusinessIcon from '@mui/icons-material/Business';
import BuildIcon from '@mui/icons-material/Build';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import MovieIcon from '@mui/icons-material/Movie';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import ArchiveIcon from '@mui/icons-material/Archive';

const defaultProjectTypes = [
  "Development",
  "Research",
  "Marketing",
  "Design",
  "Business",
  "Engineering",
  "Health",
  "Education",
  "Entertainment",
  "Other"
];

const defaultProgressStatuses = [
  "Active",
  "Completed",
  "Looking for Members",
  "Archived"
];

// Map project types to icons
const projectTypeIcons = {
  Development: <CodeIcon />,
  Research: <SearchIcon />,
  Marketing: <CampaignIcon />,
  Design: <DesignServicesIcon />,
  Business: <BusinessIcon />,
  Engineering: <BuildIcon />,
  Health: <LocalHospitalIcon />,
  Education: <SchoolIcon />,
  Entertainment: <MovieIcon />,
  Other: <MoreHorizIcon />
};

// Map progress statuses to icons
const progressStatusIcons = {
  Active: <PlayCircleOutlineIcon />,
  Completed: <CheckCircleOutlineIcon />,
  "Looking for Members": <GroupAddIcon />,
  Archived: <ArchiveIcon />
};

const ProjectDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCurrentUserMember, setIsCurrentUserMember] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedProject, setEditedProject] = useState({
    title: '',
    description: '',
    category: '',
    status: 'active',
    lookingFor: [],
    teamSize: 0,
    duration: '',
    startDate: '',
    endDate: '',
    keyAchievements: [],
    technologies: [],
    timeline: [],
    media: []
  });
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
  const [isCreator, setIsCreator] = useState(false);

  // Add getStatusColor function
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Archived':
        return 'error';
      case 'Looking for Members':
        return 'info';
      case 'Active':
      default:
        return 'primary';
    }
  };

  // Update the projectRoles and projectSubRoles definitions
  const projectRoles = Array.isArray(project?.roles) 
    ? project.roles
        .map(roleData => roleData.role)
        .filter(role => role !== null && role !== undefined)
    : [];

  const projectSubRoles = Array.isArray(project?.roles)
    ? project.roles
        .map(roleData => roleData.subRole)
        .filter(subRole => subRole !== null && subRole !== undefined)
    : [];

  // Add this helper function to sort timeline entries
  const sortTimelineEntries = (timeline) => {
    if (!Array.isArray(timeline)) return [];
    return [...timeline].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA; // Sort in descending order (newest first)
    });
  };

  // Add this helper function to handle date conversions
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Create date in local timezone
    const date = new Date(dateString);
    // Adjust for timezone offset
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() + (offset * 60 * 1000));
    // Format as YYYY-MM-DD
    return adjustedDate.toISOString().split('T')[0];
  };

  const fetchProject = async () => {
    if (!id) return;

    try {
      const projectRef = doc(db, "projects", id);
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists()) {
        const projectData = { 
          id: projectSnap.id, 
          ...projectSnap.data(),
          keyAchievements: projectSnap.data().keyAchievements || [],
          technologies: projectSnap.data().technologies || [],
          timeline: sortTimelineEntries(projectSnap.data().timeline || []),
          media: projectSnap.data().media || []
        };
        console.log("Project data:", projectData);
        setProject(projectData);
        setEditedProject(projectData);
        
        // Check if user is creator or has a role in the project
        const isCreator = projectData.creatorUid === auth.currentUser?.uid;
        const userRoles = Array.isArray(projectData.roles) 
          ? projectData.roles.filter(role => role.userId === auth.currentUser?.uid)
          : [];
        const hasRole = userRoles.length > 0;
        
        setIsCurrentUserMember(hasRole);
        setIsCreator(isCreator);
        
        // Fetch team members data
        if (Array.isArray(projectData.roles)) {
          const memberPromises = projectData.roles.map(async (roleData) => {
                    if (roleData.userId) {
                      const userDoc = await getDoc(doc(db, "users", roleData.userId));
                      if (userDoc.exists()) {
                        const userData = userDoc.data();
                        return {
                          uid: roleData.userId,
                  role: roleData.role || '',
                  subRole: roleData.subRole || '',
                  name: userData.displayName || userData.email?.split('@')[0] || 'Anonymous',
                          email: userData.email || '',
                  photoURL: userData.photoURL || '/jeff1.jpg',
                  status: roleData.status || 'Active'
                        };
                      }
                    }
                    return {
              role: roleData.role || '',
              subRole: roleData.subRole || '',
                      name: 'Open Position',
                      email: '',
              photoURL: null,
              status: 'Open'
                    };
          });

                  const members = await Promise.all(memberPromises);
          setTeamMembers(members.filter(member => member !== null));
        } else {
          setTeamMembers([]);
        }
      } else {
        console.log("No project found with ID:", id);
        setError("Project not found");
      }
    } catch (err) {
      console.error("Error fetching project:", err);
      setError(`Failed to load project: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!auth.currentUser) {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          fetchProject();
            } else {
              console.log("No authenticated user");
              setError("Please sign in to view project details");
          router.push('/');
            }
            unsubscribe();
          });
        } else {
      fetchProject();
    }
  }, [id, router]);

  const handleEditOpen = () => {
    // Prefill the editedProject state with existing project data
    setEditedProject({
      title: project.title || '',
      description: project.description || '',
      category: project.category || '',
      tags: project.tags || [],
      keyAchievements: Array.isArray(project.keyAchievements) ? [...project.keyAchievements] : [],
      technologies: Array.isArray(project.technologies) ? [...project.technologies] : [],
      timeline: Array.isArray(project.timeline) ? [...project.timeline] : [],
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

  const handleEditChange = (field, value) => {
    setEditedProject(prev => {
      if (!prev) return null;
      if (field === 'roles' && !Array.isArray(value)) {
        // If roles is not an array, initialize it
        value = [];
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSaveChanges = async () => {
    try {
      // Ensure roles is an array and timeline is sorted
      const updatedProject = {
        ...editedProject,
        roles: Array.isArray(editedProject.roles) ? editedProject.roles : [],
        timeline: sortTimelineEntries(editedProject.timeline)
      };

      await updateDoc(doc(db, "projects", id), updatedProject);
      setProject(updatedProject);
      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Project updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating project:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update project: ' + error.message,
        severity: 'error'
      });
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
    setEditedProject(prev => {
      const newTimeline = Array.isArray(prev.timeline) ? [
        ...prev.timeline,
        {
          date: formatDateForInput(new Date()),
          title: '',
          description: '',
          media: [],
          mediaType: null,
          mediaUrl: ''
        }
      ] : [{
        date: formatDateForInput(new Date()),
        title: '',
        description: '',
        media: [],
        mediaType: null,
        mediaUrl: ''
      }];
      
      return {
        ...prev,
        timeline: sortTimelineEntries(newTimeline)
      };
    });
  };

  const handleRemoveTimelineEntry = (index) => {
    setEditedProject(prev => ({
      ...prev,
      timeline: Array.isArray(prev.timeline)
        ? prev.timeline.filter((_, i) => i !== index)
        : []
    }));
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
          timeline: sortTimelineEntries(newTimeline)
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

  const handleTimelineChange = (index, field, value) => {
    setEditedProject(prev => {
      const newTimeline = Array.isArray(prev.timeline) ? [...prev.timeline] : [];
      if (!newTimeline[index]) {
        newTimeline[index] = {
          date: formatDateForInput(new Date()),
          title: '',
          description: '',
          media: [],
          mediaType: null,
          mediaUrl: ''
        };
      }
      
      // If the field is 'date', ensure proper formatting
      const fieldValue = field === 'date' ? formatDateForInput(new Date(value)) : value;
      
      newTimeline[index] = {
        ...newTimeline[index],
        [field]: fieldValue
      };
      return {
        ...prev,
        timeline: sortTimelineEntries(newTimeline)
      };
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
    if (!auth.currentUser) {
      setSnackbar({
        open: true,
        message: 'Please sign in to join the project',
        severity: 'error'
      });
      return;
    }

    try {
      const projectRef = doc(db, "projects", id);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      const projectData = projectDoc.data();

      // Check if project is archived
      if (projectData.status === 'Archived') {
        setSnackbar({
          open: true,
          message: 'Cannot join an archived project',
          severity: 'error'
        });
        return;
      }

      const selectedRoles = Array.isArray(selectedJoinRole) ? selectedJoinRole : [selectedJoinRole];
      
      // Check if any selected roles are already taken
      const invalidRoles = selectedRoles.filter(roleIndex => 
        projectData.roles[roleIndex]?.userId
      );

      if (invalidRoles.length > 0) {
        throw new Error('Some selected roles are no longer available');
      }

      // Update the project roles
      const updatedRoles = [...projectData.roles];
      const now = new Date().toISOString();

      selectedRoles.forEach(roleIndex => {
        updatedRoles[roleIndex] = {
          ...updatedRoles[roleIndex],
          userId: auth.currentUser.uid,
          status: 'Active',
          joinedAt: now
        };
      });

      // Update project document
      await updateDoc(projectRef, {
        roles: updatedRoles,
        members: (projectData.members || 0) + selectedRoles.length
      });

      // Update user's profile with current project
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        currentProject: {
          projectId: id,
          name: projectData.title,
          roles: selectedRoles.map(index => ({
            role: projectData.roles[index].role,
            joinedAt: now
          }))
        }
      });

      setIsCurrentUserMember(true);
      setJoinDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Successfully joined the project!',
        severity: 'success'
      });

      // Refresh project data
      fetchProject();
    } catch (error) {
      console.error('Error joining project:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to join project',
        severity: 'error'
      });
    }
  };

  const handleLeaveProject = async () => {
    try {
      const projectRef = doc(db, "projects", id);
      const newRoles = [...project.roles];
      const userRoleIndex = newRoles.findIndex(role => role.userId === auth.currentUser.uid);
      
      if (userRoleIndex !== -1) {
        // Remove user ID from the role
        newRoles[userRoleIndex] = {
          ...newRoles[userRoleIndex],
          userId: null
        };
        
        // Count remaining members
        const remainingMembers = newRoles.filter(role => role.userId).length;

        // Update project roles and status
      await updateDoc(projectRef, {
          roles: newRoles,
          status: remainingMembers === 0 ? 'Looking for Members' : project.status
        });

        // Remove current project from user's profile
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          currentProject: null
      });

      // Update local state
      setProject({
        ...project,
          roles: newRoles,
          status: remainingMembers === 0 ? 'Looking for Members' : project.status
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
            name: 'Open Position',
          email: '',
          photoURL: ''
        };
      });

      const members = await Promise.all(memberPromises);
      setTeamMembers(members);
        setRoleChangeDialogOpen(false);
        setSelectedRole(null);
        setIsCurrentUserMember(false);
      
      setSnackbar({
        open: true,
          message: 'Successfully left the project',
        severity: 'success'
      });

        // Redirect to home page
        router.push('/home');
      }
    } catch (error) {
      console.error("Error leaving project:", error);
      setSnackbar({
        open: true,
        message: 'Failed to leave project. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleKeyAchievementChange = (index, value) => {
    setEditedProject(prev => {
      const newAchievements = Array.isArray(prev.keyAchievements) ? [...prev.keyAchievements] : [];
      newAchievements[index] = value;
      return {
        ...prev,
        keyAchievements: newAchievements
      };
    });
  };

  const handleAddKeyAchievement = () => {
    setEditedProject(prev => ({
      ...prev,
      keyAchievements: Array.isArray(prev.keyAchievements) ? [...prev.keyAchievements, ''] : ['']
    }));
  };

  const handleRemoveKeyAchievement = (index) => {
    setEditedProject(prev => ({
      ...prev,
      keyAchievements: Array.isArray(prev.keyAchievements) 
        ? prev.keyAchievements.filter((_, i) => i !== index)
        : []
    }));
  };

  const handleTechnologyChange = (index, value) => {
    setEditedProject(prev => {
      const newTechnologies = Array.isArray(prev.technologies) ? [...prev.technologies] : [];
      newTechnologies[index] = value;
      return {
        ...prev,
        technologies: newTechnologies
      };
    });
  };

  const handleAddTechnology = () => {
    setEditedProject(prev => ({
      ...prev,
      technologies: Array.isArray(prev.technologies) ? [...prev.technologies, ''] : ['']
    }));
  };

  const handleRemoveTechnology = (index) => {
    setEditedProject(prev => ({
      ...prev,
      technologies: Array.isArray(prev.technologies)
        ? prev.technologies.filter((_, i) => i !== index)
        : []
    }));
  };

  const handleMediaUpload = async (e, timelineIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Create a reference to the storage location
      const storageRef = ref(storage, `project-media/${user.uid}/${Date.now()}-${file.name}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update the timeline entry with the new media
      const newTimeline = [...editedProject.timeline];
      newTimeline[timelineIndex] = {
        ...newTimeline[timelineIndex],
        media: [...(newTimeline[timelineIndex].media || []), {
          url: downloadURL,
          type: file.type.startsWith('image/') ? 'image' : 'video'
        }]
      };

      setEditedProject(prev => ({
        ...prev,
        timeline: sortTimelineEntries(newTimeline)
      }));

      setSnackbar({
        open: true,
        message: 'Media uploaded successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      setSnackbar({
        open: true,
        message: 'Failed to upload media. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleRemoveMedia = async (timelineIndex, mediaIndex) => {
    try {
      const mediaUrl = editedProject.timeline[timelineIndex].media[mediaIndex].url;
      const storageRef = ref(storage, mediaUrl);

      // Delete the file from storage
      await deleteObject(storageRef);

      // Update the timeline entry by removing the media
      const newTimeline = [...editedProject.timeline];
      newTimeline[timelineIndex] = {
        ...newTimeline[timelineIndex],
        media: newTimeline[timelineIndex].media.filter((_, i) => i !== mediaIndex)
      };

      setEditedProject(prev => ({
        ...prev,
        timeline: sortTimelineEntries(newTimeline)
      }));

      setSnackbar({
        open: true,
        message: 'Media removed successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing media:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove media. Please try again.',
        severity: 'error'
      });
    }
  };

  // Add this helper function to check if project is full
  const isProjectFull = (project) => {
    if (!project || !Array.isArray(project.roles)) return false;
    // Check if all roles have a userId assigned
    return project.roles.every(role => role.userId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
    </Box>
  );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography color="error">{error}</Typography>
    </Box>
  );
  }

  if (!project) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Project not found</Typography>
    </Box>
  );
  }

  return (
    <Box sx={{ bgcolor: '#F5F5F5', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 3, pb: 8 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '1200px', margin: '0 auto', padding: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
            <Typography variant="h4" component="h1">
              {project?.title || 'Loading...'}
          </Typography>
            {project?.creatorUid === auth.currentUser?.uid && (
          <Chip 
                label="Creator"
                color="primary"
            size="small" 
            sx={{ 
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontWeight: 'medium'
                }}
              />
            )}
            <Box sx={{ flexGrow: 1 }} />
            {project?.projectLink && (
              <Button
                variant="contained"
                color="info"
                onClick={() => window.open(project.projectLink, '_blank')}
                startIcon={<LinkIcon />}
                sx={{ 
                  minWidth: 100, 
              mr: 1,
                  backgroundColor: '#2196F3',
                  '&:hover': {
                    backgroundColor: '#1976D2'
                  }
                }}
              >
                View Project
              </Button>
            )}
            {isCurrentUserMember && (
              <Button
                variant="contained"
                color="success"
                onClick={handleEditOpen}
                startIcon={<EditIcon />}
                sx={{ 
                  minWidth: 100,
                  mr: isCurrentUserMember && !isCreator ? 1 : 0,
                  backgroundColor: '#4CAF50',
                  '&:hover': {
                    backgroundColor: '#388E3C'
                  }
                }}
              >
                Edit
              </Button>
            )}
            {!isCurrentUserMember && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setJoinDialogOpen(true)}
                startIcon={<GroupAddIcon />}
                disabled={project?.status === 'Archived' || isProjectFull(project)}
                sx={{ 
                  minWidth: 100,
                  backgroundColor: '#1976D2',
                  '&:hover': {
                    backgroundColor: '#1565C0'
                  }
                }}
              >
                {project?.status === 'Archived' 
                  ? 'Project Archived' 
                  : isProjectFull(project)
                    ? 'Project Full'
                    : 'Join Project'}
              </Button>
            )}
            {isCurrentUserMember && !isCreator && (
              <Button
                variant="contained"
                color="error"
                onClick={handleLeaveProject}
                startIcon={<ExitToAppIcon />}
                sx={{ 
                  minWidth: 100, 
                  ml: 1,
                  backgroundColor: '#F44336',
                  '&:hover': {
                    backgroundColor: '#D32F2F'
                  }
                }}
              >
                Leave Project
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={project?.status || 'Unknown Status'}
              color={getStatusColor(project?.status)}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              Last updated: {project?.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Unknown'}
          </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Project Overview</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                {project?.description || 'No description available'}
              </Typography>
            </Paper>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Key Achievements</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Array.isArray(project?.keyAchievements) && project.keyAchievements.length > 0 ? (
                  project.keyAchievements.map((achievement, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <CheckCircleIcon sx={{ color: '#2E7D32', fontSize: 20, mt: 0.3 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {achievement}
                    </Typography>
                  </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">No achievements added yet</Typography>
                )}
              </Box>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Project Timeline</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {Array.isArray(project?.timeline) && project.timeline.length > 0 ? (
                  <>
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
                    {project.timeline.map((update, index) => (
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
                  </>
                ) : (
                  <Typography color="text.secondary">No timeline entries yet</Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Technologies Used</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Array.isArray(editedProject?.technologies) && editedProject.technologies.length > 0 ? (
                  editedProject.technologies.map((tech) => (
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
                  ))
                ) : (
                  <Typography color="text.secondary">No technologies specified</Typography>
                )}
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
                    Project Category
                  </Typography>
                  <Typography variant="body2">
                    {project.category || 'Not specified'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Team Members</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Array.isArray(teamMembers) && teamMembers.length > 0 ? (
                  teamMembers.map((member, index) => (
                    <Box
                      key={index}
                      sx={{
                    display: 'flex',
                    alignItems: 'center',
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        cursor: member.uid ? 'pointer' : 'default',
                        '&:hover': member.uid ? {
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease-in-out'
                        } : {}
                      }}
                      onClick={() => {
                        if (member.uid) {
                          router.push(`/profile/${member.uid}`);
                        }
                      }}
                    >
                      {member.photoURL ? (
                    <Avatar 
                          src={member.photoURL}
                          alt={member.name}
                      sx={{ 
                            width: 48,
                            height: 48,
                            border: '2px solid #fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: '#e0e0e0',
                            color: '#757575'
                          }}
                        >
                          {member.name === 'Open Position' ? '?' : member.name.charAt(0)}
                    </Avatar>
                      )}
                      <Box sx={{ ml: 2, flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {member.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                          {member.role}
                          {member.subRole && ` - ${member.subRole}`}
                      </Typography>
                    </Box>
                      {isCurrentUserMember ? (
                        member.uid === auth.currentUser?.uid && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleRoleChange(index)}
                            sx={{ minWidth: 100 }}
                      >
                            CHANGE ROLE
                      </Button>
                        )
                      ) : (
                        !member.uid && (
                <Button
                  variant="contained"
                            color="primary"
                            size="small"
                  onClick={() => {
                              setSelectedJoinRole(index);
                              setJoinDialogOpen(true);
                            }}
                            sx={{ minWidth: 100 }}
                          >
                            JOIN
                </Button>
                        )
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">No team members yet</Typography>
                )}
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
          <Box component="form" sx={{ mt: 2 }}>
            {/* Project Title */}
                <TextField
                  fullWidth
                  label="Project Title"
                  value={editedProject?.title || ''}
              onChange={(e) => handleEditChange('title', e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* Project Description */}
                <TextField
                  fullWidth
              multiline
              rows={4}
              label="Project Description"
              value={editedProject?.description || ''}
              onChange={(e) => handleEditChange('description', e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* Project Link */}
            <TextField
              fullWidth
              label="Project Link"
              value={editedProject?.projectLink || ''}
              onChange={(e) => handleEditChange('projectLink', e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* Team Roles */}
            <Typography variant="h6" sx={{ mb: 2 }}>Team Roles</Typography>
            {Array.isArray(editedProject?.roles) ? (
              editedProject.roles.map((role, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <TextField
                      fullWidth
                    label="Role Title"
                    value={role.role || ''}
                    onChange={(e) => {
                      const updatedRoles = [...editedProject.roles];
                      updatedRoles[index] = { ...updatedRoles[index], role: e.target.value };
                      handleEditChange('roles', updatedRoles);
                    }}
                    sx={{ mb: 1 }}
                  />
            <TextField
              fullWidth
                    label="Sub Role (Optional)"
                    value={role.subRole || ''}
                    onChange={(e) => {
                      const updatedRoles = [...editedProject.roles];
                      updatedRoles[index] = { ...updatedRoles[index], subRole: e.target.value };
                      handleEditChange('roles', updatedRoles);
                    }}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {role.userId ? 'Filled' : 'Open Position'}
                    </Typography>
                    {!role.userId && (
                      <Button
                          size="small"
                        color="error"
                        onClick={() => {
                          const updatedRoles = editedProject.roles.filter((_, i) => i !== index);
                          handleEditChange('roles', updatedRoles);
                        }}
                      >
                        Remove Role
                                  </Button>
                              )}
                            </Box>
                          </Box>
              ))
            ) : (
              <Typography color="text.secondary">No roles defined</Typography>
            )}

                            <Button
                              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                const updatedRoles = Array.isArray(editedProject?.roles) 
                  ? [...editedProject.roles, { role: '', subRole: '', userId: null }]
                  : [{ role: '', subRole: '', userId: null }];
                handleEditChange('roles', updatedRoles);
              }}
              sx={{ mt: 2 }}
            >
              Add Role
                            </Button>

            {/* Project Category */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Project Category</InputLabel>
              <Select
                value={editedProject?.category || ''}
                onChange={(e) => handleEditChange('category', e.target.value)}
                label="Project Category"
              >
                {defaultProjectTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Project Status */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Project Status</InputLabel>
              <Select
                value={editedProject?.status || 'Active'}
                onChange={(e) => handleEditChange('status', e.target.value)}
                label="Project Status"
              >
                {defaultProgressStatuses.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Expected Completion Date */}
                <TextField
                  fullWidth
              type="date"
              label="Expected Completion Date"
              value={editedProject?.expectedCompletionDate || ''}
              onChange={(e) => handleEditChange('expectedCompletionDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />

            {/* Key Achievements Section */}
            <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Key Achievements</Typography>
            {Array.isArray(editedProject?.keyAchievements) ? editedProject.keyAchievements.map((achievement, index) => (
              <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                  fullWidth
                  value={achievement}
                  onChange={(e) => handleKeyAchievementChange(index, e.target.value)}
                  placeholder="Enter key achievement"
                  sx={{ flex: 1 }}
                />
                <Button
                    size="small"
                    color="error"
                  onClick={() => handleRemoveKeyAchievement(index)}
                  >
                  Remove
                </Button>
                </Box>
            )) : null}
              <Button 
                variant="outlined" 
              startIcon={<AddIcon />}
              onClick={handleAddKeyAchievement}
              >
              Add Achievement
              </Button>

            {/* Technologies Section */}
            <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Technologies Used</Typography>
            {Array.isArray(editedProject?.technologies) ? editedProject.technologies.map((technology, index) => (
              <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  value={technology}
                  onChange={(e) => handleTechnologyChange(index, e.target.value)}
                  placeholder="Enter technology"
                  sx={{ flex: 1 }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleRemoveTechnology(index)}
                >
                  Remove
              </Button>
            </Box>
            )) : null}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddTechnology}
            >
              Add Technology
            </Button>

            {/* Project Timeline Section */}
            <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Project Timeline</Typography>
            {Array.isArray(editedProject?.timeline) ? editedProject.timeline.map((entry, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      type="date"
                      label="Date"
                      value={formatDateForInput(entry.date)}
                      onChange={(e) => handleTimelineChange(index, 'date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveTimelineEntry(index)}
                    >
                      Remove Entry
                    </Button>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                  value={entry.description}
                  onChange={(e) => handleTimelineChange(index, 'description', e.target.value)}
                  placeholder="Enter milestone description"
                  sx={{ mb: 2 }}
                />
                
                {/* Media Upload Section */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Media</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {entry.media?.map((mediaItem, mediaIndex) => (
                      <Box key={mediaIndex} sx={{ position: 'relative' }}>
                        {mediaItem.type === 'image' ? (
                          <img
                            src={mediaItem.url}
                            alt={`Timeline media ${mediaIndex + 1}`}
                            style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          <video 
                            src={mediaItem.url}
                            style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
                            controls 
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveMedia(index, mediaIndex)}
                          sx={{ 
                            position: 'absolute', 
                            top: -10,
                            right: -10,
                            bgcolor: 'white',
                            '&:hover': { bgcolor: 'white' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                  <Button
                                    variant="outlined"
                      startIcon={<AddPhotoAlternateIcon />}
                      component="label"
                      onClick={() => handleFileSelect(null, index)}
                    >
                      Add Image
                          <input
                            type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleFileSelect(file, index);
                          }
                        }}
                      />
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<VideoLibraryIcon />}
                      component="label"
                      onClick={() => handleFileSelect(null, index)}
                            >
                              Add Video
                      <input
                        type="file"
                        accept="video/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleFileSelect(file, index);
                          }
                        }}
                      />
                            </Button>
                        </Box>
                      </Box>
                  </Box>
            )) : null}
                        <Button
                          variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddTimelineEntry}
            >
                  Add Timeline Entry
                </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleSaveChanges} variant="contained" color="primary">
            Save Changes
          </Button>
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

            <Divider sx={{ my: 2 }} />

            <Button
              variant="outlined"
              color="error"
              onClick={handleLeaveProject}
              startIcon={<ExitToAppIcon />}
              sx={{ mt: 2 }}
            >
              Leave Project
            </Button>
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
            {Array.isArray(project?.roles) && project.roles.length > 0 ? (
              project.roles.map((roleData, index) => {
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
              })
            ) : (
              <Typography color="text.secondary">No roles available</Typography>
            )}
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