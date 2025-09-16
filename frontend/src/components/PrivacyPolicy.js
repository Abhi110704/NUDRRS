import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  Security,
  DataUsage,
  Visibility,
  Shield,
  Person,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Security sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
            Privacy Policy
          </Typography>
          <Typography variant="h6" color="text.secondary">
            National Urban Disaster Response and Reporting System (NUDRRS)
          </Typography>
          <Chip 
            label="Last Updated: September 16, 2025" 
            color="primary" 
            variant="outlined" 
            sx={{ mt: 2 }}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Introduction */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Introduction
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            At NUDRRS, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
            emergency reporting and disaster management platform.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            By using NUDRRS, you agree to the collection and use of information in accordance with this policy.
          </Typography>
        </Box>

        {/* Information We Collect */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Information We Collect
          </Typography>
          
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, mt: 3 }}>
            Personal Information
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Person color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Name and Contact Information"
                secondary="Full name, email address, phone number, and organization details"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><LocationOn color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Location Data"
                secondary="GPS coordinates and address information for emergency reporting"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><DataUsage color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Emergency Reports"
                secondary="Details about incidents, photos, videos, and other media you submit"
              />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, mt: 3 }}>
            Technical Information
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Visibility color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Device Information"
                secondary="IP address, browser type, device model, and operating system"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><DataUsage color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Usage Data"
                secondary="Pages visited, time spent, and interactions with the platform"
              />
            </ListItem>
          </List>
        </Box>

        {/* How We Use Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            How We Use Your Information
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Shield color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Emergency Response"
                secondary="To coordinate emergency services and disaster response efforts"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><DataUsage color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Platform Improvement"
                secondary="To analyze usage patterns and improve our services"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Email color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Communication"
                secondary="To send important updates, alerts, and notifications"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Security color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Security"
                secondary="To protect against fraud, abuse, and unauthorized access"
              />
            </ListItem>
          </List>
        </Box>

        {/* Data Sharing */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Information Sharing
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            We may share your information in the following circumstances:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Emergency Services"
                secondary="With police, fire departments, medical services, and other emergency responders"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Government Agencies"
                secondary="With relevant government departments for disaster management and public safety"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Legal Requirements"
                secondary="When required by law, court order, or to protect our rights and safety"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Consent"
                secondary="With your explicit consent for specific purposes"
              />
            </ListItem>
          </List>
        </Box>

        {/* Data Security */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Data Security
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            We implement industry-standard security measures to protect your information:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Shield color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Encryption"
                secondary="All data is encrypted in transit and at rest using AES-256 encryption"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Security color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Access Controls"
                secondary="Strict access controls and authentication mechanisms"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><DataUsage color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Regular Audits"
                secondary="Regular security audits and vulnerability assessments"
              />
            </ListItem>
          </List>
        </Box>

        {/* Your Rights */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Your Rights
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            You have the following rights regarding your personal information:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Access"
                secondary="Request access to your personal information"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Correction"
                secondary="Request correction of inaccurate information"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Deletion"
                secondary="Request deletion of your personal information (subject to legal requirements)"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Portability"
                secondary="Request a copy of your data in a portable format"
              />
            </ListItem>
          </List>
        </Box>

        {/* Contact Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Contact Us
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Email color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Email"
                secondary="privacy@nudrrs.gov.in"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Phone color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Phone"
                secondary="+91-11-2345-6789"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><LocationOn color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Address"
                secondary="NUDRRS Headquarters, New Delhi, India"
              />
            </ListItem>
          </List>
        </Box>

        {/* Changes to Policy */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Changes to This Policy
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy 
            Policy periodically for any changes.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;
