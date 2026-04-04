const express = require('express');
const { body, param } = require('express-validator');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All user routes require authentication + admin role
router.use(protect, requireRole('admin'));

const updateRules = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('role')
    .optional()
    .isIn(['viewer', 'analyst', 'admin'])
    .withMessage('Role must be viewer, analyst, or admin'),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
];

router.get('/', getAllUsers);
router.get('/:id', param('id').isMongoId(), validate, getUserById);
router.put('/:id', updateRules, validate, updateUser);
router.delete('/:id', param('id').isMongoId(), validate, deleteUser);

module.exports = router;
