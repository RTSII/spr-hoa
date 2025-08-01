import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login'; // Corrected import path for Login component
import Register from './pages/Register'; // Corrected import path for Register component
import InviteRequest from './pages/InviteRequest'; // Corrected import path for InviteRequest component

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/invite-request" element={<InviteRequest />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/forgot-password" element={<div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Forgot password page coming soon...</p></div>} />
          <Route path="/dashboard" element={<div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Welcome to your dashboard!</p></div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
