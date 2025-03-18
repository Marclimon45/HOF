import React from "react";
import { AppBar, Toolbar, Typography, InputBase, Avatar, Menu, MenuItem } from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import styles from "../styles/navbar.module.css";

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
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" color="default" elevation={0} className={styles.navbar}>
      <Toolbar className={styles.toolbar}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <img src="/cpx.png" alt="Logo" className={styles.logo} />
          <Typography variant="h6" className={styles.logoText}>
            Xin's Hall of Fame
          </Typography>
        </div>

        {/* Search Bar */}
        <Search>
          <SearchIcon style={{ fontSize: "18px", color: "#999" }} />
          <SearchInput placeholder="Search projects..." />
        </Search>

        {/* Navigation Links */}
        <div className={styles.navLinks}>
          <Typography className={styles.navLink} color="primary">Home</Typography>
          <Typography className={styles.navLink}>Contribution</Typography>
          <Typography className={styles.navLink}>Bucket</Typography>
          <Typography className={styles.navLink}>Projects & Publication</Typography>
          <Typography className={styles.navLink}>About us</Typography>
        </div>

        {/* User Profile */}
        <div className={styles.profileSection} onClick={handleMenuOpen}>
          <Avatar src="/jeff1.jpg" className={styles.avatar} />
          <Typography className={styles.username}>John Doe</Typography>
          <ArrowDropDownIcon />
        </div>

        {/* Dropdown Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
          <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
          <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;