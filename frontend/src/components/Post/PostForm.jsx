import React, { useEffect, useState } from 'react';
import { Paper, TextField, Button, MenuItem, Select, InputLabel, FormControl, Grid, Chip, Autocomplete } from '@mui/material';
import { useApi } from '../../contexts/ApiProvider';

const PostForm = ({ onAddPost }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [credits, setCredits] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const api = useApi();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get('/tags', { withCredentials: true });
        if (response.ok) {
          setAvailableTags(response.body);
        } else {
          console.error('Error fetching tags:', response.body.error);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, [api]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title || !content || !serviceType || credits === '') {
      alert('Please fill all fields');
      return;
    }

    const newPost = {
      title,
      content,
      type: serviceType,
      credits: parseInt(credits),
      tags: selectedTags,
    };

    try {
      const response = await api.post('/posts', newPost, { withCredentials: true });
      if (response.ok) {
        onAddPost(response.body.post);
        // Clear the form after successful submission
        setTitle('');
        setContent('');
        setServiceType('');
        setCredits('');
        setSelectedTags([]);
      } else {
        console.error('Error submitting post:', response.body.error);
      }
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
                onChange={(e) => setServiceType(e.target.value)}
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
                onChange={(e) => setCredits(e.target.value)}
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
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return <Chip key={key} label={option} {...tagProps} />;
            })
          }
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="Tags" placeholder="Add or select tags" />
          )}
          sx={{ marginTop: 2 }}
        />
        <Button type="submit" variant="contained" sx={{ marginTop: 2 }}>
          Add Post
        </Button>
      </form>
    </Paper>
  );
};

export default PostForm;
