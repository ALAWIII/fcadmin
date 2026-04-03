import { Pool } from "pg";
import settings from "./config.js";
let dbSet = settings.database;

const dbPool = new Pool({
  user: dbSet.username,
  host: dbSet.host,
  port: dbSet.port,
  database: dbSet.name,
  password: dbSet.password,
});

async function verifyCon(): Promise<void> {
  try {
    const c = await dbPool.connect();
    c.release();
    console.log("Connected to PostgreSQL database");
  } catch (error) {
    // Panic: stop execution immediately
    throw new Error(`Critical: cannot connect to database: ${error}`);
  }
}

// At startup
await verifyCon(); // If it fails, Node.js process stops
export default dbPool;
