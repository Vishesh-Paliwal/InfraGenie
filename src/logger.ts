import * as vscode from 'vscode';

/**
 * Log levels for categorizing log messages.
 */
export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

/**
 * Logger utility for consistent logging throughout the extension.
 * Provides methods for logging messages with timestamps, context, and formatted stack traces.
 * All logs are written to the VS Code output channel.
 */
export class Logger {
  private static instance: Logger | undefined;
  private outputChannel: vscode.OutputChannel;

  private constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  /**
   * Initializes the logger with an output channel.
   * Should be called once during extension activation.
   */
  public static initialize(outputChannel: vscode.OutputChannel): void {
    Logger.instance = new Logger(outputChannel);
  }

  /**
   * Gets the logger instance.
   * Throws an error if the logger has not been initialized.
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      throw new Error('Logger not initialized. Call Logger.initialize() first.');
    }
    return Logger.instance;
  }

  /**
   * Logs an informational message.
   * 
   * @param message - The message to log
   * @param context - Optional context (e.g., function name, component name)
   */
  public info(message: string, context?: string): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Logs a warning message.
   * 
   * @param message - The message to log
   * @param context - Optional context (e.g., function name, component name)
   */
  public warning(message: string, context?: string): void {
    this.log(LogLevel.WARNING, message, context);
  }

  /**
   * Logs an error message with optional error object.
   * If an error object is provided, the stack trace will be formatted and logged.
   * 
   * @param message - The error message to log
   * @param error - Optional error object
   * @param context - Optional context (e.g., function name, component name)
   */
  public error(message: string, error?: Error | any, context?: string): void {
    this.log(LogLevel.ERROR, message, context);
    
    if (error) {
      // Log error details
      if (error.name) {
        this.outputChannel.appendLine(`  Error Type: ${error.name}`);
      }
      
      if (error.message && error.message !== message) {
        this.outputChannel.appendLine(`  Error Message: ${error.message}`);
      }
      
      // Log additional error properties
      if (error.code) {
        this.outputChannel.appendLine(`  Error Code: ${error.code}`);
      }
      
      if (error.statusCode) {
        this.outputChannel.appendLine(`  Status Code: ${error.statusCode}`);
      }
      
      // Format and log stack trace
      if (error.stack) {
        this.outputChannel.appendLine('  Stack Trace:');
        const stackLines = this.formatStackTrace(error.stack);
        stackLines.forEach(line => {
          this.outputChannel.appendLine(`    ${line}`);
        });
      }
    }
  }

  /**
   * Logs a debug message.
   * 
   * @param message - The message to log
   * @param context - Optional context (e.g., function name, component name)
   */
  public debug(message: string, context?: string): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Shows the output channel to the user.
   * Useful for displaying logs when an error occurs.
   */
  public show(): void {
    this.outputChannel.show();
  }

  /**
   * Internal method to log a message with timestamp and level.
   * 
   * @param level - The log level
   * @param message - The message to log
   * @param context - Optional context
   */
  private log(level: LogLevel, message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';
    const logMessage = `[${timestamp}] ${level}${contextStr}: ${message}`;
    this.outputChannel.appendLine(logMessage);
  }

  /**
   * Formats a stack trace for better readability.
   * Splits the stack trace into lines and removes unnecessary whitespace.
   * 
   * @param stack - The stack trace string
   * @returns Array of formatted stack trace lines
   */
  private formatStackTrace(stack: string): string[] {
    const lines = stack.split('\n');
    return lines
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
}

/**
 * Convenience function to get the logger instance.
 * Throws an error if the logger has not been initialized.
 */
export function getLogger(): Logger {
  return Logger.getInstance();
}
