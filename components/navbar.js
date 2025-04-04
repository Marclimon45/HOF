import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, InputBase, Avatar, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import styles from "../styles/navbar.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { auth } from "../firebase/firebaseconfig";
import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

const Search = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  backgroundColor: "#f1f1f1",
  padding: "6px 12px",
  borderRadius: "5px",
  marginLeft: "20px",
  width: "200px",
}));

const SearchInput = styled(InputBase)({
  marginLeft: 5,
  flex: 1,
  fontSize: "14px",
});

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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

  return (
    <AppBar position="static" color="default" elevation={0} className={styles.navbar}>
      <Toolbar className={styles.toolbar}>
        {/* Logo */}
        <Link href="/" passHref>
          <div className={styles.logoContainer}>
            <img src="/cpx.png" alt="Logo" className={styles.logo} />
            <Typography variant="h6" className={styles.logoText}>
              Xin's Hall of Fame
            </Typography>
          </div>
        </Link>

        {/* Search Bar */}
        <Search>
          <SearchIcon style={{ fontSize: "18px", color: "#999" }} />
          <SearchInput placeholder="Search projects..." />
        </Search>

        {/* Navigation Links */}
        <div className={styles.navLinks}>
          <Link href="/" passHref>
            <Typography className={styles.navLink} color="primary">Home</Typography>
          </Link>
          <Link href="/contribution" passHref>
            <Typography className={styles.navLink}>Contribution</Typography>
          </Link>
          <Link href="/bucket" passHref>
            <Typography className={styles.navLink}>Bucket</Typography>
          </Link>
          <Link href="/projects" passHref>
            <Typography className={styles.navLink}>Projects & Publication</Typography>
          </Link>
          <Link href="/about" passHref>
            <Typography className={styles.navLink}>About us</Typography>
          </Link>
        </div>

        {/* User Profile or Auth Buttons */}
        {user ? (
          <>
            <div className={styles.profileSection} onClick={handleMenuOpen}>
              <Avatar src="/jeff1.jpg" className={styles.avatar} />
              <Typography className={styles.username}>
                {user.email?.split('@')[0] || 'User'}
              </Typography>
              <ArrowDropDownIcon />
            </div>

            {/* Dropdown Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <Link href="/profile" passHref>
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              </Link>
              <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
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