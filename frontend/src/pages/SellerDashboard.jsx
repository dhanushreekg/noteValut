import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiTrendingUp } from 'react-icons/fi';
import api from '../api/axios';

export default function SellerDashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotes = () => {
    setLoading(true);
    api
      .get('/notes/mine')
      .then((res) => setNotes(res.data.data))
      .catch(() => setError('Could not load your notes.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadNotes, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note permanently? This cannot be undone.')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this note.');
    }
  };

  const totalEarnings = notes.reduce((sum, n) => sum + n.salesCount * n.price, 0);
  const totalSales = notes.reduce((sum, n) => sum + n.salesCount, 0);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <Link
          to="/seller/upload"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple text-white text-sm font-medium"
        >
          <FiPlus /> Upload Note
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500">Notes Published</p>
          <p className="text-2xl font-bold">{notes.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold">{totalSales}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1"><FiTrendingUp /> Estimated Earnings</p>
          <p className="text-2xl font-bold text-brand-blue">₹{totalEarnings}</p>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-500">Loading your notes...</p>}

      {!loading && notes.length === 0 && (
        <p className="text-gray-500">
          You haven't uploaded any notes yet.{' '}
          <Link to="/seller/upload" className="text-brand-blue font-medium">Upload your first one</Link>.
        </p>
      )}

      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note._id} className="glass-card p-4 flex items-center gap-4">
            <img src={note.coverImageUrl} alt={note.title} className="w-16 h-16 object-cover rounded-lg" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{note.title}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    note.status === 'approved'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                      : note.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                  }`}
                >
                  {note.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {note.subject} · ₹{note.price} · {note.salesCount} sale{note.salesCount === 1 ? '' : 's'}
              </p>
            </div>
            <button
              onClick={() => handleDelete(note._id)}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              title="Delete note"
            >
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
