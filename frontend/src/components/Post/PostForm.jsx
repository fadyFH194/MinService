import React, { useEffect, useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Chip,
  Autocomplete
} from '@mui/material';
import { useApi } from '../../contexts/ApiProvider';

const PostForm = ({ onAddPost }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [credits, setCredits] = useState(''); // Renamed to 'credits' for backend compatibility
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
    <Paper 
      elevation={4} 
      sx={{ 
        padding: { xs: '16px', sm: '30px' },
        margin: '20px auto',
        maxWidth: { xs: '95%', sm: 600 }
      }}
    >
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Type Dropdown */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                label="Type"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              >
                {/* Default MenuItem with empty value */}
                <MenuItem value="">
                  {/* This MenuItem is intentionally left empty to allow the label to act as a placeholder */}
                </MenuItem>
                <MenuItem value="in-person">In-Person</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Urgency Dropdown (formerly Credits) */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="urgency-label">Urgency</InputLabel>
              <Select
                labelId="urgency-label"
                label="Urgency"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
              >
                {/* Default MenuItem with empty value */}
                <MenuItem value="">
                  {/* This MenuItem is intentionally left empty to allow the label to act as a placeholder */}
                </MenuItem>
                <MenuItem value={0}>0</MenuItem>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Post Title Field */}
        <TextField
          label="Post Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mt: 2 }}
        />

        {/* Post Content Field */}
        <TextField
          label="Post Content"
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mt: 2 }}
        />

        {/* Tags Autocomplete */}
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
            <TextField 
              {...params} 
              variant="outlined" 
              label="Tags" 
              placeholder="Add or select tags" 
            />
          )}
          sx={{ mt: 2 }}
        />

        {/* Submit Button */}
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Add Post
        </Button>
      </form>
    </Paper>
  );
};

export default PostForm;
