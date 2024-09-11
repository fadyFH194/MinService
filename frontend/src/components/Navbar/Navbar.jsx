import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { useAuth } from "../../contexts/AuthProvider";
import ViewUserProfile from "../ViewUserProfile/ViewUserProfile";
import NViewUserProfile from "../ViewUserProfile/NViewUserProfile";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isViewUserProfileOpen, setIsViewUserProfileOpen] = useState(false);
  const [isNViewUserProfileOpen, setIsNViewUserProfileOpen] = useState(false);
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
          }}
        >
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
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
            >
              MinService
            </Typography>
          </Box>

          {isAuthenticated && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="subtitle1">{user.given_name}</Typography>

              <Tooltip title="View Profile">
                <Avatar
                  alt={"User's Picture"}
                  src={user.picture}
                  onClick={handleAvatarClick}
                  style={{ cursor: "pointer" }}
                />
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {/* <MenuItem onClick={() => {
                  setIsViewUserProfileOpen(true);
                  handleMenuClose();
                }}>View Profile</MenuItem> */}
                <MenuItem onClick={() => {
                  setIsNViewUserProfileOpen(true);
                  handleMenuClose();
                }}>View Profile</MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {isViewUserProfileOpen && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "1000",
          }}
        >
          <ViewUserProfile
            closeViewProfile={() => setIsViewUserProfileOpen(false)}
          />
        </div>
      )}

      {isNViewUserProfileOpen && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "1000",
          }}
        >
          <NViewUserProfile
            closeViewProfile={() => setIsNViewUserProfileOpen(false)}
          />
        </div>
      )}
    </Box>
  );
}

export default Navbar;
