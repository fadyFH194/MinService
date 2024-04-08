// PostForm.jsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Paper, InputLabel, MenuItem, FormControl, Select, Grid } from '@mui/material';

const PostForm = ({ onAddPost }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [credits, setCredits] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onAddPost({ title, content, serviceType, credits });
    setTitle('');
    setContent('');
    setServiceType('');
    setCredits('');
  };

  return (
    <Paper elevation={4} sx={{ padding: '30px', borderRadius: '8px', margin: '30px 0', maxWidth: 600, width: '100%' }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Grid container spacing={2} justifyContent="space-between">
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="service-type-label">Type</InputLabel>
              <Select
                labelId="service-type-label"
                id="service-type"
                value={serviceType}
                label="Type"
                onChange={(e) => setServiceType(e.target.value)}
              >
                <MenuItem value={'in-person'}>In-Person</MenuItem>
                <MenuItem value={'online'}>Online</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="credits-label">Credits</InputLabel>
              <Select
                labelId="credits-label"
                id="credits"
                value={credits}
                label="Credits"
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
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ marginY: '16px' }}
        />
        <TextField
          label="Post Content"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ marginBottom: '16px' }}
        />
        <Button type="submit" variant="contained" color="primary" size="large">
          Add Post
        </Button>
      </Box>
    </Paper>
  );
};

export default PostForm;
