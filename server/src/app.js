const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./auth/auth.routes");
const projectRoutes = require("./project/project.routes");
const taskRoutes = require("./task/task.routes");
const errorHandler = require("./middleware/error.middleware");
const userRoutes = require("./user/user.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "TaskFlow API is running",
  });
});

app.use(errorHandler);

module.exports = app;
