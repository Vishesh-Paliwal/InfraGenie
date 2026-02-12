import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { UserInputData, ChatMessage } from './types';
import { APIResponse } from './BackendAPIClient';

/**
 * Sanitization utilities for user input and API responses.
 * 
 * This module provides functions to sanitize data before sending to the backend API
 * and before displaying in the webview. It uses DOMPurify to remove potentially
 * dangerous HTML/JavaScript content.
 * 
 * Requirements: 9.3, 9.4
 */

// Create a DOMPurify instance for Node.js environment
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

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
  
  // Remove any HTML tags and scripts
  const sanitized = purify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });
  
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
  // For API responses, we allow some HTML/markdown for formatting
  // but remove dangerous elements like scripts, iframes, etc.
  const sanitizedMessage = purify.sanitize(response.message, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'table', 'thead',
      'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  });
  
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
