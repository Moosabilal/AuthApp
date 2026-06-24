import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import ForgotPasswordPage from '@/pages/ForgotPassword';
import ResetPasswordPage from '@/pages/ResetPassword';
import AuthScene from '@/components/AuthScene';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      
      <Route path="/login"  element={<AuthScene routeKey="login"><LoginPage /></AuthScene>} />
      <Route path="/signup" element={<AuthScene routeKey="signup"><SignupPage /></AuthScene>} />
      <Route path="/forgot-password" element={<AuthScene routeKey="forgot-password"><ForgotPasswordPage /></AuthScene>} />
      <Route path="/reset-password/:token" element={<AuthScene routeKey="reset-password"><ResetPasswordPage /></AuthScene>} />

      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      
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
