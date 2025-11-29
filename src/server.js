import express from 'express';
import path from 'path';

// Import auth routes (CommonJS modules export will be available as default)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const authRoutes = require('./routes/authRoutes.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health
app.get('/', (req, res) => {
  res.send('API BE-AMANAT is running!');
});

// Mount routes
const authRouter = authRoutes && (authRoutes.default || authRoutes);
if (authRouter) app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
