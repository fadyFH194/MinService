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

const NViewUserProfile = ({ closeViewProfile }) => {
  const [userData, setUserData] = useState({
    name: '',
    about: '',
    classBatch: '',
    currentLocation: '',
    skills: [],
  });

  const api = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/nusers-view', {
          withCredentials: true,
        });
        if (response.status === 200 && response.body) {
          console.log("NUserData:", response.body);
          setUserData(response.body);
        } else {
          console.log('Failed to fetch user data', response.status);
        }
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };
    fetchUserData();
  }, [api]);

  if (!userData || Object.keys(userData).length === 0) {
    return <div>Loading...</div>; // Show a loading message or spinner here
  }

  const handleEditClick = () => {
    closeViewProfile();
    navigate('/nuserform', {
      state: { userData: userData, isUpdateMode: true },
    });
  };

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
            <ListItemText primary="Name" secondary={userData?.name || 'N/A'} />
          </ListItem>
          <ListItem>
            <ListItemText primary="About" secondary={userData?.about || 'N/A'} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Class Batch" secondary={userData?.class_batch || 'N/A'} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Current Location" secondary={userData?.current_location || 'N/A'} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Skills" secondary={userData?.skills.join(', ') || 'N/A'} />
          </ListItem>
        </List>
        <Grid container justifyContent="flex-end">
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
