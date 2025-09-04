import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import SOSReport from './pages/SOSReport';
import DisasterMap from './pages/DisasterMap';
import ResourceAllocation from './pages/ResourceAllocation';
import Chatbot from './pages/Chatbot';
import EmergencyContacts from './pages/EmergencyContacts';
import AdminPanel from './pages/AdminPanel';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sos" element={<SOSReport />} />
            <Route path="/map" element={<DisasterMap />} />
            <Route path="/resources" element={<ResourceAllocation />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/contacts" element={<EmergencyContacts />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;