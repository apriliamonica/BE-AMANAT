import { ZodError } from "zod";

export const validateRequiredFields = (req, requiredFields) => {
  try {
    const missing = [];
    const body = req.body || {};

    requiredFields.forEach((field) => {
      if (
        !Object.prototype.hasOwnProperty.call(body, field) ||
        body[field] === null ||
        body[field] === undefined
      ) {
        missing.push(field);
      } else if (typeof body[field] === "string" && body[field].trim() === "") {
        missing.push(field);
      } else if (Array.isArray(body[field]) && body[field].length === 0) {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      const error = new Error(`${missing.join(", ")} harus diisi`);
      error.statusCode = 400;
      throw error;
    }
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = error.statusCode || 400;
    throw err;
  }
};

export const validateAllowedFields = (req, allowedFields) => {
  try {
    const body = req.body || {};
    const disallowed = Object.keys(body).filter(
      (key) => !allowedFields.includes(key)
    );

    if (disallowed.length > 0) {
      const error = new Error(`${disallowed.join(", ")} tidak diizinkan`);
      error.statusCode = 400;
      throw error;
    }
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = error.statusCode || 400;
    throw err;
  }
};

export const validateSchema = async (req, schema) => {
  try {
    const result = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace req dengan validated data dari Zod
    if (result.body) req.body = result.body;
    // req.query adalah read-only, jadi kita assign properties-nya satu per satu
    if (result.query) {
      Object.keys(result.query).forEach((key) => {
        req.query[key] = result.query[key];
      });
    }
    if (result.params) req.params = result.params;
  } catch (zodError) {
    // Jika error dari Zod
    if (zodError instanceof ZodError) {
      // Zod menggunakan error.issues, bukan error.errors
      const validationErrors = zodError.issues.map((issue) => {
        // Build field path (misal: body.email, body.password, dll)
        const fieldPath = issue.path.join(".");

        return {
          field: fieldPath,
          message: issue.message,
          code: issue.code,
        };
      });

      // Buat message yang lebih informatif
      const errorMessages = validationErrors
        .map((err) => err.message)
        .join(", ");
      const message = `${errorMessages}`;

      // Gunakan nama variable yang berbeda untuk avoid shadowing
      const validationError = new Error(message);
      validationError.statusCode = 400;
      validationError.errors = validationErrors; // Simpan detail errors
      throw validationError;
    }

    // Jika bukan ZodError, re-throw error asli
    throw zodError;
  }
};

export const validateRequest = async (req, options = {}) => {
  try {
    const { required = [], allowed = [], schema = null } = options;

    // Validasi required fields
    if (required.length > 0) {
      validateRequiredFields(req, required);
    }

    // Validasi allowed fields (jika ada allowed fields yang didefinisikan)
    if (allowed.length > 0) {
      validateAllowedFields(req, allowed);
    }

    // Validasi schema
    if (schema) {
      await validateSchema(req, schema);
    }
  } catch (error) {
    // Preserve error properties (message, statusCode, errors)
    const err = new Error(error.message);
    err.statusCode = error.statusCode || 400;
    // Pass errors array jika ada (dari Zod validation)
    if (error.errors) {
      err.errors = error.errors;
    }
    throw err;
  }
};
