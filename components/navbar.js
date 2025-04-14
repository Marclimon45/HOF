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
    if (isCPSMember) return '/CPS.webp';
    if (contributions >= 15) return '/Master.webp';
    if (contributions >= 10) return '/Diamond.webp';
    if (contributions >= 5) return '/Platinum.webp';
    if (contributions >= 3) return '/Gold.webp';
    if (contributions >= 2) return '/Silver.webp';
    if (contributions >= 1) return '/Bronze.webp';
    return null;  // Don't show any rank image for unranked users
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
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <Link href="/profile" passHref>
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              </Link>
              <Link href="/settings" passHref>
                <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
              </Link>
              <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main' }}>Logout</MenuItem>
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