import { Pool } from "pg";
import settings from "./config.js";
let db_set = settings.database;

const db_pool = new Pool({
  user: db_set.username,
  host: db_set.host,
  port: db_set.port,
  database: db_set.name,
  password: db_set.password,
});

async function verifyCon(): Promise<void> {
  try {
    const c = await db_pool.connect();
    c.release();
    console.log("Connected to PostgreSQL database");
  } catch (error) {
    // Panic: stop execution immediately
    throw new Error(`Critical: cannot connect to database: ${error}`);
  }
}

// At startup
await verifyCon(); // If it fails, Node.js process stops
export default db_pool;
