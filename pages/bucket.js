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
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
import { formatDistanceToNow } from 'date-fns';

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
          
          return {
            id: ideaDoc.id,
            ...data,
            likes: data.likes || [], // Ensure likes is always an array
            comments: data.comments || [], // Ensure comments is always an array
            creator: userData ? {
              name: userData.name || userData.email,
              photoURL: userData.photoURL
            } : null
          };
        } catch (userError) {
          console.error('Error fetching user data:', userError);
          return {
            id: ideaDoc.id,
            ...data,
            likes: data.likes || [], // Ensure likes is always an array
            comments: data.comments || [], // Ensure comments is always an array
            creator: null
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

  const handleCreateIdea = async () => {
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }

    try {
      setUploadingMedia(true);
      
      // Upload all media files first
      const mediaUrls = await Promise.all(
        newIdea.media.map(async (mediaItem) => {
          if (mediaItem.file) {
            const fileRef = ref(storage, `ideas/${Date.now()}_${mediaItem.file.name}`);
            await uploadBytes(fileRef, mediaItem.file);
            const url = await getDownloadURL(fileRef);
            return {
              url,
              type: mediaItem.type
            };
          }
          return mediaItem;
        })
      );

      // Create the idea document
      const ideaData = {
        title: newIdea.title,
        summary: newIdea.summary,
        tags: newIdea.tags,
        media: mediaUrls,
        links: newIdea.links,
        creatorUid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        likes: [], // Initialize likes as an empty array
        comments: [] // Initialize comments as an empty array
      };

      await addDoc(collection(db, 'ideas'), ideaData);
      
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
    } catch (error) {
      console.error('Error creating idea:', error);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleMediaUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const type = file.type.startsWith('image/') ? 'image' : 'video';
    const newMedia = {
      file,
      type,
      previewUrl: URL.createObjectURL(file)
    };

    setNewIdea(prev => ({
      ...prev,
      media: [...prev.media, newMedia]
    }));
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
      const ideaRef = doc(db, 'ideas', ideaId);
      const idea = ideas.find(i => i.id === ideaId);
      const updatedComments = [
        ...(idea.comments || []),
        {
          text: newComment.trim(),
          userId: auth.currentUser.uid,
          userName: auth.currentUser.displayName || 'Anonymous',
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
    } catch (error) {
      console.error('Error adding comment:', error);
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
                        <Typography variant="subtitle1">
                          {idea.creator?.name || 'Anonymous'}
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
                                <Typography variant="subtitle2">
                                  {comment.userName}
                                </Typography>
                                <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                  {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ ml: 4 }}>
                                {comment.text}
                              </Typography>
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
                      <Button
                        variant="contained"
                        sx={{ ml: 'auto' }}
                        onClick={() => handleOpenCreateProject(idea)}
                      >
                        Create Project
                      </Button>
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
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Post New Idea
          <IconButton
            onClick={() => setCreateDialogOpen(false)}
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
                />
                <label htmlFor="media-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<AddPhotoAlternateIcon />}
                  >
                    Add Photo
                  </Button>
                </label>
                <label htmlFor="media-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<VideoLibraryIcon />}
                  >
                    Add Video
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
                        position: 'relative'
                      }}
                    >
                      {media.type === 'image' ? (
                        <img
                          src={media.previewUrl}
                          alt={`Upload preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 4
                          }}
                        />
                      ) : (
                        <video
                          src={media.previewUrl}
                          controls
                          style={{
                            width: '100%',
                            borderRadius: 4
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
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateIdea}
            variant="contained"
            disabled={!newIdea.title || !newIdea.summary || uploadingMedia}
          >
            Post Idea
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
                const ideaRef = doc(db, 'ideas', selectedIdea.id);
                const updatedComments = selectedIdea.comments.map(comment => {
                  if (comment.timestamp === replyTo.timestamp) {
                    return {
                      ...comment,
                      replies: [...(comment.replies || []), {
                        text: newComment.trim(),
                        userId: auth.currentUser.uid,
                        userName: auth.currentUser.displayName || 'Anonymous',
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
              } else {
                // Handle new comment
                handleComment(selectedIdea.id);
              }
              setReplyTo(null);
              setNewComment('');
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