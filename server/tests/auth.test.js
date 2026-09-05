const request = require("supertest");
const app = require("../src/app");

describe("POST /api/auth/register", () => {
  it("should register a new user successfully", async () => {
    const uniqueEmail = `test_${Date.now()}@example.com`;

    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: uniqueEmail,
      password: "password123",
    });

    expect(response.statusCode).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("User registered successfully");

    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.name).toBe("Test User");
    expect(response.body.data.email).toBe(uniqueEmail);

    expect(response.body.data).not.toHaveProperty("password");
  });

  it("should reject registration with an already registered email", async () => {
    const uniqueEmail = `duplicate_${Date.now()}@example.com`;

    const firstResponse = await request(app).post("/api/auth/register").send({
      name: "First User",
      email: uniqueEmail,
      password: "password123",
    });

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await request(app).post("/api/auth/register").send({
      name: "Second User",
      email: uniqueEmail,
      password: "password123",
    });

    expect(secondResponse.statusCode).toBe(400);

    expect(secondResponse.body.success).toBe(false);

    expect(secondResponse.body.message).toBe("Email already registered");
  });
});

describe("POST /api/auth/login", () => {
  it("should login an existing user successfully", async () => {
    const uniqueEmail = `login_${Date.now()}@example.com`;

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login Test User",
        email: uniqueEmail,
        password: "password123",
      });

    expect(registerResponse.statusCode).toBe(201);

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: uniqueEmail,
      password: "password123",
    });

    expect(loginResponse.statusCode).toBe(200);

    expect(loginResponse.body.success).toBe(true);

    expect(loginResponse.body.message).toBe("Login successful");

    expect(loginResponse.body.data).toHaveProperty("token");

    expect(loginResponse.body.data.token).toEqual(expect.any(String));

    expect(loginResponse.body.data.user).toHaveProperty("id");

    expect(loginResponse.body.data.user.name).toBe("Login Test User");

    expect(loginResponse.body.data.user.email).toBe(uniqueEmail);

    expect(loginResponse.body.data.user).not.toHaveProperty("password");
  });

  it("should reject login with an incorrect password", async () => {
    const uniqueEmail = `wrong_password_${Date.now()}@example.com`;

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Wrong Password User",
        email: uniqueEmail,
        password: "password123",
      });

    expect(registerResponse.statusCode).toBe(201);

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: uniqueEmail,
      password: "wrongpassword",
    });

    expect(loginResponse.statusCode).toBe(401);

    expect(loginResponse.body.success).toBe(false);

    expect(loginResponse.body.message).toBe("Invalid email or password");

    expect(loginResponse.body.data).toBeUndefined();
  });

  it("should reject login with an unregistered email", async () => {
    const uniqueEmail = `unknown_${Date.now()}@example.com`;

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: uniqueEmail,
      password: "password123",
    });

    expect(loginResponse.statusCode).toBe(401);

    expect(loginResponse.body.success).toBe(false);

    expect(loginResponse.body.message).toBe("Invalid email or password");

    expect(loginResponse.body.data).toBeUndefined();
  });
});

describe("GET /api/auth/me", () => {
  it("should authenticate a user with a valid token", async () => {
    const uniqueEmail = `me_${Date.now()}@example.com`;

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Me Test User",
        email: uniqueEmail,
        password: "password123",
      });

    expect(registerResponse.statusCode).toBe(201);

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: uniqueEmail,
      password: "password123",
    });

    expect(loginResponse.statusCode).toBe(200);

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("You are authenticated");

    expect(response.body.user).toBeDefined();

    expect(response.body.user).toHaveProperty("userId");

    expect(response.body.user.userId).toBe(loginResponse.body.data.user.id);
  });

  it("should reject access without a token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should reject access with an invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid_token");

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);
  });

  it("should reject access with an invalid authorization format", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "InvalidToken");

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);
  });
});
