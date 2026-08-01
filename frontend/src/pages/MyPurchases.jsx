import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function MyPurchases() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders/mine')
      .then((res) => setOrders(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (noteId) => {
    const res = await api.get(`/orders/download/${noteId}`);
    window.open(res.data.data.downloadUrl, '_blank');
  };

  if (loading) return <p className="max-w-4xl mx-auto px-4 py-10 text-gray-500">Loading...</p>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My Purchases</h1>
      {orders.length === 0 && (
        <p className="text-gray-500">
          You haven't purchased any notes yet. <Link to="/" className="text-brand-blue">Browse notes</Link>
        </p>
      )}
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order._id} className="glass-card p-4 flex items-center gap-4">
            <img src={order.note.coverImageUrl} alt={order.note.title} className="w-16 h-16 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-semibold">{order.note.title}</h3>
              <p className="text-xs text-gray-500">{order.note.subject} · ₹{order.amount}</p>
            </div>
            <button
              onClick={() => handleDownload(order.note._id)}
              className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
