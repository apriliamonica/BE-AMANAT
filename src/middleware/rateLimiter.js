import rateLimit from "express-rate-limit";

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Terlalu banyak request dari IP ini, coba lagi nanti.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (more strict)
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: "Terlalu banyak percobaan login, coba lagi setelah 1 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Export limiter (strict untuk prevent abuse)
export const exportLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 exports per minute
  message: {
    success: false,
    message: "Terlalu banyak export, coba lagi nanti.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
