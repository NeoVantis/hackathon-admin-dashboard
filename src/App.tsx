
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './components/theme-provider';
import ProtectedRoute from './components/ProtectedRoute';
import SendEmail from './components/SendEmail';
import NewLayout from './components/NewLayout';
import Login from './components/Login';

const App: React.FC = () => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route 
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <NewLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/send-email"
              element={
                <ProtectedRoute>
                  <SendEmail />
                </ProtectedRoute>
              }
            />
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
