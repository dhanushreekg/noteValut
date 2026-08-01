import React from 'react';
import { Link } from 'react-router-dom';
import { FiTag } from 'react-icons/fi';

export default function NoteCard({ note }) {
  return (
    <Link
      to={`/notes/${note._id}`}
      className="glass-card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col"
    >
      <img
        src={note.coverImageUrl}
        alt={note.title}
        className="h-40 w-full object-cover"
        loading="lazy"
      />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs font-medium text-brand-purple">{note.category}</span>
        <h3 className="font-semibold leading-snug line-clamp-2">{note.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <FiTag size={12} /> {note.subject}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-brand-blue">₹{note.price}</span>
          {note.seller?.name && (
            <span className="text-xs text-gray-400">by {note.seller.name}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
