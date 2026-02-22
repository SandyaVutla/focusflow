import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Focus from './pages/Focus';
import Health from './pages/Health';
import Motivation from './pages/Motivation';
import Analytics from './pages/Analytics';
import Signup from './pages/Signup';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import './styles/global.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("[AUTH-DIAG] ProtectedRoute: No token found. Redirecting to /login");
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Auth Routes */}
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* Protected Routes Wrapper */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="focus" element={<Focus />} />
          <Route path="health" element={<Health />} />
          <Route path="motivation" element={<Motivation />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;