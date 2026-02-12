import * as vscode from 'vscode';
import { UserInputData, ChatMessage } from './types';
import { getValidatedConfiguration } from './configValidation';
import { getLogger } from './logger';

/**
 * Response structure from the Backend API.
 */
export interface APIResponse {
  message: string;
  isPRD: boolean;
  error?: string;
}

/**
 * Custom error classes for different error scenarios.
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class APIError extends Error {
  public statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
  }
}

/**
 * Client for communicating with the Infra Genie Backend API.
 * 
 * The BackendAPIClient handles:
 * - Reading configuration from VS Code settings
 * - Making HTTP requests to the backend API
 * - Handling errors and timeouts
 * - Parsing and returning API responses
 */
export class BackendAPIClient {
  private baseURL!: string;
  private timeout!: number;

  constructor() {
    this.loadConfiguration();
  }

  /**
   * Loads configuration from VS Code settings with validation.
   * Reads the API endpoint and timeout values.
   */
  private loadConfiguration(): void {
    const logger = getLogger();
    const config = getValidatedConfiguration();
    this.baseURL = config.apiEndpoint;
    this.timeout = config.apiTimeout;
    
    logger.info(
      `Configuration loaded: endpoint=${this.baseURL}, timeout=${this.timeout}ms`,
      'BackendAPIClient.loadConfiguration'
    );
  }

  /**
   * Reloads configuration from VS Code settings.
   * Should be called when configuration changes are detected.
   */
  public reloadConfiguration(): void {
    this.loadConfiguration();
  }

  /**
   * Sends the initial request to the backend API with user input data and first message.
   * This is called when the user submits the initial questionnaire and sends their first message.
   * 
   * @param userInput - The user input data from the questionnaire
   * @param message - The first message from the user
   * @returns Promise resolving to the API response
   * @throws NetworkError, TimeoutError, or APIError on failure
   */
  async sendInitialRequest(
    userInput: UserInputData,
    message: string
  ): Promise<APIResponse> {
    const url = `${this.baseURL}/spec/init`;
    const body = JSON.stringify({ userInput, message });

    return this.makeRequest(url, body);
  }

  /**
   * Sends a chat message to the backend API with conversation history.
   * This is called for subsequent messages after the initial request.
   * 
   * @param message - The user's message
   * @param history - The conversation history
   * @returns Promise resolving to the API response
   * @throws NetworkError, TimeoutError, or APIError on failure
   */
  async sendMessage(
    message: string,
    history: ChatMessage[]
  ): Promise<APIResponse> {
    const url = `${this.baseURL}/spec/chat`;
    const body = JSON.stringify({ message, history });

    return this.makeRequest(url, body);
  }

  /**
   * Makes an HTTP POST request to the specified URL with error handling.
   * 
   * @param url - The full URL to send the request to
   * @param body - The JSON string body to send
   * @returns Promise resolving to the API response
   * @throws NetworkError, TimeoutError, or APIError on failure
   */
  private async makeRequest(url: string, body: string): Promise<APIResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new APIError(
          `API error (${response.status}): ${errorText}`,
          response.status
        );
      }

      const data = await response.json();
      return data as APIResponse;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new TimeoutError(
          'Request timed out. The backend API is taking too long to respond.'
        );
      } else if (error instanceof APIError) {
        throw error;
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError(
          'Unable to reach the backend API. Please check your internet connection.'
        );
      } else {
        throw new NetworkError(
          `Network error: ${error.message || 'Unknown error occurred'}`
        );
      }
    }
  }
}
