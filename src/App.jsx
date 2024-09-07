import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './pages/PrivateRoute';
import HomePage from './pages/HomePage';
import PetProfilePage from './pages/PetProfilePage'; // Assuming you have this component

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Check if a user exists in localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setIsAuthenticated(true); // If any user exists, consider authenticated
    }
    setLoading(false); // Stop loading once authentication is checked
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking authentication
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/petprofile/:petusername" element={<PetProfilePage />} /> {/* Public Route */}

        {/* Protected Routes */}
        <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Redirect all unknown routes */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;
