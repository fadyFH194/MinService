import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from './Post';
import PostForm from './PostForm';
import { Box } from '@mui/material';

const PostColumn = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:7070/api/posts', { withCredentials: true })
      .then(response => {
        const sortedPosts = response.data.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort posts by date (newest first)
        setPosts(sortedPosts);
      })
      .catch(error => console.error('Error fetching posts:', error));
  }, []);

  const addNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <PostForm onAddPost={addNewPost} />
      {posts.map(post => (
        <Post key={post.id} postId={post.id} />
      ))}
    </Box>
  );
};

export default PostColumn;