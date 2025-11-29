const express = require('express');
const prisma = require('./config/database.cjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Enable CORS in development so the frontend dev server can call this API
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: true, credentials: true }));
}

// Mount auth routes (CommonJS router) only in non-production
if (process.env.NODE_ENV !== 'production') {
  try {
    const authRoutes = require('./routes/authRoutes.js');
    const authRouter = authRoutes && (authRoutes.default || authRoutes);
    if (authRouter) app.use('/api/auth', authRouter);
  } catch (e) {
    console.warn('Could not mount authRoutes from ./routes/authRoutes.js:', e.message);
  }
} else {
  console.log('Running in production mode: dev-only routes not mounted');
}

app.get('/', (req, res) => {
  res.send('API BE-AMANAT (CJS test server) is running!');
});

app.post('/api/auth/password-variants/test', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Endpoint ini hanya tersedia di lingkungan development' });

    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username harus disertakan' });

    const user = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true, password: true, isActive: true } });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    const base = String(username);
    const reversed = base.split('').reverse().join('');
    const year = new Date().getFullYear();

    const candidates = [
      base,
      base + '123',
      base + '1234',
      base + '12345',
      base + '!' ,
      base + '@' + (year % 100),
      base + '@' + year,
      base + '#2025',
      base + '2025',
      reversed,
      reversed + '123',
      'Password' + base,
      base + '!' + (year % 100),
      base + '2024',
      base + '_admin',
      base + '$',
    ];

    const matches = [];
    for (const cand of candidates) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await bcrypt.compare(cand, user.password);
      if (ok) matches.push(cand);
    }

    return res.json({ matches, tested: candidates.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Minimal login route for dev/testing (returns JWT)
// Only enabled in non-production to avoid conflict with main server
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username dan password harus disertakan' });

    // Select only existing columns to avoid Prisma/DB schema mismatch (e.g., missing `jabatan`)
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, password: true, isActive: true, role: true, name: true, email: true }
    });
    if (!user) return res.status(401).json({ error: 'Username atau password salah' });
    if (!user.isActive) return res.status(403).json({ error: 'Akun tidak aktif' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Username atau password salah' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    return res.json({ user: { id: user.id, username: user.username, role: user.role, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
  });
} else {
  console.log('Dev login route disabled in production');
}

app.listen(PORT, () => {
  console.log(`CJS test server running at http://localhost:${PORT}`);
});
