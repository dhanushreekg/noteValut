import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PDFPreviewer from '../components/PDFPreviewer';
import { useAuth } from '../context/AuthContext';

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(false);

  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Unable to load Razorpay payment gateway.'));
      document.body.appendChild(script);
    });

  useEffect(() => {
    setLoading(true);
    api
      .get(`/notes/${id}`)
      .then((res) => setNote(res.data.data))
      .catch(() => setError('This note could not be found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/notes/${id}` } });
      return;
    }

    setBuying(true);
    setError('');

    try {
      const res = await api.post('/orders/checkout', { noteId: id });
      const { key, amount, currency, orderId, orderDbId, noteId, name, description, receipt, userEmail, userName } = res.data.data;

      await loadRazorpayScript();

      const options = {
        key,
        amount,
        currency,
        order_id: orderId,
        name,
        description,
        receipt,
        prefill: {
          name: userName || user?.name || 'Customer',
          email: userEmail || user?.email || '',
        },
        notes: {
          orderDbId,
          noteId,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => setBuying(false),
        },
        handler: async function (response) {
          try {
            await api.post('/orders/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderDbId,
              noteId,
            });
            navigate('/checkout/success');
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.message || 'Payment could not be verified. Please contact support.');
            setBuying(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start checkout. Please try again.');
      setBuying(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await api.get(`/orders/download/${id}`);
      window.open(res.data.data.downloadUrl, '_blank');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch your download link.');
    }
  };

  if (loading) return <p className="max-w-5xl mx-auto px-4 py-10 text-gray-500">Loading...</p>;
  if (error && !note) return <p className="max-w-5xl mx-auto px-4 py-10 text-red-500">{error}</p>;

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-5 gap-8">
      <div className="md:col-span-3">
        <PDFPreviewer previewUrl={note.previewFileUrl} pageCount={note.pageCount} />
      </div>

      <aside className="md:col-span-2 space-y-4">
        <span className="text-xs font-semibold text-brand-purple uppercase">{note.category}</span>
        <h1 className="text-2xl font-bold leading-snug">{note.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{note.description}</p>

        <dl className="text-sm grid grid-cols-2 gap-y-1 text-gray-500">
          <dt>Subject</dt>
          <dd className="text-gray-800 dark:text-gray-200">{note.subject}</dd>
          {note.branch && (
            <>
              <dt>Branch</dt>
              <dd className="text-gray-800 dark:text-gray-200">{note.branch}</dd>
            </>
          )}
          {note.semester && (
            <>
              <dt>Semester</dt>
              <dd className="text-gray-800 dark:text-gray-200">{note.semester}</dd>
            </>
          )}
          <dt>Sold by</dt>
          <dd className="text-gray-800 dark:text-gray-200">{note.seller?.name}</dd>
        </dl>

        <div className="glass-card p-4 flex items-center justify-between">
          <span className="text-2xl font-extrabold text-brand-blue">₹{note.price}</span>
          {note.alreadyPurchased ? (
            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
            >
              Download Full PDF
            </button>
          ) : (
            <button
              onClick={handleBuy}
              disabled={buying}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple text-white font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {buying ? 'Redirecting...' : 'Buy Now'}
            </button>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </aside>
    </main>
  );
}
