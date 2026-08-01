import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBookOpen, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand-blue">
          <FiBookOpen /> NoteNest
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-brand-purple transition">Browse Notes</Link>
          {user && user.role === 'student' && (
            <Link to="/purchases" className="hover:text-brand-purple transition">My Purchases</Link>
          )}
          {user && (user.role === 'seller' || user.role === 'admin') && (
            <>
              <Link to="/seller/dashboard" className="hover:text-brand-purple transition">Seller Dashboard</Link>
              <Link to="/seller/upload" className="hover:text-brand-purple transition">Upload Note</Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                <FiUser /> {user.name}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:opacity-90 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
