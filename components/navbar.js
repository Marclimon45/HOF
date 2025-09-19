import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Avatar, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import styles from "../styles/navbar.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { auth, db } from "../firebase/firebaseconfig";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const isActivePage = (path) => {
    return router.pathname === path;
  };

  const getRankImage = (contributions, isCPSMember) => {
    if (isCPSMember) return '/CPS.png';
    if (contributions >= 15) return '/Master.png';
    if (contributions >= 10) return '/Diamond.png';
    if (contributions >= 5) return '/Platinum.png';
    if (contributions >= 3) return '/Gold.png';
    if (contributions >= 2) return '/Silver.png';
    if (contributions >= 1) return '/Bronze.png';
    return '/Unranked.png';
  };

  // Add rank color helper function
  const getRankColor = (contributions, isCPSMember) => {
    if (isCPSMember) return '#FFD700'; // CPS - Gold
    if (contributions >= 20) return '#FF4081'; // Grandmaster - Pink
    if (contributions >= 15) return '#9C27B0'; // Master - Purple
    if (contributions >= 10) return '#2196F3'; // Diamond - Blue
    if (contributions >= 5) return '#00BCD4';  // Platinum - Cyan
    if (contributions >= 3) return '#FFC107';  // Gold - Yellow
    if (contributions >= 2) return '#9E9E9E';  // Silver - Grey
    if (contributions >= 1) return '#795548';  // Bronze - Brown
    return '#757575';  // Unranked - Default grey
  };

  useEffect(() => {
    setMounted(true);
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Fetch user data including contributions
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log('User data:', data); // Debug log
            
            // Ensure we have a contributions value
            const contributions = data.contributions || 0;
            setUserData({
              ...data,
              contributions: contributions
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth);
      setLogoutDialogOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleBucketClick = (e) => {
    e.preventDefault();
    router.push('/bucket');
  };

  const handleNavigation = (path) => {
    router.push(path);
  };

  // Render a simple loading state during SSR
  if (!mounted) {
    return (
      <AppBar position="static" color="default" elevation={0} className={styles.navbar}>
        <Toolbar className={styles.toolbar}>
          <Link href="/home" passHref>
            <div className={styles.logoContainer}>
              <img src="/cpx.png" alt="Logo" className={styles.logo} />
              <Typography variant="h6" className={styles.logoText}>
                Xin's Hall of Fame
              </Typography>
            </div>
          </Link>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="static" color="default" elevation={0} className={styles.navbar}>
      <Toolbar className={styles.toolbar}>
        {/* Logo */}
        <Link href="/home" passHref>
          <div className={styles.logoContainer}>
            <img src="/cpx.png" alt="Logo" className={styles.logo} />
            <Typography variant="h6" className={styles.logoText}>
              Xin's Hall of Fame
            </Typography>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className={styles.navLinks}>
          <Link href="/home">
            <Typography className={`${styles.navLink} ${isActivePage('/home') ? styles.activeNavLink : ''}`}>
              Home
            </Typography>
          </Link>
          <Link href="/contribution">
            <Typography className={`${styles.navLink} ${isActivePage('/contribution') ? styles.activeNavLink : ''}`}>
              Contribution
            </Typography>
          </Link>
          <Link href="/bucket">
            <Typography className={`${styles.navLink} ${isActivePage('/bucket') ? styles.activeNavLink : ''}`}>
              Bucket
            </Typography>
          </Link>
          <Link href="/projects-and-publications">
            <Typography className={`${styles.navLink} ${isActivePage('/projects-and-publications') ? styles.activeNavLink : ''}`}>
              Projects & Publications
            </Typography>
          </Link>
          <Button
            color="inherit"
            onClick={() => handleNavigation('/team')}
            className={router.pathname === '/team' ? styles.activeLink : ''}
          >
            About Us
          </Button>
        </div>

        {/* User Profile or Auth Buttons */}
        {user ? (
          <>
            <div className={styles.profileSection} onClick={handleMenuOpen}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar src={userData?.photoURL || user.photoURL || '/jeff1.jpg'} className={styles.avatar} />
                <Typography className={styles.username}>
                  {userData?.displayName || user.email?.split('@')[0] || 'User'}
                </Typography>
                {(userData?.contributions > 0 || userData?.isCPSMember) && getRankImage(userData?.contributions, userData?.isCPSMember) && (
                  <img
                    src={getRankImage(userData?.contributions, userData?.isCPSMember)}
                    alt={userData?.isCPSMember ? 'CPS Rank' : `Rank ${userData?.contributions}`}
                    className={styles.rankIcon}
                  />
                )}
                <ArrowDropDownIcon sx={{ color: '#666' }} />
              </Box>
            </div>

            {/* Dropdown Menu */}
            <Menu 
              anchorEl={anchorEl} 
              open={Boolean(anchorEl)} 
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                  mt: 1.5,
                  borderRadius: 2,
                  minWidth: 220,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '& a': {
                    textDecoration: 'none',
                    color: 'inherit'
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #eee' }}>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 500,
                  color: getRankColor(userData?.contributions, userData?.isCPSMember)
                }}>
                  {userData?.displayName || user?.email?.split('@')[0] || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>

              <Link href="/profile" passHref>
                <MenuItem onClick={handleMenuClose} sx={{
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    bgcolor: `${getRankColor(userData?.contributions, userData?.isCPSMember)}15`,
                    '& .MuiTypography-root': {
                      color: getRankColor(userData?.contributions, userData?.isCPSMember)
                    }
                  }
                }}>
                  <Avatar src={userData?.photoURL || user?.photoURL || '/jeff1.jpg'} sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="body1">Profile</Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and edit your profile
                    </Typography>
                  </Box>
                </MenuItem>
              </Link>

              <Link href="/settings" passHref>
                <MenuItem onClick={handleMenuClose} sx={{
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    bgcolor: `${getRankColor(userData?.contributions, userData?.isCPSMember)}15`,
                    '& .MuiTypography-root': {
                      color: getRankColor(userData?.contributions, userData?.isCPSMember)
                    }
                  }
                }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="white">
                      <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                    </svg>
                  </Avatar>
                  <Box>
                    <Typography variant="body1">Settings</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage your preferences
                    </Typography>
                  </Box>
                </MenuItem>
              </Link>

              <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #eee' }}>
                <Button 
                  onClick={handleLogoutClick}
                  fullWidth
                  color="error"
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'white'
                    }
                  }}
                >
                  Sign Out
                </Button>
              </Box>
            </Menu>

            {/* Logout Confirmation Dialog */}
            <Dialog
              open={logoutDialogOpen}
              onClose={() => setLogoutDialogOpen(false)}
              aria-labelledby="logout-dialog-title"
              PaperProps={{
                sx: {
                  width: '100%',
                  maxWidth: '400px',
                  p: 1
                }
              }}
            >
              <DialogTitle id="logout-dialog-title" sx={{ pb: 1 }}>
                Confirm Logout
              </DialogTitle>
              <DialogContent>
                <Typography>
                  Are you sure you want to log out? You will need to sign in again to access your account.
                </Typography>
              </DialogContent>
              <DialogActions sx={{ p: 2, pt: 1 }}>
                <Button 
                  onClick={() => setLogoutDialogOpen(false)}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleLogoutConfirm}
                  color="error"
                  variant="contained"
                  autoFocus
                >
                  Logout
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : (
          <div className={styles.authButtons}>
            <Link href="/login" passHref>
              <Button variant="outlined" color="primary" sx={{ mr: 1 }}>
                Login
              </Button>
            </Link>
            <Link href="/register" passHref>
              <Button variant="contained" color="primary">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;