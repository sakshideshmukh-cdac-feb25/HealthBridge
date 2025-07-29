import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import { AccountCircle, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || "Patient";
  } catch (err) {
    console.error("Invalid token", err);
    return "Patient";
  }
};

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [username, setUsername] = useState("Patient");
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  useEffect(() => {
    const name = getUserFromToken();
    if (name) setUsername(name);
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    handleClose();
    navigate("/login"); // Redirect to login
  };

  const handleProfile = () => {
    handleClose();
    navigate("/profile"); // Or wherever your patient profile page is
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "#1976d2" }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Patient Dashboard
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {username}
          </Typography>
          <Avatar
            alt={username}
            src="/path/to/profile.jpg" // Optional: Make dynamic if available
            onClick={handleMenu}
            sx={{ cursor: "pointer" }}
          />
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <MenuItem onClick={handleProfile}>
              <AccountCircle sx={{ mr: 1 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
