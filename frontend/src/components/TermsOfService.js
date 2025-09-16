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
  Chip,
  Alert
} from '@mui/material';
import {
  Gavel,
  Warning,
  CheckCircle,
  Cancel,
  Security,
  Report,
  Phone,
  Email,
  LocationOn
} from '@mui/icons-material';

const TermsOfService = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Gavel sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
            Terms of Service
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

        {/* Important Notice */}
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Important Notice
          </Typography>
          <Typography variant="body1">
            NUDRRS is a critical emergency response system. Misuse of this platform may result in legal consequences 
            and immediate account termination. Please use this service responsibly and only for legitimate emergency reporting.
          </Typography>
        </Alert>

        {/* Acceptance of Terms */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Acceptance of Terms
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            By accessing and using the National Urban Disaster Response and Reporting System (NUDRRS), you accept and 
            agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, 
            please do not use this service.
          </Typography>
        </Box>

        {/* Service Description */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Service Description
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            NUDRRS is a government-operated emergency reporting and disaster management platform that allows users to:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Report Emergencies"
                secondary="Submit real-time emergency reports with location, photos, and detailed descriptions"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Track Incidents"
                secondary="Monitor the status of reported emergencies and response efforts"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Access Information"
                secondary="View emergency alerts, safety information, and disaster preparedness resources"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Community Engagement"
                secondary="Participate in community safety initiatives and emergency response coordination"
              />
            </ListItem>
          </List>
        </Box>

        {/* User Responsibilities */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            User Responsibilities
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            As a user of NUDRRS, you agree to:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Accurate Reporting"
                secondary="Provide truthful, accurate, and complete information in all reports"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Legitimate Use"
                secondary="Use the platform only for legitimate emergency reporting and safety purposes"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Respectful Communication"
                secondary="Maintain respectful and professional communication with other users and officials"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Account Security"
                secondary="Maintain the security of your account credentials and report any unauthorized access"
              />
            </ListItem>
          </List>
        </Box>

        {/* Prohibited Activities */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Prohibited Activities
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            The following activities are strictly prohibited and may result in immediate account termination:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Cancel color="error" /></ListItemIcon>
              <ListItemText 
                primary="False Reports"
                secondary="Submitting false, misleading, or fraudulent emergency reports"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Cancel color="error" /></ListItemIcon>
              <ListItemText 
                primary="Spam or Abuse"
                secondary="Using the platform for spam, harassment, or any form of abuse"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Cancel color="error" /></ListItemIcon>
              <ListItemText 
                primary="Unauthorized Access"
                secondary="Attempting to gain unauthorized access to the system or other users' accounts"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Cancel color="error" /></ListItemIcon>
              <ListItemText 
                primary="Illegal Content"
                secondary="Posting or sharing illegal, harmful, or inappropriate content"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Cancel color="error" /></ListItemIcon>
              <ListItemText 
                primary="System Interference"
                secondary="Attempting to disrupt, damage, or interfere with the platform's operation"
              />
            </ListItem>
          </List>
        </Box>

        {/* Emergency Response */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Emergency Response
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            NUDRRS is designed to facilitate rapid emergency response. By using this platform, you understand that:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Response Time"
                secondary="Emergency response times may vary based on location, severity, and available resources"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="System Limitations"
                secondary="The platform may experience downtime or technical issues that could affect emergency reporting"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Alternative Contact"
                secondary="In case of immediate life-threatening emergencies, contact emergency services directly"
              />
            </ListItem>
          </List>
        </Box>

        {/* Privacy and Data */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Privacy and Data Protection
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, 
            and protect your information. By using NUDRRS, you consent to the collection and use of information 
            as described in our Privacy Policy.
          </Typography>
        </Box>

        {/* Limitation of Liability */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Limitation of Liability
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            To the maximum extent permitted by law, NUDRRS and its operators shall not be liable for any direct, 
            indirect, incidental, special, or consequential damages resulting from:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="System Downtime"
                secondary="Any interruption or cessation of service"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Data Loss"
                secondary="Loss of data or information transmitted through the platform"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Emergency Response"
                secondary="Delays or failures in emergency response coordination"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Third-Party Actions"
                secondary="Actions or omissions of emergency responders or third parties"
              />
            </ListItem>
          </List>
        </Box>

        {/* Termination */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Account Termination
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            We reserve the right to terminate or suspend your account at any time, with or without notice, for 
            violation of these terms or for any other reason at our sole discretion. Upon termination:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Access Revocation"
                secondary="Your right to use the platform will immediately cease"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Data Retention"
                secondary="We may retain your data as required by law or for legitimate business purposes"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="No Refund"
                secondary="No refunds will be provided for any unused portion of the service"
              />
            </ListItem>
          </List>
        </Box>

        {/* Contact Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Contact Information
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
            For questions about these Terms of Service, please contact us:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Email color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Email"
                secondary="legal@nudrrs.gov.in"
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
                secondary="NUDRRS Legal Department, New Delhi, India"
              />
            </ListItem>
          </List>
        </Box>

        {/* Changes to Terms */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            Changes to Terms
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            We reserve the right to modify these terms at any time. We will notify users of any material changes 
            through the platform or via email. Your continued use of NUDRRS after such modifications constitutes 
            acceptance of the updated terms.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfService;
