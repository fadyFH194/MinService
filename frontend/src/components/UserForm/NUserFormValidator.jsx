// NUserFormValidator.jsx

const validateFormData = (formData) => {
  let errors = {};
  let isValid = true;

  // Validate name
  if (!(formData.name?.trim())) {
    isValid = false;
    errors.name = "Name is required.";
  }
  
  // Validate class batch
  if (!(formData.classBatch?.trim())) { // Ensure the key matches with your state structure
    isValid = false;
    errors.classBatch = "Class batch is required.";
  }

  // Validate current location
  if (!(formData.currentLocation?.trim())) { // Ensure the key matches with your state structure
    isValid = false;
    errors.currentLocation = "Current location is required.";
  }

  // Validate skills (at least one skill must be selected)
  if (!formData.skills || formData.skills.length === 0) {
    isValid = false;
    errors.skills = "At least one skill must be selected.";
  }

  return {
    isValid,
    errors,
  };
};

export default validateFormData;
