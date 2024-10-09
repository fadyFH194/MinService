import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
} from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import StarIcon from '@mui/icons-material/Star';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAuth } from '../../contexts/AuthProvider';

const Post = ({ postId, onDelete, refreshPosts }) => {
  const { user } = useAuth();
  const [postData, setPostData] = useState(null);
  const [upvotes, setUpvotes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [postMenuAnchorEl, setPostMenuAnchorEl] = useState(null);
  const [commentMenuAnchorEl, setCommentMenuAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [commentEditDialogOpen, setCommentEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editType, setEditType] = useState('');
  const [editCredits, setEditCredits] = useState(0);
  const [editCommentContent, setEditCommentContent] = useState('');

  useEffect(() => {
    // Fetch the post data
    axios
      .get(`http://127.0.0.1:7070/api/posts/${postId}`, {
        withCredentials: true,
      })
      .then((response) => {
        const post = response.data;
        setPostData(post);
        setComments(post.comments);
        setUpvotes(post.likes);

        // Check if the user has liked the post
        axios
          .get(`http://127.0.0.1:7070/api/posts/${postId}/has_liked`, {
            withCredentials: true,
          })
          .then((res) => {
            setHasLiked(res.data.hasLiked);
          })
          .catch((err) => console.error('Error checking like status:', err));
      })
      .catch((error) => console.error('Error fetching post:', error));
  }, [postId]);

  const handleUpvote = () => {
    axios
      .post(
        `http://127.0.0.1:7070/api/posts/${postId}/like`,
        {},
        { withCredentials: true }
      )
      .then((response) => {
        // Assuming the backend returns the updated likes count and hasLiked status
        const { likes, hasLiked } = response.data;
        setUpvotes(likes);
        setHasLiked(hasLiked);
      })
      .catch((error) => console.error('Error upvoting post:', error));
  };

  const handleCommentSubmit = () => {
    if (commentInput.trim()) {
      axios
        .post(
          `http://127.0.0.1:7070/api/posts/${postId}/comments`,
          { content: commentInput },
          { withCredentials: true }
        )
        .then((response) => {
          // Assuming response.data contains the new comment object
          const newComment = response.data;
          setComments((prevComments) => [...prevComments, newComment]);
          setCommentInput('');
        })
        .catch((error) => console.error('Error posting comment:', error));
    }
  };

  const handleDeleteComment = () => {
    if (selectedComment) {
      axios
        .delete(
          `http://127.0.0.1:7070/api/comments/${selectedComment.id}/delete`,
          { withCredentials: true }
        )
        .then(() => {
          setComments((prevComments) =>
            prevComments.filter((comment) => comment.id !== selectedComment.id)
          );
          setCommentDialogOpen(false);
          setSelectedComment(null);
        })
        .catch((error) => console.error('Error deleting comment:', error));
    }
  };

  const handleEditComment = () => {
    if (selectedComment && editCommentContent.trim()) {
      axios
        .put(
          `http://127.0.0.1:7070/api/comments/${selectedComment.id}/edit`,
          { content: editCommentContent },
          { withCredentials: true }
        )
        .then((response) => {
          const updatedComment = response.data.comment;
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === updatedComment.id ? updatedComment : comment
            )
          );
          setCommentEditDialogOpen(false);
          setSelectedComment(null);
        })
        .catch((error) => console.error('Error editing comment:', error));
    }
  };

  const handleDeletePost = () => {
    axios
      .delete(`http://127.0.0.1:7070/api/posts/${postId}/delete`, {
        withCredentials: true,
      })
      .then(() => {
        setPostDialogOpen(false);
        if (onDelete) {
          onDelete(postId);
        }
      })
      .catch((error) => console.error('Error deleting post:', error));
  };

  const handleOpenPostMenu = (event) => {
    setPostMenuAnchorEl(event.currentTarget);
  };

  const handleClosePostMenu = () => {
    setPostMenuAnchorEl(null);
  };

  const handleOpenCommentMenu = (event, comment) => {
    setCommentMenuAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleCloseCommentMenu = () => {
    setCommentMenuAnchorEl(null);
  };

  const handleOpenPostDialog = () => {
    setPostDialogOpen(true);
    handleClosePostMenu();
  };

  const handleClosePostDialog = () => {
    setPostDialogOpen(false);
  };

  const handleOpenCommentDialog = () => {
    setCommentDialogOpen(true);
    handleCloseCommentMenu();
  };

  const handleCloseCommentDialog = () => {
    setCommentDialogOpen(false);
    setSelectedComment(null);
  };

  const handleOpenEditDialog = () => {
    setEditTitle(postData.title);
    setEditContent(postData.content);
    setEditType(postData.type);
    setEditCredits(postData.credits);
    setEditDialogOpen(true);
    handleClosePostMenu();
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleOpenCommentEditDialog = () => {
    setEditCommentContent(selectedComment.content);
    setCommentEditDialogOpen(true);
    handleCloseCommentMenu();
  };

  const handleCloseCommentEditDialog = () => {
    setCommentEditDialogOpen(false);
    setSelectedComment(null);
  };

  const handleEditPost = () => {
    axios
      .put(
        `http://127.0.0.1:7070/api/posts/${postId}/edit`,
        {
          title: editTitle,
          content: editContent,
          type: editType,
          credits: editCredits,
        },
        { withCredentials: true }
      )
      .then((response) => {
        // Assuming response.data contains the updated post object
        const updatedPost = response.data.post;
        setPostData(updatedPost);
        handleCloseEditDialog();
        if (refreshPosts) {
          refreshPosts();
        }
      })
      .catch((error) => console.error('Error updating post:', error));
  };

  if (!postData || !user) return <div>Loading...</div>;

  // Ensure that author_id and user.id are the same type
  const postAuthorId = String(postData.author_id);
  const currentUserId = String(user.id);

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
        },
      }}
    >
      {/* Post Type Indicator */}
      <Chip
        label={postData.type.charAt(0).toUpperCase() + postData.type.slice(1)}
        color="primary"
        size="small"
        sx={{ position: 'absolute', top: 16, right: 50, zIndex: 1 }}
      />

      {/* Credits Indicator */}
      <Chip
        icon={<StarIcon />}
        label={`${postData.credits}`}
        size="small"
        sx={{ position: 'absolute', top: 16, right: 130, zIndex: 1 }}
      />

      {/* Conditional rendering of the Post Menu */}
      {postAuthorId === currentUserId && (
        <>
          {/* Post Menu - Positioned at the top right */}
          <IconButton
            onClick={handleOpenPostMenu}
            sx={{ position: 'absolute', top: 5, right: 5, zIndex: 2 }}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={postMenuAnchorEl}
            open={Boolean(postMenuAnchorEl)}
            onClose={handleClosePostMenu}
            keepMounted
          >
            <MenuItem onClick={handleOpenEditDialog}>Edit</MenuItem>
            <MenuItem onClick={handleOpenPostDialog}>Delete</MenuItem>
          </Menu>
        </>
      )}

      <CardContent>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Avatar
              alt="Author's Picture"
              src={postData.author_picture}
              sx={{ width: 40, height: 40 }}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="h5">{postData.title}</Typography>
            <Typography variant="subtitle2">{`By ${postData.author}`}</Typography>
            <Typography variant="caption" color="textSecondary">
              {postData.date}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          {postData.content}
        </Typography>
      </CardContent>

      <CardActions disableSpacing>
        <IconButton onClick={handleUpvote} aria-label="upvote">
          {hasLiked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
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
        <Button
          variant="contained"
          onClick={handleCommentSubmit}
          disabled={!commentInput.trim()}
        >
          Post Comment
        </Button>

        {comments.map((comment) => (
          <Grid
            container
            alignItems="center"
            key={comment.id}
            sx={{ marginTop: '16px' }}
          >
            <Grid item>
              <Avatar
                alt="Comment Author's Picture"
                src={comment.author_picture}
                sx={{ width: 30, height: 30 }}
              />
            </Grid>
            <Grid item xs sx={{ marginLeft: '10px' }}>
              <Typography variant="body2">
                <strong>{comment.author}</strong>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ marginLeft: '10px' }}
                >
                  {comment.timestamp}
                </Typography>
              </Typography>
              <Typography variant="body1" sx={{ marginTop: '4px' }}>
                {comment.content}
              </Typography>
            </Grid>
            {String(comment.author_id) === currentUserId && (
              <Grid item>
                <IconButton
                  onClick={(e) => handleOpenCommentMenu(e, comment)}
                >
                  <MoreVertIcon />
                </IconButton>
              </Grid>
            )}
          </Grid>
        ))}
      </CardContent>

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

      {/* Confirmation Dialog for Deleting Post */}
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

      {/* Confirmation Dialog for Deleting Comment */}
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
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
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
      <Dialog open={commentEditDialogOpen} onClose={handleCloseCommentEditDialog}>
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
  );
};

export default Post;
