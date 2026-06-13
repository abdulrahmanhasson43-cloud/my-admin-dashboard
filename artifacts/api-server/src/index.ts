import app from "./app.js";
import { logger } from "./lib/logger.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  logger.error("PORT environment variable is required but was not provided.");
  process.exit(1);
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  logger.error(`Invalid PORT value: "${rawPort}"`);
  process.exit(1);
}

app.listen(port, () => {
  logger.info({ port }, "Server listening");
});
