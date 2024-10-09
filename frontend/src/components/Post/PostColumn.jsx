import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from './Post';
import PostForm from './PostForm';
import { Box } from '@mui/material';

const PostColumn = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = () => {
    axios
      .get('http://127.0.0.1:7070/api/posts', { withCredentials: true })
      .then((response) => {
        setPosts(response.data); // Use the order as returned by the backend
      })
      .catch((error) => console.error('Error fetching posts:', error));
  };

  useEffect(() => {
    // Fetch posts from the backend and set them directly
    fetchPosts();
  }, []);

  const addNewPost = (newPost) => {
    // Optionally, you can fetch posts again or prepend the new post
    // setPosts([newPost, ...posts]);
    fetchPosts();
  };

  const handleDeletePost = (deletedPostId) => {
    // Optionally, you can filter out the deleted post
    // setPosts((prevPosts) => prevPosts.filter((post) => post.id !== deletedPostId));
    fetchPosts();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <PostForm onAddPost={addNewPost} />
      {posts.map((post) => (
        <Post
          key={post.id}
          postId={post.id}
          onDelete={handleDeletePost}
          refreshPosts={fetchPosts}
        />
      ))}
    </Box>
  );
};

export default PostColumn;
