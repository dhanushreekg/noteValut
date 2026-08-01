import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="glass-card p-8">
        <h1 className="text-xl font-bold mb-6">Log in to NoteNest</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple text-white font-medium disabled:opacity-60"
          >
            {submitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4">
          No account? <Link to="/register" className="text-brand-blue font-medium">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
