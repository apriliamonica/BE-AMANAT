import authService from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    return sendSuccess(res, "Login berhasil", data);
  } catch (err) {
    return sendError(res, err.message);
  }
};
