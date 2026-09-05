const { z } = require("zod");

const createTaskSchema = z.object({
  title: z
    .string()
    .min(2, "Task title must be at least 2 characters")
    .max(150, "Task title must not exceed 150 characters"),

  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),

  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),

  dueDate: z.string().datetime().optional(),

  projectId: z.coerce.number().int().positive(),

  assignedTo: z.coerce.number().int().positive().optional(),
});

const updateTaskSchema = z
  .object({
    title: z
      .string()
      .min(2, "Task title must be at least 2 characters")
      .max(150, "Task title must not exceed 150 characters")
      .optional(),

    description: z
      .string()
      .max(1000, "Description must not exceed 1000 characters")
      .optional(),

    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),

    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),

    dueDate: z.string().datetime().optional(),

    assignedTo: z.preprocess(
      (value) => {
        if (value === null) {
          return null;
        }

        if (value === "") {
          return undefined;
        }

        return Number(value);
      },
      z.union([z.number().int().positive(), z.null()]).optional(),
    ),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const getTasksSchema = z.object({
  projectId: z.coerce.number().int().positive(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  getTasksSchema,
};
