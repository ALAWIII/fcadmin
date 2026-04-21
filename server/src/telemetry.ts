import pino from "pino";
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

// logs every request automatically
