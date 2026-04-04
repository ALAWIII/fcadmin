// data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Admin, File, Folder, User } from "./models.js";
import settings from "./config.js";

const db = settings.database;

export const dbCon = new DataSource({
  type: "postgres",
  host: db.host,
  port: db.port,
  username: db.username,
  password: db.password,
  database: db.name,
  synchronize: false,
  migrationsRun: false,
  entities: [User, File, Folder, Admin],
});

// At startup — same panic behavior as yours
await dbCon.initialize().catch((error) => {
  throw new Error(`Critical: cannot connect to database: ${error}`);
});

console.log("Connected to PostgreSQL database");
export const userRepo = dbCon.getRepository(User);
export const fileRepo = dbCon.getRepository(File);
export const folderRepo = dbCon.getRepository(Folder);
export const AdminRepo = dbCon.getRepository(Admin);
