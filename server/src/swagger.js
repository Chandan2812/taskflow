const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "TaskFlow API",
      version: "1.0.0",
      description:
        "REST API documentation for the TaskFlow project management application",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    tags: [
      {
        name: "Health",
        description: "API health check",
      },
      {
        name: "Auth",
        description: "Authentication APIs",
      },
      {
        name: "Projects",
        description: "Project management APIs",
      },
      {
        name: "Tasks",
        description: "Task management APIs",
      },
      {
        name: "Users",
        description: "User APIs",
      },
    ],
  },

  apis: [
    "./src/auth/*.routes.js",
    "./src/project/*.routes.js",
    "./src/task/*.routes.js",
    "./src/user/*.routes.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
