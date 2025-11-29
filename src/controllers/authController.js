// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * Register new user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, username, password, role, bagian, jabatan } = req.body;

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return errorResponse(res, "Email atau username sudah digunakan", 400);
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
        role: role || "STAFF",
        bagian,
        jabatan,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        bagian: true,
        jabatan: true,
        createdAt: true,
      },
    });

    return successResponse(res, user, "User berhasil dibuat", 201);
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
      where: { username },
    });

    if (!user) {
      return errorResponse(res, "Username atau password salah", 401);
    }

    if (!user.isActive) {
      return errorResponse(res, "Akun tidak aktif", 403);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, "Username atau password salah", 401);
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    // Return user data without password
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      bagian: user.bagian,
      jabatan: user.jabatan,
    };

    return successResponse(res, { user: userData, token }, "Login berhasil");
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
        updatedAt: true,
      },
    });

    return successResponse(res, user, "Profile berhasil diambil");
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
        jabatan,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        bagian: true,
        jabatan: true,
        phone: true,
      },
    });

    return successResponse(res, user, "Profile berhasil diupdate");
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
      where: { id: req.user.id },
    });

    // Check old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, "Password lama salah", 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    return successResponse(res, null, "Password berhasil diubah");
  } catch (error) {
    next(error);
  }
};

/**
 * Generate password variations for a given username
 * This does NOT change the user's password — it only generates possible variants.
 */
const generatePasswordVariants = async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username) return errorResponse(res, "Username harus disertakan", 400);

    const base = String(username);
    const reversed = base.split("").reverse().join("");
    const year = new Date().getFullYear();

    // Common patterns
    const variants = [
      base,
      base + "123",
      base + "1234",
      base + "12345",
      base + "!",
      base + "@" + (year % 100),
      base + "@" + year,
      base + "#2025",
      base + "2025",
      reversed,
      reversed + "123",
      "Password" + base,
      base + "!" + (year % 100),
      base + "2024",
      base + "_admin",
      base + "$",
    ];

    // Deduplicate while preserving order
    const dedup = [...new Set(variants)];

    return successResponse(
      res,
      { variants: dedup },
      "Variasi kata sandi dihasilkan"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Test generated variants against stored password hash for a username.
 * WARNING: returns which variants match — use only in development/testing.
 */
const testPasswordVariants = async (req, res, next) => {
  try {
    // Only allow this endpoint in non-production environments
    if (process.env.NODE_ENV === "production") {
      return errorResponse(
        res,
        "Endpoint ini hanya tersedia di lingkungan development",
        403
      );
    }

    const { username } = req.body;
    if (!username) return errorResponse(res, "Username harus disertakan", 400);

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return errorResponse(res, "User tidak ditemukan", 404);

    // Reuse generator
    const base = String(username);
    const reversed = base.split("").reverse().join("");
    const year = new Date().getFullYear();

    const candidates = [
      base,
      base + "123",
      base + "1234",
      base + "12345",
      base + "!",
      base + "@" + (year % 100),
      base + "@" + year,
      base + "#2025",
      base + "2025",
      reversed,
      reversed + "123",
      "Password" + base,
      base + "!" + (year % 100),
      base + "2024",
      base + "_admin",
      base + "$",
    ];

    const matches = [];
    for (const cand of candidates) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await bcrypt.compare(cand, user.password);
      if (ok) matches.push(cand);
    }

    return successResponse(
      res,
      { matches, tested: candidates.length },
      "Hasil pengujian variasi kata sandi"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  generatePasswordVariants,
  testPasswordVariants,
};
