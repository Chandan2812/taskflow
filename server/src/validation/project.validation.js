const { z } = require("zod");

const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must not exceed 100 characters"),

  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
});

const updateProjectSchema = z
  .object({
    name: z
      .string()
      .min(2, "Project name must be at least 2 characters")
      .max(100, "Project name must not exceed 100 characters")
      .optional(),

    description: z
      .string()
      .max(500, "Description must not exceed 500 characters")
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "At least one field is required",
  });

module.exports = {
  createProjectSchema,
  updateProjectSchema,
};
