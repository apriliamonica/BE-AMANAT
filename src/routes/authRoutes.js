// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (admin only)
 * @access  Public (should be protected in production)
 */
router.post('/register', [
  body('name').notEmpty().withMessage('Nama harus diisi'),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('username').notEmpty().withMessage('Username harus diisi')
    .isLength({ min: 3 }).withMessage('Username minimal 3 karakter'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  validate
], authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', [
  body('username').notEmpty().withMessage('Username harus diisi'),
  body('password').notEmpty().withMessage('Password harus diisi'),
  validate
], authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', [
  authenticate,
  body('name').optional().notEmpty().withMessage('Nama tidak boleh kosong'),
  body('email').optional().isEmail().withMessage('Email tidak valid'),
  validate
], authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.put('/change-password', [
  authenticate,
  body('oldPassword').notEmpty().withMessage('Password lama harus diisi'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter'),
  validate
], authController.changePassword);

module.exports = router;