import app from "./index.js";
import { logger } from "./telemetry.js";

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
