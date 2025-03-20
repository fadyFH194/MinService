import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  Avatar,
  ListItemText,
  ListItemIcon,
  Paper,
  Grid,
  Button,
  Link,
  SvgIcon,
  Badge,
  Dialog
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import Post from '../Post/Post'; // Adjust path if needed
import { useApi } from '../../contexts/ApiProvider';

// -------------------- Telegram Icon --------------------
const TelegramIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M21.146 2.927c-.305-.25-.741-.281-1.094-.084L2.61 11.158c-.406.216-.636.64-.6 1.098s.3.87.727 1.058l3.97 1.66 1.58 5.145c.147.477.586.8 1.08.8.216 0 .433-.054.63-.16l3.188-1.692 3.542 2.74c.19.146.423.22.66.22.15 0 .3-.028.442-.086.35-.14.602-.44.69-.82L22.973 4.02c.08-.32-.04-.656-.28-.89zM8.375 13.998l-.647 3.232-.93-3.048 10.77-6.58-9.194 6.396zM14.16 18.9l-2.613 1.39 1.014-3.298 6.405-6.895-4.806 8.803z" />
  </SvgIcon>
);

// -------------------- WhatsApp Icon --------------------
const WhatsAppIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.954.57 3.765 1.553 5.285L2 22l4.917-1.553A9.974 9.974 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
    {/* Put phone icon in the middle */}
    <g transform="translate(4.6,4.6) scale(0.6)">
      <PhoneIcon fontSize="small" aria-label="Phone" />
    </g>
  </SvgIcon>
);

/**
 * FullUserProfile
 * 
 * When opened, it:
 *   1) Calls GET /search/users with { q: authorName }
 *   2) If a user is found, calls GET /posts, filters by user.id
 *   3) Displays exactly the same layout/logic as your SearchWindow's "renderUserProfile"
 *   4) "Give Kudos" -> POST /give-kudos/:id
 *
 * Props:
 *   open:        boolean - whether the modal is visible
 *   authorName:  string  - e.g. "Philip", which we pass as q=Philip to /search/users
 *   onClose:     function - closes the modal
 */
const FullUserProfile = ({ open, authorName, onClose }) => {
  const api = useApi();
  const [userData, setUserData] = useState(null);   // The found user
  const [userPosts, setUserPosts] = useState([]);   // That user's posts
  const [kudosGiven, setKudosGiven] = useState(false);

  useEffect(() => {
    if (!open || !authorName) return;

    const fetchUserAndPosts = async () => {
      try {
        // EXACT logic from "SearchWindow" when searchType = "users" & query = ...
        const userRes = await api.get('/search/users', { q: authorName });
        if (userRes.ok && userRes.body && userRes.body.length > 0) {
          const foundUser = userRes.body[0];
          setUserData(foundUser);

          // Then fetch posts, filter by foundUser.id
          const postsRes = await api.get('/posts');
          if (postsRes.ok && postsRes.body) {
            const filtered = postsRes.body.filter(
              (p) => String(p.author_id) === String(foundUser.id)
            );
            setUserPosts(filtered);
          }
        } else {
          console.warn('No user found for name:', authorName);
        }
      } catch (error) {
        console.error('Error in FullUserProfile fetch logic:', error);
      }
    };

    fetchUserAndPosts();
  }, [open, authorName, api]);

  // "Give Kudos" logic (like snippet)
  const handleGiveKudos = async () => {
    if (!userData?.id) {
      console.warn('User not loaded or has no ID; cannot give kudos.');
      return;
    }
    try {
      const res = await api.post(`/give-kudos/${userData.id}`);
      if (res.ok && res.status === 200) {
        // update userData credits
        setUserData((prev) => ({
          ...prev,
          credits: res.body.new_credits,
        }));
        setKudosGiven(true);
      } else {
        alert(res.body?.error || 'Failed to give kudos');
      }
    } catch (err) {
      console.error('Error giving kudos:', err);
    }
  };

  // Contact Info
  const contactInfo = [
    { label: 'Telegram', value: userData?.telegram },
    { label: 'WhatsApp', value: userData?.whatsapp },
    { label: 'Phone', value: userData?.phone },
  ];
  const contactInfoFields = contactInfo.filter(
    (info) => info.value && info.value !== 'N/A'
  );

  const getContactLink = (label, value) => {
    if (!value) return null;
    switch (label) {
      case 'Telegram': {
        const telegramUsername = value.startsWith('@') ? value.slice(1) : value;
        return `https://t.me/${telegramUsername}`;
      }
      case 'WhatsApp': {
        const whatsappNumber = value.replace(/\D/g, '');
        return `https://wa.me/${whatsappNumber}`;
      }
      case 'Phone':
        return `tel:${value}`;
      default:
        return null;
    }
  };

  const getIcon = (label) => {
    switch (label) {
      case 'Telegram':
        return <TelegramIcon style={{ color: '#0088cc', fontSize: 24 }} />;
      case 'WhatsApp':
        return <WhatsAppIcon style={{ color: '#25D366', fontSize: 24 }} />;
      case 'Phone':
        return <PhoneIcon sx={{ fontSize: 24 }} />;
      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          position: 'relative',
          backgroundColor: '#f9f9f9',
          width: '100%',
          maxWidth: { xs: '90%', sm: 600 },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        {!userData ? (
          <Box>Loading user info...</Box>
        ) : (
          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            {/* Profile Header with Avatar + Credits Badge */}
            <Grid container justifyContent="center" sx={{ mb: 2 }}>
              <Badge
                badgeContent={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      bgcolor: '#e0e0e0',
                      borderRadius: '4px',
                      px: 0.5,
                    }}
                  >
                    <StarIcon sx={{ fontSize: 16, color: 'gold' }} />
                    {userData.credits}
                  </Box>
                }
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                overlap="circular"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: 'transparent',
                    color: 'black',
                    border: 'none',
                  },
                }}
              >
                <Avatar
                  src={userData.picture}
                  alt={userData.name}
                  sx={{ width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 } }}
                />
              </Badge>
            </Grid>

            <Divider sx={{ mb: 2, width: '100%' }} />

            {/* Basic Info */}
            <List sx={{ width: '100%' }}>
              <ListItem>
                <ListItemText primary="Name" secondary={userData.name || 'N/A'} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Email"
                  secondary={userData.email || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="About"
                  secondary={userData.about || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Class Batch"
                  secondary={userData.classBatch || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Current Location"
                  secondary={userData.currentLocation || 'N/A'}
                />
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
            </List>

            {/* Contact Info */}
            {contactInfoFields.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 2, width: '100%' }}>
                  Contact Info
                </Typography>
                <Divider sx={{ mb: 2, width: '100%' }} />
                <List sx={{ width: '100%' }}>
                  {contactInfoFields.map((info, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon>{getIcon(info.label)}</ListItemIcon>
                      <ListItemText
                        primary={info.label}
                        secondary={
                          <Link
                            href={getContactLink(info.label, info.value)}
                            target={info.label !== 'Phone' ? '_blank' : '_self'}
                            rel={
                              info.label !== 'Phone'
                                ? 'noopener noreferrer'
                                : undefined
                            }
                            underline="hover"
                          >
                            {info.value}
                          </Link>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {/* Give Kudos */}
            <Grid container justifyContent="center" sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleGiveKudos}
                disabled={kudosGiven}
                sx={{
                  borderRadius: '50px',
                  textTransform: 'none',
                  fontSize: '16px',
                }}
              >
                Give Kudos
              </Button>
            </Grid>

            {/* "Back" Button */}
            <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button variant="contained" onClick={onClose} sx={{ mr: 2 }}>
                Back
              </Button>
            </Grid>

            {/* User's Posts */}
            {userPosts.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 2, width: '100%' }}>
                  Posts
                </Typography>
                <Divider sx={{ mb: 2, width: '100%' }} />
                <Grid container direction="column" alignItems="center">
                  {userPosts.map((p) => (
                    <Post
                      key={p.id}
                      postId={p.id}
                      onDelete={() => {}}
                      refreshPosts={() => {}}
                    />
                  ))}
                </Grid>
              </>
            )}
          </Grid>
        )}
      </Paper>
    </Dialog>
  );
};

export default FullUserProfile;
