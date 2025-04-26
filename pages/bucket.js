import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  TextField, 
  Chip,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  InputAdornment,
  CircularProgress,
  AppBar,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  Checkbox,
  ListItemText
} from '@mui/material';
import { db, auth, storage } from '../firebase/firebaseconfig';
import { 
  collection, 
  getDocs, 
  addDoc, 
  orderBy, 
  serverTimestamp, 
  getDoc, 
  doc, 
  updateDoc,
  query as firestoreQuery,
  where,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Navbar from '../components/navbar';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ShareIcon from '@mui/icons-material/Share';
import CommentIcon from '@mui/icons-material/Comment';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import SortIcon from '@mui/icons-material/Sort';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const defaultSkillsOptions = ["Project", "Python", "UI/UX Design", "Data Analysis", "Marketing", "Project Management", "Research", "Content Writing"];
const areasOfInterestOptions = ["Technology", "Education", "Health", "Business", "Environment"];

const Bucket = () => {
  const router = useRouter();
  const { query } = useRouter();
  const [ideas, setIdeas] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const [selectedIdeaForProject, setSelectedIdeaForProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState({
    title: '',
    teamSize: '',
    expectedCompletionDate: '',
    skillsRequired: [],
    projectTags: [],
    areaOfInterest: '',
    projectSummary: '',
    userRole: '',
  });
  const [roles, setRoles] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [newProjectTag, setNewProjectTag] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [newIdea, setNewIdea] = useState({
    title: '',
    summary: '',
    tags: [],
    media: [],
    links: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'likes', 'a-z', 'z-a'
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchIdeas();
  }, [mounted]);

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

  const fetchIdeas = async () => {
    try {
      setError(null);
      const ideasRef = collection(db, 'ideas');
      const q = firestoreQuery(ideasRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const ideasData = await Promise.all(querySnapshot.docs.map(async (ideaDoc) => {
        const data = ideaDoc.data();
        try {
          // Fetch user data for each idea
          const userDocRef = doc(db, 'users', data.creatorUid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.exists() ? userDoc.data() : null;
          
          // Construct full name from first, middle, and last name
          const fullName = userData ? 
            [userData.firstName, userData.middleName, userData.lastName]
              .filter(Boolean)
              .join(' ') || 'User' : 
            'User';
          
          return {
            id: ideaDoc.id,
            ...data,
            likes: data.likes || [], // Ensure likes is always an array
            comments: data.comments || [], // Ensure comments is always an array
            creator: userData ? {
              name: fullName,
              photoURL: userData.photoURL
            } : {
              name: 'User',
              photoURL: null
            }
          };
        } catch (userError) {
          console.error('Error fetching user data:', userError);
          return {
            id: ideaDoc.id,
            ...data,
            likes: data.likes || [], // Ensure likes is always an array
            comments: data.comments || [], // Ensure comments is always an array
            creator: {
              name: 'User',
              photoURL: null
            }
          };
        }
      }));
      
      setIdeas(ideasData);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      setError('Failed to load ideas. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIdea = async (ideaId) => {
    if (!auth.currentUser) return;

    try {
      const ideaRef = doc(db, 'ideas', ideaId);
      const idea = ideas.find(i => i.id === ideaId);

      if (idea.creatorUid !== auth.currentUser.uid) {
        toast.error('You can only delete your own ideas');
        return;
      }

      // Delete media files from storage
      if (idea.media && idea.media.length > 0) {
        await Promise.all(
          idea.media.map(async (media) => {
            if (media.url) {
              const fileRef = ref(storage, media.url);
              try {
                await deleteObject(fileRef);
              } catch (error) {
                console.error('Error deleting media:', error);
              }
            }
          })
        );
      }

      await deleteDoc(ideaRef);
      setIdeas(prevIdeas => prevIdeas.filter(i => i.id !== ideaId));
      toast.success('Idea deleted successfully');
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error('Failed to delete idea');
    }
  };

  const handleMediaUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          toast.error('Please upload only images or videos');
          continue;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast.error('File size should be less than 10MB');
          continue;
        }

        const type = file.type.startsWith('image/') ? 'image' : 'video';
        
        // Create a preview URL
        const previewUrl = URL.createObjectURL(file);
        
        // Add to newIdea state
        setNewIdea(prev => ({
          ...prev,
          media: [...prev.media, {
            file,
            type,
            previewUrl
          }]
        }));
      } catch (error) {
        console.error('Error handling file:', error);
        toast.error(`Failed to process ${file.name}`);
      }
    }
  };

  const handleCreateIdea = async () => {
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }

    // Check daily post limit
    const today = new Date().toISOString().split('T')[0];
    const userIdeasToday = ideas.filter(idea => 
      idea.creatorUid === auth.currentUser.uid && 
      idea.createdAt?.toDate().toISOString().split('T')[0] === today
    );

    if (userIdeasToday.length >= 5) {
      toast.error('You have reached your daily limit of 5 posts');
      return;
    }

    if (!newIdea.title.trim() || !newIdea.summary.trim()) {
      toast.error('Please fill in the title and summary');
      return;
    }

    try {
      setUploadingMedia(true);
      
      // Fetch user data
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        toast.error('User profile not found');
        return;
      }

      const userData = userDoc.data();
      const fullName = [userData.firstName, userData.middleName, userData.lastName]
        .filter(Boolean)
        .join(' ');

      if (!fullName) {
        toast.error('Please complete your profile before posting ideas');
        return;
      }
      
      // Upload all media files first
      const mediaUrls = await Promise.all(
        newIdea.media.map(async (mediaItem) => {
          try {
            if (mediaItem.file) {
              console.log('Starting upload for:', mediaItem.file.name);
              
              // Generate a unique filename with timestamp and random string
              const timestamp = Date.now();
              const randomString = Math.random().toString(36).substring(7);
              const safeFileName = mediaItem.file.name.replace(/[^a-zA-Z0-9.]/g, '_');
              const fileName = `ideas/${timestamp}_${randomString}_${safeFileName}`;
              
              // Create storage reference
              const fileRef = ref(storage, fileName);
              
              // Set metadata with CORS headers
              const metadata = {
                contentType: mediaItem.file.type,
                customMetadata: {
                  originalName: mediaItem.file.name
                }
              };
              
              // Upload with metadata
              console.log('Uploading file with metadata...');
              const uploadResult = await uploadBytes(fileRef, mediaItem.file, metadata);
              console.log('Upload successful:', uploadResult);
              
              // Get the download URL
              console.log('Getting download URL...');
              const url = await getDownloadURL(uploadResult.ref);
              console.log('Download URL obtained:', url);
              
              // Clean up preview URL
              if (mediaItem.previewUrl) {
                URL.revokeObjectURL(mediaItem.previewUrl);
              }
              
              return {
                url,
                type: mediaItem.type,
                fileName: fileName,
                originalName: mediaItem.file.name
              };
            }
            return null;
          } catch (error) {
            console.error('Error details:', error);
            if (error.code === 'storage/unauthorized') {
              toast.error('Permission denied. Please check if you are logged in.');
            } else if (error.code === 'storage/canceled') {
              toast.error('Upload was cancelled.');
            } else if (error.code === 'storage/unknown') {
              toast.error('An unknown error occurred. Please try again.');
            } else {
              toast.error(`Failed to upload ${mediaItem.file?.name || 'media'}: ${error.message}`);
            }
            return null;
          }
        })
      );

      // Filter out any failed uploads
      const validMediaUrls = mediaUrls.filter(Boolean);
      console.log('Valid media URLs:', validMediaUrls);

      if (newIdea.media.length > 0 && validMediaUrls.length === 0) {
        toast.error('Failed to upload any media files. Please try again.');
        return;
      }

      // Create the idea document
      const ideaData = {
        title: newIdea.title.trim(),
        summary: newIdea.summary.trim(),
        tags: newIdea.tags,
        media: validMediaUrls,
        links: newIdea.links,
        creatorUid: auth.currentUser.uid,
        creator: {
          name: fullName,
          photoURL: userData.photoURL || null
        },
        createdAt: serverTimestamp(),
        lastEdited: null,
        likes: [],
        comments: []
      };

      const docRef = await addDoc(collection(db, 'ideas'), ideaData);
      console.log('Idea document created:', docRef.id);
      
      // Reset form and close dialog
      setNewIdea({
        title: '',
        summary: '',
        tags: [],
        media: [],
        links: []
      });
      setCreateDialogOpen(false);
      
      // Refresh ideas list
      fetchIdeas();
      toast.success('Idea posted successfully');
    } catch (error) {
      console.error('Error creating idea:', error);
      toast.error(`Failed to post idea: ${error.message}`);
    } finally {
      setUploadingMedia(false);
      // Clean up any remaining preview URLs
      newIdea.media.forEach(media => {
        if (media.previewUrl) {
          URL.revokeObjectURL(media.previewUrl);
        }
      });
    }
  };

  const handleEditIdea = async (ideaId) => {
    if (!auth.currentUser) return;

    try {
      const idea = ideas.find(i => i.id === ideaId);
      if (!idea || idea.creatorUid !== auth.currentUser.uid) {
        toast.error('You can only edit your own ideas');
        return;
      }

      // Set the current idea data in the edit form
      setNewIdea({
        title: idea.title,
        summary: idea.summary,
        tags: idea.tags || [],
        media: idea.media || [],
        links: idea.links || []
      });

      setSelectedIdea(idea);
      setCreateDialogOpen(true);
    } catch (error) {
      console.error('Error preparing to edit idea:', error);
      toast.error('Failed to prepare edit. Please try again.');
    }
  };

  const handleSaveEdit = async () => {
    if (!auth.currentUser || !selectedIdea) return;

    try {
      const ideaRef = doc(db, 'ideas', selectedIdea.id);
      
      // Upload any new media files
      const newMedia = newIdea.media.filter(m => m.file);
      const existingMedia = newIdea.media.filter(m => !m.file);
      
      const uploadedMedia = await Promise.all(
        newMedia.map(async (mediaItem) => {
          try {
            const timestamp = Date.now();
            const fileName = `${timestamp}_${mediaItem.file.name}`;
            const fileRef = ref(storage, `ideas/${fileName}`);
            await uploadBytes(fileRef, mediaItem.file);
            const url = await getDownloadURL(fileRef);
            return {
              url,
              type: mediaItem.type,
              fileName
            };
          } catch (error) {
            console.error('Error uploading media:', error);
            toast.error(`Failed to upload ${mediaItem.file?.name || 'media'}`);
            return null;
          }
        })
      );

      const validNewMedia = uploadedMedia.filter(Boolean);
      const allMedia = [...existingMedia, ...validNewMedia];

      // Update the idea document
      await updateDoc(ideaRef, {
        title: newIdea.title.trim(),
        summary: newIdea.summary.trim(),
        tags: newIdea.tags,
        media: allMedia,
        links: newIdea.links,
        lastEdited: serverTimestamp()
      });

      // Reset form and close dialog
      setNewIdea({
        title: '',
        summary: '',
        tags: [],
        media: [],
        links: []
      });
      setSelectedIdea(null);
      setCreateDialogOpen(false);
      
      // Refresh ideas list
      fetchIdeas();
      toast.success('Idea updated successfully');
    } catch (error) {
      console.error('Error updating idea:', error);
      toast.error('Failed to update idea. Please try again.');
    }
  };

  const handleAddLink = (link) => {
    if (link && !newIdea.links.includes(link)) {
      setNewIdea(prev => ({
        ...prev,
        links: [...prev.links, link]
      }));
    }
  };

  const handleRemoveMedia = (index) => {
    setNewIdea(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveLink = (index) => {
    setNewIdea(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         idea.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 ||
                       selectedTags.some(tag => idea.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const handleLike = async (ideaId, currentLikes) => {
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }

    try {
      const ideaRef = doc(db, 'ideas', ideaId);
      const updatedLikes = currentLikes.includes(auth.currentUser.uid)
        ? currentLikes.filter(uid => uid !== auth.currentUser.uid)
        : [...currentLikes, auth.currentUser.uid];

      await updateDoc(ideaRef, {
        likes: updatedLikes
      });

      setIdeas(prevIdeas => 
        prevIdeas.map(idea => 
          idea.id === ideaId ? { ...idea, likes: updatedLikes } : idea
        )
      );
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleComment = async (ideaId) => {
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) return;

    try {
      // Fetch user data
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        toast.error('User profile not found');
        return;
      }

      const userData = userDoc.data();
      
      // Construct full name from first, middle, and last name
      const fullName = [userData.firstName, userData.middleName, userData.lastName]
        .filter(Boolean)
        .join(' ');

      if (!fullName) {
        toast.error('Please complete your profile before commenting');
        return;
      }

      const ideaRef = doc(db, 'ideas', ideaId);
      const idea = ideas.find(i => i.id === ideaId);
      const updatedComments = [
        ...(idea.comments || []),
        {
          text: newComment.trim(),
          userId: auth.currentUser.uid,
          userName: fullName,
          timestamp: new Date().toISOString()
        }
      ];

      await updateDoc(ideaRef, {
        comments: updatedComments
      });

      setIdeas(prevIdeas => 
        prevIdeas.map(idea => 
          idea.id === ideaId ? { ...idea, comments: updatedComments } : idea
        )
      );

      setNewComment('');
      setCommentDialogOpen(false);
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment. Please try again.');
    }
  };

  const handleShare = (idea) => {
    const shareUrl = `${window.location.origin}/bucket?idea=${idea.id}`;
    if (navigator.share) {
      navigator.share({
        title: idea.title,
        text: idea.summary,
        url: shareUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      }).catch(console.error);
    }
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setSortAnchorEl(null);
    
    setIdeas(prevIdeas => {
      const sortedIdeas = [...prevIdeas];
      switch (sortType) {
        case 'recent':
          return sortedIdeas.sort((a, b) => 
            new Date(b.createdAt?.toDate()) - new Date(a.createdAt?.toDate())
          );
        case 'likes':
          return sortedIdeas.sort((a, b) => 
            (b.likes?.length || 0) - (a.likes?.length || 0)
          );
        case 'a-z':
          return sortedIdeas.sort((a, b) => 
            a.title.localeCompare(b.title)
          );
        case 'z-a':
          return sortedIdeas.sort((a, b) => 
            b.title.localeCompare(a.title)
          );
        default:
          return sortedIdeas;
      }
    });
  };

  const handleOpenCreateProject = async (idea) => {
    if (auth.currentUser?.uid !== idea.creatorUid) {
      alert("Only the original idea creator can create a project from their idea");
      return;
    }

    // Check if a project with this title already exists
    const projectsRef = collection(db, 'projects');
    const q = firestoreQuery(projectsRef, where('title', '==', idea.title));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      alert("A project with this title already exists. Please modify the title to create a new project.");
      return;
    }

    setSelectedIdeaForProject(idea);
    setProjectDetails({
      title: idea.title,
      teamSize: '',
      expectedCompletionDate: '',
      skillsRequired: [...idea.tags], // Prefill skills with idea tags
      projectTags: [...idea.tags], // Prefill project tags with idea tags
      areaOfInterest: '',
      projectSummary: idea.summary,
      userRole: '',
    });
    setCreateProjectDialogOpen(true);
  };

  const handleCloseCreateProject = () => {
    setCreateProjectDialogOpen(false);
    setSelectedIdeaForProject(null);
    setProjectDetails({
      title: '',
      teamSize: '',
      expectedCompletionDate: '',
      skillsRequired: [],
      projectTags: [],
      areaOfInterest: '',
      projectSummary: '',
      userRole: '',
    });
    setRoles([]);
    setCustomSkill('');
    setCustomTag('');
  };

  const handleCreateProject = async () => {
    if (!auth.currentUser) {
      alert("Please sign in to create a project");
      return;
    }

    if (!selectedIdeaForProject) {
      alert("No idea selected for project creation");
      return;
    }

    if (auth.currentUser.uid !== selectedIdeaForProject.creatorUid) {
      alert("Only the original idea creator can create a project from their idea");
      return;
    }

    // Check if a project with this title already exists
    const projectsRef = collection(db, 'projects');
    const q = firestoreQuery(projectsRef, where('title', '==', projectDetails.title));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      alert("A project with this title already exists. Please modify the title to create a new project.");
      return;
    }

    if (!projectDetails.title || !projectDetails.teamSize || !projectDetails.expectedCompletionDate || 
        !projectDetails.areaOfInterest || !projectDetails.projectSummary || !projectDetails.userRole) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);

      // Create array of role objects
      const rolesList = [
        {
          uid: auth.currentUser.uid,
          role: projectDetails.userRole,
          status: 'Active'
        },
        ...roles.slice(1).map(role => ({
          role,
          status: 'Open'
        }))
      ];

      // Create the project
      const newProject = {
        ...projectDetails,
        createdAt: serverTimestamp(),
        creatorUid: auth.currentUser.uid,
        status: "Active",
        roles: rolesList,
        originatingIdeaId: selectedIdeaForProject.id,
        type: projectDetails.areaOfInterest, // Set project type to the area of interest
        members: [{
          uid: auth.currentUser.uid,
          role: projectDetails.userRole,
          joinedAt: serverTimestamp()
        }]
      };

      const docRef = await addDoc(collection(db, 'projects'), newProject);

      // Update user's profile with current project
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        currentProject: docRef.id
      });

      // Mark the idea as converted to project
      const ideaRef = doc(db, 'ideas', selectedIdeaForProject.id);
      await updateDoc(ideaRef, {
        convertedToProject: true,
        projectId: docRef.id
      });

      setCreateProjectDialogOpen(false);
      
      // Show congratulations dialog
      alert("Congratulations! Your project has been created successfully. You've been automatically added as " + projectDetails.userRole);
      
      router.push(`/project/${docRef.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Error creating project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const handleDeleteComment = async (ideaId, commentTimestamp) => {
    if (!auth.currentUser) return;

    try {
      const ideaRef = doc(db, 'ideas', ideaId);
      const idea = ideas.find(i => i.id === ideaId);
      
      // Find the comment to check if user is the author
      const comment = idea.comments.find(c => c.timestamp === commentTimestamp);
      
      if (!comment) {
        toast.error('Comment not found');
        return;
      }

      if (comment.userId !== auth.currentUser.uid) {
        toast.error('You can only delete your own comments');
        return;
      }

      // Update the comment to show as deleted instead of removing it
      const updatedComments = idea.comments.map(c => {
        if (c.timestamp === commentTimestamp) {
          return {
            ...c,
            text: '[Comment deleted]',
            deleted: true
          };
        }
        return c;
      });

      await updateDoc(ideaRef, {
        comments: updatedComments
      });

      setIdeas(prevIdeas => 
        prevIdeas.map(idea => 
          idea.id === ideaId ? { ...idea, comments: updatedComments } : idea
        )
      );

      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5' }}>
      <Navbar />
      
      <AppBar position="static" sx={{ bgcolor: '#1976D2', mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Idea Bucket
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton 
              color="inherit" 
              onClick={(e) => setSortAnchorEl(e.currentTarget)}
            >
              <SortIcon />
            </IconButton>
            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: 'white',
                color: '#1976D2',
                '&:hover': {
                  bgcolor: '#f5f5f5'
                }
              }}
              onClick={() => setCreateDialogOpen(true)}
            >
              Add Idea
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Search and Filter Section */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFilterDialogOpen(true)}
          >
            Filter
          </Button>
        </Box>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {selectedTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => setSelectedTags(tags => tags.filter(t => t !== tag))}
                sx={{
                  bgcolor: '#1976D2',
                  color: 'white',
                  '& .MuiChip-deleteIcon': {
                    color: 'white'
                  }
                }}
              />
            ))}
            <Button size="small" onClick={() => setSelectedTags([])}>
              Clear all
            </Button>
          </Box>
        )}

        {/* Ideas Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ py: 4, textAlign: 'center' }}>
            {error}
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredIdeas.map((idea) => (
              <Grid item xs={12} key={idea.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={idea.creator?.photoURL} sx={{ mr: 2 }}>
                        {idea.creator?.name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography 
                          variant="subtitle1" 
                          component="a"
                          href={`/profile/${idea.creatorUid}`}
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/profile/${idea.creatorUid}`);
                          }}
                          sx={{
                            textDecoration: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            '&:hover': {
                              color: '#87CEEB'
                            }
                          }}
                        >
                          {idea.creator?.name || 'User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(idea.createdAt?.toDate()).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      {idea.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {idea.summary}
                    </Typography>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      {idea.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{ bgcolor: '#E3F2FD' }}
                        />
                      ))}
                    </Box>

                    {/* Media Preview */}
                    {idea.media && idea.media.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        {idea.media.map((media, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: 200,
                              height: media.type === 'image' ? 150 : 'auto',
                              position: 'relative'
                            }}
                          >
                            {media.type === 'image' ? (
                              <img
                                src={media.url}
                                alt={`Idea media ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: 4
                                }}
                              />
                            ) : (
                              <video
                                src={media.url}
                                controls
                                style={{
                                  width: '100%',
                                  borderRadius: 4
                                }}
                              />
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Links */}
                    {idea.links && idea.links.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        {idea.links.map((link, index) => (
                          <Typography
                            key={index}
                            component="a"
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: 'block',
                              color: '#1976D2',
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            {link}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {/* Comments Section */}
                    {idea.comments && idea.comments.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Comments ({idea.comments.length})
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                          {idea.comments.map((comment, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                  {comment.userName[0]}
                                </Avatar>
                                <Typography 
                                  variant="subtitle2"
                                  component="a"
                                  href={`/profile/${comment.userId}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    router.push(`/profile/${comment.userId}`);
                                  }}
                                  sx={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    '&:hover': {
                                      color: '#87CEEB'
                                    }
                                  }}
                                >
                                  {comment.userName}
                                </Typography>
                                <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                  {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                                </Typography>
                                {auth.currentUser?.uid === comment.userId && !comment.deleted && (
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleDeleteComment(idea.id, comment.timestamp)}
                                    sx={{ ml: 'auto' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  ml: 4,
                                  color: comment.deleted ? 'text.secondary' : 'text.primary',
                                  fontStyle: comment.deleted ? 'italic' : 'normal'
                                }}
                              >
                                {comment.text}
                              </Typography>
                              {!comment.deleted && (
                                <Button
                                  size="small"
                                  sx={{ ml: 4, mt: 1 }}
                                  onClick={() => {
                                    setReplyTo(comment);
                                    setSelectedIdea(idea);
                                    setCommentDialogOpen(true);
                                  }}
                                >
                                  Reply
                                </Button>
                              )}
                              {comment.replies && comment.replies.map((reply, replyIndex) => (
                                <Box key={replyIndex} sx={{ ml: 6, mt: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar sx={{ width: 20, height: 20, mr: 1 }}>
                                      {reply.userName[0]}
                                    </Avatar>
                                    <Typography variant="subtitle2" sx={{ fontSize: '0.875rem' }}>
                                      {reply.userName}
                                    </Typography>
                                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                      {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" sx={{ ml: 3 }}>
                                    {reply.text}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Edit Status */}
                    {idea.lastEdited && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        (edited {formatDistanceToNow(new Date(idea.lastEdited.toDate()), { addSuffix: true })})
                      </Typography>
                    )}
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <IconButton 
                      onClick={() => handleLike(idea.id, idea.likes || [])}
                      color={idea.likes?.includes(auth.currentUser?.uid) ? 'primary' : 'default'}
                    >
                      <FavoriteIcon />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {idea.likes?.length || 0}
                    </Typography>
                    <IconButton 
                      onClick={() => {
                        setSelectedIdea(idea);
                        setCommentDialogOpen(true);
                      }}
                    >
                      <CommentIcon />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {idea.comments?.length || 0}
                    </Typography>
                    <IconButton onClick={() => handleShare(idea)}>
                      <ShareIcon />
                    </IconButton>
                    {auth.currentUser?.uid === idea.creatorUid && (
                      <>
                        <Button
                          variant="contained"
                          sx={{ ml: 'auto' }}
                          onClick={() => handleOpenCreateProject(idea)}
                        >
                          Create Project
                        </Button>
                        <IconButton 
                          onClick={() => handleEditIdea(idea.id)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteIdea(idea.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Create Idea Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setSelectedIdea(null);
          setNewIdea({
            title: '',
            summary: '',
            tags: [],
            media: [],
            links: []
          });
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedIdea ? 'Edit Idea' : 'Post New Idea'}
          <IconButton
            onClick={() => {
              setCreateDialogOpen(false);
              setSelectedIdea(null);
              setNewIdea({
                title: '',
                summary: '',
                tags: [],
                media: [],
                links: []
              });
            }}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              fullWidth
              label="Idea Title"
              value={newIdea.title}
              onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
            />
            
            <TextField
              fullWidth
              label="Project Summary"
              multiline
              rows={4}
              value={newIdea.summary}
              onChange={(e) => setNewIdea({ ...newIdea, summary: e.target.value })}
            />

            {/* Tags Input */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      e.preventDefault();
                      if (!newIdea.tags.includes(newTag.trim())) {
                        setNewIdea(prev => ({
                          ...prev,
                          tags: [...prev.tags, newTag.trim()]
                        }));
                      }
                      setNewTag('');
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => {
                            if (newTag.trim() && !newIdea.tags.includes(newTag.trim())) {
                              setNewIdea(prev => ({
                                ...prev,
                                tags: [...prev.tags, newTag.trim()]
                              }));
                              setNewTag('');
                            }
                          }}
                          disabled={!newTag.trim()}
                        >
                          Add
                        </Button>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {newIdea.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => {
                      setNewIdea(prev => ({
                        ...prev,
                        tags: prev.tags.filter((_, i) => i !== index)
                      }));
                    }}
                    sx={{
                      bgcolor: '#1976D2',
                      color: 'white'
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Media Upload */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Media
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  id="media-upload"
                  onChange={handleMediaUpload}
                  multiple
                />
                <label htmlFor="media-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<AddPhotoAlternateIcon />}
                  >
                    Add Media
                  </Button>
                </label>
              </Box>
              
              {/* Media Preview */}
              {newIdea.media.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                  {newIdea.media.map((media, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 200,
                        height: media.type === 'image' ? 150 : 'auto',
                        position: 'relative',
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      {media.type === 'image' ? (
                        <img
                          src={media.previewUrl}
                          alt={`Upload preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <video
                          src={media.previewUrl}
                          controls
                          style={{
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      )}
                      <IconButton
                        onClick={() => handleRemoveMedia(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                        }}
                      >
                        <CloseIcon sx={{ color: 'white' }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Links Input */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Links
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Add a link"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddLink(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
              {newIdea.links.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {newIdea.links.map((link, index) => (
                    <Chip
                      key={index}
                      label={link}
                      onDelete={() => handleRemoveLink(index)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            setSelectedIdea(null);
            setNewIdea({
              title: '',
              summary: '',
              tags: [],
              media: [],
              links: []
            });
          }}>
            Cancel
          </Button>
          <Button
            onClick={selectedIdea ? handleSaveEdit : handleCreateIdea}
            variant="contained"
            disabled={!newIdea.title || !newIdea.summary || uploadingMedia}
          >
            {selectedIdea ? 'Save Changes' : 'Post Idea'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Filter Ideas
          <IconButton
            onClick={() => setFilterDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Filter by tags:
          </Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Add a tag to filter"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newTag.trim()) {
                  e.preventDefault();
                  if (!selectedTags.includes(newTag.trim())) {
                    setSelectedTags(prev => [...prev, newTag.trim()]);
                  }
                  setNewTag('');
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      onClick={() => {
                        if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
                          setSelectedTags(prev => [...prev, newTag.trim()]);
                          setNewTag('');
                        }
                      }}
                      disabled={!newTag.trim()}
                    >
                      Add
                    </Button>
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedTags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => {
                  setSelectedTags(tags => tags.filter((_, i) => i !== index));
                }}
                sx={{
                  bgcolor: '#1976D2',
                  color: 'white'
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTags([])}>Clear All</Button>
          <Button onClick={() => setFilterDialogOpen(false)} variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Comment Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={() => {
          setCommentDialogOpen(false);
          setReplyTo(null);
          setNewComment('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {replyTo ? `Reply to ${replyTo.userName}'s comment` : 'Add Comment'}
          <IconButton
            onClick={() => {
              setCommentDialogOpen(false);
              setReplyTo(null);
              setNewComment('');
            }}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {replyTo && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Replying to:
              </Typography>
              <Typography variant="body1">
                {replyTo.text}
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Your Comment"
            fullWidth
            multiline
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setCommentDialogOpen(false);
              setReplyTo(null);
              setNewComment('');
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              if (replyTo) {
                // Handle reply
                try {
                  // Fetch user data for the reply
                  const userDocRef = doc(db, 'users', auth.currentUser.uid);
                  const userDoc = await getDoc(userDocRef);
                  
                  if (!userDoc.exists()) {
                    toast.error('User profile not found');
                    return;
                  }

                  const userData = userDoc.data();
                  const fullName = [userData.firstName, userData.middleName, userData.lastName]
                    .filter(Boolean)
                    .join(' ');

                  if (!fullName) {
                    toast.error('Please complete your profile before replying');
                    return;
                  }

                  const ideaRef = doc(db, 'ideas', selectedIdea.id);
                  const updatedComments = selectedIdea.comments.map(comment => {
                    if (comment.timestamp === replyTo.timestamp) {
                      return {
                        ...comment,
                        replies: [...(comment.replies || []), {
                          text: newComment.trim(),
                          userId: auth.currentUser.uid,
                          userName: fullName,
                          timestamp: new Date().toISOString()
                        }]
                      };
                    }
                    return comment;
                  });
                  
                  await updateDoc(ideaRef, { comments: updatedComments });
                  setIdeas(prevIdeas => 
                    prevIdeas.map(idea => 
                      idea.id === selectedIdea.id ? { ...idea, comments: updatedComments } : idea
                    )
                  );
                  toast.success('Reply added successfully');
                } catch (error) {
                  console.error('Error adding reply:', error);
                  toast.error('Failed to add reply. Please try again.');
                }
              } else {
                // Handle new comment
                handleComment(selectedIdea.id);
              }
              setReplyTo(null);
              setNewComment('');
              setCommentDialogOpen(false);
            }}
            variant="contained"
            disabled={!newComment.trim()}
          >
            {replyTo ? 'Post Reply' : 'Post Comment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Project Dialog */}
      <Dialog
        open={createProjectDialogOpen}
        onClose={handleCloseCreateProject}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create New Project
          <IconButton
            onClick={handleCloseCreateProject}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              label="Project Title"
              required
              fullWidth
              value={projectDetails.title}
              onChange={(e) => setProjectDetails({ ...projectDetails, title: e.target.value })}
            />

            <TextField
              label="Project Summary"
              required
              fullWidth
              multiline
              rows={4}
              value={projectDetails.projectSummary}
              onChange={(e) => setProjectDetails({ ...projectDetails, projectSummary: e.target.value })}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Team Size</InputLabel>
                <Select
                  value={projectDetails.teamSize}
                  onChange={(e) => setProjectDetails({ ...projectDetails, teamSize: e.target.value })}
                  label="Team Size"
                >
                  {[...Array(50)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Expected Completion Date"
                type="date"
                required
                fullWidth
                value={projectDetails.expectedCompletionDate}
                onChange={(e) => setProjectDetails({ ...projectDetails, expectedCompletionDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today }}
              />
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Area of Interest</InputLabel>
              <Select
                value={projectDetails.areaOfInterest}
                onChange={(e) => setProjectDetails({ ...projectDetails, areaOfInterest: e.target.value })}
                label="Area of Interest"
              >
                {areasOfInterestOptions.map((area) => (
                  <MenuItem key={area} value={area}>{area}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Skills Required</InputLabel>
              <Select
                multiple
                value={projectDetails.skillsRequired}
                onChange={(e) => setProjectDetails({ ...projectDetails, skillsRequired: e.target.value })}
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
                    if (e.key === 'Enter' && customSkill.trim()) {
                      e.preventDefault();
                      if (!projectDetails.skillsRequired.includes(customSkill.trim())) {
                        setProjectDetails(prev => ({
                          ...prev,
                          skillsRequired: [...prev.skillsRequired, customSkill.trim()]
                        }));
                      }
                      setCustomSkill('');
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (customSkill.trim() && !projectDetails.skillsRequired.includes(customSkill.trim())) {
                      setProjectDetails(prev => ({
                        ...prev,
                        skillsRequired: [...prev.skillsRequired, customSkill.trim()]
                      }));
                      setCustomSkill('');
                    }
                  }}
                  disabled={!customSkill.trim()}
                >
                  Add
                </Button>
              </Box>
            </Box>

            <TextField
              label="Your Role"
              required
              fullWidth
              value={projectDetails.userRole}
              onChange={(e) => setProjectDetails({ ...projectDetails, userRole: e.target.value })}
              placeholder="e.g., Project Manager, Developer, Designer"
            />

            {parseInt(projectDetails.teamSize) > 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Additional Team Roles
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[...Array(parseInt(projectDetails.teamSize) - 1)].map((_, index) => (
                    <TextField
                      key={index}
                      label={`Team Member ${index + 2} Role`}
                      fullWidth
                      value={roles[index + 1] || ''}
                      onChange={(e) => {
                        const newRoles = [...roles];
                        newRoles[index + 1] = e.target.value;
                        setRoles(newRoles);
                      }}
                      placeholder="e.g., Developer, Designer, Content Writer"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateProject}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateProject}
            disabled={!projectDetails.title || !projectDetails.projectSummary || !projectDetails.teamSize || 
                     !projectDetails.expectedCompletionDate || !projectDetails.areaOfInterest || !projectDetails.userRole}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
      >
        <MenuItem onClick={() => handleSort('recent')}>Most Recent</MenuItem>
        <MenuItem onClick={() => handleSort('likes')}>Most Liked</MenuItem>
        <MenuItem onClick={() => handleSort('a-z')}>A to Z</MenuItem>
        <MenuItem onClick={() => handleSort('z-a')}>Z to A</MenuItem>
      </Menu>
    </Box>
  );
};

export default Bucket; 