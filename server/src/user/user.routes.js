const express = require("express");

const { getAll } = require("./user.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Returns users with safe public fields only. Passwords are never exposed.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get("/", authenticate, getAll);

module.exports = router;
