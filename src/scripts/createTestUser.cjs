const prisma = require('../config/database.cjs');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const username = 'admin';
    const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (existing) {
      console.log('User already exists:', username);
      process.exit(0);
    }

    const hashed = bcrypt.hashSync('admin123', 10);
    const { randomUUID } = require('crypto');
    const id = randomUUID();
    const now = new Date();

    // Use raw SQL to avoid Prisma/model mismatch with the current DB schema
    await prisma.$executeRaw`
      INSERT INTO "users" ("id","name","email","username","password","role","isActive","createdAt","updatedAt")
      VALUES (${id}, ${'Admin'}, ${'admin@example.com'}, ${username}, ${hashed}, 'STAFF'::"Role", ${true}, ${now}, ${now})
    `;
    console.log('Created user', { id, username });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
