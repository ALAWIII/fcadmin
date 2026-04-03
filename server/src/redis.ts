import { Redis as RedisClient, type RedisOptions } from "ioredis";
import settings from "./config.js";

const rds = settings.redis;

const options: RedisOptions = {
  host: rds.host,
  port: rds.port,
  retryStrategy: (times) => Math.min(times * 50, 2000), // custom backoff
  maxRetriesPerRequest: 3, // override default of 20
  reconnectOnError: (err) => err.message.includes("READONLY"),
};

const rdsCon: RedisClient = new RedisClient(options);
rdsCon.on("connect", () => console.log("✅ Redis connected"));
rdsCon.on("ready", () => console.log("✅ Redis ready"));
rdsCon.on("error", (err) => console.error("❌ Redis error:", err.message));
rdsCon.on("reconnecting", () => console.warn("🔄 Redis reconnecting..."));
rdsCon.on("close", () => console.warn("🔌 Redis connection closed"));

export default rdsCon;
