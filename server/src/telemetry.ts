import pino from "pino";
import { pinoHttp } from "pino-http";
import app from "./app.js";
import settings from "./config.js";

export const logger = pino({
  level: settings.app.logLevel,
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard" },
        level: "trace",
      },
      {
        target: "pino/file",
        options: { destination: "./logs/app.log", mkdir: true },
        level: "trace",
      },
    ],
  },
});

app.use(pinoHttp({ logger })); // logs every request automatically
