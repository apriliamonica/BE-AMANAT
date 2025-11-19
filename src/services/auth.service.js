import prisma from "../config/db.js";
import { comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

export default {
  login: async ({ email, password }) => {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) throw new Error("Email tidak ditemukan");

    const valid = await comparePassword(password, user.password);
    if (!valid) throw new Error("Password salah");

    const token = generateToken({
      id: user.id,
      role: user.role,
      bagian: user.bagian
    });

    return { user, token };
  }
};
