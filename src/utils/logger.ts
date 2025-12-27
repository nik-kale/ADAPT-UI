// Production-safe logger utility with structured logging and correlation ID support

const isDevelopment = import.meta.env.MODE === 'development';
const useJsonFormat = import.meta.env.VITE_LOG_FORMAT === 'json';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  component?: string;
  action?: string;
  correlationId?: string;
  [key: string]: any;
}

class Logger {
  private minLevel: LogLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  private globalContext: LogContext = {};

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  /**
   * Set global context that will be included in all log messages
   * Useful for correlation IDs, request IDs, tenant IDs, etc.
   */
  setContext(context: LogContext): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  /**
   * Clear global context
   */
  clearContext(): void {
    this.globalContext = {};
  }

  /**
   * Get current global context
   */
  getContext(): LogContext {
    return { ...this.globalContext };
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const mergedContext = { ...this.globalContext, ...context };

    if (useJsonFormat) {
      // JSON format for production log aggregation tools
      const logEntry = {
        timestamp,
        level: level.toUpperCase(),
        message,
        ...mergedContext,
      };
      return JSON.stringify(logEntry);
    } else {
      // Pretty format for development
      const contextStr = Object.keys(mergedContext).length > 0
        ? ` ${JSON.stringify(mergedContext)}`
        : '';
      return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext: LogContext = { ...context };

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

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

export const logger = new Logger();

// Convenience exports
export const log = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
