import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SellerRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user.role !== 'seller' && user.role !== 'admin') {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold">Sellers only</h1>
        <p className="text-gray-500 mt-2">
          This account is registered as a student. Create a seller account to upload notes.
        </p>
      </main>
    );
  }
  return children;
}
