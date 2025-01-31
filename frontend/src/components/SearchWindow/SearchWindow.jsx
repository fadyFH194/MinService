import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemIcon,
  Paper,
  Grid,
  Button,
  Chip,
  Link, // Import Link component from MUI
  SvgIcon, // Import SvgIcon for custom icons
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { useApi } from "../../contexts/ApiProvider";
import Post from "../Post/Post"; // Import Post component
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import PhoneIcon from '@mui/icons-material/Phone'; // Import Phone icon

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

// Styled toggle component (unchanged in functionality)
const StyledToggle = styled("div")(({ theme, active }) => ({
  width: 120,
  height: 50,
  borderRadius: 25,
  backgroundColor: active ? theme.palette.primary.main : "#555",
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  overflow: "hidden",
  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  "&::before": {
    content: `"${active ? "Posts" : "Users"}"`,
    position: "absolute",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "16px",
    transition: "all 0.3s ease",
    left: active ? "25%" : "75%",
    transform: "translateX(-50%)",
  },
  "& .toggle-thumb": {
    width: 50,
    height: 50,
    borderRadius: "50%",
    backgroundColor: "#fff",
    position: "absolute",
    left: active ? "70px" : "0",
    transition: "all 0.3s ease",
    boxShadow: theme.shadows[2],
  },
}));

function SearchWindow({ closeSearchWindow }) {
  const [searchType, setSearchType] = useState("users");
  const [query, setQuery] = useState(""); // For users search
  const [selectedTags, setSelectedTags] = useState([]); // For tags selection
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]); // State for selected user's posts
  const [availableTags, setAvailableTags] = useState([]); // State for available tags
  const api = useApi();

  // Helper function to generate contact link URLs
  const getContactLink = (label, value) => {
    switch (label) {
      case "Telegram":
        // eslint-disable-next-line no-case-declarations
        const telegramUsername = value.startsWith("@") ? value.slice(1) : value;
        return `https://t.me/${telegramUsername}`;
      case "WhatsApp":
        // eslint-disable-next-line no-case-declarations
        const whatsappNumber = value.replace(/\D/g, "");
        return `https://wa.me/${whatsappNumber}`;
      case "Phone":
        return `tel:${value}`;
      default:
        return null;
    }
  };

  // Helper function to get the appropriate icon based on label
  const getIcon = (label) => {
    switch (label) {
      case "Telegram":
        return <TelegramIcon style={{ color: "#0088cc", fontSize: 24 }} />;
      case "WhatsApp":
        return <WhatsAppIcon style={{ color: "#25D366", fontSize: 24 }} />;
      case "Phone":
        return <PhoneIcon color="action" sx={{ fontSize: 24 }} />;
      default:
        return null;
    }
  };

  const handleSearchTypeToggle = () => {
    setSearchType((prevType) =>
      prevType === "users" ? "posts (by tag)" : "users"
    );
    setResults([]);
    setQuery("");
    setSelectedTags([]);
    setSelectedUser(null);
  };

  // Fetch available tags when the component mounts or when search type changes
  useEffect(() => {
    const fetchAvailableTags = async () => {
      try {
        const response = await api.get("/posts");
        if (response && response.ok && response.status === 200) {
          const posts = response.body;
          const tagsSet = new Set();
          posts.forEach((post) => {
            if (Array.isArray(post.tags)) {
              post.tags.forEach((tag) => tagsSet.add(tag));
            }
          });
          setAvailableTags(Array.from(tagsSet));
        } else {
          console.error("Error fetching posts for tags:", response.status);
        }
      } catch (error) {
        console.error("Error fetching posts for tags:", error);
      }
    };

    if (searchType === "posts (by tag)") {
      fetchAvailableTags();
    }
  }, [searchType, api]);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchType === "users" && !query) {
        setResults([]);
        return;
      }
      if (searchType === "posts (by tag)" && selectedTags.length === 0) {
        setResults([]);
        return;
      }
      try {
        let endpoint;
        let params;
        if (searchType === "users") {
          endpoint = `/search/users`;
          params = { q: query };
        } else {
          endpoint = `/search/posts`;
          params = { tags: selectedTags.join(",") };
        }

        const response = await api.get(endpoint, params);
        if (response && response.ok && response.status === 200) {
          setResults(response.body || []);
        } else {
          if (response.status === 404) {
            setResults([]);
          } else {
            console.error("Error fetching search results:", response.status);
          }
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    const debounceTimeout = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query, selectedTags, searchType, api]);

  // Function to handle user selection
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    try {
      const response = await api.get("/posts");
      if (response && response.ok && response.status === 200) {
        const posts = response.body.filter(
          (post) => post.author_id === user.id
        );
        setUserPosts(posts);
      } else {
        console.error("Error fetching posts:", response.status);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Render the selected user's profile with contact info (with icons)
  const renderUserProfile = (user) => {
    const contactInfo = [
      { label: "Telegram", value: user.telegram },
      { label: "WhatsApp", value: user.whatsapp },
      { label: "Phone", value: user.phone },
    ];

    const contactInfoFields = contactInfo.filter(
      (info) => info.value && info.value !== "N/A"
    );

    return (
      <Grid
        container
        justifyContent="center"
        sx={{
          p: { xs: 2, sm: 3 },
          height: "100%",
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3 },
            maxWidth: 600,
            width: "100%",
            position: "relative",
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={() => setSelectedUser(null)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          {/* User Avatar */}
          <Grid container justifyContent="center" sx={{ mb: 2 }}>
            <Avatar
              src={user.picture}
              alt={user.name}
              sx={{ width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 } }}
            />
          </Grid>
          <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
            {user.name || "N/A"}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItem>
              <ListItemText primary="Name" secondary={user.name || "N/A"} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Email" secondary={user.email || "N/A"} />
            </ListItem>
            <ListItem>
              <ListItemText primary="About" secondary={user.about || "N/A"} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Class Batch"
                secondary={user.classBatch || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Current Location"
                secondary={user.currentLocation || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Skills"
                secondary={
                  Array.isArray(user.skills) && user.skills.length > 0
                    ? user.skills.join(", ")
                    : "N/A"
                }
              />
            </ListItem>
          </List>
          {/* Contact Info with Icons */}
          {contactInfoFields.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mt: 3 }}>
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
                        (info.label === "Telegram" ||
                          info.label === "WhatsApp" ||
                          info.label === "Phone") ? (
                          <Link
                            href={getContactLink(info.label, info.value)}
                            target={info.label !== "Phone" ? "_blank" : "_self"}
                            rel={info.label !== "Phone" ? "noopener noreferrer" : undefined}
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
          {/* Back Button */}
          <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => setSelectedUser(null)} sx={{ mr: 2 }}>
              Back
            </Button>
          </Grid>
          {/* User's Posts */}
          {userPosts && userPosts.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mt: 3 }}>
                Posts
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container direction="column" alignItems="center">
                {userPosts.map((post) => (
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

  return (
    <Box
      sx={{
        position: "relative",
        width: { xs: "95%", sm: "80%", md: "70%" },
        height: { xs: "90%", sm: "80%" },
        backgroundColor: "white",
        borderRadius: "8px",
        p: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "column",
        gap: 3,
        boxShadow: 3,
      }}
    >
      {selectedUser ? (
        renderUserProfile(selectedUser)
      ) : (
        <>
          <IconButton
            onClick={closeSearchWindow}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h5" textAlign="center">
            Search
          </Typography>
          {/* Search Input and Toggle */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {searchType === "users" ? (
              <TextField
                label={`Search ${searchType}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
                autoFocus
                sx={{ flexGrow: 1 }}
              />
            ) : (
              <Autocomplete
                multiple
                options={availableTags}
                value={selectedTags}
                onChange={(event, newValue) => setSelectedTags(newValue)}
                filterSelectedOptions
                getOptionLabel={(option) => option}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        variant="outlined"
                        label={option}
                        {...tagProps}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Select Tags"
                    placeholder="Add tags"
                    fullWidth
                    autoFocus
                  />
                )}
                sx={{ flexGrow: 1 }}
              />
            )}
            <Box onClick={handleSearchTypeToggle}>
              <StyledToggle active={searchType === "posts (by tag)"} />
            </Box>
          </Box>
          <Divider />
          {/* Results Display */}
          {searchType === "users" ? (
            <List
              sx={{
                overflowY: "auto",
                flexGrow: 1,
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                p: { xs: 1, sm: 2 },
              }}
            >
              {results.map((result, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleUserSelect(result)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    borderBottom: "1px solid #ddd",
                    p: { xs: 1, sm: 2 },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={result.picture} alt={result.name} />
                  </ListItemAvatar>
                  <ListItemText primary={result.name} secondary={result.email} />
                </ListItem>
              ))}
              {results.length === 0 && query && (
                <Typography
                  variant="body2"
                  sx={{ textAlign: "center", p: 2, width: "100%" }}
                >
                  No results found
                </Typography>
              )}
            </List>
          ) : (
            <Grid
              container
              spacing={2}
              sx={{
                overflowY: "auto",
                flexGrow: 1,
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                p: { xs: 1, sm: 2 },
              }}
            >
              {results.map((post) => (
                <Grid item xs={12} key={post.id}>
                  <Post
                    postId={post.id}
                    onDelete={() => {}}
                    refreshPosts={() => {}}
                  />
                </Grid>
              ))}
              {results.length === 0 && selectedTags.length > 0 && (
                <Typography
                  variant="body2"
                  sx={{ textAlign: "center", p: 2, width: "100%" }}
                >
                  No posts found for the selected tags
                </Typography>
              )}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}

export default SearchWindow;
