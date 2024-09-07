// src/components/AdminHome.jsx
import React from 'react';

const AdminHome = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome, Admin!</h1>
      <div className="text-xl text-gray-700 mb-4">
        You have admin privileges. Manage the system here.
      </div>
      {/* Add more admin-specific content here */}
    </div>
  );
};

export default AdminHome;
