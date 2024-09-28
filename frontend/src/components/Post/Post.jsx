import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Avatar, IconButton, TextField, Button, Chip, Grid, CardActions, Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt'; // For unliked state
import StarIcon from '@mui/icons-material/Star';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // For the three vertical dots menu
import { useAuth } from '../../contexts/AuthProvider'; // Assuming you have a context for auth

const Post = ({ postId }) => {
  const { user } = useAuth(); // Get the current user's information, including their picture and id
  const [postData, setPostData] = useState(null);
  const [upvotes, setUpvotes] = useState(0);  // To store the total upvotes
  const [hasLiked, setHasLiked] = useState(false); // Track whether the user has liked the post
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [anchorEl, setAnchorEl] = useState(null); // Anchor element for the menu
  const [selectedComment, setSelectedComment] = useState(null); // Track selected comment for delete
  const [dialogOpen, setDialogOpen] = useState(false); // Track dialog open state

  useEffect(() => {
    // Fetch post details
    axios.get(`http://127.0.0.1:7070/api/posts/${postId}`, { withCredentials: true })
      .then((response) => {
        const post = response.data;
        setPostData(post);
        setComments(post.comments);

        // Fetch like status and total likes for this post
        axios.get(`http://127.0.0.1:7070/api/posts/${postId}/has_liked`, { withCredentials: true })
          .then((res) => {
            setHasLiked(res.data.hasLiked); // Whether the current user has liked the post
            setUpvotes(res.data.likes); // Total upvotes from all users
          })
          .catch(err => console.error('Error checking like status:', err));
      })
      .catch(error => console.error('Error fetching post:', error));
  }, [postId]);

  const handleUpvote = () => {
    axios.post(`http://127.0.0.1:7070/api/posts/${postId}/like`, {}, { withCredentials: true })
      .then((response) => {
        setUpvotes(response.data.likes);  // Update total likes
        setHasLiked(!hasLiked);  // Toggle the user's like status
      })
      .catch(error => console.error('Error upvoting post:', error));
  };

  const handleCommentSubmit = () => {
    if (commentInput.trim()) {
      axios.post(`http://127.0.0.1:7070/api/posts/${postId}/comments`, { content: commentInput }, { withCredentials: true })
        .then((response) => {
          setComments(prevComments => [...prevComments, response.data.comment]);
          setCommentInput('');
        })
        .catch(error => console.error('Error posting comment:', error));
    }
  };

  // Delete comment handler
  const handleDeleteComment = () => {
    if (selectedComment) {
      axios.delete(`http://127.0.0.1:7070/api/comments/${selectedComment}/delete`, { withCredentials: true })
        .then(() => {
          // Remove the comment from the local state
          setComments(prevComments => prevComments.filter(comment => comment.id !== selectedComment));
          handleCloseDialog(); // Close the confirmation dialog
        })
        .catch(error => console.error('Error deleting comment:', error));
    }
  };

  // Handle menu open
  const handleOpenMenu = (event, commentId) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(commentId); // Set the selected comment before opening the dialog
  };

  // Handle menu close
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Handle dialog open
  const handleOpenDialog = () => {
    setDialogOpen(true);
    handleCloseMenu(); // Close the menu when the dialog opens
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedComment(null); // Reset the selected comment after closing the dialog
  };

  if (!postData) return <div>Loading...</div>;

  return (
    <Card
      sx={{
        position: 'relative',
        maxWidth: 600,
        width: '100%',
        margin: '20px auto',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: '8px',
        '&:hover': {
          boxShadow: '0px 6px 25px rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      {/* Post Type Indicator */}
      <Chip
        label={postData.type.charAt(0).toUpperCase() + postData.type.slice(1)}
        color="primary"
        size="small"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1,
        }}
      />

      {/* Credits Indicator */}
      <Chip
        icon={<StarIcon />}
        label={`${postData.credits}`}
        size="small"
        sx={{
          position: 'absolute',
          top: 16,
          right: 110,
          zIndex: 1,
        }}
      />

      <CardContent>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            {/* Show the post author's picture */}
            <Avatar alt="Author's Picture" src={postData.author_picture} sx={{ width: 40, height: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h5">{postData.title}</Typography>
            <Typography variant="subtitle2">{`By ${postData.author}`}</Typography>
            <Typography variant="caption" color="textSecondary">
              {postData.date} {/* Display the formatted timestamp */}
            </Typography>
          </Grid>
        </Grid>

        <Typography variant="body1" sx={{ marginTop: 2 }}>
          {postData.content}
        </Typography>
      </CardContent>

      <CardActions disableSpacing>
        <IconButton onClick={handleUpvote} aria-label="upvote">
          {hasLiked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />} {/* Change icon based on like status */}
          <Typography sx={{ marginLeft: '8px' }}>{upvotes}</Typography>
        </IconButton>
      </CardActions>

      <CardContent>
        <TextField
          fullWidth
          label="Write a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          variant="outlined"
          sx={{ marginBottom: '16px' }}
        />
        <Button variant="contained" onClick={handleCommentSubmit} disabled={!commentInput.trim()}>
          Post Comment
        </Button>

        {comments.map((comment, index) => (
          <Grid container alignItems="center" key={index} sx={{ marginTop: '16px' }}>
            <Grid item>
              {/* Show the comment author's picture */}
              <Avatar alt="Comment Author's Picture" src={comment.author_picture} sx={{ width: 30, height: 30 }} />
            </Grid>
            <Grid item xs sx={{ marginLeft: '10px' }}>
              <Typography variant="body2">
                <strong>{comment.author}</strong> {/* Bold author name */}
                <Typography variant="caption" color="textSecondary" sx={{ marginLeft: '10px' }}>
                  {comment.timestamp} {/* Timestamp in smaller font */}
                </Typography>
              </Typography>
              <Typography variant="body1" sx={{ marginTop: '4px' }}>
                {comment.content}
              </Typography>
            </Grid>

            {/* Show menu with delete option if the current user is the author */}
            {comment.author_id === user.id && ( // Use user.id from useAuth to compare with comment author
              <Grid item>
                <IconButton onClick={(e) => handleOpenMenu(e, comment.id)}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  keepMounted
                >
                  <MenuItem onClick={handleOpenDialog}>Delete</MenuItem>
                </Menu>
              </Grid>
            )}
          </Grid>
        ))}
      </CardContent>

      {/* Confirmation dialog for deletion */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this comment?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteComment}  // Call delete function directly
            color="primary"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default Post;