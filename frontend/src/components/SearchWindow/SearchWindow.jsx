import React, { useState, useEffect } from "react";
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
  Paper,
  Grid,
  Button,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { useApi } from "../../contexts/ApiProvider";
import Post from "../Post/Post"; // Import Post component
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

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

  const handleSearchTypeToggle = () => {
    setSearchType((prevType) =>
      prevType === "users" ? "posts (by tag)" : "users"
    );
    setResults([]);
    setQuery("");
    setSelectedTags([]);
    setSelectedUser(null);
  };

  // Fetch available tags when the component mounts
  useEffect(() => {
    const fetchAvailableTags = async () => {
      try {
        const response = await api.get("/posts");
        if (response && response.ok && response.status === 200) {
          // Extract unique tags from posts
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
      // Fetch all posts
      const response = await api.get("/posts");
      if (response && response.ok && response.status === 200) {
        // Filter posts authored by the selected user
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
          padding: 3,
          height: "100%",
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            maxWidth: 600,
            width: "100%",
          }}
        >
          {/* Close Button at the Top Right */}
            <IconButton
              onClick={() => setSelectedUser(null)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <CloseIcon />
            </IconButton>
          {/* User Avatar */}
          <Grid container justifyContent="center" sx={{ marginBottom: 2 }}>
            <Avatar
              src={user.picture}
              alt={user.name}
              sx={{ width: 100, height: 100 }}
            />
          </Grid>

          <Typography variant="h4" sx={{ marginBottom: 2, textAlign: "center" }}>
            {user.name || "N/A"}
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />
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

          {/* Contact Info */}
          {contactInfoFields.length > 0 && (
            <>
              <Typography variant="h6" sx={{ marginTop: 3 }}>
                Contact Info
              </Typography>
              <Divider sx={{ marginBottom: 2 }} />
              <List>
                {contactInfoFields.map((info, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={info.label} secondary={info.value} />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {/* User's Posts */}
          {userPosts && userPosts.length > 0 && (
            <>
              <Typography variant="h6" sx={{ marginTop: 3 }}>
                Posts
              </Typography>
              <Divider sx={{ marginBottom: 2 }} />
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

          {/* Back Button */}
          <Grid container justifyContent="flex-end" sx={{ marginTop: 2 }}>
            <Button
              variant="contained"
              onClick={() => setSelectedUser(null)}
              sx={{ marginRight: 2 }}
            >
              Back
            </Button>
          </Grid>
        </Paper>
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "80%",
        height: "80%",
        backgroundColor: "white",
        borderRadius: "8px",
        padding: 3,
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {searchType === "users" ? (
              <TextField
                label={`Search ${searchType}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
                autoFocus
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
              <StyledToggle active={searchType === "posts (by tag)"}>
                <div className="toggle-thumb"></div>
              </StyledToggle>
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
                padding: 2,
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
                    padding: 2,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={result.picture} alt={result.name} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={result.name}
                    secondary={result.email}
                  />
                </ListItem>
              ))}
              {results.length === 0 && query && (
                <Typography
                  variant="body2"
                  sx={{ textAlign: "center", padding: 2, width: "100%" }}
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
                padding: 2,
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
                  sx={{ textAlign: "center", padding: 2, width: "100%" }}
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
