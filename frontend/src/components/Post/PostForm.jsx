import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Paper, TextField, Button, MenuItem, Select, InputLabel, FormControl, Grid, Chip, Autocomplete } from '@mui/material';

const PostForm = ({ onAddPost }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [serviceType, setServiceType] = useState('');  // Type field
  const [credits, setCredits] = useState('');  // Credits field
  const [availableTags, setAvailableTags] = useState([]);  // Available tags fetched from the backend
  const [selectedTags, setSelectedTags] = useState([]);  // Selected tags for the post

  useEffect(() => {
    // Fetch available tags from the backend when the component mounts
    axios.get('http://127.0.0.1:7070/api/tags')
      .then(response => {
        setAvailableTags(response.data);
      })
      .catch(error => console.error('Error fetching tags:', error));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Ensure all fields are properly populated before submitting
    if (!title || !content || !serviceType || credits === "") {
      alert("Please fill all fields");
      return;
    }

    const newPost = {
      title,
      content,
      type: serviceType,  // Type field (online/in-person)
      credits: parseInt(credits),  // Credits field
      tags: selectedTags  // Add selected tags to the post data
    };

    try {
      const response = await axios.post('http://127.0.0.1:7070/api/posts', newPost, { withCredentials: true });
      onAddPost(response.data.post);
      // Clear the form after successful submission
      setTitle('');
      setContent('');
      setServiceType('');
      setCredits('');
      setSelectedTags([]); // Clear selected tags
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  return (
    <Paper elevation={4} sx={{ padding: '30px', margin: '20px auto', maxWidth: 600 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}  // Service Type field
              >
                <MenuItem value="in-person">In-Person</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Credits</InputLabel>
              <Select
                value={credits}
                onChange={(e) => setCredits(e.target.value)}  // Credits field
              >
                <MenuItem value={0}>0</MenuItem>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <TextField
          label="Post Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ marginTop: 2 }}
        />
        <TextField
          label="Post Content"
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ marginTop: 2 }}
        />
        <Autocomplete
          multiple
          freeSolo
          options={availableTags}
          value={selectedTags}
          onChange={(event, newValue) => setSelectedTags(newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={index} label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="Tags" placeholder="Add or select tags" />
          )}
          sx={{ marginTop: 2 }}
        />
        <Button type="submit" variant="contained" sx={{ marginTop: 2 }}>Add Post</Button>
      </form>
    </Paper>
  );
};

export default PostForm;
