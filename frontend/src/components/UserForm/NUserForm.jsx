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
    if (isUpdateMode && userData) {
      setFormData({ ...userData });
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
    <Grid 
      container 
      sx={{
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Paper 
        elevation={3} 
        sx={{
          p: { xs: 2, sm: 3 },
          width: "100%",
          maxWidth: { xs: "90%", sm: 600 },
          mx: "auto",
          mt: { xs: 3, sm: 6 },
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 2, 
            textAlign: "center",
            fontSize: { xs: "20px", sm: "24px" },
          }}
        >
          {isUpdateMode ? "Update Your Profile" : "Create Your Profile"}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            sx={{ m: 1, width: "100%" }}
            value={formData.name}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
            required
          />
          <TextField
            label="About"
            name="about"
            sx={{ m: 1, width: "100%" }}
            value={formData.about}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
            multiline
            rows={4}
          />
          <FormControl sx={{ m: 1, width: "100%" }}>
            <InputLabel id="class-batch-label">Class Batch</InputLabel>
            <Select
              labelId="class-batch-label"
              name="classBatch"
              value={formData.classBatch}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              label="Class Batch"
            >
              <MenuItem value="M19">M19</MenuItem>
              <MenuItem value="M20">M20</MenuItem>
              <MenuItem value="M21">M21</MenuItem>
              <MenuItem value="M22">M22</MenuItem>
              <MenuItem value="M23">M23</MenuItem>
              <MenuItem value="M24">M24</MenuItem>
              <MenuItem value="M25">M25</MenuItem>
              <MenuItem value="M26">M26</MenuItem>
              <MenuItem value="M27">M27</MenuItem>
              <MenuItem value="M28">M28</MenuItem>
              <MenuItem value="M29">M29</MenuItem>
              <MenuItem value="M30">M30</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Current Location"
            name="currentLocation"
            sx={{ m: 1, width: "100%" }}
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
                <Chip 
                  key={index} 
                  variant="outlined" 
                  label={option} 
                  {...getTagProps({ index })} 
                />
              ))
            }
            renderInput={(params) => (
              <TextField 
                {...params} 
                variant="outlined" 
                label="Skills" 
                placeholder="Add skills" 
              />
            )}
            sx={{ m: 1, width: "100%" }}
          />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Contact Info
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TextField
            label="Telegram"
            name="telegram"
            sx={{ m: 1, width: "100%" }}
            value={formData.telegram}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
          />
          <TextField
            label="WhatsApp"
            name="whatsapp"
            sx={{ m: 1, width: "100%" }}
            value={formData.whatsapp}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
          />
          <TextField
            label="Phone"
            name="phone"
            sx={{ m: 1, width: "100%" }}
            value={formData.phone}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
          />
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ mt: 2, display: "block", ml: "auto" }}
          >
            {isUpdateMode ? "Update Profile" : "Create Profile"}
          </Button>
        </form>
      </Paper>
    </Grid>
  );
}
