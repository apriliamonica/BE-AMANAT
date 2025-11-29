const express = require('express');
const prisma = require('./config/database.cjs');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API BE-AMANAT (CJS test server) is running!');
});

app.post('/api/auth/password-variants/test', async (req, res) => {
  try {
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

app.listen(PORT, () => {
  console.log(`CJS test server running at http://localhost:${PORT}`);
});
