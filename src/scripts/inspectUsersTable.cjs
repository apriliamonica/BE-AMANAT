const prisma = require('../config/database.cjs');

(async () => {
  try {
    const cols = await prisma.$queryRaw`
      SELECT column_name, is_nullable, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    console.log(cols);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
