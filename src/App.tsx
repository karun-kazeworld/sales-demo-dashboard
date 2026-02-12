import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { SupervisorDashboard } from './components/dashboard/SupervisorDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { LoginForm } from './components/auth/LoginForm';
import './App.css';

function AppRoutes() {
  const { user, profile, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3F51B5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div>Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Connection Error</h2>
        <p>{error}</p>
        <p>Please check your database connection.</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3F51B5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  // Show loading if user exists but profile is still loading
  if (!profile) {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3F51B5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div>Loading Profile...</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          profile.role === 'admin' ? 
            <AdminDashboard /> :
          profile.role === 'supervisor' ? 
            <SupervisorDashboard /> : 
            <ExecutiveDashboard />
        } 
      />
      <Route 
        path="/executive" 
        element={
          profile.role === 'executive' ? 
            <ExecutiveDashboard /> : 
            <Navigate to="/" />
        } 
      />
      <Route 
        path="/supervisor" 
        element={
          profile.role === 'supervisor' ? 
            <SupervisorDashboard /> : 
            <Navigate to="/" />
        } 
      />
      <Route 
        path="/admin" 
        element={
          profile.role === 'admin' ? 
            <AdminDashboard /> : 
            <Navigate to="/" />
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
