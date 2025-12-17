/**
 * Centralized logging utility for KryptoTrac
 * 
 * Environment-aware logging that:
 * - Silences debug/info logs in production (except errors)
 * - Pretty-prints in development
 * - Structured JSON in production for log aggregation
 * 
 * Usage:
 * import { logger } from '@/lib/logger';
 * logger.info('User signed up', { userId: '123' });
 * logger.error('Payment failed', { error: e, userId: '123' });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Format log message for output
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    
    if (this.isProduction) {
      // Structured JSON for production log aggregation (CloudWatch, DataDog, etc.)
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        ...context,
      });
    } else {
      // Pretty-print for development
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      }[level];
      
      const contextStr = context ? `\n${JSON.stringify(context, null, 2)}` : '';
      return `${emoji} [${level.toUpperCase()}] ${message}${contextStr}`;
    }
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    if (this.isProduction) {
      // In production, only log warnings and errors
      return level === 'warn' || level === 'error';
    }
    // In development, log everything
    return true;
  }

  /**
   * Debug-level logging (verbose, development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Info-level logging (general information)
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, context));
    }
  }

  /**
   * Warning-level logging (unexpected but handled situations)
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  /**
   * Error-level logging (errors and exceptions)
   */
  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context));
    }
  }

  /**
   * Legacy compatibility: Log with [v0] tag (for gradual migration)
   */
  v0(level: LogLevel, message: string, context?: LogContext): void {
    const v0Message = `[v0] ${message}`;
    
    switch (level) {
      case 'debug':
        this.debug(v0Message, context);
        break;
      case 'info':
        this.info(v0Message, context);
        break;
      case 'warn':
        this.warn(v0Message, context);
        break;
      case 'error':
        this.error(v0Message, context);
        break;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for external use
export type { LogLevel, LogContext };
