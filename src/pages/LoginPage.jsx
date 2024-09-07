import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { supabase } from '../supabaseClient';

const LoginPage = ({ setIsAuthenticated }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('users')
        .select('encrypted_password, role, id')
        .eq('mobile_number', credentials.username) // Use mobile number for login
        .single();

      if (error || !data) {
        throw new Error('Invalid mobile number or password');
      }

      const isPasswordValid = bcrypt.compareSync(credentials.password, data.encrypted_password);
      if (isPasswordValid) {
        // Save user data to local storage
        const userData = { username: credentials.username, role: data.role, id: data.id };
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        navigate('/'); // Redirect to the home page
      } else {
        throw new Error('Invalid mobile number or password');
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <InputField
            type="text"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleInputChange}
            label="Mobile Number"
          />
          <InputField
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            label="Password"
          />
          <button type="submit" className="w-full bg-blue-600 text-white rounded-md py-2" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <CustomAlert message={error} />}
      </div>
    </div>
  );
};

const InputField = ({ type, id, name, value, onChange, label }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required
      className="w-full px-4 py-2 bg-gray-50 border rounded-md"
    />
  </div>
);

const CustomAlert = ({ message }) => (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mt-4">
    <p>{message}</p>
  </div>
);

export default LoginPage;
