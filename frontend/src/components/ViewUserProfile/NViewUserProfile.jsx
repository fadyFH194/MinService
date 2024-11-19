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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Post from '../Post/Post'; // Import the Post component

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

  return (
    <Grid
      container
      justifyContent="center"
      style={{
        padding: '20px',
        paddingTop: '10%',
        paddingBottom: '5%',
        height: '100vh',
        overflow: 'auto',
      }}
      data-testid="view-user-profile"
    >
      <Paper
        elevation={3}
        style={{ padding: '20px', maxWidth: '600px', width: '100%' }}
      >
        <Typography variant="h4" style={{ marginBottom: '16px', textAlign: 'center' }}>
          View Your Profile
        </Typography>
        <Divider style={{ marginBottom: '16px' }} />
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
            <ListItemText primary="Available Credits" secondary={userData.credits || 0} />
          </ListItem>
        </List>

        {/* Only render Contact Info if there are any fields with values */}
        {contactInfoFields.length > 0 && (
          <>
            <Typography variant="h6" style={{ marginTop: '16px' }}>
              Contact Info
            </Typography>
            <Divider style={{ marginBottom: '16px' }} />
            <List>
              {contactInfoFields.map((info, index) => (
                <ListItem key={index}>
                  <ListItemText primary={info.label} secondary={info.value} />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Render User's Posts Using the Post Component */}
        {userData.posts && userData.posts.length > 0 && (
          <>
            <Typography variant="h6" style={{ marginTop: '16px' }}>
              Your Posts
            </Typography>
            <Divider style={{ marginBottom: '16px' }} />
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

        <Grid container justifyContent="flex-end" style={{ marginTop: '16px' }}>
          <Button variant="contained" onClick={closeViewProfile} style={{ marginRight: '8px' }}>
            Close
          </Button>
          <Button variant="contained" color="primary" onClick={handleEditClick}>
            Edit Profile
          </Button>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default NViewUserProfile;
