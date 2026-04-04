const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
} = require('../controllers/recordController');
const { protect, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { CATEGORIES } = require('../models/FinancialRecord');

const router = express.Router();

// All record routes require authentication
router.use(protect);

const recordBodyRules = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO8601 date'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description max 500 chars'),
];

const updateBodyRules = [
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').optional().isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO8601 date'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description max 500 chars'),
];

// GET /api/records — viewer, analyst, admin can view
router.get('/', requireRole('viewer'), getAllRecords);

// GET /api/records/:id
router.get('/:id', requireRole('viewer'), param('id').isMongoId(), validate, getRecordById);

// POST /api/records — analyst and admin can create
router.post('/', requireRole('analyst'), recordBodyRules, validate, createRecord);

// PUT /api/records/:id — analyst and admin can update
router.put(
  '/:id',
  requireRole('analyst'),
  [param('id').isMongoId(), ...updateBodyRules],
  validate,
  updateRecord
);

// DELETE /api/records/:id — admin only
router.delete('/:id', requireRole('admin'), param('id').isMongoId(), validate, deleteRecord);

module.exports = router;
