import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = ['Engineering', 'Medical', 'Commerce', 'Computer Science', 'Other'];

const initialForm = {
  title: '',
  description: '',
  subject: '',
  branch: '',
  semester: '',
  category: 'Computer Science',
  price: '',
  tags: '',
};

export default function UploadNote() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [cover, setCover] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!cover || !pdf) {
      setError('Please attach both a cover image and a PDF file.');
      return;
    }
    if (Number(form.price) < 0 || form.price === '') {
      setError('Please enter a valid price (0 or more).');
      return;
    }

    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    body.append('cover', cover);
    body.append('pdf', pdf);

    setSubmitting(true);
    try {
      // Do not set Content-Type manually - the browser needs to add the multipart boundary itself.
      await api.post('/notes', body);
      navigate('/seller/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please check your files and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Upload a New Note</h1>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            required
            value={form.title}
            onChange={update('title')}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2"
            placeholder="e.g. Data Structures & Algorithms - Complete Notes"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={update('description')}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2"
            placeholder="What's covered, why it's useful, format, etc."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Subject</label>
            <input
              required
              value={form.subject}
              onChange={update('subject')}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2"
              placeholder="e.g. Algorithms"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              value={form.category}
              onChange={update('category')}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Branch (optional)</label>
            <input
              value={form.branch}
              onChange={update('branch')}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2"
              placeholder="e.g. CSE"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Semester (optional)</label>
            <input
              value={form.semester}
              onChange={update('semester')}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2"
              placeholder="e.g. 5th"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Price (₹)</label>
            <input
              required
              type="number"
              min="0"
              value={form.price}
              onChange={update('price')}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2"
              placeholder="e.g. 99"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tags (comma-separated)</label>
            <input
              value={form.tags}
              onChange={update('tags')}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2"
              placeholder="dsa, trees, exam-prep"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Cover image</label>
            <input
              required
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setCover(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Full PDF</label>
            <input
              required
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdf(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500">
          The first few pages of your PDF become a free, watermarked preview automatically.
          The rest stays locked until a student pays.
        </p>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple text-white font-medium disabled:opacity-60"
        >
          {submitting ? 'Uploading...' : 'Publish Note'}
        </button>
      </form>
    </main>
  );
}
