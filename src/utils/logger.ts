import { LOG_LEVELS, DEFAULT_CONFIG } from '@/config/constants';

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

export class Logger {
  private readonly level: LogLevel;
  private readonly maxLength: number;

  constructor(level: LogLevel = LOG_LEVELS.INFO, maxLength: number = DEFAULT_CONFIG.MAX_LOG_LENGTH) {
    this.level = level;
    this.maxLength = maxLength;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LOG_LEVELS.ERROR, LOG_LEVELS.WARN, LOG_LEVELS.INFO, LOG_LEVELS.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }

  private formatMessage(message: string): string {
    if (message.length <= this.maxLength) {
      return message;
    }
    return message.substring(0, this.maxLength - 3) + '...';
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message: this.formatMessage(message),
      context,
      error,
    };
  }

  private output(entry: LogEntry): void {
    const logMessage = {
      ...entry,
      error: entry.error ? {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack,
      } : undefined,
    };

    // Cloudflare Workers環境ではconsoleを使用
    switch (entry.level) {
      case LOG_LEVELS.ERROR:
        console.error(JSON.stringify(logMessage));
        break;
      case LOG_LEVELS.WARN:
        console.warn(JSON.stringify(logMessage));
        break;
      case LOG_LEVELS.INFO:
        console.info(JSON.stringify(logMessage));
        break;
      case LOG_LEVELS.DEBUG:
        console.debug(JSON.stringify(logMessage));
        break;
    }
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      this.output(this.createLogEntry(LOG_LEVELS.ERROR, message, context, error));
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      this.output(this.createLogEntry(LOG_LEVELS.WARN, message, context));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      this.output(this.createLogEntry(LOG_LEVELS.INFO, message, context));
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      this.output(this.createLogEntry(LOG_LEVELS.DEBUG, message, context));
    }
  }
}

// デフォルトのloggerインスタンス
let defaultLogger: Logger;

export function getLogger(env?: { LOG_LEVEL?: string }): Logger {
  if (!defaultLogger) {
    const logLevel = (env?.LOG_LEVEL as LogLevel) || LOG_LEVELS.INFO;
    defaultLogger = new Logger(logLevel);
  }
  return defaultLogger;
}