const express = require("express");

const {
  create,
  getProjects,
  getProject,
  update,
  remove,
} = require("./project.controller");

const authenticate = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const {
  createProjectSchema,
  updateProjectSchema,
} = require("../validation/project.validation");

const router = express.Router();

/**
 * @swagger
 * /api/projects:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create a project
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: TaskFlow Development
 *               description:
 *                 type: string
 *                 example: Project management application
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation or creation error
 *       401:
 *         description: Authentication required
 */
router.post("/", authenticate, validate(createProjectSchema), create);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get all projects owned by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get("/", authenticate, getProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get a project by ID
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
 *         description: Project retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Project not found
 */
router.get("/:id", authenticate, getProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     tags:
 *       - Projects
 *     summary: Update a project
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
 *               name:
 *                 type: string
 *                 example: Updated Project Name
 *               description:
 *                 type: string
 *                 example: Updated project description
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Validation or update error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Project not found
 */
router.put("/:id", authenticate, validate(updateProjectSchema), update);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     tags:
 *       - Projects
 *     summary: Delete a project
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
 *         description: Project deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Project not found
 */
router.delete("/:id", authenticate, remove);

module.exports = router;
