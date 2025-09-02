/**
 * Production-Ready Logger
 * Provides environment-aware logging with support for different log levels
 */

import * as Application from 'expo-application';
import * as Device from 'expo-device';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
  NONE = 5
}

// Log entry interface
interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
  context?: {
    userId?: string;
    sessionId?: string;
    device?: string;
    platform?: string;
    version?: string;
  };
  error?: Error;
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  enableLocalStorage: boolean;
  maxLocalLogs: number;
  remoteEndpoint?: string;
}

class Logger {
  private config: LoggerConfig;
  private localLogs: LogEntry[] = [];
  private sessionId: string;
  private userId?: string;

  constructor() {
    // Set default configuration based on environment
    this.config = {
      minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.WARN,
      enableConsole: __DEV__,
      enableRemote: !__DEV__,
      enableLocalStorage: true,
      maxLocalLogs: 100,
      remoteEndpoint: process.env.EXPO_PUBLIC_LOG_ENDPOINT
    };
    
    // Generate session ID
    this.sessionId = this.generateSessionId();
  }

  /**
   * Configure the logger
   */
  configure(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set the current user ID for context
   */
  setUserId(userId: string | undefined) {
    this.userId = userId;
  }

  /**
   * Debug level logging (detailed information for debugging)
   */
  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Info level logging (general information)
   */
  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Warning level logging (potential issues)
   */
  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Error level logging (errors that need attention)
   */
  error(message: string, error?: Error | any, data?: any) {
    if (error instanceof Error) {
      this.log(LogLevel.ERROR, message, data, error);
    } else {
      this.log(LogLevel.ERROR, message, { error, ...data });
    }
  }

  /**
   * Fatal level logging (critical errors that may crash the app)
   */
  fatal(message: string, error?: Error, data?: any) {
    this.log(LogLevel.FATAL, message, data, error);
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    // Check if we should log this level
    if (level < this.config.minLevel) {
      return;
    }

    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
      error,
      context: this.getContext()
    };

    // Console logging
    if (this.config.enableConsole) {
      this.consoleLog(entry);
    }

    // Local storage
    if (this.config.enableLocalStorage) {
      this.storeLocally(entry);
    }

    // Remote logging
    if (this.config.enableRemote && level >= LogLevel.WARN) {
      this.sendToRemote(entry);
    }
  }

  /**
   * Log to console based on level
   */
  private consoleLog(entry: LogEntry) {
    const prefix = `[${this.getLevelString(entry.level)}] ${entry.timestamp.toISOString()}`;
    const message = `${prefix} - ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.log(message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry.error || entry.data);
        if (entry.error?.stack) {
          console.error(entry.error.stack);
        }
        break;
    }
  }

  /**
   * Store log entry locally
   */
  private storeLocally(entry: LogEntry) {
    this.localLogs.push(entry);
    
    // Trim logs if exceeded max
    if (this.localLogs.length > this.config.maxLocalLogs) {
      this.localLogs = this.localLogs.slice(-this.config.maxLocalLogs);
    }
  }

  /**
   * Send log entry to remote server
   */
  private async sendToRemote(entry: LogEntry) {
    if (!this.config.remoteEndpoint) {
      return;
    }

    try {
      const payload = {
        ...entry,
        timestamp: entry.timestamp.toISOString(),
        level: this.getLevelString(entry.level),
        error: entry.error ? {
          message: entry.error.message,
          stack: entry.error.stack,
          name: entry.error.name
        } : undefined
      };

      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      // Silently fail remote logging to avoid infinite loops
      if (this.config.enableConsole) {
        console.error('Failed to send log to remote:', error);
      }
    }
  }

  /**
   * Get current context information
   */
  private getContext() {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      device: Device.modelName || 'Unknown',
      platform: Device.osName || 'Unknown',
      version: Application.nativeApplicationVersion || 'Unknown'
    };
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert log level to string
   */
  private getLevelString(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return 'DEBUG';
      case LogLevel.INFO: return 'INFO';
      case LogLevel.WARN: return 'WARN';
      case LogLevel.ERROR: return 'ERROR';
      case LogLevel.FATAL: return 'FATAL';
      default: return 'UNKNOWN';
    }
  }

  /**
   * Get all local logs
   */
  getLocalLogs(): LogEntry[] {
    return [...this.localLogs];
  }

  /**
   * Clear local logs
   */
  clearLocalLogs() {
    this.localLogs = [];
  }

  /**
   * Export logs as JSON string
   */
  exportLogs(): string {
    return JSON.stringify(this.localLogs, null, 2);
  }

  /**
   * Track analytics event
   */
  trackEvent(eventName: string, properties?: Record<string, any>) {
    this.info(`Event: ${eventName}`, properties);
    
    // Here you could integrate with analytics services like:
    // - Firebase Analytics
    // - Mixpanel
    // - Amplitude
    // - Segment
  }

  /**
   * Track screen view
   */
  trackScreen(screenName: string, properties?: Record<string, any>) {
    this.info(`Screen: ${screenName}`, properties);
  }

  /**
   * Track user action
   */
  trackAction(action: string, target: string, properties?: Record<string, any>) {
    this.info(`Action: ${action} on ${target}`, properties);
  }

  /**
   * Performance timing helper
   */
  startTimer(label: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.debug(`Timer [${label}]: ${duration}ms`);
      return duration;
    };
  }
}

// Create singleton instance
const logger = new Logger();

// Export logger instance and types
export default logger;
export { Logger, LogEntry, LoggerConfig };

// Console replacements for production
if (!__DEV__) {
  // Override console methods in production
  console.log = (...args: any[]) => logger.debug(args.join(' '));
  console.info = (...args: any[]) => logger.info(args.join(' '));
  console.warn = (...args: any[]) => logger.warn(args.join(' '));
  console.error = (...args: any[]) => logger.error(args.join(' '));
  
  // Keep console.debug silent in production
  console.debug = () => {};
}