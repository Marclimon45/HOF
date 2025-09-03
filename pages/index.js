// pages/index.js
import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box,
} from "@mui/material";
import { auth, db } from "../firebase/firebaseconfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";

const LandingPage = () => {
  const router = useRouter();
  const [openLogin, setOpenLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginDetails, setLoginDetails] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseLogin = () => {
    setOpenLogin(false);
    setLoginDetails({ email: "", password: "" });
    setErrorMessage("");
    setSuccessMessage("");
    setIsSignUp(false);
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, loginDetails.email, loginDetails.password);
      setSuccessMessage("Login successful! Redirecting...");
      setTimeout(() => {
        router.push("/home");
      }, 1500);
    } catch (error) {
      console.error("Login failed:", error.code, error.message);
      setErrorMessage(`Login failed: ${error.message}`);
    }
  };

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        loginDetails.email,
        loginDetails.password
      );
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: loginDetails.email,
        contributionCount: 0,
        createdAt: new Date().toISOString(),
      });
      setSuccessMessage("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/home");
      }, 1500);
    } catch (error) {
      console.error("Signup failed:", error.code, error.message);
      setErrorMessage(`Signup failed: ${error.message}`);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginDetails.email) {
      setErrorMessage("Please enter your email address");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, loginDetails.email);
      setResetEmailSent(true);
      setSuccessMessage("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Password reset failed:", error);
      setErrorMessage(`Failed to send reset email: ${error.message}`);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff9f0",
        padding: "20px",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: "480px",
            margin: "0 auto",
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              fontWeight: 700,
              color: "#333",
              mb: 2,
              letterSpacing: "-0.5px",
            }}
          >
            CPX LAB
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              fontSize: { xs: "1rem", md: "1.1rem" },
              color: "#666",
              mb: 4,
              lineHeight: 1.5,
              maxWidth: "400px",
            }}
          >
            Focusing on ensuring the safety and reliability of cyber-physical systems
          </Typography>

          <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
            {/* SSO Button - Replaced with regular login functionality */}
            {/* <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => {
                setIsSignUp(false);
                setOpenLogin(true);
              }}
              sx={{
                backgroundColor: "#ffc107",
                color: "#000",
                padding: "12px 24px",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#ffb300",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                },
              }}
            >
              Log In (Regular Login)
            </Button> */}

            {/* Regular Log In Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => {
                setIsSignUp(false);
                setOpenLogin(true);
              }}
              sx={{
                backgroundColor: "#ffc107",
                color: "#000",
                padding: "12px 24px",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#ffb300",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                },
              }}
            >
              Log In
            </Button>

            <Link href="/register" passHref>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                sx={{
                  color: "#666",
                  borderColor: "#666",
                  padding: "12px 24px",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "rgba(102,102,102,0.04)",
                    borderColor: "#666",
                  },
                }}
              >
                Sign Up
              </Button>
            </Link>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: "#666",
              mb: 2,
              "& a": {
                color: "#1976d2",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              },
            }}
          >
            By logging in, you agree to our{" "}
            <a href="/terms-of-service">Terms of Service</a> and{" "}
            <a href="/privacy-policy">Privacy Policy</a>
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#999",
              fontSize: "0.875rem",
            }}
          >
            © 2024 California State University Long Beach
          </Typography>
        </Box>
      </Container>

      <Dialog open={openLogin} onClose={handleCloseLogin} maxWidth="sm" fullWidth>
        <DialogTitle>{isSignUp ? "Create Account" : "Log In"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={loginDetails.email}
            onChange={handleLoginInputChange}
            variant="outlined"
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            value={loginDetails.password}
            onChange={handleLoginInputChange}
            variant="outlined"
          />
          <Box sx={{ mt: 1, textAlign: 'right', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              onClick={() => window.location.href = 'mailto:cpxlab.csulb@gmail.com?subject=Forgot%20Email%20-%20Account%20Recovery'}
              sx={{ 
                textTransform: 'none',
                color: 'text.secondary',
                fontSize: '0.875rem'
              }}
            >
              Forgot Email?
            </Button>
            <Button
              onClick={handleForgotPassword}
              sx={{ textTransform: 'none' }}
            >
              Forgot Password?
            </Button>
          </Box>
          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage("")} sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" onClose={() => setSuccessMessage("")} sx={{ mt: 2 }}>
              {successMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLogin}>Cancel</Button>
          <Button onClick={isSignUp ? handleSignup : handleLogin} variant="contained">
            {isSignUp ? "Sign Up" : "Log In"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LandingPage;