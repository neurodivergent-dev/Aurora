import { logger, consoleTransport } from "react-native-logs";

const config = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: __DEV__ ? "debug" : "info",
  transport: consoleTransport,
  transportOptions: {
    colors: {
      info: "blueBright",
      warn: "yellowBright",
      error: "redBright",
    } as Record<string, "blueBright" | "yellowBright" | "redBright">,
  },
  async: true,
  dateFormat: "time",
  printLevel: true,
  printDate: true,
  enabled: true,
};

const log = logger.createLogger(config);

/**
 * Enhanced logger with support for namespaces/tags
 * Usage: logger.info("message", "Tag")
 */
export const auroraLogger = {
  debug: (message: string, tag?: string) => {
    const prefix = tag ? `[${tag}] ` : "";
    log.debug(`${prefix}${message}`);
  },
  info: (message: string, tag?: string) => {
    const prefix = tag ? `[${tag}] ` : "";
    log.info(`${prefix}${message}`);
  },
  warn: (message: string, tag?: string) => {
    const prefix = tag ? `[${tag}] ` : "";
    log.warn(`${prefix}${message}`);
  },
  error: (message: string, tag?: string) => {
    const prefix = tag ? `[${tag}] ` : "";
    log.error(`${prefix}${message}`);
  },
};

export default auroraLogger;
