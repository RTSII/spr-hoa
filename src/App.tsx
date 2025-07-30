import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import InviteRequest from './pages/auth/InviteRequest';

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
