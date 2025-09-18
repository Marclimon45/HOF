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
        backgroundColor: "var(--color-white)",
        padding: "var(--space-21)",
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
            gap: "var(--space-34)",
          }}
        >
          {/* Main heading with Area 17 typography */}
          <Box sx={{ marginBottom: "var(--space-55)" }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: "var(--text-3xl)", md: "var(--text-4xl)" },
                fontWeight: 600,
                color: "var(--color-gray-900)",
                letterSpacing: "-0.025em",
                marginBottom: "var(--space-21)",
              }}
            >
              CPX LAB
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "var(--text-base)", md: "var(--text-lg)" },
                color: "var(--color-gray-600)",
                lineHeight: "var(--leading-relaxed)",
                maxWidth: "400px",
                margin: "0 auto",
              }}
            >
              Focusing on ensuring the safety and reliability of cyber-physical systems
            </Typography>
          </Box>

          {/* Action buttons with minimal styling */}
          <Box sx={{ 
            width: "100%", 
            display: "flex", 
            flexDirection: "column", 
            gap: "var(--space-13)",
            maxWidth: "320px"
          }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => {
                setIsSignUp(false);
                setOpenLogin(true);
              }}
              sx={{
                padding: "var(--space-13) var(--space-34)",
                fontSize: "var(--text-base)",
                fontWeight: 500,
              }}
            >
              Sign in with Single Sign-On
            </Button>

            <Link href="/register" passHref>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                sx={{
                  padding: "var(--space-13) var(--space-34)",
                  fontSize: "var(--text-base)",
                  fontWeight: 500,
                }}
              >
                Sign Up
              </Button>
            </Link>
          </Box>

          {/* Footer information with minimal typography */}
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "var(--space-13)",
            alignItems: "center",
            marginTop: "var(--space-34)"
          }}>
            <Typography
              variant="body2"
              sx={{
                color: "var(--color-gray-500)",
                fontSize: "var(--text-sm)",
                "& a": {
                  color: "var(--color-gray-900)",
                  textDecoration: "none",
                  borderBottom: "1px solid transparent",
                  transition: "border-color var(--transition-fast)",
                  "&:hover": {
                    borderColor: "var(--color-gray-400)",
                  },
                },
              }}
            >
              By signing in, you agree to our{" "}
              <a href="/terms-of-service">Terms of Service</a> and{" "}
              <a href="/privacy-policy">Privacy Policy</a>
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "var(--color-gray-400)",
                fontSize: "var(--text-xs)",
                letterSpacing: "0.025em",
              }}
            >
              © 2024 California State University Long Beach
            </Typography>
          </Box>
        </Box>
      </Container>

      <Dialog 
        open={openLogin} 
        onClose={handleCloseLogin} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "var(--space-8)",
            padding: "var(--space-21)",
            border: "1px solid var(--color-gray-200)",
          }
        }}
      >
        <DialogTitle sx={{
          fontSize: "var(--text-xl)",
          fontWeight: 500,
          color: "var(--color-gray-900)",
          padding: "0 0 var(--space-21) 0",
          borderBottom: "1px solid var(--color-gray-200)",
          marginBottom: "var(--space-21)"
        }}>
          {isSignUp ? "Create Account" : "Sign In"}
        </DialogTitle>
        <DialogContent sx={{ padding: 0 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "var(--space-21)" }}>
            <TextField
              autoFocus
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={loginDetails.email}
              onChange={handleLoginInputChange}
              variant="outlined"
              sx={{
                "& .MuiInputLabel-root": {
                  color: "var(--color-gray-500)",
                  fontSize: "var(--text-sm)",
                },
                "& .MuiInputBase-input": {
                  fontSize: "var(--text-base)",
                  padding: "var(--space-13) var(--space-21)",
                },
              }}
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              fullWidth
              value={loginDetails.password}
              onChange={handleLoginInputChange}
              variant="outlined"
              sx={{
                "& .MuiInputLabel-root": {
                  color: "var(--color-gray-500)",
                  fontSize: "var(--text-sm)",
                },
                "& .MuiInputBase-input": {
                  fontSize: "var(--text-base)",
                  padding: "var(--space-13) var(--space-21)",
                },
              }}
            />
          </Box>
          
          <Box sx={{ 
            marginTop: "var(--space-13)", 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Button
              onClick={() => window.location.href = 'mailto:cpxlab.csulb@gmail.com?subject=Forgot%20Email%20-%20Account%20Recovery'}
              sx={{ 
                color: 'var(--color-gray-500)',
                fontSize: 'var(--text-sm)',
                padding: "var(--space-5) var(--space-8)",
              }}
            >
              Forgot Email?
            </Button>
            <Button
              onClick={handleForgotPassword}
              sx={{ 
                color: 'var(--color-gray-900)',
                fontSize: 'var(--text-sm)',
                padding: "var(--space-5) var(--space-8)",
              }}
            >
              Forgot Password?
            </Button>
          </Box>
          
          {errorMessage && (
            <Alert 
              severity="error" 
              onClose={() => setErrorMessage("")} 
              sx={{ 
                marginTop: "var(--space-21)",
                borderRadius: "var(--space-5)",
                border: "1px solid var(--color-gray-200)",
              }}
            >
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert 
              severity="success" 
              onClose={() => setSuccessMessage("")} 
              sx={{ 
                marginTop: "var(--space-21)",
                borderRadius: "var(--space-5)",
                border: "1px solid var(--color-gray-200)",
              }}
            >
              {successMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          padding: "var(--space-21) 0 0 0",
          gap: "var(--space-13)",
          borderTop: "1px solid var(--color-gray-200)",
          marginTop: "var(--space-21)"
        }}>
          <Button 
            onClick={handleCloseLogin}
            variant="outlined"
            sx={{
              padding: "var(--space-8) var(--space-21)",
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={isSignUp ? handleSignup : handleLogin} 
            variant="contained"
            sx={{
              padding: "var(--space-8) var(--space-21)",
            }}
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LandingPage;