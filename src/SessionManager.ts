import { UserInputData, ChatMessage } from './types';

/**
 * Manages session state and conversation history for the Spec feature.
 * 
 * The SessionManager is responsible for:
 * - Storing user input data from the initial questionnaire
 * - Managing the conversation history (messages between user and assistant)
 * - Providing methods to retrieve and clear session data
 */
export class SessionManager {
  private userInput: UserInputData | null = null;
  private history: ChatMessage[] = [];

  /**
   * Initializes a new session with user input data.
   * This should be called when the user submits the initial questionnaire.
   * 
   * @param userInput - The user input data from the questionnaire
   */
  initializeSession(userInput: UserInputData): void {
    this.userInput = userInput;
    this.history = [];
  }

  /**
   * Adds a message to the conversation history.
   * 
   * @param message - The chat message to add (user or assistant)
   */
  addMessage(message: ChatMessage): void {
    this.history.push(message);
  }

  /**
   * Retrieves the complete conversation history.
   * Returns a copy of the history array to prevent external modifications.
   * 
   * @returns A copy of the conversation history
   */
  getHistory(): ChatMessage[] {
    return [...this.history];
  }

  /**
   * Clears all session data including user input and conversation history.
   * This should be called when starting a new session.
   */
  clearSession(): void {
    this.userInput = null;
    this.history = [];
  }

  /**
   * Retrieves the stored user input data.
   * 
   * @returns The user input data, or null if no session has been initialized
   */
  getUserInput(): UserInputData | null {
    return this.userInput;
  }
}
