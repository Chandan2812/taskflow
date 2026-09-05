const request = require("supertest");
const app = require("../src/app");

describe("GET /api/health", () => {
  it("should return API health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "TaskFlow API is running",
    });
  });
});
