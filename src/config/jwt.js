import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Preserve error type untuk error handler
    if (error.name === "TokenExpiredError") {
      const expiredError = new Error("Token sudah kadaluarsa");
      expiredError.name = "TokenExpiredError";
      expiredError.statusCode = 401;
      throw expiredError;
    }
    if (error.name === "JsonWebTokenError") {
      const invalidError = new Error("Token tidak valid");
      invalidError.name = "JsonWebTokenError";
      invalidError.statusCode = 401;
      throw invalidError;
    }
    const err = new Error("Token verification failed");
    err.statusCode = 401;
    throw err;
  }
};
