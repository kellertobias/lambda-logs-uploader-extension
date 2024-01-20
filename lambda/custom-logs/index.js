#!/usr/bin/env node
const { register, next } = require("./extensions-api");
const { subscribe } = require("./logs-api");
const { listen } = require("./http-listener");
const { uploadLogs } = require("./logs-uploader");

const EventType = {
  INVOKE: "INVOKE",
  SHUTDOWN: "SHUTDOWN",
};

// Subscribe to platform logs and receive them on ${local_ip}:4243 via HTTP protocol.
const RECEIVER_PORT = 4243;

(async function main() {
  function handleShutdown(event) {
    if (process.env.JSON_LOGS_DEBUG) {
      console.log("shutdown", { event });
    }
    process.exit(0);
  }

  process.on("SIGINT", () => handleShutdown("SIGINT"));
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));

  const extensionId = await register();
  if (process.env.JSON_LOGS_DEBUG) {
    console.log(`${__dirname} extension: registered ${extensionId}`);
  }

  // listen returns `logsQueue`, a mutable array that collects logs received from Logs API
  const { logsQueue, server } = listen("sandbox", RECEIVER_PORT);

  // subscribing listener to the Logs API
  await subscribe(extensionId, RECEIVER_PORT, server);

  // function for processing collected logs
  async function handleLogs() {
    while (logsQueue.length > 0) {
      if (process.env.JSON_LOGS_DEBUG) {
        console.log("handleLogs", logsQueue.length);
      }
      await uploadLogs(logsQueue.splice(0));
    }
  }

  // execute extensions logic
  while (true) {
    if (process.env.JSON_LOGS_DEBUG) {
      console.log(`${__dirname} extension: next`);
    }
    const event = await next(extensionId);

    switch (event.eventType) {
      case EventType.SHUTDOWN:
        await handleLogs(); // upload remaining logs, during shutdown event
        handleShutdown(event);
        break;
      case EventType.INVOKE:
        await handleLogs(); // upload queued logs, during invoke event
        break;
      default:
        throw new Error("unknown event: " + event.eventType);
    }
  }
})();
