import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Button,
  Chip,
  Grid,
  CardActions,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  FormControl,
  InputLabel,
  MenuItem as DropdownItem,
  Autocomplete,
} from '@mui/material';

import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import StarIcon from '@mui/icons-material/Star';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { useAuth } from '../../contexts/AuthProvider';
import { useApi } from '../../contexts/ApiProvider';

// Import the separate modal component (formerly "UserProfileModal")
import FullUserProfile from '../FullUserProfile/FullUserProfile';

const Post = ({ postId, onDelete, refreshPosts }) => {
  const { user } = useAuth();
  const api = useApi();

  // -------------------- States for Post & Comments --------------------
  const [postData, setPostData] = useState(null);
  const [upvotes, setUpvotes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [postMenuAnchorEl, setPostMenuAnchorEl] = useState(null);
  const [commentMenuAnchorEl, setCommentMenuAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);

  // Dialog states
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [commentEditDialogOpen, setCommentEditDialogOpen] = useState(false);

  // Edits
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editType, setEditType] = useState('');
  const [editCredits, setEditCredits] = useState(0);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // For the "Profile Modal"
  const [profileOpen, setProfileOpen] = useState(false);
  // We remove the local userData state if we’re only passing name
  // but we do preserve your original code structure:
  const [profileUserData, setProfileUserData] = useState(null);
  const [profileAuthorName, setProfileAuthorName] = useState("");

  // -------------------- Fetch Post Data --------------------
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const response = await api.get(`/posts/${postId}`, { withCredentials: true });
        if (response.ok) {
          const post = response.body;
          setPostData(post);
          setComments(post.comments);
          setUpvotes(post.likes);

          // Check if the user has liked the post
          const res = await api.get(`/posts/${postId}/has_liked`, { withCredentials: true });
          if (res.ok) {
            setHasLiked(res.body.hasLiked);
          } else {
            console.error('Error checking like status:', res.body.error);
          }
        } else {
          console.error('Error fetching post:', response.body.error);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };
    fetchPostData();
  }, [postId, api]);

  // -------------------- Build user object from post/comment --------------------
  // Adjust these fields as your backend returns them
  const buildAuthorData = (rawData) => ({
    id: rawData.author_id,
    name: rawData.author,
    email: rawData.author_email,
    about: rawData.author_about,
    classBatch: rawData.author_classBatch,
    currentLocation: rawData.author_currentLocation,
    skills: rawData.author_skills,
    picture: rawData.author_picture,
    credits: rawData.author_credits,
    telegram: rawData.author_telegram,
    whatsapp: rawData.author_whatsapp,
    phone: rawData.author_phone
  });

  // -------------------- Profile Modal Handlers --------------------
  const openProfileForUser = (userObj) => {
    if (!userObj) return;
    setProfileUserData(userObj);
    setProfileOpen(true);
  };
  const closeProfile = () => {
    setProfileOpen(false);
    setProfileUserData(null);
  };

  // Our approach: we just store the author’s *name* so FullUserProfile can do /search/users?q=name
  const handleAvatarClick = (authorName) => {
    setProfileAuthorName(authorName);
    setProfileOpen(true);
  };

  // -------------------- Post/Comment Action Handlers --------------------
  const handleUpvote = async () => {
    try {
      const response = await api.post(`/posts/${postId}/like`, null, {
        withCredentials: true
      });
      if (response.ok) {
        const { likes, hasLiked } = response.body;
        setUpvotes(likes);
        setHasLiked(hasLiked);
      } else {
        console.error('Error upvoting post:', response.body.error);
      }
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    try {
      const response = await api.post(
        `/posts/${postId}/comments`,
        { content: commentInput },
        { withCredentials: true }
      );
      if (response.ok) {
        setComments((prev) => [...prev, response.body]);
        setCommentInput('');
      } else {
        console.error('Error posting comment:', response.body.error);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedComment) return;
    try {
      const response = await api.delete(
        `/comments/${selectedComment.id}/delete`,
        { withCredentials: true }
      );
      if (response.ok) {
        setComments((prev) => prev.filter((c) => c.id !== selectedComment.id));
        setCommentDialogOpen(false);
        setSelectedComment(null);
      } else {
        console.error('Error deleting comment:', response.body.error);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = async () => {
    if (!selectedComment || !editCommentContent.trim()) return;
    try {
      const response = await api.put(
        `/comments/${selectedComment.id}/edit`,
        { content: editCommentContent },
        { withCredentials: true }
      );
      if (response.ok) {
        const updatedComment = response.body.comment;
        setComments((prev) =>
          prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
        );
        setCommentEditDialogOpen(false);
        setSelectedComment(null);
      } else {
        console.error('Error editing comment:', response.body.error);
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeletePost = async () => {
    try {
      const response = await api.delete(`/posts/${postId}/delete`, {
        withCredentials: true
      });
      if (response.ok) {
        setPostDialogOpen(false);
        if (onDelete) onDelete(postId);
      } else {
        console.error('Error deleting post:', response.body.error);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // -------------------- Menus & Dialogs --------------------
  const handleOpenPostMenu = (event) => setPostMenuAnchorEl(event.currentTarget);
  const handleClosePostMenu = () => setPostMenuAnchorEl(null);

  const handleOpenCommentMenu = (event, comment) => {
    setCommentMenuAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };
  const handleCloseCommentMenu = () => setCommentMenuAnchorEl(null);

  const handleOpenPostDialog = () => {
    setPostDialogOpen(true);
    handleClosePostMenu();
  };
  const handleClosePostDialog = () => setPostDialogOpen(false);

  const handleOpenCommentDialog = () => {
    setCommentDialogOpen(true);
    handleCloseCommentMenu();
  };
  const handleCloseCommentDialog = () => {
    setCommentDialogOpen(false);
    setSelectedComment(null);
  };

  const handleOpenEditDialog = async () => {
    if (!postData) return;
    setEditTitle(postData.title);
    setEditContent(postData.content);
    setEditType(postData.type);
    setEditCredits(postData.credits);
    setEditTags(postData.tags || []);
    setEditDialogOpen(true);
    handleClosePostMenu();

    try {
      const res = await api.get('/tags', { withCredentials: true });
      if (res.ok) {
        setAvailableTags(res.body);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };
  const handleCloseEditDialog = () => setEditDialogOpen(false);

  const handleOpenCommentEditDialog = () => {
    if (!selectedComment) return;
    setEditCommentContent(selectedComment.content);
    setCommentEditDialogOpen(true);
    handleCloseCommentMenu();
  };
  const handleCloseCommentEditDialog = () => {
    setCommentEditDialogOpen(false);
    setSelectedComment(null);
  };

  const handleEditPost = async () => {
    try {
      const response = await api.put(
        `/posts/${postId}/edit`,
        {
          title: editTitle,
          content: editContent,
          type: editType,
          credits: editCredits,
          tags: editTags
        },
        { withCredentials: true }
      );
      if (response.ok) {
        const updatedPost = response.body.post;
        setPostData(updatedPost);
        handleCloseEditDialog();
        if (refreshPosts) refreshPosts();
      } else {
        console.error('Error updating post:', response.body.error);
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  // -------------------- Render --------------------
  if (!postData || !user) return <div>Loading...</div>;
  const postAuthorData = buildAuthorData(postData);

  return (
    <>
      <Card
        sx={{
          position: 'relative',
          maxWidth: { xs: '90%', sm: 600 },
          width: '100%',
          m: { xs: '10px auto', sm: '20px auto' },
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: '8px',
          '&:hover': {
            boxShadow: '0px 6px 25px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <CardContent>
          {/* ----- Post header: Author info ----- */}
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={12} sm={8}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Avatar
                    alt="Author's Picture"
                    src={postData.author_picture}
                    sx={{ width: { xs: 30, sm: 40 }, height: { xs: 30, sm: 40 }, cursor: 'pointer' }}
                    // Clicking the post's avatar uses handleAvatarClick
                    onClick={() => handleAvatarClick(postData.author)}
                  />
                </Grid>
                <Grid item xs>
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: { xs: '1.2rem', sm: '1.5rem' },
                      wordWrap: 'break-word',
                      cursor: 'pointer'
                    }}
                    onClick={() => openProfileForUser(postAuthorData)}
                  >
                    {postData.title}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => openProfileForUser(postAuthorData)}
                  >
                    {`By ${postData.author}`}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {postData.date}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm="auto">
              <Grid container alignItems="center" spacing={1} justifyContent="flex-end">
                <Grid item>
                  <Chip
                    label={
                      postData.type
                        ? postData.type.charAt(0).toUpperCase() + postData.type.slice(1)
                        : 'N/A'
                    }
                    color="primary"
                    size="small"
                  />
                </Grid>
                <Grid item>
                  <Chip icon={<StarIcon />} label={`${postData.credits}`} size="small" />
                </Grid>
                {String(postData.author_id) === String(user.id) && (
                  <Grid item>
                    <IconButton onClick={handleOpenPostMenu}>
                      <MoreVertIcon />
                    </IconButton>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* ----- Main post content ----- */}
          <Typography variant="body1" sx={{ mt: 2 }}>
            {postData.content}
          </Typography>

          {/* ----- Tags ----- */}
          <Grid container spacing={1} sx={{ mt: 2 }}>
            {postData.tags?.map((tag, idx) => (
              <Grid item key={idx}>
                <Chip label={tag} size="small" />
              </Grid>
            ))}
          </Grid>
        </CardContent>

        {/* Upvote */}
        <CardActions disableSpacing>
          <IconButton onClick={handleUpvote} aria-label="upvote">
            {hasLiked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
            <Typography sx={{ ml: '8px' }}>{upvotes}</Typography>
          </IconButton>
        </CardActions>

        {/* Comments */}
        <CardContent>
          <TextField
            fullWidth
            label="Write a comment..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            variant="outlined"
            sx={{ mb: { xs: '8px', sm: '16px' } }}
          />
          <Button variant="contained" onClick={handleCommentSubmit} disabled={!commentInput.trim()}>
            Post Comment
          </Button>

          {comments.map((comment) => {
            return (
              <Grid container alignItems="center" key={comment.id} sx={{ mt: { xs: '8px', sm: '16px' } }}>
                <Grid item>
                  <Avatar
                    alt="Comment Author's Picture"
                    src={comment.author_picture}
                    sx={{ width: { xs: 24, sm: 30 }, height: { xs: 24, sm: 30 }, cursor: 'pointer' }}
                    // FIXED: Use handleAvatarClick for the comment's avatar too
                    onClick={() => handleAvatarClick(comment.author)}
                  />
                </Grid>
                <Grid item xs sx={{ ml: 1 }}>
                  <Typography variant="body2">
                    <strong
                      style={{ cursor: 'pointer' }}
                      // Also use handleAvatarClick here, or keep openProfileForUser if you prefer the user object approach
                      onClick={() => handleAvatarClick(comment.author)}
                    >
                      {comment.author}
                    </strong>
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                      {comment.timestamp}
                    </Typography>
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {comment.content}
                  </Typography>
                </Grid>
                {String(comment.author_id) === String(user.id) && (
                  <Grid item>
                    <IconButton onClick={(e) => handleOpenCommentMenu(e, comment)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Grid>
                )}
              </Grid>
            );
          })}
        </CardContent>

        {/* Post Menu */}
        <Menu
          anchorEl={postMenuAnchorEl}
          open={Boolean(postMenuAnchorEl)}
          onClose={handleClosePostMenu}
          keepMounted
        >
          <MenuItem onClick={handleOpenEditDialog}>Edit</MenuItem>
          <MenuItem onClick={handleOpenPostDialog}>Delete</MenuItem>
        </Menu>

        {/* Comment Menu */}
        <Menu
          anchorEl={commentMenuAnchorEl}
          open={Boolean(commentMenuAnchorEl)}
          onClose={handleCloseCommentMenu}
          keepMounted
        >
          <MenuItem onClick={handleOpenCommentEditDialog}>Edit</MenuItem>
          <MenuItem onClick={handleOpenCommentDialog}>Delete</MenuItem>
        </Menu>

        {/* Delete Post Dialog */}
        <Dialog open={postDialogOpen} onClose={handleClosePostDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this post?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePostDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeletePost} color="primary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Comment Dialog */}
        <Dialog open={commentDialogOpen} onClose={handleCloseCommentDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this comment?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCommentDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteComment} color="primary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Post Dialog */}
        <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
          <DialogTitle>Edit Post</DialogTitle>
          <DialogContent>
            <TextField
              label="Title"
              fullWidth
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              margin="dense"
            />
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              margin="dense"
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Type</InputLabel>
              <Select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
              >
                <DropdownItem value="online">Online</DropdownItem>
                <DropdownItem value="in-person">In-Person</DropdownItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Credits</InputLabel>
              <Select
                value={editCredits}
                onChange={(e) => setEditCredits(Number(e.target.value))}
              >
                <DropdownItem value={0}>0</DropdownItem>
                <DropdownItem value={1}>1</DropdownItem>
                <DropdownItem value={2}>2</DropdownItem>
              </Select>
            </FormControl>
            <Autocomplete
              multiple
              options={availableTags}
              getOptionLabel={(option) => option}
              value={editTags}
              onChange={(event, newValue) => setEditTags(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Tags" margin="normal" fullWidth />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleEditPost} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Comment Dialog */}
        <Dialog open={commentEditDialogOpen} onClose={handleCloseCommentEditDialog} fullWidth maxWidth="sm">
          <DialogTitle>Edit Comment</DialogTitle>
          <DialogContent>
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={4}
              value={editCommentContent}
              onChange={(e) => setEditCommentContent(e.target.value)}
              margin="dense"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCommentEditDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleEditComment} color="primary" disabled={!editCommentContent.trim()}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Card>

      {/* We pass the profileAuthorName to FullUserProfile so it can do /search/users?q=thatName */}
      <FullUserProfile
        open={profileOpen}
        authorName={profileAuthorName}
        onClose={closeProfile}
      />
    </>
  );
};

export default Post;
