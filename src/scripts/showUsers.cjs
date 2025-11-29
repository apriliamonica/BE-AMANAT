const prisma = require("../config/database.cjs");

(async () => {
  try {
    const rows = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    console.log("Found", rows.length, "users");
    console.table(rows);
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error("Error querying users:", e);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
