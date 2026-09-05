const express = require("express");

const { create, getAll, getOne, update, remove } = require("./task.controller");

const authenticate = require("../middleware/auth.middleware");
const {
  validate,
  validateQuery,
} = require("../middleware/validate.middleware");

const {
  createTaskSchema,
  updateTaskSchema,
  getTasksSchema,
} = require("../validation/task.validation");

const router = express.Router();

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - projectId
 *             properties:
 *               title:
 *                 type: string
 *                 example: Build authentication API
 *               description:
 *                 type: string
 *                 example: Implement JWT authentication
 *               status:
 *                 type: string
 *                 enum:
 *                   - TODO
 *                   - IN_PROGRESS
 *                   - DONE
 *                 example: TODO
 *               priority:
 *                 type: string
 *                 enum:
 *                   - LOW
 *                   - MEDIUM
 *                   - HIGH
 *                 example: HIGH
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-09-10T18:00:00.000Z
 *               projectId:
 *                 type: integer
 *                 example: 1
 *               assignedTo:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation or creation error
 *       401:
 *         description: Authentication required
 */
router.post("/", authenticate, validate(createTaskSchema), create);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get tasks for a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *       400:
 *         description: Invalid project ID or project not found
 *       401:
 *         description: Authentication required
 */
router.get("/", authenticate, validateQuery(getTasksSchema), getAll);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get a task by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Task not found
 */
router.get("/:id", authenticate, getOne);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Update a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated task title
 *               description:
 *                 type: string
 *                 example: Updated description
 *               status:
 *                 type: string
 *                 enum:
 *                   - TODO
 *                   - IN_PROGRESS
 *                   - DONE
 *               priority:
 *                 type: string
 *                 enum:
 *                   - LOW
 *                   - MEDIUM
 *                   - HIGH
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedTo:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Task not found
 */
router.put("/:id", authenticate, validate(updateTaskSchema), update);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Task not found
 */
router.delete("/:id", authenticate, remove);

module.exports = router;
