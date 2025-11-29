const prisma = require('../config/database.cjs');

(async () => {
  try {
    const users = await prisma.user.findMany({ take: 20, select: { id: true, username: true, email: true, isActive: true } });
    console.log(users.map(u => ({ id: u.id, username: u.username, email: u.email, isActive: u.isActive })));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
