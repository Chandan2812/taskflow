const { z } = require("zod");

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),

  email: z.string().email("Invalid email address"),

  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(100, "Password must not exceed 100 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),

  password: z.string().min(1, "Password is required"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
