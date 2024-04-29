import React, { useEffect } from "react";
import Button from "@mui/material/Button";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";

function SignUp() {
  const { promptGoogleSignIn, authenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated) {
      navigate("/userform"),
      navigate("/nuserform");
    }
  }, [authenticated, navigate]);

  return (
    <div className="SignUp">
      <Button
        variant="contained"
        color="primary"
        startIcon={<GoogleIcon />}
        onClick={promptGoogleSignIn}
        data-testid="signup-component"
      >
        Sign Up with Google
      </Button>
    </div>
  );
}

export default SignUp;
