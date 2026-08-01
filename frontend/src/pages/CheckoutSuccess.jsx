import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

export default function CheckoutSuccess() {
  return (
    <main className="max-w-md mx-auto px-4 py-20 text-center">
      <FiCheckCircle className="mx-auto text-green-500" size={56} />
      <h1 className="text-2xl font-bold mt-4">Payment received!</h1>
      <p className="text-gray-500 mt-2">
        Your note will appear in "My Purchases" as soon as Razorpay confirms the payment
        (usually within a few seconds).
      </p>
      <Link
        to="/purchases"
        className="inline-block mt-6 px-5 py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple text-white font-medium"
      >
        Go to My Purchases
      </Link>
    </main>
  );
}
