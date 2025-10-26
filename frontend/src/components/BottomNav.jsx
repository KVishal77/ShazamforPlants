import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaPlusCircle, FaSearch, FaInfoCircle } from 'react-icons/fa';

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { icon: <FaHome />, to: '/dashboard', label: 'Home' },
    { icon: <FaPlusCircle />, to: '/new', label: 'Add' },
    { icon: <FaSearch />, to: '/search', label: 'Search' },
    { icon: <FaInfoCircle />, to: '/about', label: 'About' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 z-20">
      {items.map((item) => (
        <button
          key={item.to}
          onClick={() => navigate(item.to)}
          className={`flex flex-col items-center text-sm ${
            pathname === item.to ? 'text-green-700' : 'text-gray-500'
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}