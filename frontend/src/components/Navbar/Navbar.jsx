import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import { useAuth } from "../../contexts/AuthProvider";
import NViewUserProfile from "../ViewUserProfile/NViewUserProfile";
import SearchWindow from "../SearchWindow/SearchWindow";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isNViewUserProfileOpen, setIsNViewUserProfileOpen] = useState(false);
  const [isSearchWindowOpen, setIsSearchWindowOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      setAnchorEl(null);
    }
  }, [isAuthenticated]);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateToHome = () => {
    navigate("/");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap", // Allow wrapping on smaller screens
          }}
        >
          {/* App Logo/Name */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              cursor: "pointer",
            }}
            onClick={navigateToHome}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
            >
              MinService
            </Typography>
          </Box>

          {/* Search Button */}
          {isAuthenticated && (
            <Button
              onClick={() => setIsSearchWindowOpen(true)}
              variant="text"
              sx={{
                fontSize: { xs: "14px", sm: "16px" },
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "20px",
                padding: { xs: "8px 16px", sm: "10px 24px", md: "10px 40px" },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              Search
            </Button>
          )}

          {/* User Menu */}
          {isAuthenticated && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexShrink: 0,
              }}
            >
              <Typography variant="subtitle1">{user.given_name}</Typography>

              <Tooltip title="View Profile">
                <Avatar
                  alt={"User's Picture"}
                  src={user.picture}
                  onClick={handleAvatarClick}
                  sx={{
                    cursor: "pointer",
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                  }}
                />
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    setIsNViewUserProfileOpen(true);
                    handleMenuClose();
                  }}
                >
                  View Profile
                </MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* View User Profile Window */}
      {isNViewUserProfileOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1300, // Ensure this overlay is on top of everything
            p: 2,
            pointerEvents: "auto", // Ensure pointer events are enabled
          }}
        >
          <NViewUserProfile
            closeViewProfile={() => setIsNViewUserProfileOpen(false)}
          />
        </Box>
      )}

      {/* Search Window */}
      {isSearchWindowOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1300, // Ensure this overlay is on top of everything
            p: 2,
            pointerEvents: "auto", // Ensure pointer events are enabled
          }}
        >
          <SearchWindow closeSearchWindow={() => setIsSearchWindowOpen(false)} />
        </Box>
      )}
    </Box>
  );
}

export default Navbar;
