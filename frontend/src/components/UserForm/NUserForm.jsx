import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApi } from "../../contexts/ApiProvider";
import {
  TextField,
  Button,
  FormControl,
  Typography,
  Divider,
  Paper,
  Grid,
  Chip,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

const formControlStyle = {
  margin: "8px",
  width: "100%",
};

const paperStyle = {
  padding: "20px",
  width: "100%",
  maxWidth: "600px",
  margin: "auto",
  marginTop: "50px",
};

const titleStyle = {
  marginBottom: "16px",
  textAlign: "center",
  fontSize: "24px",
};

const submitButtonStyle = {
  marginTop: "16px",
  display: "block",
  marginLeft: "auto",
};

const gridContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const skillsData = [
  "Political Science",
  "Creative writing",
  "Driving",
  "Project Management",
  "Software Engineering",
]; // Example skills

export default function NUserFormPage() {
  const navigate = useNavigate();
  const { userData, isUpdateMode = false } = useLocation().state || {};

  const [formData, setFormData] = useState({
    name: "",
    about: "",
    classBatch: "",
    currentLocation: "",
    telegram: "",
    whatsapp: "",
    phone: "",
    skills: [],
  });

  const api = useApi();

  useEffect(() => {
    if (isUpdateMode) {
      if (userData) {
        setFormData({ ...userData });
      }
    }
  }, [userData, isUpdateMode]);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = "/nusers-data";
    const method = isUpdateMode ? "put" : "post";

    try {
      const response = await api[method](endpoint, formData);
      if (response.status === 200 || response.status === 201) {
        navigate("/");
      } else {
        console.error("Operation failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Grid container style={gridContainerStyle}>
      <Paper elevation={3} style={paperStyle}>
        <Typography variant="h4" style={titleStyle}>
          {isUpdateMode ? "Update Your Profile" : "Create Your Profile"}
        </Typography>
        <Divider style={{ marginBottom: "16px" }} />
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            style={formControlStyle}
            value={formData.name}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
            required
          />
          <TextField
            label="About"
            name="about"
            style={formControlStyle}
            value={formData.about}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
            multiline
            rows={4}
          />
          <FormControl style={formControlStyle}>
            <InputLabel id="class-batch-label">Class Batch</InputLabel>
            <Select
              labelId="class-batch-label"
              name="classBatch"
              value={formData.classBatch}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
            >
              <MenuItem value="M25">M25</MenuItem>
              <MenuItem value="M26">M26</MenuItem>
              <MenuItem value="M27">M27</MenuItem>
              <MenuItem value="M28">M28</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Current Location"
            name="currentLocation"
            style={formControlStyle}
            value={formData.currentLocation}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
          />
          <Autocomplete
            multiple
            options={skillsData}
            freeSolo
            value={formData.skills}
            onChange={(event, newValue) => handleChange("skills", newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip key={index} variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Skills" placeholder="Add skills" />
            )}
            style={formControlStyle}
          />
          <Typography variant="h6" style={{ marginTop: '16px' }}>
            Contact Info          </Typography>
          <Divider style={{ marginBottom: '16px' }} />
          <TextField
            label="Telegram"
            name="telegram"
            style={formControlStyle}
            value={formData.telegram}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
          />
          <TextField
            label="WhatsApp"
            name="whatsapp"
            style={formControlStyle}
            value={formData.whatsapp}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
          />
          <TextField
            label="Phone"
            name="phone"
            style={formControlStyle}
            value={formData.phone}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
          />
          <Button type="submit" variant="contained" style={submitButtonStyle}>
            {isUpdateMode ? "Update Profile" : "Create Profile"}
          </Button>
        </form>
      </Paper>
    </Grid>
  );
}
