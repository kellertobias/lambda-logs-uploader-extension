const fetch = require("node-fetch-commonjs");

const baseUrl = `http://${process.env.AWS_LAMBDA_RUNTIME_API}/2020-08-15/logs`;

const TIMEOUT_MS = 1000; // Maximum time (in milliseconds) that a batch is buffered.
const MAX_BYTES = 256 * 1024; // Maximum size in bytes that the logs are buffered in memory.
const MAX_ITEMS = 10000; // Maximum number of events that are buffered in memory.

async function subscribe(extensionId, RECEIVER_PORT, server) {
  const res = await fetch(baseUrl, {
    method: "put",
    body: JSON.stringify({
      destination: {
        protocol: "HTTP",
        URI: `http://sandbox.localdomain:${RECEIVER_PORT}`,
      },
      types: ["platform", "function"],
      buffering: {
        timeoutMs: TIMEOUT_MS,
        maxBytes: MAX_BYTES,
        maxItems: MAX_ITEMS,
      },
    }),
    headers: {
      "Content-Type": "application/json",
      "Lambda-Extension-Identifier": extensionId,
    },
  });

  switch (res.status) {
    case 200:
      break;
    case 202:
      console.warn(
        `${__dirname} extension: WARNING!!! Logs API is not supported! Is this extension running in a local sandbox?`
      );
      break;
    default:
      console.error(`${__dirname} extension: failed`, await res.text());
      break;
  }
}

module.exports = {
  subscribe,
};
