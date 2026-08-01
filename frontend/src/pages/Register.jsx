import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="glass-card p-8">
        <h1 className="text-xl font-bold mb-6">Create your account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Full name"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
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
            minLength={8}
            placeholder="Password (min 8 characters)"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.role === 'student'}
                onChange={() => setForm({ ...form, role: 'student' })}
              />
              I'm a student (buy notes)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.role === 'seller'}
                onChange={() => setForm({ ...form, role: 'seller' })}
              />
              I'm a seller (sell notes)
            </label>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple text-white font-medium disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-brand-blue font-medium">Log in</Link>
        </p>
      </div>
    </main>
  );
}
