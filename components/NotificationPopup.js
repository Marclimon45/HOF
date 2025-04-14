import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  IconButton,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { auth, db } from '../firebase/firebaseconfig';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, writeBatch } from 'firebase/firestore';

const NotificationPopup = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const checkNotifications = async () => {
      if (!auth.currentUser) return;

      try {
        // Get user's notification preferences
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data();
        const notificationPrefs = userData?.notifications || {};

        // Query for unread notifications
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', auth.currentUser.uid),
          where('read', '==', false)
        );

        const querySnapshot = await getDocs(q);
        const unreadNotifications = [];

        querySnapshot.forEach((doc) => {
          const notification = doc.data();
          // Only show notifications if they're enabled in settings
          if (
            (notification.type === 'projectUpdate' && notificationPrefs.projectUpdates?.inApp) ||
            (notification.type === 'roleFilled' && notificationPrefs.roleFilled?.inApp) ||
            (notification.type === 'projectLike' && notificationPrefs.projectLikes?.inApp)
          ) {
            unreadNotifications.push({
              id: doc.id,
              ...notification
            });
          }
        });

        if (unreadNotifications.length > 0) {
          setNotifications(unreadNotifications);
          setOpen(true);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkNotifications();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleClose = async () => {
    // Mark all notifications as read
    try {
      const batch = writeBatch(db);
      notifications.forEach((notification) => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
    setOpen(false);
  };

  const formatNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'projectUpdate':
        return `Project "${notification.projectName}" has been updated: ${notification.message}`;
      case 'roleFilled':
        return `A role has been filled in project "${notification.projectName}": ${notification.message}`;
      case 'projectLike':
        return `Someone liked your project "${notification.projectName}"`;
      default:
        return notification.message;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">New Notifications</Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {notifications.map((notification) => (
            <Box
              key={notification.id}
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                boxShadow: 1
              }}
            >
              <Typography>{formatNotificationMessage(notification)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(notification.timestamp?.toDate()).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Mark all as read
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPopup; 