const express = require("express");
const prisma = require("./config/database.cjs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Enable CORS in development
if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: true, credentials: true }));
}

// Try to mount existing route modules (CommonJS)
try {
  const authRoutes = require("./routes/authRoutes.js");
  const authRouter = authRoutes && (authRoutes.default || authRoutes);
  if (authRouter) app.use("/api/auth", authRouter);
} catch (e) {
  console.warn("Could not mount authRoutes:", e.message);
}

app.get("/", (req, res) => {
  res.send("API BE-AMANAT (CommonJS) is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
