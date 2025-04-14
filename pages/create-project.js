import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { db, auth } from '../firebase/firebaseconfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Navbar from '../components/navbar';
import CloseIcon from '@mui/icons-material/Close';

const CreateProject = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [project, setProject] = useState({
    title: '',
    description: '',
    tags: [],
    status: 'Planning',
    roles: {},
    creatorUid: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check authentication
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }

    // Prefill form with idea data if available
    const { title, description, tags } = router.query;
    if (title || description || tags) {
      setProject(prev => ({
        ...prev,
        title: title || '',
        description: description || '',
        tags: tags ? tags.split(',') : [],
        creatorUid: auth.currentUser.uid,
      }));
    }
  }, [mounted, router.query]);

  const handleCreateProject = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!project.title || !project.description) {
        setError('Please fill in all required fields');
        return;
      }

      const projectData = {
        ...project,
        createdAt: serverTimestamp(),
        creatorUid: auth.currentUser.uid,
        status: 'Planning',
        roles: {
          [auth.currentUser.uid]: 'Creator'
        },
        ideaId: router.query.ideaId || null
      };

      const docRef = await addDoc(collection(db, 'projects'), projectData);
      router.push(`/project/${docRef.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5' }}>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 4 }}>
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
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Project
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Project Title"
              required
              fullWidth
              value={project.title}
              onChange={(e) => setProject({ ...project, title: e.target.value })}
            />

            <TextField
              label="Project Description"
              required
              fullWidth
              multiline
              rows={4}
              value={project.description}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
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
                      if (!project.tags.includes(newTag.trim())) {
                        setProject(prev => ({
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
                            if (newTag.trim() && !project.tags.includes(newTag.trim())) {
                              setProject(prev => ({
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
                {project.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => {
                      setProject(prev => ({
                        ...prev,
                        tags: prev.tags.filter((_, i) => i !== index)
                      }));
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateProject}
                disabled={loading || !project.title || !project.description}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Project'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateProject; 