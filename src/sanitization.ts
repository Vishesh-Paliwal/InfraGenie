import { UserInputData } from './types';
import { APIResponse } from './BackendAPIClient';

/**
 * Sanitization utilities for user input and API responses.
 * 
 * This module provides functions to sanitize data before sending to the backend API
 * and before displaying in the webview. It uses simple string operations to remove
 * potentially dangerous HTML/JavaScript content.
 * 
 * Requirements: 9.3, 9.4
 */

/**
 * Sanitizes a string by removing potentially dangerous HTML/JavaScript content.
 * 
 * @param input - The string to sanitize
 * @returns The sanitized string
 */
function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags and script content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
  
  return sanitized.trim();
}

/**
 * Sanitizes an array of strings.
 * 
 * @param input - The array of strings to sanitize
 * @returns The sanitized array
 */
function sanitizeStringArray(input: string[]): string[] {
  if (!Array.isArray(input)) {
    return [];
  }
  
  return input.map(item => sanitizeString(item)).filter(item => item.length > 0);
}

/**
 * Sanitizes user input data from the form.
 * Removes potentially dangerous content while preserving legitimate user input.
 * 
 * @param data - The user input data to sanitize
 * @returns The sanitized user input data
 */
export function sanitizeUserInput(data: UserInputData): UserInputData {
  return {
    appType: sanitizeString(data.appType),
    expectedUsers: sanitizeString(data.expectedUsers),
    trafficPattern: sanitizeString(data.trafficPattern),
    processingType: data.processingType === 'real-time' || data.processingType === 'batch' 
      ? data.processingType 
      : 'real-time',
    dataSensitivity: sanitizeString(data.dataSensitivity),
    regions: sanitizeStringArray(data.regions),
    availabilityRequirement: sanitizeString(data.availabilityRequirement),
    detailedDescription: sanitizeString(data.detailedDescription),
  };
}

/**
 * Sanitizes a chat message string.
 * Removes potentially dangerous content while preserving the message text.
 * 
 * @param message - The message to sanitize
 * @returns The sanitized message
 */
export function sanitizeChatMessage(message: string): string {
  return sanitizeString(message);
}

/**
 * Sanitizes an API response before displaying in the webview.
 * Allows safe markdown/HTML for rendering but removes dangerous scripts.
 * 
 * @param response - The API response to sanitize
 * @returns The sanitized API response
 */
export function sanitizeAPIResponse(response: APIResponse): APIResponse {
  // For API responses, we do basic sanitization but preserve formatting
  let sanitizedMessage = response.message;
  
  // Remove script tags and event handlers
  sanitizedMessage = sanitizedMessage.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitizedMessage = sanitizedMessage.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitizedMessage = sanitizedMessage.replace(/javascript:/gi, '');
  
  return {
    message: sanitizedMessage,
    isPRD: Boolean(response.isPRD),
    error: response.error ? sanitizeString(response.error) : undefined,
  };
}

/**
 * Sanitizes a filename to prevent path traversal attacks.
 * Removes directory separators and other dangerous characters.
 * 
 * @param filename - The filename to sanitize
 * @returns The sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') {
    return 'untitled.md';
  }
  
  // Remove path separators and dangerous characters
  let sanitized = filename.replace(/[/\\:*?"<>|]/g, '');
  
  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[.\s]+|[.\s]+$/g, '');
  
  // Ensure it's not empty
  if (sanitized.length === 0) {
    return 'untitled.md';
  }
  
  // Ensure it has a .md extension
  if (!sanitized.endsWith('.md')) {
    sanitized += '.md';
  }
  
  return sanitized;
}
