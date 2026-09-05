const request = require("supertest");
const app = require("../src/app");

async function createUser() {
  const uniqueEmail = `user_test_${Date.now()}_${Math.random()}@example.com`;

  const registerResponse = await request(app).post("/api/auth/register").send({
    name: "User Test",
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

describe("GET /api/users", () => {
  it("should return all users for an authenticated user", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("should return users with only safe fields", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    response.body.data.forEach((user) => {
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("email");

      expect(user).not.toHaveProperty("password");
      expect(user).not.toHaveProperty("passwordHash");
    });
  });

  it("should return users sorted by name", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    const names = response.body.data.map((user) => user.name);

    const sortedNames = [...names].sort((a, b) => a.localeCompare(b));

    expect(names).toEqual(sortedNames);
  });

  it("should include the newly registered user", async () => {
    const { token, user } = await createUser();

    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    const foundUser = response.body.data.find((item) => item.id === user.id);

    expect(foundUser).toBeDefined();

    expect(foundUser.name).toBe(user.name);
    expect(foundUser.email).toBe(user.email);

    expect(foundUser).not.toHaveProperty("password");
  });

  it("should reject access without authentication", async () => {
    const response = await request(app).get("/api/users");

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should reject access with an invalid token", async () => {
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer invalid_token");

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should reject access with an invalid authorization format", async () => {
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", "InvalidToken");

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);
  });
});
