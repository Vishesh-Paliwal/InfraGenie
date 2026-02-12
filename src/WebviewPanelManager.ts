import * as vscode from 'vscode';
import { WebviewMessage, ExtensionMessage, UserInputData, ChatMessage } from './types';
import { SessionManager } from './SessionManager';
import { BackendAPIClient, NetworkError, TimeoutError, APIError } from './BackendAPIClient';
import { sanitizeUserInput, sanitizeChatMessage, sanitizeAPIResponse, sanitizeFilename } from './sanitization';
import { getLogger } from './logger';

/**
 * Manages the webview panel lifecycle for the Infra Genie extension.
 * Implements singleton pattern to ensure only one panel exists at a time.
 */
export class WebviewPanelManager {
  private static currentPanel: WebviewPanelManager | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private readonly sessionManager: SessionManager;
  private readonly apiClient: BackendAPIClient;
  private disposables: vscode.Disposable[] = [];

  /**
   * Creates or shows the webview panel.
   * If a panel already exists, it will be revealed instead of creating a new one.
   */
  public static createOrShow(extensionUri: vscode.Uri): void {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (WebviewPanelManager.currentPanel) {
      WebviewPanelManager.currentPanel.panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      'infraGenieWebview',
      'Infra Genie',
      column || vscode.ViewColumn.One,
      {
        // Enable JavaScript in the webview
        enableScripts: true,
        
        // Retain context when hidden to preserve state
        retainContextWhenHidden: true,
        
        // Restrict the webview to only load resources from specific directories
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'out')
        ]
      }
    );

    WebviewPanelManager.currentPanel = new WebviewPanelManager(panel, extensionUri);
  }

  /**
   * Notifies the current panel that configuration has changed.
   * This triggers the BackendAPIClient to reload its configuration.
   */
  public static notifyConfigurationChanged(): void {
    if (WebviewPanelManager.currentPanel) {
      WebviewPanelManager.currentPanel.handleConfigurationChanged();
    }
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.extensionUri = extensionUri;
    this.sessionManager = new SessionManager();
    this.apiClient = new BackendAPIClient();

    // Set the webview's initial HTML content
    this.panel.webview.html = this.getWebviewContent(this.panel.webview);

    // Set up message listener
    this.panel.webview.onDidReceiveMessage(
      (message: WebviewMessage) => this.handleMessage(message),
      null,
      this.disposables
    );

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  /**
   * Generates the HTML content for the webview.
   * Includes proper Content Security Policy and script loading.
   */
  private getWebviewContent(webview: vscode.Webview): string {
    // Get the URI for the webview script
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'out', 'webview.js')
    );

    // Generate a nonce for inline scripts to satisfy CSP
    const nonce = this.getNonce();

    // Content Security Policy
    // - default-src 'none': Deny all by default
    // - img-src: Allow images from webview and https
    // - script-src: Allow scripts with nonce
    // - style-src: Allow inline styles (needed for React)
    // - font-src: Allow fonts from webview
    const csp = [
      `default-src 'none'`,
      `img-src ${webview.cspSource} https:`,
      `script-src 'nonce-${nonce}'`,
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `font-src ${webview.cspSource}`
    ].join('; ');

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="${csp}">
      <title>Infra Genie</title>
    </head>
    <body>
      <div id="root"></div>
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
  }

  /**
   * Generates a random nonce for Content Security Policy.
   */
  private getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /**
   * Handles messages received from the webview.
   * Routes messages to appropriate handlers based on message type.
   */
  private async handleMessage(message: WebviewMessage): Promise<void> {
    switch (message.type) {
      case 'submitUserInput':
        await this.handleUserInputSubmission(message.data);
        break;
      case 'sendChatMessage':
        await this.handleChatMessage(message.data);
        break;
      case 'newSession':
        this.handleNewSession();
        break;
      case 'savePRD':
        await this.handleSavePRD(message.data);
        break;
    }
  }

  /**
   * Sends a message to the webview.
   */
  private sendMessage(message: ExtensionMessage): void {
    this.panel.webview.postMessage(message);
  }

  /**
   * Handles user input form submission.
   * Receives user input form data from webview, initializes session, and sends acknowledgment.
   * Requirements: 2.3, 2.5
   */
  private async handleUserInputSubmission(data: UserInputData): Promise<void> {
    const logger = getLogger();
    try {
      // Sanitize user input
      const sanitizedData = sanitizeUserInput(data);
      
      // Initialize session with user input
      this.sessionManager.initializeSession(sanitizedData);
      
      // Log the action
      logger.info('User input submitted and session initialized', 'handleUserInputSubmission');
      
      // Send acknowledgment to webview
      this.sendMessage({
        type: 'loading',
        data: { isLoading: false }
      });
    } catch (error: any) {
      this.handleError(error, 'handleUserInputSubmission');
    }
  }

  /**
   * Handles chat message from user.
   * Receives chat message, adds to history, calls API, and sends response.
   * Requirements: 3.3, 4.2, 4.3, 4.4, 4.5, 6.4
   */
  private async handleChatMessage(data: { message: string }): Promise<void> {
    const logger = getLogger();
    try {
      // Sanitize the message
      const sanitizedMessage = sanitizeChatMessage(data.message);
      
      if (!sanitizedMessage || sanitizedMessage.trim().length === 0) {
        this.sendMessage({
          type: 'error',
          data: { message: 'Message cannot be empty' }
        });
        return;
      }
      
      // Add user message to session history
      const userMessage: ChatMessage = {
        role: 'user',
        content: sanitizedMessage,
        timestamp: Date.now()
      };
      this.sessionManager.addMessage(userMessage);
      
      // Send loading state to webview
      this.sendMessage({
        type: 'loading',
        data: { isLoading: true }
      });
      
      // Log the action
      logger.info('Sending chat message to API', 'handleChatMessage');
      
      // Call BackendAPIClient to send message
      const userInput = this.sessionManager.getUserInput();
      const history = this.sessionManager.getHistory();
      
      let apiResponse;
      if (userInput && history.length === 1) {
        // First message - send initial request with user input
        apiResponse = await this.apiClient.sendInitialRequest(userInput, sanitizedMessage);
      } else {
        // Subsequent messages - send with history
        apiResponse = await this.apiClient.sendMessage(sanitizedMessage, history);
      }
      
      // Sanitize API response
      const sanitizedResponse = sanitizeAPIResponse(apiResponse);
      
      // Add API response to session history
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: sanitizedResponse.message,
        timestamp: Date.now(),
        isPRD: sanitizedResponse.isPRD
      };
      this.sessionManager.addMessage(assistantMessage);
      
      // Send response to webview
      this.sendMessage({
        type: 'loading',
        data: { isLoading: false }
      });
      
      this.sendMessage({
        type: 'chatResponse',
        data: {
          message: sanitizedResponse.message,
          isPRD: sanitizedResponse.isPRD
        }
      });
      
      // Log success
      logger.info('Chat response received and sent to webview', 'handleChatMessage');
    } catch (error: any) {
      // Send loading false
      this.sendMessage({
        type: 'loading',
        data: { isLoading: false }
      });
      
      // Handle errors and send error messages to webview
      this.handleError(error, 'handleChatMessage');
    }
  }

  /**
   * Handles new session request.
   * Clears session data and sends confirmation to webview.
   * Requirements: 7.1, 7.5
   */
  private handleNewSession(): void {
    const logger = getLogger();
    try {
      // Clear session data via SessionManager
      this.sessionManager.clearSession();
      
      // Log the action
      logger.info('Session cleared', 'handleNewSession');
      
      // Send session cleared message to webview
      this.sendMessage({
        type: 'sessionCleared'
      });
    } catch (error: any) {
      this.handleError(error, 'handleNewSession');
    }
  }

  /**
   * Handles PRD save request.
   * Receives PRD content and filename, writes to workspace file.
   * Requirements: 5.4
   */
  private async handleSavePRD(data: { content: string; filename: string }): Promise<void> {
    const logger = getLogger();
    try {
      // Sanitize filename
      const sanitizedFilename = sanitizeFilename(data.filename);
      
      // Get workspace folder
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        throw new Error('No workspace folder open. Please open a folder first.');
      }
      
      // Create file path
      const filePath = vscode.Uri.joinPath(workspaceFolder.uri, sanitizedFilename);
      
      // Write PRD content to file using VS Code file system API
      await vscode.workspace.fs.writeFile(
        filePath,
        Buffer.from(data.content, 'utf8')
      );
      
      // Log success
      logger.info(`PRD saved to ${sanitizedFilename}`, 'handleSavePRD');
      
      // Show success notification
      vscode.window.showInformationMessage(`PRD saved to ${sanitizedFilename}`);
    } catch (error: any) {
      // Handle file system errors
      let errorMessage = 'Failed to save PRD';
      
      if (error.code === 'EACCES' || error.code === 'PermissionDenied') {
        errorMessage = 'Permission denied. Unable to write file.';
      } else if (error.code === 'ENOSPC' || error.code === 'NoSpace') {
        errorMessage = 'Disk full. Unable to save file.';
      } else if (error.message) {
        errorMessage = `Failed to save file: ${error.message}`;
      }
      
      // Log error
      logger.error(`Error saving PRD: ${errorMessage}`, error, 'handleSavePRD');
      
      // Show error notification
      vscode.window.showErrorMessage(`Infra Genie: ${errorMessage}`);
      
      // Send error to webview
      this.sendMessage({
        type: 'error',
        data: { message: errorMessage }
      });
    }
  }

  /**
   * Handles errors that occur during message processing.
   * Logs errors and sends appropriate messages to the webview.
   */
  private handleError(error: any, context: string): void {
    const logger = getLogger();
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let canRetry = false;
    
    // Determine error type, message, and whether it's retryable
    if (error instanceof NetworkError) {
      errorMessage = error.message;
      canRetry = true; // Network errors are retryable
    } else if (error instanceof TimeoutError) {
      errorMessage = error.message;
      canRetry = true; // Timeout errors are retryable
    } else if (error instanceof APIError) {
      errorMessage = error.message;
      canRetry = false; // API errors are typically not retryable
    } else if (error.message) {
      errorMessage = error.message;
      canRetry = false;
    }
    
    // Log error with full details
    logger.error(errorMessage, error, context);
    
    // Send error to webview with retry flag
    this.sendMessage({
      type: 'error',
      data: { 
        message: errorMessage,
        canRetry: canRetry
      }
    });
  }

  /**
   * Handles configuration changes.
   * Reloads the BackendAPIClient configuration when settings change.
   * Requirements: 8.3
   */
  private handleConfigurationChanged(): void {
    const logger = getLogger();
    logger.info('Configuration changed, reloading API client configuration', 'handleConfigurationChanged');
    this.apiClient.reloadConfiguration();
  }

  /**
   * Cleans up resources when the panel is disposed.
   */
  private dispose(): void {
    WebviewPanelManager.currentPanel = undefined;

    // Clear session data
    this.sessionManager.clearSession();

    // Clean up resources
    this.panel.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
