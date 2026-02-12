import * as vscode from 'vscode';
import { WebviewMessage, ExtensionMessage } from './types';

/**
 * Manages the webview panel lifecycle for the Infra Genie extension.
 * Implements singleton pattern to ensure only one panel exists at a time.
 */
export class WebviewPanelManager {
  private static currentPanel: WebviewPanelManager | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
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

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.extensionUri = extensionUri;

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
   * TODO: Will be implemented in task 7.1
   */
  private async handleUserInputSubmission(data: any): Promise<void> {
    // Placeholder for task 7.1
    console.log('User input submitted:', data);
  }

  /**
   * Handles chat message from user.
   * TODO: Will be implemented in task 7.2
   */
  private async handleChatMessage(data: any): Promise<void> {
    // Placeholder for task 7.2
    console.log('Chat message received:', data);
  }

  /**
   * Handles new session request.
   * TODO: Will be implemented in task 7.3
   */
  private handleNewSession(): void {
    // Placeholder for task 7.3
    console.log('New session requested');
  }

  /**
   * Handles PRD save request.
   * TODO: Will be implemented in task 7.4
   */
  private async handleSavePRD(data: any): Promise<void> {
    // Placeholder for task 7.4
    console.log('Save PRD requested:', data);
  }

  /**
   * Cleans up resources when the panel is disposed.
   */
  private dispose(): void {
    WebviewPanelManager.currentPanel = undefined;

    // TODO: Clear session data (will be implemented in task 4 when SessionManager is created)
    // this.sessionManager.clearSession();

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
