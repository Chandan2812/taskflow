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

async function createUser() {
  const uniqueEmail = `project_test_${Date.now()}_${Math.random()}@example.com`;

  const response = await request(app).post("/api/auth/register").send({
    name: "Project Test User",
    email: uniqueEmail,
    password: "password123",
  });

  expect(response.statusCode).toBe(201);

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

describe("POST /api/projects", () => {
  it("should create a project for an authenticated user", async () => {
    const { token, user } = await createUser();

    const response = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Project",
        description: "Project created during testing",
      });

    expect(response.statusCode).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Project created successfully");

    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.name).toBe("Test Project");
    expect(response.body.data.description).toBe(
      "Project created during testing",
    );
    expect(response.body.data.ownerId).toBe(user.id);
  });

  it("should reject project creation without authentication", async () => {
    const response = await request(app).post("/api/projects").send({
      name: "Unauthorized Project",
      description: "This should fail",
    });

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);
  });
});

describe("GET /api/projects", () => {
  it("should return projects belonging to the authenticated user", async () => {
    const { token } = await createUser();

    await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Project One",
        description: "First project",
      });

    await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Project Two",
        description: "Second project",
      });

    const response = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data.length).toBeGreaterThanOrEqual(2);

    const projectNames = response.body.data.map((project) => project.name);

    expect(projectNames).toContain("Project One");
    expect(projectNames).toContain("Project Two");
  });

  it("should reject fetching projects without authentication", async () => {
    const response = await request(app).get("/api/projects");

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);
  });
});

describe("GET /api/projects/:id", () => {
  it("should return a project owned by the authenticated user", async () => {
    const { token } = await createUser();

    const createResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Single Project",
        description: "Project details",
      });

    expect(createResponse.statusCode).toBe(201);

    const projectId = createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.id).toBe(projectId);
    expect(response.body.data.name).toBe("Single Project");
    expect(response.body.data.description).toBe("Project details");
  });

  it("should return 404 for a non-existent project", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .get("/api/projects/999999999")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Project not found");
  });

  it("should prevent a user from accessing another user's project", async () => {
    const owner = await createUser();
    const otherUser = await createUser();

    const createResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        name: "Private Project",
        description: "Owner only project",
      });

    expect(createResponse.statusCode).toBe(201);

    const projectId = createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${otherUser.token}`);

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Project not found");
  });
});

describe("PUT /api/projects/:id", () => {
  it("should update a project owned by the authenticated user", async () => {
    const { token } = await createUser();

    const createResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Original Project",
        description: "Original description",
      });

    expect(createResponse.statusCode).toBe(201);

    const projectId = createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Project",
        description: "Updated description",
      });

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Project updated successfully");

    expect(response.body.data.id).toBe(projectId);
    expect(response.body.data.name).toBe("Updated Project");
    expect(response.body.data.description).toBe("Updated description");
  });

  it("should prevent a user from updating another user's project", async () => {
    const owner = await createUser();
    const otherUser = await createUser();

    const createResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        name: "Protected Project",
        description: "Should not be changed",
      });

    expect(createResponse.statusCode).toBe(201);

    const projectId = createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${otherUser.token}`)
      .send({
        name: "Hacked Project",
      });

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Project not found");
  });

  it("should return 404 when updating a non-existent project", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .put("/api/projects/999999999")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Project",
      });

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Project not found");
  });
});

describe("DELETE /api/projects/:id", () => {
  it("should delete a project owned by the authenticated user", async () => {
    const { token } = await createUser();

    const createResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Delete Project",
        description: "Project to delete",
      });

    expect(createResponse.statusCode).toBe(201);

    const projectId = createResponse.body.data.id;

    const deleteResponse = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);

    expect(deleteResponse.body.success).toBe(true);

    expect(deleteResponse.body.message).toBe("Project deleted successfully");

    const getResponse = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getResponse.statusCode).toBe(404);

    expect(getResponse.body.success).toBe(false);
  });

  it("should prevent a user from deleting another user's project", async () => {
    const owner = await createUser();
    const otherUser = await createUser();

    const createResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        name: "Protected Delete Project",
        description: "Should remain",
      });

    expect(createResponse.statusCode).toBe(201);

    const projectId = createResponse.body.data.id;

    const response = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${otherUser.token}`);

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Project not found");

    const ownerGetResponse = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(ownerGetResponse.statusCode).toBe(200);

    expect(ownerGetResponse.body.data.id).toBe(projectId);
  });

  it("should return 404 when deleting a non-existent project", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .delete("/api/projects/999999999")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Project not found");
  });

  it("should reject deletion without authentication", async () => {
    const response = await request(app).delete("/api/projects/999999999");

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);
  });
});
