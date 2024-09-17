import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Avatar, IconButton, TextField, Button, Chip, Grid, CardActions } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import StarIcon from '@mui/icons-material/Star';
import { deepPurple } from '@mui/material/colors';

const Post = ({ postId }) => {
  const [postData, setPostData] = useState(null);
  const [upvotes, setUpvotes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    axios.get(`http://127.0.0.1:7070/api/posts/${postId}`, { withCredentials: true })
      .then((response) => {
        const post = response.data;
        setPostData(post);
        setUpvotes(post.likes);
        setComments(post.comments);
      })
      .catch(error => console.error('Error fetching post:', error));
  }, [postId]);

  const handleUpvote = () => {
    axios.post(`http://127.0.0.1:7070/api/posts/${postId}/like`, {}, { withCredentials: true })
      .then(() => {
        setUpvotes(prevUpvotes => prevUpvotes + 1);
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
            <Avatar sx={{ bgcolor: deepPurple[500] }}>{postData.author[0]}</Avatar>
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
          <ThumbUpAltIcon />
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
          <Typography key={index} variant="body2" sx={{ marginTop: '16px' }}>
            {comment.content}
          </Typography>
        ))}
      </CardContent>
    </Card>
  );
};

export default Post;