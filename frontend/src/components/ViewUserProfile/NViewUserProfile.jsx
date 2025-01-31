import React, { useState, useEffect } from 'react';
import { useApi } from '../../contexts/ApiProvider';
import {
  Button,
  Paper,
  Grid,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Link, // Import Link component from MUI
  SvgIcon, // Import SvgIcon for custom icons
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PhoneIcon from '@mui/icons-material/Phone'; // Import Phone icon
import Post from '../Post/Post'; // Import the Post component

// Custom Telegram Icon
const TelegramIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M21.146 2.927c-.305-.25-.741-.281-1.094-.084L2.61 11.158c-.406.216-.636.64-.6 1.098s.3.87.727 1.058l3.97 1.66 1.58 5.145c.147.477.586.8 1.08.8.216 0 .433-.054.63-.16l3.188-1.692 3.542 2.74c.19.146.423.22.66.22.15 0 .3-.028.442-.086.35-.14.602-.44.69-.82L22.973 4.02c.08-.32-.04-.656-.28-.89zM8.375 13.998l-.647 3.232-.93-3.048 10.77-6.58-9.194 6.396zM14.16 18.9l-2.613 1.39 1.014-3.298 6.405-6.895-4.806 8.803z" />
  </SvgIcon>
);

// Custom WhatsApp Icon
const WhatsAppIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.954.57 3.765 1.553 5.285L2 22l4.917-1.553A9.974 9.974 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
    <g transform="translate(4.6,4.6) scale(0.6)">
      <PhoneIcon fontSize="small" aria-label="Phone" />
    </g>
  </SvgIcon>
);

const NViewUserProfile = ({ closeViewProfile }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    about: '',
    classBatch: '',
    currentLocation: '',
    skills: [],
    telegram: '',
    whatsapp: '',
    phone: '',
    credits: 0,
    posts: [], // Include posts in the initial state
  });
  const api = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/nusers-view', { withCredentials: true });
        if (response && response.ok && response.status === 200) {
          console.log("Fetched User Data:", response.body);
          setUserData({
            ...response.body,
            skills: response.body.skills || [], // Ensure skills is always an array
            posts: response.body.posts || [],   // Ensure posts is always an array
          });
        } else {
          console.error("Error fetching user data:", response.status);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Profile not found, redirect to profile creation form
          navigate('/nuserform', { state: { isUpdateMode: false } });
        } else {
          console.error("API Error:", error);
        }
      }
    };
    fetchUserData();
  }, [api, navigate]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  const handleEditClick = () => {
    closeViewProfile();
    navigate('/nuserform', {
      state: { userData: userData, isUpdateMode: true },
    });
  };

  // Prepare the contact info fields
  const contactInfo = [
    { label: 'Telegram', value: userData.telegram },
    { label: 'WhatsApp', value: userData.whatsapp },
    { label: 'Phone', value: userData.phone },
  ];

  // Filter out empty or 'N/A' values
  const contactInfoFields = contactInfo.filter(
    (info) => info.value && info.value !== 'N/A'
  );

  // Helper function to generate link URLs
  const getContactLink = (label, value) => {
    switch (label) {
      case 'Telegram':
        // Ensure the username does not contain '@'
        // eslint-disable-next-line no-case-declarations
        const telegramUsername = value.startsWith('@') ? value.slice(1) : value;
        return `https://t.me/${telegramUsername}`;
      case 'WhatsApp':
        // Remove any non-digit characters from the phone number
        // eslint-disable-next-line no-case-declarations
        const whatsappNumber = value.replace(/\D/g, '');
        return `https://wa.me/${whatsappNumber}`;
      case 'Phone':
        // Return a tel link
        return `tel:${value}`;
      default:
        return null;
    }
  };

  // Helper function to get the appropriate icon based on label
  const getIcon = (label) => {
    switch (label) {
      case 'Telegram':
        return <TelegramIcon style={{ color: '#0088cc' }} />; // Telegram Blue
      case 'WhatsApp':
        return <WhatsAppIcon style={{ color: '#25D366' }} />; // WhatsApp Green
      case 'Phone':
        return <PhoneIcon color="action" />; // Default color
      default:
        return null;
    }
  };

  return (
    <Grid
      container
      justifyContent="center"
      sx={{
        p: { xs: 2, sm: 3 },
        pt: { xs: "10%", sm: "10%" },
        pb: { xs: "5%", sm: "5%" },
        height: "100vh",
        overflow: "auto",
      }}
      data-testid="view-user-profile"
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          maxWidth: { xs: "90%", sm: 600 },
          width: "100%",
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ mb: 2, textAlign: "center" }}
        >
          View Your Profile
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          <ListItem>
            <ListItemText primary="Name" secondary={userData.name || 'N/A'} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Email" secondary={userData.email || 'N/A'} />
          </ListItem>
          <ListItem>
            <ListItemText primary="About" secondary={userData.about || 'N/A'} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Class Batch" secondary={userData.classBatch || 'N/A'} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Current Location" secondary={userData.currentLocation || 'N/A'} />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Skills"
              secondary={
                Array.isArray(userData.skills) && userData.skills.length > 0
                  ? userData.skills.join(', ')
                  : 'N/A'
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Kudos" secondary={userData.credits || 0} />
          </ListItem>
        </List>

        {/* Only render Contact Info if there are any fields with values */}
        {contactInfoFields.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Contact Info
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {contactInfoFields.map((info, index) => (
                <ListItem key={index}>
                  <ListItemIcon>{getIcon(info.label)}</ListItemIcon>
                  <ListItemText
                    primary={info.label}
                    secondary={
                      (info.label === 'Telegram' || info.label === 'WhatsApp' || info.label === 'Phone') ? (
                        <Link
                          href={getContactLink(info.label, info.value)}
                          target={info.label !== 'Phone' ? "_blank" : "_self"}
                          rel={info.label !== 'Phone' ? "noopener noreferrer" : undefined}
                          underline="hover"
                        >
                          {info.value}
                        </Link>
                      ) : (
                        info.value
                      )
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
        <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button variant="contained" onClick={closeViewProfile} sx={{ mr: 2 }}>
            Close
          </Button>
          <Button variant="contained" color="primary" onClick={handleEditClick}>
            Edit Profile
          </Button>
        </Grid>

        {/* Render User's Posts Using the Post Component */}
        {userData.posts && userData.posts.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Your Posts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container direction="column" alignItems="center">
              {userData.posts.map((post) => (
                <Post
                  key={post.id}
                  postId={post.id}
                  onDelete={() => {}}
                  refreshPosts={() => {}}
                />
              ))}
            </Grid>
          </>
        )}
      </Paper>
    </Grid>
  );
};

export default NViewUserProfile;
