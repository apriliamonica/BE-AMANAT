// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Register new user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, username, password, role, bagian, jabatan } = req.body;

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return errorResponse(res, 'Email atau username sudah digunakan', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        role: role || 'STAFF',
        bagian,
        jabatan
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        bagian: true,
        jabatan: true,
        createdAt: true
      }
    });

    return successResponse(res, user, 'User berhasil dibuat', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return errorResponse(res, 'Username atau password salah', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Akun tidak aktif', 403);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Username atau password salah', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data without password
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      bagian: user.bagian,
      jabatan: user.jabatan
    };

    return successResponse(res, { user: userData, token }, 'Login berhasil');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        bagian: true,
        jabatan: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return successResponse(res, user, 'Profile berhasil diambil');
  } catch (error) {
    next(error);
  }
};

/**
 * Update profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, bagian, jabatan } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        email,
        phone,
        bagian,
        jabatan
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        bagian: true,
        jabatan: true,
        phone: true
      }
    });

    return successResponse(res, user, 'Profile berhasil diupdate');
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Check old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Password lama salah', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    return successResponse(res, null, 'Password berhasil diubah');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};