import { createApp } from "./app.js";
import { config } from "./config.js";
import { closeDb } from "./db/client.js";
import { attachLiveInterviewSocket } from "./modules/live/liveInterviewSocket.js";

const app = createApp();

const server = app.listen(config.PORT, () => {
  console.log(`Mockbros API listening on port ${config.PORT}`);
});

attachLiveInterviewSocket(server);

async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down`);
  server.close(async () => {
    await closeDb();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
