import React, { useEffect } from "react";
import Button from "@mui/material/Button";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { Box } from "@mui/material";

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
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: { xs: "100vh", sm: "100vh" },
        p: 2,
      }}
    >
      <Button
        variant="contained"
        color="primary"
        startIcon={<GoogleIcon />}
        onClick={promptGoogleSignIn}
        data-testid="signup-component"
        sx={{
          fontSize: { xs: "14px", sm: "16px" },
          padding: { xs: "8px 16px", sm: "10px 24px" },
        }}
      >
        Sign Up with Google
      </Button>
    </Box>
  );
}

export default SignUp;
