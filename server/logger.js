/**
 * Server-side structured logger
 * Provides consistent logging format for the Express API server
 */

const isDevelopment = process.env.NODE_ENV !== 'production';
const useJsonFormat = process.env.LOG_FORMAT === 'json';

const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

class Logger {
  constructor() {
    this.minLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    this.globalContext = {};
  }

  shouldLog(level) {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  setContext(context) {
    this.globalContext = { ...this.globalContext, ...context };
  }

  clearContext() {
    this.globalContext = {};
  }

  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const mergedContext = { ...this.globalContext, ...context };

    if (useJsonFormat) {
      // JSON format for production log aggregation
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        ...mergedContext,
      });
    } else {
      // Pretty format for development
      const contextStr = Object.keys(mergedContext).length > 0
        ? ` ${JSON.stringify(mergedContext)}`
        : '';
      return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }
  }

  debug(message, context) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message, context) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  warn(message, context) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
  }

  error(message, error, context = {}) {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = { ...context };

      if (error) {
        if (error instanceof Error) {
          errorContext.error = {
            name: error.name,
            message: error.message,
            stack: error.stack,
          };
        } else {
          errorContext.error = error;
        }
      }

      console.error(this.formatMessage(LogLevel.ERROR, message, errorContext));
    }
  }

  setLevel(level) {
    this.minLevel = level;
  }
}

export const logger = new Logger();
export { LogLevel };

