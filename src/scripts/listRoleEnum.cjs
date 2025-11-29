const prisma = require("../config/database.cjs");

(async () => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'role'
      ORDER BY e.enumsortorder
    `;
    console.log(rows.map((r) => r.enumlabel));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
