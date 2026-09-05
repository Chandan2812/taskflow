jest.mock("../src/socket", () => ({
  getIO: () => ({
    emit: jest.fn(),
  }),
}));

const request = require("supertest");
const app = require("../src/app");
const { redisClient, connectRedis } = require("../src/redis");

beforeAll(async () => {
  if (!redisClient.isOpen) {
    await connectRedis();
  }
});

afterAll(async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
});

async function createUser(name = "Task Test User") {
  const uniqueEmail = `task_test_${Date.now()}_${Math.random()}@example.com`;

  const registerResponse = await request(app).post("/api/auth/register").send({
    name,
    email: uniqueEmail,
    password: "password123",
  });

  expect(registerResponse.statusCode).toBe(201);

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: uniqueEmail,
    password: "password123",
  });

  expect(loginResponse.statusCode).toBe(200);

  return {
    token: loginResponse.body.data.token,
    user: loginResponse.body.data.user,
  };
}

async function createProject(token, name = "Task Test Project") {
  const response = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name,
      description: "Project created for task testing",
    });

  expect(response.statusCode).toBe(201);

  return response.body.data;
}

async function createTask(token, projectId, overrides = {}) {
  // Verify that this token actually owns the project.
  const projectResponse = await request(app)
    .get(`/api/projects/${projectId}`)
    .set("Authorization", `Bearer ${token}`);

  if (projectResponse.statusCode !== 200) {
    console.log(
      "PROJECT ACCESS ERROR:",
      projectResponse.body,
      "projectId:",
      projectId,
    );
  }

  expect(projectResponse.statusCode).toBe(200);

  const response = await request(app)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Test Task",
      description: "Task created during testing",
      projectId,
      ...overrides,
    });

  if (response.statusCode !== 201) {
    console.log("TASK CREATE ERROR:", response.body, "projectId:", projectId);
  }

  return response;
}

describe("POST /api/tasks", () => {
  it("should create a task successfully", async () => {
    const { token } = await createUser();
    const project = await createProject(token);

    const response = await createTask(token, project.id);

    expect(response.statusCode).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Task created successfully");

    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.title).toBe("Test Task");
    expect(response.body.data.description).toBe("Task created during testing");
    expect(response.body.data.projectId).toBe(project.id);
    expect(response.body.data.status).toBe("TODO");
    expect(response.body.data.priority).toBe("MEDIUM");
  });

  it("should create a task with status and priority", async () => {
    const { token } = await createUser();
    const project = await createProject(token);

    const response = await createTask(token, project.id, {
      title: "High Priority Task",
      status: "IN_PROGRESS",
      priority: "HIGH",
    });

    expect(response.statusCode).toBe(201);

    expect(response.body.data.title).toBe("High Priority Task");

    expect(response.body.data.status).toBe("IN_PROGRESS");
    expect(response.body.data.priority).toBe("HIGH");
  });

  it("should reject task creation without authentication", async () => {
    const response = await request(app).post("/api/tasks").send({
      title: "Unauthorized Task",
      projectId: 1,
    });

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should reject a task with an invalid title", async () => {
    const { token } = await createUser();
    const project = await createProject(token);

    const response = await createTask(token, project.id, {
      title: "A",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });

  it("should reject a task with an invalid status", async () => {
    const { token } = await createUser();
    const project = await createProject(token);

    const response = await createTask(token, project.id, {
      status: "INVALID_STATUS",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });

  it("should reject a task with an invalid priority", async () => {
    const { token } = await createUser();
    const project = await createProject(token);

    const response = await createTask(token, project.id, {
      priority: "URGENT",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });

  it("should reject a task for a non-existent project", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Invalid Project Task",
        projectId: 999999999,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Project not found");
  });

  it("should prevent creating a task in another user's project", async () => {
    const owner = await createUser("Project Owner");
    const otherUser = await createUser("Other User");

    const project = await createProject(owner.token, "Private Task Project");

    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${otherUser.token}`)
      .send({
        title: "Unauthorized Project Task",
        projectId: project.id,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Project not found");
  });

  it("should reject assigning a task to a non-existent user", async () => {
    const { token } = await createUser();
    const project = await createProject(token);

    const response = await createTask(token, project.id, {
      title: "Invalid Assignee Task",
      assignedTo: 999999999,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Assigned user not found");
  });
});

describe("GET /api/tasks", () => {
  it("should return tasks belonging to a project", async () => {
    const { token } = await createUser();
    const project = await createProject(token);

    await createTask(token, project.id, {
      title: "Task One",
    });

    await createTask(token, project.id, {
      title: "Task Two",
    });

    const response = await request(app)
      .get(`/api/tasks?projectId=${project.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);

    const taskTitles = response.body.data.map((task) => task.title);

    expect(taskTitles).toContain("Task One");
    expect(taskTitles).toContain("Task Two");
  });

  it("should reject fetching tasks without authentication", async () => {
    const response = await request(app).get("/api/tasks?projectId=1");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should return 400 when projectId is missing", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Query validation failed");
  });

  it("should reject accessing tasks from another user's project", async () => {
    const owner = await createUser("Task Project Owner");
    const otherUser = await createUser("Task Project Other");

    const project = await createProject(owner.token, "Private Task Project");

    const response = await request(app)
      .get(`/api/tasks?projectId=${project.id}`)
      .set("Authorization", `Bearer ${otherUser.token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Project not found");
  });
});

describe("GET /api/tasks/:id", () => {
  it("should return a task owned through the user's project", async () => {
    const { token } = await createUser();
    const project = await createProject(token);

    const createResponse = await createTask(token, project.id, {
      title: "Single Task",
    });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(taskId);
    expect(response.body.data.title).toBe("Single Task");
    expect(response.body.data.projectId).toBe(project.id);
  });

  it("should return 404 for a non-existent task", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .get("/api/tasks/999999999")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Task not found");
  });

  it("should prevent a user from accessing another user's task", async () => {
    const owner = await createUser("Task Owner");
    const otherUser = await createUser("Task Other User");

    const project = await createProject(owner.token, "Owner Project");

    const createResponse = await createTask(owner.token, project.id, {
      title: "Private Task",
    });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${otherUser.token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Task not found");
  });

  it("should reject access without authentication", async () => {
    const response = await request(app).get("/api/tasks/999999999");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe("PUT /api/tasks/:id", () => {
  it("should update a task successfully", async () => {
    const { token } = await createUser();
    const project = await createProject(token);

    const createResponse = await createTask(token, project.id, {
      title: "Original Task",
    });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Task",
        description: "Updated description",
        status: "DONE",
        priority: "HIGH",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Task updated successfully");
    expect(response.body.data.id).toBe(taskId);
    expect(response.body.data.title).toBe("Updated Task");
    expect(response.body.data.description).toBe("Updated description");
    expect(response.body.data.status).toBe("DONE");
    expect(response.body.data.priority).toBe("HIGH");
  });

  it("should update only the provided task fields", async () => {
    const { token } = await createUser();
    const project = await createProject(token);

    const createResponse = await createTask(token, project.id, {
      title: "Partial Update Task",
      description: "Original description",
      priority: "LOW",
    });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "IN_PROGRESS",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.title).toBe("Partial Update Task");
    expect(response.body.data.description).toBe("Original description");
    expect(response.body.data.priority).toBe("LOW");
    expect(response.body.data.status).toBe("IN_PROGRESS");
  });

  it("should reject an update with no fields", async () => {
    const { token } = await createUser();
    const project = await createProject(token);

    const createResponse = await createTask(token, project.id);

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });

  it("should update task assignment to another existing user", async () => {
    const owner = await createUser("Task Owner");
    const assignee = await createUser("Task Assignee");

    const project = await createProject(owner.token);

    const createResponse = await createTask(owner.token, project.id, {
      title: "Assignment Task",
    });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        assignedTo: assignee.user.id,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.assignedTo).toBe(assignee.user.id);
  });

  it("should reject assigning a task to a non-existent user", async () => {
    const { token } = await createUser();
    const project = await createProject(token);

    const createResponse = await createTask(token, project.id);

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        assignedTo: 999999999,
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Assigned user not found");
  });

  it("should allow removing task assignment", async () => {
    const owner = await createUser("Assignment Owner");
    const assignee = await createUser("Assignment User");

    const project = await createProject(owner.token);

    const createResponse = await createTask(owner.token, project.id, {
      title: "Remove Assignment Task",
      assignedTo: assignee.user.id,
    });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        assignedTo: null,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.assignedTo).toBeNull();
  });

  it("should prevent a user from updating another user's task", async () => {
    const owner = await createUser("Update Task Owner");
    const otherUser = await createUser("Update Task Other");

    const project = await createProject(owner.token);

    const createResponse = await createTask(owner.token, project.id, {
      title: "Protected Task",
    });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${otherUser.token}`)
      .send({
        title: "Hacked Task",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Task not found");
  });

  it("should return 404 when updating a non-existent task", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .put("/api/tasks/999999999")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Task",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Task not found");
  });

  it("should reject updating a task without authentication", async () => {
    const response = await request(app).put("/api/tasks/999999999").send({
      title: "Unauthorized Update",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("should delete a task successfully", async () => {
    const { token } = await createUser();
    const project = await createProject(token);

    const createResponse = await createTask(token, project.id, {
      title: "Delete Task",
    });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.data.id;

    const deleteResponse = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.message).toBe("Task deleted successfully");

    const getResponse = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getResponse.statusCode).toBe(404);
    expect(getResponse.body.success).toBe(false);
  });

  it("should prevent a user from deleting another user's task", async () => {
    const owner = await createUser("Delete Task Owner");
    const otherUser = await createUser("Delete Task Other");

    const project = await createProject(owner.token);

    const createResponse = await createTask(owner.token, project.id, {
      title: "Protected Delete Task",
    });

    expect(createResponse.statusCode).toBe(201);

    const taskId = createResponse.body.data.id;

    const response = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${otherUser.token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Task not found");

    const ownerGetResponse = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(ownerGetResponse.statusCode).toBe(200);
    expect(ownerGetResponse.body.data.id).toBe(taskId);
  });

  it("should return 404 when deleting a non-existent task", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .delete("/api/tasks/999999999")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Task not found");
  });

  it("should reject deletion without authentication", async () => {
    const response = await request(app).delete("/api/tasks/999999999");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
