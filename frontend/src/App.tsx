import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import AuthScene from '@/components/AuthScene';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      {/* Public routes wrapped in the 3D AuthScene */}
      <Route path="/login"  element={<AuthScene routeKey="login"><LoginPage /></AuthScene>} />
      <Route path="/signup" element={<AuthScene routeKey="signup"><SignupPage /></AuthScene>} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
