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
  FormHelperText,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import validateFormData from "./NUserFormValidator"; 

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

const skillsData = ["Communication", "Teamwork", "Problem Solving", "Project Management", "Critical Thinking"]; // Example skills

export default function NUserFormPage() {
  const navigate = useNavigate();
  const { userData, isUpdateMode = false } = useLocation().state || {};

  const [formData, setFormData] = useState({
    name: "",
    about: "",
    classBatch: "",  // Make sure the naming matches throughout your code
    currentLocation: "",
    skills: [],
    ...userData,  // This will spread your userData into the initial state
  });

  const [formErrors, setFormErrors] = useState({});

  const api = useApi();

  useEffect(() => {
    if (isUpdateMode && userData) {
      setFormData({
        name: userData.name || "",
        about: userData.about || "",
        classBatch: userData.class_batch || "",  // Check the exact key names in userData
        currentLocation: userData.current_location || "",
        skills: userData.skills || [],
      });
    }
  }, [userData, isUpdateMode]);

  const handleChange = (event, newValue, field) => {
    if (field === 'skills') {
      setFormData({ ...formData, [field]: newValue });
    } else {
      const { name, value } = event.target;
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateFormData(formData);
    setFormErrors(validation.errors);

    if (!validation.isValid) {
      console.log("Validation failed:", validation.errors);
      return;
    }

    const endpoint = isUpdateMode ? "/update-nuser" : "/nusers-data";
    try {
      const response = await api[isUpdateMode ? 'put' : 'post'](endpoint, formData);
      if (response.status === 200) {
        navigate("/");
      } else {
        console.log("Operation failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  return (
    <Grid container style={gridContainerStyle}>
      <Paper elevation={3} style={paperStyle}>
        <Typography variant="h4" style={titleStyle}>
          {isUpdateMode ? "Update Your N-Profile" : "Create Your N-Profile"}
        </Typography>
        <Divider style={{ marginBottom: "16px" }} />
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            style={formControlStyle}
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            label="About"
            name="about"
            style={formControlStyle}
            value={formData.about}
            onChange={handleChange}
            multiline
            rows={4}
          />
          <FormControl style={formControlStyle}>
            <InputLabel id="class-batch-label">Class Batch</InputLabel>
            <Select
              labelId="class-batch-label"
              name="classBatch"
              value={formData.classBatch}  // Make sure this matches the state property name
              onChange={handleChange}
              label="Class Batch"
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
            value={formData.currentLocation}  // Adjusted to match the corrected state property name
            onChange={handleChange}
            InputLabelProps={{
              shrink: Boolean(formData.currentLocation), // This will ensure the label shrinks only if there's a value
            }}
          />

          <Autocomplete
            multiple
            options={skillsData}
            freeSolo
            value={formData.skills}
            onChange={(event, newValue) => handleChange(event, newValue, 'skills')}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Skills" placeholder="Add skills" />
            )}
          />
          <Divider style={{ marginTop: "16px", marginBottom: "16px" }} />
          <Button
            type="submit"
            variant="contained"
            style={submitButtonStyle}
          >
            {isUpdateMode ? "Update Profile" : "Create Profile"}
          </Button>
        </form>
      </Paper>
    </Grid>
  );
}