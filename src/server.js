import express from 'express';
// Jika Anda menggunakan ES modules, __dirname tidak tersedia secara default.

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('API BE-AMANAT is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
