const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000,
    },
    subject: { type: String, required: true, trim: true },
    branch: { type: String, trim: true },
    semester: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Engineering', 'Medical', 'Commerce', 'Computer Science', 'Other'],
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    coverImageUrl: { type: String, required: true },
    // Full file is kept private; only served after purchase via a signed/controlled route
    fullFileKey: { type: String, required: true },
    // Publicly viewable preview (first N pages), generated server-side
    previewFileUrl: { type: String, required: true },
    pageCount: { type: Number },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // MVP: auto-approve; wire to admin moderation later
    },
    salesCount: { type: Number, default: 0 },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

noteSchema.index({ title: 'text', description: 'text', tags: 'text', subject: 'text' });

module.exports = mongoose.model('Note', noteSchema);
