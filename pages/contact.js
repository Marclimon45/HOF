import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Stack,
  Link as MuiLink
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import styles from '../styles/contact.module.css';
import Navbar from '../components/navbar';

const ContactPage = () => {
  const handleEmailClick = () => {
    window.location.href = 'mailto:marclim45@yahoo.com?subject=Hall of Fame Support Request';
  };

  return (
    <Box className={styles.container}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ p: 4, borderRadius: 2 }}>
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" gutterBottom>
              Contact Us
            </Typography>
            
            <Typography variant="body1" textAlign="center" color="text.secondary">
              Need help or have questions? We're here to assist you. 
              Click the button below to send us an email, and we'll get back to you as soon as possible.
            </Typography>

            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<EmailIcon />}
              onClick={handleEmailClick}
              sx={{ mt: 2 }}
            >
              Send Email
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Our support team typically responds within 24-48 hours.
            </Typography>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

export default ContactPage; 