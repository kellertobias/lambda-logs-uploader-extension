const { SeverityNumber } = require("@opentelemetry/api-logs");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");

const resources = {
  [SemanticResourceAttributes.SERVICE_NAME]:
    process.env.SERVICE_NAME ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.SERVICE_NAME_FALLBACK ||
    "NO-SERVICE-NAME-PROVIDED",
  [SemanticResourceAttributes.SERVICE_NAMESPACE]:
    process.env.SERVICE_NAMESPACE || "UNNAMED_NAMESPACE",
  [SemanticResourceAttributes.SERVICE_VERSION]:
    process.env.SERVICE_VERSION || "1.0.0",
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
    process.env.DEPLOYMENT_ENVIRONMENT || "production",
};

const logsEndpoint =
  process.env.JSON_LOGS_ENDPOINT || "http://localhost:4318/logs/json";
console.log("logsEndpoint", logsEndpoint);

const maybeParseJson = (str, fallback = {}) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
};

const extraHeaders = maybeParseJson(process.env.JSON_LOGS_HEADERS, {});

const extractLog = (log) => {
  const logData = maybeParseJson(log.record, { msg: log.record });
  const {
    level,
    time,
    msg,
    traceId,
    spanId,
    traceFlags,
    trace_id,
    span_id,
    trace_flags,
    pid,
    ...rest
  } = logData;

  const timestamp = time ? time * 1000 : new Date(log.time).getTime() * 1000;
  const severity_number = level || SeverityNumber.TRACE;
  return {
    timestamp,
    logLineType: log.type,
    severity_number,
    severity_text: SeverityNumber[log.severityNumber] || "DEBUG",
    trace_id: trace_id || traceId,
    span_id: span_id || spanId,
    trace_flags: trace_flags || traceFlags,
    body: typeof log.record === "string" ? msg : "metrics",
    attributes: typeof log.record === "string" ? rest : log.record,
  };
};

const uploadLogs = async (logs) => {
  const mappedLogs = logs
    .filter((log) => {
      return log.record && log.type == "function";
    })
    .map((log) => ({ ...extractLog(log), resources }));

  await fetch(logsEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify(mappedLogs),
  });

  console.log("Logs Emitted");
};

module.exports = {
  uploadLogs,
};
