import React, { useEffect, useState } from 'react';
import Post from './Post';
import PostForm from './PostForm';
import { Box } from '@mui/material';
import { useApi } from '../../contexts/ApiProvider'; // Adjust the import path accordingly

const PostColumn = () => {
  const [posts, setPosts] = useState([]);
  const api = useApi(); // Access the API client

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      if (response.ok) {
        setPosts(response.body); // Use the order as returned by the backend
      } else {
        console.error('Error fetching posts:', response.body.error);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
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
