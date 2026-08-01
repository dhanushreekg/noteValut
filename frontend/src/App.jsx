import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import SellerRoute from './components/SellerRoute';
import Home from './pages/Home';
import NoteDetail from './pages/NoteDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPurchases from './pages/MyPurchases';
import CheckoutSuccess from './pages/CheckoutSuccess';
import SellerDashboard from './pages/SellerDashboard';
import UploadNote from './pages/UploadNote';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notes/:id" element={<NoteDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <MyPurchases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/dashboard"
            element={
              <SellerRoute>
                <SellerDashboard />
              </SellerRoute>
            }
          />
          <Route
            path="/seller/upload"
            element={
              <SellerRoute>
                <UploadNote />
              </SellerRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
