import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import NoteCard from '../components/NoteCard';

const CATEGORIES = ['All', 'Engineering', 'Medical', 'Commerce', 'Computer Science', 'Other'];

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    api
      .get('/notes', {
        params: {
          q: query || undefined,
          category: category !== 'All' ? category : undefined,
          page: meta.page,
        },
        signal: controller.signal,
      })
      .then((res) => {
        setNotes(res.data.data);
        setMeta(res.data.meta);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError') setError('Could not load notes right now.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, meta.page]);

  return (
    <main>
      <section className="bg-gradient-to-br from-brand-blue to-brand-purple text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Learn Smarter with Premium Study Notes
          </h1>
          <p className="mt-4 text-white/80 max-w-xl mx-auto">
            Preview before you buy. Curated notes from top students and educators across every branch.
          </p>
          <div className="mt-8 max-w-xl mx-auto">
            <input
              value={query}
              onChange={(e) => {
                setMeta((m) => ({ ...m, page: 1 }));
                setQuery(e.target.value);
              }}
              placeholder="Search by title, subject, or tag..."
              className="w-full rounded-full px-5 py-3 text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                category === c
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-500">Loading notes...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && notes.length === 0 && (
          <p className="text-gray-500">No notes match your search yet.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>

        {meta.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setMeta((m) => ({ ...m, page: p }))}
                className={`w-9 h-9 rounded-lg text-sm ${
                  p === meta.page
                    ? 'bg-brand-blue text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
