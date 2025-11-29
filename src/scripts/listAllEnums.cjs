const prisma = require('../config/database.cjs');

(async () => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT t.typname AS enum_type, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      ORDER BY t.typname, e.enumsortorder
    `;
    const map = {};
    for (const r of rows) {
      if (!map[r.enum_type]) map[r.enum_type] = [];
      map[r.enum_type].push(r.enumlabel);
    }
    console.log(map);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
