import React, { useState } from 'react';
import { Card, CardContent, CardActions, Typography, Avatar, Grid, IconButton, TextField, Button, Chip } from '@mui/material';
import { deepPurple } from '@mui/material/colors';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import StarIcon from '@mui/icons-material/Star';

const Post = () => {
  const [upvotes, setUpvotes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');

  // Add a serviceType property to your postData
  const postData = {
    title: 'Placeholder Title',
    author: 'Author Name',
    date: 'March 16, 2024',
    content: 'This is a placeholder for post content. Actual post content will be fetched from an API.',
    serviceType: 'online',
    credits: 2
  };

  const handleUpvote = () => {
    setUpvotes(prevUpvotes => prevUpvotes + 1);
  };

  const handleCommentSubmit = () => {
    if (commentInput.trim()) {
      setComments(prevComments => [...prevComments, commentInput]);
      setCommentInput('');
    }
  };

  return (
    <Card
      sx={{
        position: 'relative', // Needed to position the service type indicator
        maxWidth: 600,
        width: '100%',
        margin: '20px 0',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: '8px',
        '&:hover': {
          boxShadow: '0px 6px 25px rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      {/* Service Type Indicator */}
      <Chip
        label={postData.serviceType.charAt(0).toUpperCase() + postData.serviceType.slice(1)}
        color={postData.serviceType === 'online' ? 'primary' : 'secondary'}
        size="small"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16, // Adjust this value to move the service chip to the left
          zIndex: 1, // Make sure it's above other content
        }}
      />
      {/* Credits Indicator */}
      <Chip
        icon={<StarIcon />} // Add the star icon here
        label={`${postData.credits}`} // Display the number of credits
        size="small"
        sx={{
          position: 'absolute',
          top: 16,
          right: 'calc(100% - 520px)', // Keep this chip to the right
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
            <Typography variant="subtitle2">{`By ${postData.author} on ${postData.date}`}</Typography>
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
        <IconButton aria-label="comment">
          {/* The comment icon button can be used to toggle the display of comments or open a comment modal */}
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
            {comment}
          </Typography>
        ))}
      </CardContent>
    </Card>
  );
};

export default Post;
