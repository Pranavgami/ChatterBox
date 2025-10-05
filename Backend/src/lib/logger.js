import morgan from "morgan";

const logger = morgan((tokens, req, res) => {
  const timestamp = new Date().toISOString();
  const level =
    res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

  return `${timestamp} [${level}]: ${tokens.method(req, res)} ${tokens.url(
    req,
    res
  )} ${tokens.status(req, res)} - ${tokens["response-time"](req, res)} ms`;
});

export { logger };
