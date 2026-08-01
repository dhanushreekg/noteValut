const asyncHandler = require('express-async-handler');
const Note = require('../models/Note');
const { uploadBuffer } = require('../utils/cloudinaryUpload');
const { buildPreviewPdf } = require('../utils/pdfPreview');

// @desc    Seller uploads a new note (cover image + full PDF)
// @route   POST /api/notes
// @access  Private (seller)
const createNote = asyncHandler(async (req, res) => {
  const { title, description, subject, branch, semester, category, price, tags } = req.body;

  if (!title || !description || !subject || !category || price === undefined) {
    res.status(400);
    throw new Error('title, description, subject, category, and price are required');
  }

  if (Number(price) < 0) {
    res.status(400);
    throw new Error('Price cannot be negative');
  }

  const coverFile = req.files?.cover?.[0];
  const pdfFile = req.files?.pdf?.[0];

  if (!coverFile || !pdfFile) {
    res.status(400);
    throw new Error('Both a cover image ("cover") and a PDF ("pdf") are required');
  }

  // 1. Full PDF -> private/raw storage (never returned directly to unauthenticated clients)
  const fullUpload = await uploadBuffer(pdfFile.buffer, {
    resource_type: 'raw',
    folder: 'notenest/full',
    type: 'authenticated', // requires a signed URL to access
  });

  // 2. Generate a trimmed, watermarked preview and store it publicly
  const { previewBuffer, totalPages } = await buildPreviewPdf(pdfFile.buffer);
  const previewUpload = await uploadBuffer(previewBuffer, {
    resource_type: 'raw',
    folder: 'notenest/previews',
    type: 'upload',
  });

  // 3. Cover image
  const coverUpload = await uploadBuffer(coverFile.buffer, {
    resource_type: 'image',
    folder: 'notenest/covers',
  });

  const note = await Note.create({
    title,
    description,
    subject,
    branch,
    semester,
    category,
    price: Number(price),
    tags: tags ? String(tags).split(',').map((t) => t.trim().toLowerCase()) : [],
    coverImageUrl: coverUpload.secure_url,
    fullFileKey: fullUpload.public_id,
    previewFileUrl: previewUpload.secure_url,
    pageCount: totalPages,
    seller: req.user._id,
  });

  res.status(201).json({ success: true, data: note });
});

// @desc    Browse / search notes with filters and pagination
// @route   GET /api/notes
// @access  Public
const getNotes = asyncHandler(async (req, res) => {
  const { q, category, subject, minPrice, maxPrice, page = 1, limit = 12, sort = '-createdAt' } = req.query;

  const filter = { status: 'approved' };
  if (category) filter.category = category;
  if (subject) filter.subject = new RegExp(subject, 'i');
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (q) filter.$text = { $search: q };

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Number(limit) || 12, 50);

  const [notes, total] = await Promise.all([
    Note.find(filter)
      .select('-fullFileKey')
      .populate('seller', 'name')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Note.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: notes,
    meta: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
});

// @desc    Get a single note's public detail + preview link
// @route   GET /api/notes/:id
// @access  Public
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id).select('-fullFileKey').populate('seller', 'name');

  if (!note || note.status !== 'approved') {
    res.status(404);
    throw new Error('Note not found');
  }

  // If the requester is authenticated and has purchased this note, let the frontend
  // know so it can show a "Download full PDF" action instead of "Buy now".
  let alreadyPurchased = false;
  if (req.user) {
    alreadyPurchased = req.user.purchasedNotes.some((id) => id.toString() === note._id.toString());
  }

  res.json({ success: true, data: { ...note.toObject(), alreadyPurchased } });
});

// @desc    Get the logged-in seller's own notes (any status), with sales stats
// @route   GET /api/notes/mine
// @access  Private (seller)
const getMyNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ seller: req.user._id }).sort('-createdAt');
  res.json({ success: true, data: notes });
});

// @desc    Delete a note the logged-in seller owns
// @route   DELETE /api/notes/:id
// @access  Private (seller, owner only)
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  if (note.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only delete your own notes');
  }

  await note.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = { createNote, getNotes, getNoteById, getMyNotes, deleteNote };
