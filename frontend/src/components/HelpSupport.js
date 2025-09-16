import React, { useState } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Help,
  ExpandMore,
  Phone,
  Email,
  LocationOn,
  QuestionAnswer,
  BugReport,
  Security,
  Speed,
  Report,
  AccountCircle,
  Settings,
  Map,
  Analytics
} from '@mui/icons-material';

const HelpSupport = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your message. We will get back to you within 24 hours.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const faqs = [
    {
      question: "How do I report an emergency?",
      answer: "Click on the 'Create Report' button, fill in the emergency details, add photos if available, and submit. Your report will be immediately sent to emergency responders."
    },
    {
      question: "How long does it take for emergency services to respond?",
      answer: "Response times vary based on location and severity. Critical emergencies are prioritized and typically receive response within minutes. You can track your report status in real-time."
    },
    {
      question: "Can I edit or delete my reports?",
      answer: "You can edit your reports if they haven't been processed by emergency services. Once processed, reports become part of the official record and cannot be deleted."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your data. Only authorized emergency responders and officials can access your information."
    },
    {
      question: "What should I do if the app is not working?",
      answer: "Try refreshing the page, clearing your browser cache, or using a different browser. If the problem persists, contact our technical support team immediately."
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to your Profile page, click 'Edit Profile', make your changes, and save. Keep your contact information updated for better emergency response coordination."
    }
  ];

  const supportCategories = [
    {
      title: "Technical Support",
      description: "App issues, login problems, technical difficulties",
      icon: <Settings />,
      color: "primary"
    },
    {
      title: "Emergency Reporting",
      description: "How to report emergencies, status updates, response times",
      icon: <Report />,
      color: "error"
    },
    {
      title: "Account Management",
      description: "Profile updates, password reset, account settings",
      icon: <AccountCircle />,
      color: "info"
    },
    {
      title: "Data & Privacy",
      description: "Privacy concerns, data requests, security questions",
      icon: <Security />,
      color: "warning"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Help sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
            Help & Support
          </Typography>
          <Typography variant="h6" color="text.secondary">
            National Urban Disaster Response and Reporting System (NUDRRS)
          </Typography>
          <Chip 
            label="24/7 Emergency Support Available" 
            color="error" 
            variant="outlined" 
            sx={{ mt: 2 }}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Emergency Notice */}
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            🚨 Emergency Notice
          </Typography>
          <Typography variant="body1">
            For immediate life-threatening emergencies, call emergency services directly: <strong>100 (Police), 101 (Fire), 102 (Ambulance)</strong>
          </Typography>
        </Alert>

        {/* Support Categories */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
            Support Categories
          </Typography>
          <Grid container spacing={3}>
            {supportCategories.map((category, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent>
                    <Box sx={{ color: `${category.color}.main`, mb: 2 }}>
                      {category.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Report />}
                sx={{ py: 2 }}
                href="/reports"
              >
                Report Emergency
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Map />}
                sx={{ py: 2 }}
                href="/map"
              >
                View Map
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Analytics />}
                sx={{ py: 2 }}
                href="/analytics"
              >
                View Analytics
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AccountCircle />}
                sx={{ py: 2 }}
                href="/profile"
              >
                My Profile
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* FAQ Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, index) => (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Contact Form */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
            Contact Support
          </Typography>
          <Paper elevation={1} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    multiline
                    rows={4}
                    value={contactForm.message}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Email />}
                    sx={{ px: 4 }}
                  >
                    Send Message
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>

        {/* Contact Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
            Contact Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Phone sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Phone Support
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    +91-11-2345-6789
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available 24/7 for emergencies
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Email sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Email Support
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    support@nudrrs.gov.in
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Response within 24 hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <LocationOn sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Office Location
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    New Delhi, India
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    NUDRRS Headquarters
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* System Status */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
            System Status
          </Typography>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              ✅ All Systems Operational
            </Typography>
            <Typography variant="body1">
              NUDRRS is currently running normally. All emergency reporting features are available.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date().toLocaleString()}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default HelpSupport;
