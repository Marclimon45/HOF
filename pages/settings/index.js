import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  Card,
  Alert,
  Link as MuiLink,
  CircularProgress,
  Stack
} from '@mui/material';
import { auth, db } from '../../firebase/firebaseconfig';
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import styles from '../../styles/settings.module.css';
import Navbar from '../../components/navbar';
import { useRouter } from 'next/router';
import Link from 'next/link';

const SettingsPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    projectUpdates: {
      email: true,
      inApp: true
    },
    roleFilled: {
      email: true,
      inApp: true
    },
    projectLikes: {
      email: true,
      inApp: true
    }
  });
  const [message, setMessage] = useState({ type: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      setIsAuthenticated(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setEmail(user.email);
          setNotificationSettings({
            projectUpdates: {
              email: userData.notifications?.projectUpdates?.email ?? true,
              inApp: userData.notifications?.projectUpdates?.inApp ?? true
            },
            roleFilled: {
              email: userData.notifications?.roleFilled?.email ?? true,
              inApp: userData.notifications?.roleFilled?.inApp ?? true
            },
            projectLikes: {
              email: userData.notifications?.projectLikes?.email ?? true,
              inApp: userData.notifications?.projectLikes?.inApp ?? true
            }
          });
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
        setMessage({ type: 'error', content: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      if (!currentPassword) {
        throw new Error('Please enter your current password');
      }

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, email);
      
      setMessage({ type: 'success', content: 'Email updated successfully' });
      setCurrentPassword('');
    } catch (error) {
      console.error('Error updating email:', error);
      setMessage({ type: 'error', content: error.message });
    }
    setIsUpdating(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!currentPassword) {
        throw new Error('Please enter your current password');
      }

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      
      setMessage({ type: 'success', content: 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', content: error.message });
    }
    setIsUpdating(false);
  };

  const handleNotificationChange = async (setting, type) => {
    try {
      const newSettings = {
        ...notificationSettings,
        [setting]: {
          ...notificationSettings[setting],
          [type]: !notificationSettings[setting][type]
        }
      };
      setNotificationSettings(newSettings);

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        notifications: newSettings
      });
      setMessage({ type: 'success', content: 'Notification settings updated' });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setMessage({ type: 'error', content: 'Failed to update notification settings' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box className={styles.container}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Settings
        </Typography>

        {message.content && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.content}
          </Alert>
        )}

        {/* Email Update Section */}
        <Card className={styles.section} sx={{ mb: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Update Email
          </Typography>
          <Box component="form" onSubmit={handleUpdateEmail}>
            <TextField
              fullWidth
              label="New Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isUpdating}
              sx={{ mt: 2 }}
            >
              {isUpdating ? <CircularProgress size={24} /> : 'Update Email'}
            </Button>
          </Box>
        </Card>

        {/* Password Update Section */}
        <Card className={styles.section} sx={{ mb: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Update Password
          </Typography>
          <Box component="form" onSubmit={handleUpdatePassword}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isUpdating}
              sx={{ mt: 2 }}
            >
              {isUpdating ? <CircularProgress size={24} /> : 'Update Password'}
            </Button>
          </Box>
        </Card>

        {/* Notification Settings Section */}
        <Card className={styles.section} sx={{ mb: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Project Updates
              </Typography>
              <Stack spacing={1} sx={{ pl: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.projectUpdates.email}
                      onChange={() => handleNotificationChange('projectUpdates', 'email')}
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.projectUpdates.inApp}
                      onChange={() => handleNotificationChange('projectUpdates', 'inApp')}
                      color="primary"
                    />
                  }
                  label="In-App Notifications"
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Role Updates
              </Typography>
              <Stack spacing={1} sx={{ pl: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.roleFilled.email}
                      onChange={() => handleNotificationChange('roleFilled', 'email')}
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.roleFilled.inApp}
                      onChange={() => handleNotificationChange('roleFilled', 'inApp')}
                      color="primary"
                    />
                  }
                  label="In-App Notifications"
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Project Likes
              </Typography>
              <Stack spacing={1} sx={{ pl: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.projectLikes.email}
                      onChange={() => handleNotificationChange('projectLikes', 'email')}
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.projectLikes.inApp}
                      onChange={() => handleNotificationChange('projectLikes', 'inApp')}
                      color="primary"
                    />
                  }
                  label="In-App Notifications"
                />
              </Stack>
            </Box>
          </Stack>
        </Card>

        {/* Help & Support Section */}
        <Card className={styles.section} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Help & Support
          </Typography>
          <Stack spacing={2}>
            <Link href="/privacy-policy" passHref>
              <MuiLink>Privacy Policy</MuiLink>
            </Link>
            <Link href="/terms-of-service" passHref>
              <MuiLink>Terms of Service</MuiLink>
            </Link>
            <Link href="/contact" passHref>
              <MuiLink>Contact Us</MuiLink>
            </Link>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

export default SettingsPage; 