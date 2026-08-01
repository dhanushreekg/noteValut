const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const cloudinary = require('../config/cloudinary');
const Note = require('../models/Note');
const Order = require('../models/Order');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order for a note
// @route   POST /api/orders/checkout
// @access  Private (student)
const createCheckoutSession = asyncHandler(async (req, res) => {
  const { noteId } = req.body;

  const note = await Note.findById(noteId);
  if (!note || note.status !== 'approved') {
    res.status(404);
    throw new Error('Note not found');
  }

  const alreadyOwned = req.user.purchasedNotes.some((id) => id.toString() === note._id.toString());
  if (alreadyOwned) {
    res.status(409);
    throw new Error('You already own this note');
  }

  const order = await Order.create({
    buyer: req.user._id,
    note: note._id,
    amount: note.price,
    status: 'pending',
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(note.price * 100),
    currency: 'INR',
    receipt: order._id.toString(),
    notes: {
      orderId: order._id.toString(),
      noteId: note._id.toString(),
      buyerId: req.user._id.toString(),
    },
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.json({
    success: true,
    data: {
      key: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: razorpayOrder.id,
      orderDbId: order._id.toString(),
      noteId: note._id.toString(),
      name: 'NoteNest',
      description: `Purchase ${note.title}`,
      receipt: order._id.toString(),
      userEmail: req.user.email,
      userName: req.user.name || req.user.email,
    },
  });
});

// @desc    Verify Razorpay payment and unlock the note for the buyer
// @route   POST /api/orders/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, noteId } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const unlockNoteId = noteId || order.note.toString();
  if (order.status !== 'paid') {
    order.status = 'paid';
    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    await User.findByIdAndUpdate(order.buyer, { $addToSet: { purchasedNotes: unlockNoteId } });
    await Note.findByIdAndUpdate(unlockNoteId, { $inc: { salesCount: 1 } });
  }

  res.json({ success: true, data: { verified: true } });
});

// @desc    Get the logged-in student's purchase history
// @route   GET /api/orders/mine
// @access  Private
const getMyPurchases = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id, status: 'paid' })
    .populate('note', 'title coverImageUrl subject price')
    .sort('-createdAt');

  res.json({ success: true, data: orders });
});

// @desc    Get a time-limited signed download URL for a note the user has purchased
// @route   GET /api/orders/download/:noteId
// @access  Private
const getDownloadUrl = asyncHandler(async (req, res) => {
  const owns = req.user.purchasedNotes.some((id) => id.toString() === req.params.noteId);
  if (!owns) {
    res.status(403);
    throw new Error('You have not purchased this note');
  }

  const note = await Note.findById(req.params.noteId);
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Signed URL expires in 5 minutes - prevents link sharing after the page closes
  const expiresAt = Math.floor(Date.now() / 1000) + 300;
  const signedUrl = cloudinary.utils.private_download_url(note.fullFileKey, 'pdf', {
    resource_type: 'raw',
    type: 'authenticated',
    expires_at: expiresAt,
  });

  res.json({ success: true, data: { downloadUrl: signedUrl, expiresAt } });
});

module.exports = { createCheckoutSession, verifyPayment, getMyPurchases, getDownloadUrl };
