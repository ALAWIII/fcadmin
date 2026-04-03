import { z } from "zod";
import * as yaml from "js-yaml";
import { readFileSync } from "fs";
import path from "path";

// 1️⃣ Define Zod schema
const SettingsSchema = z.object({
  app: z.object({
    name: z.string(),
    host: z.string(),
    port: z.number(),
    logLevel: z.enum(["error", "warn", "info", "debug", "trace"]),
    logDir: z.string(),
  }),
  database: z.object({
    name: z.string(),
    host: z.string(),
    port: z.number(),
    username: z.string(),
    password: z.string(),
  }),
  email: z.object({
    protocol: z.string(),
    tlsParam: z.boolean(),
    port: z.number(),
    host: z.string(),
    username: z.string(),
    password: z.string(),
    fromSender: z.string(),
  }),
  rustfs: z.object({
    region: z.string(),
    accessKey: z.string(),
    url: z.string(),
  }),
  secrets: z.object({
    rustfs: z.string(),
    hmac: z.string(),
  }),
  redis: z.object({
    host: z.string(),
    port: z.number(),
  }),
});

// TypeScript type
type Settings = z.infer<typeof SettingsSchema>;

// Load and parse YAML
const configPath = path.join(process.cwd(), "settings.yaml");
const raw = yaml.load(readFileSync(configPath, "utf-8"));

// Parse with type annotation
const settings: Settings = SettingsSchema.parse(raw);

export default settings;
