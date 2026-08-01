const express = require('express');
const { createNote, getNotes, getNoteById, getMyNotes, deleteNote } = require('../controllers/noteController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadNoteFiles } = require('../middleware/upload');

const router = express.Router();

// NOTE: /mine must be registered before /:id, or Express will treat "mine" as an :id value.
router.get('/mine', protect, authorize('seller', 'admin'), getMyNotes);
router.get('/', getNotes);
router.get('/:id', optionalAuth, getNoteById);
router.post('/', protect, authorize('seller', 'admin'), uploadNoteFiles, createNote);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteNote);

module.exports = router;
