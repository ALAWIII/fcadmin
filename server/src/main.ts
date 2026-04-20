import { app, logger } from "./lib.js";
const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
