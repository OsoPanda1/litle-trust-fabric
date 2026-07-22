export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  module: string;
  data?: Record<string, unknown>;
  error?: { name?: string; message: string; stack?: string };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (typeof process !== "undefined" && process.env.LITLE_LOG_LEVEL === "debug") ? "debug" : "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function toEntry(level: LogLevel, message: string, module: string, data?: unknown): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    module,
  };
  if (data instanceof Error) {
    entry.error = { name: data.name, message: data.message, stack: data.stack };
  } else if (data && typeof data === "object") {
    entry.data = data as Record<string, unknown>;
  }
  return entry;
}

function write(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return;
  const line = JSON.stringify(entry);
  switch (entry.level) {
    case "error": console.error(line); break;
    case "warn": console.warn(line); break;
    case "debug": console.debug(line); break;
    default: console.log(line);
  }
}

export const logger = {
  debug: (message: string, module: string, data?: unknown) => write(toEntry("debug", message, module, data)),
  info: (message: string, module: string, data?: unknown) => write(toEntry("info", message, module, data)),
  warn: (message: string, module: string, data?: unknown) => write(toEntry("warn", message, module, data)),
  error: (message: string, module: string, data?: unknown) => write(toEntry("error", message, module, data)),
};
