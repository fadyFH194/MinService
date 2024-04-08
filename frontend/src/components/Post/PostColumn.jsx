// PostColumn.jsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import PostForm from "./PostForm";
import Post from "./Post"; 


const PostColumn = () => {
  const [posts, setPosts] = useState([
    { id: 1, title: 'Post Title 1', content: 'Post Content Placeholder 1' },
    { id: 2, title: 'Post Title 2', content: 'Post Content Placeholder 2' },
    // Add more posts as needed
  ]);

  const addNewPost = (newPost) => {
    setPosts([ { ...newPost, id: Date.now() }, ...posts ]); // New post at the beginning
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        gap: 2,
      }}
    >
      <PostForm onAddPost={addNewPost} />
      {posts.map((post) => (
        <Post key={post.id} title={post.title} content={post.content} />
      ))}
    </Box>
  );
};

export default PostColumn;