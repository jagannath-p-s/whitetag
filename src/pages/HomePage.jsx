import React, { useEffect, useState } from 'react';
import AdminHome from './components/AdminHome';
import UserHome from './components/UserHome';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = () => {
      // Get user data from localStorage
      const userData = localStorage.getItem('user');

      if (userData) {
        const parsedUserData = JSON.parse(userData);
        setUserRole(parsedUserData.role); // Set the user's role from localStorage
      } else {
        navigate('/login'); // Redirect to login if user data is not found in localStorage
      }

      setLoading(false); // Stop loading after session check
    };

    checkSession(); // Check for session from localStorage
  }, [navigate]);

  // Render loading state until userRole is set
  if (loading) return <div>Loading...</div>;

  // Render components based on user role
  return (
    <div>
      {userRole === 'admin' ? <AdminHome userRole={userRole} /> : <UserHome userRole={userRole} />}
    </div>
  );
};

export default HomePage;
