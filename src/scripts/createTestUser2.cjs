const prisma = require("../config/database.cjs");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

(async () => {
  try {
    const username = process.argv[2] || "admin";
    const rawPassword = process.argv[3] || "admin123";
    const role = process.argv[4] || "KEPALA_BAGIAN";

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);
    const id = uuidv4();
    const now = new Date();

    const sql = `INSERT INTO users (id, name, email, username, password, role, "updatedAt")\n      VALUES ('${id}', 'Admin User', 'admin@example.com', '${username}', '${hash}', '${role}'::"Role", '${now.toISOString()}')\n      RETURNING id, username, role`;

    const res = await prisma.$queryRawUnsafe(sql);

    console.log("Inserted:", res);
    process.exit(0);
  } catch (e) {
    console.error("Insert error:", e);
    process.exit(1);
  }
})();
