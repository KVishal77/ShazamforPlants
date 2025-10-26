// src/components/Layout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  // ⚠️ Firebase हटाया: user ko localStorage se read करेंगे (optional)
  const userEmail = typeof window !== 'undefined'
    ? localStorage.getItem('userEmail') || localStorage.getItem('email') || ''
    : '';

  const isLoggedIn = Boolean(userEmail);

  const handleLogout = () => {
    // Yahan future me backend logout call kar sakte ho.
    // Abhi ke liye local storage clear + redirect to /login
    try {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('email');
      localStorage.removeItem('token');
      localStorage.removeItem('auth');
    } catch (_) {}
    navigate('/login');
  };

  const getUserInitials = (email) => {
    return email ? email.slice(0, 2).toUpperCase() : '';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Green Header (UI same) */}
      <header className="bg-green-600 text-white flex justify-between items-center p-4 shadow">
        <h1 className="text-xl font-bold flex items-center">
          Rooted
        </h1>

        {isLoggedIn && (
          <div className="flex items-center space-x-4">
            <span className="bg-white text-green-600 font-semibold px-3 py-1 rounded-full">
              {getUserInitials(userEmail)}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white text-green-600 px-3 py-1 rounded hover:bg-red-500 hover:text-white"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1 p-4">{children}</main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Layout;