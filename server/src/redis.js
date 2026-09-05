const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

async function connectRedis() {
  if (redisClient.isOpen) {
    return;
  }

  await redisClient.connect();

  console.log("Redis connected successfully");
}

module.exports = {
  redisClient,
  connectRedis,
};
