/**
 * Type definitions for messages exchanged between the webview and extension host.
 */

/**
 * User input data collected from the initial questionnaire.
 */
export interface UserInputData {
  appType: string;
  expectedUsers: string;
  trafficPattern: string;
  processingType: 'real-time' | 'batch';
  dataSensitivity: string;
  regions: string[];
  availabilityRequirement: string;
  detailedDescription: string;
}

/**
 * Represents a single message in the chat conversation.
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isPRD?: boolean;
}

/**
 * Messages sent from the webview to the extension host.
 */
export type WebviewMessage =
  | { type: 'submitUserInput'; data: UserInputData }
  | { type: 'sendChatMessage'; data: { message: string } }
  | { type: 'newSession' }
  | { type: 'savePRD'; data: { content: string; filename: string } };

/**
 * Messages sent from the extension host to the webview.
 */
export type ExtensionMessage =
  | { type: 'chatResponse'; data: { message: string; isPRD: boolean } }
  | { type: 'error'; data: { message: string; canRetry?: boolean } }
  | { type: 'loading'; data: { isLoading: boolean } }
  | { type: 'sessionCleared' };
