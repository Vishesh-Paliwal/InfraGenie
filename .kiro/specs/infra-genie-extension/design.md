# Design Document: Infra Genie Extension

## Overview

The Infra Genie Extension is a VS Code extension that provides an AI-powered interface for gathering project requirements and generating Product Requirements Documents (PRDs). The extension follows a multi-panel architecture with a main menu and a chat-based Spec feature. This design focuses on the Spec feature implementation while establishing the foundation for future Traffic Simulator and Deployer features.

The extension uses VS Code's webview API to render a React-based UI, communicates with a backend API for AI processing, and manages state through a message-passing architecture between the extension host and webview.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VS Code Extension Host                │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Extension Activation & Commands           │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Webview Panel Manager                   │  │
│  │  - Creates and manages webview lifecycle         │  │
│  │  - Handles message passing                       │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Backend API Client                      │  │
│  │  - HTTP request handling                          │  │
│  │  - Request/response serialization                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Message Passing
                           │
┌─────────────────────────────────────────────────────────┐
│                    Webview (React App)                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Main Menu Component                  │  │
│  │  - Displays three feature options                │  │
│  │  - Routes to Spec feature                        │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Spec Feature Component                  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │      User Input Form Component              │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │      Chat Interface Component               │  │  │
│  │  │  - Message list                             │  │  │
│  │  │  - Input field                              │  │  │
│  │  │  - PRD display                              │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Communication Flow

1. **Extension Activation**: User activates extension → Extension host creates webview panel → Webview loads React app
2. **User Interaction**: User interacts with UI → Webview sends message to extension host → Extension host processes and responds
3. **API Communication**: Extension host receives chat message → Makes HTTP request to Backend API → Receives response → Sends to webview
4. **State Management**: Webview maintains UI state → Extension host maintains session state → Both synchronized via messages

## Components and Interfaces

### Extension Host Components

#### ExtensionActivator
Responsible for registering commands and initializing the extension.

```typescript
interface ExtensionActivator {
  activate(context: vscode.ExtensionContext): void;
  deactivate(): void;
}

function activate(context: vscode.ExtensionContext): void {
  // Register command to open Infra Genie
  const command = vscode.commands.registerCommand(
    'infra-genie.open',
    () => WebviewPanelManager.createOrShow(context.extensionUri)
  );
  context.subscriptions.push(command);
}
```

#### WebviewPanelManager
Manages the webview panel lifecycle and message passing.

```typescript
interface WebviewPanelManager {
  createOrShow(extensionUri: vscode.Uri): void;
  dispose(): void;
  handleMessage(message: WebviewMessage): Promise<void>;
  sendMessage(message: ExtensionMessage): void;
}

class WebviewPanelManager {
  private static currentPanel?: WebviewPanelManager;
  private panel: vscode.WebviewPanel;
  private sessionManager: SessionManager;
  private apiClient: BackendAPIClient;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.sessionManager = new SessionManager();
    this.apiClient = new BackendAPIClient();
    
    // Set up message listener
    this.panel.webview.onDidReceiveMessage(
      message => this.handleMessage(message)
    );
  }

  static createOrShow(extensionUri: vscode.Uri): void {
    // Create or reveal existing panel
  }

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
}
```

#### BackendAPIClient
Handles HTTP communication with the backend API.

```typescript
interface BackendAPIClient {
  sendInitialRequest(userInput: UserInputData, message: string): Promise<APIResponse>;
  sendMessage(message: string, history: ChatMessage[]): Promise<APIResponse>;
}

interface UserInputData {
  appType: string;
  expectedUsers: string;
  trafficPattern: string;
  processingType: 'real-time' | 'batch';
  dataSensitivity: string;
  regions: string[];
  availabilityRequirement: string;
  detailedDescription: string;
}

interface APIResponse {
  message: string;
  isPRD: boolean;
  error?: string;
}

class BackendAPIClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    const config = vscode.workspace.getConfiguration('infraGenie');
    this.baseURL = config.get('apiEndpoint', 'https://api.infragenie.com');
    this.timeout = config.get('apiTimeout', 30000);
  }

  async sendInitialRequest(
    userInput: UserInputData,
    message: string
  ): Promise<APIResponse> {
    const response = await fetch(`${this.baseURL}/spec/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput, message }),
      signal: AbortSignal.timeout(this.timeout)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async sendMessage(
    message: string,
    history: ChatMessage[]
  ): Promise<APIResponse> {
    const response = await fetch(`${this.baseURL}/spec/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
      signal: AbortSignal.timeout(this.timeout)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return await response.json();
  }
}
```

#### SessionManager
Manages session state and conversation history.

```typescript
interface SessionManager {
  initializeSession(userInput: UserInputData): void;
  addMessage(message: ChatMessage): void;
  getHistory(): ChatMessage[];
  clearSession(): void;
  getUserInput(): UserInputData | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isPRD?: boolean;
}

class SessionManager {
  private userInput: UserInputData | null = null;
  private history: ChatMessage[] = [];

  initializeSession(userInput: UserInputData): void {
    this.userInput = userInput;
    this.history = [];
  }

  addMessage(message: ChatMessage): void {
    this.history.push(message);
  }

  getHistory(): ChatMessage[] {
    return [...this.history];
  }

  clearSession(): void {
    this.userInput = null;
    this.history = [];
  }

  getUserInput(): UserInputData | null {
    return this.userInput;
  }
}
```

### Webview Components (React)

#### Message Types
Defines the message protocol between webview and extension host.

```typescript
// Messages from webview to extension
type WebviewMessage =
  | { type: 'submitUserInput'; data: UserInputData }
  | { type: 'sendChatMessage'; data: { message: string } }
  | { type: 'newSession' }
  | { type: 'savePRD'; data: { content: string; filename: string } };

// Messages from extension to webview
type ExtensionMessage =
  | { type: 'chatResponse'; data: { message: string; isPRD: boolean } }
  | { type: 'error'; data: { message: string } }
  | { type: 'loading'; data: { isLoading: boolean } }
  | { type: 'sessionCleared' };
```

#### MainMenu Component
Displays the three feature options.

```typescript
interface MainMenuProps {
  onSelectFeature: (feature: 'spec' | 'traffic' | 'deployer') => void;
}

function MainMenu({ onSelectFeature }: MainMenuProps): JSX.Element {
  return (
    <div className="main-menu">
      <h1>Infra Genie</h1>
      <div className="feature-cards">
        <FeatureCard
          title="Spec"
          description="Generate PRDs from your project requirements"
          available={true}
          onClick={() => onSelectFeature('spec')}
        />
        <FeatureCard
          title="Traffic Simulator"
          description="Simulate traffic patterns for your application"
          available={false}
          onClick={() => {}}
        />
        <FeatureCard
          title="Deployer"
          description="Deploy your infrastructure to the cloud"
          available={false}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}
```

#### UserInputForm Component
Collects structured project information.

```typescript
interface UserInputFormProps {
  onSubmit: (data: UserInputData) => void;
}

interface FormErrors {
  [key: string]: string;
}

function UserInputForm({ onSubmit }: UserInputFormProps): JSX.Element {
  const [formData, setFormData] = useState<Partial<UserInputData>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.appType) newErrors.appType = 'App type is required';
    if (!formData.expectedUsers) newErrors.expectedUsers = 'Expected users is required';
    if (!formData.trafficPattern) newErrors.trafficPattern = 'Traffic pattern is required';
    if (!formData.processingType) newErrors.processingType = 'Processing type is required';
    if (!formData.dataSensitivity) newErrors.dataSensitivity = 'Data sensitivity is required';
    if (!formData.regions || formData.regions.length === 0) {
      newErrors.regions = 'At least one region is required';
    }
    if (!formData.availabilityRequirement) {
      newErrors.availabilityRequirement = 'Availability requirement is required';
    }
    if (!formData.detailedDescription) {
      newErrors.detailedDescription = 'Detailed description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData as UserInputData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-input-form">
      {/* Form fields with validation */}
    </form>
  );
}
```

#### ChatInterface Component
Displays conversation and handles message input.

```typescript
interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onNewSession: () => void;
  onSavePRD: (content: string, filename: string) => void;
}

function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  onNewSession,
  onSavePRD
}: ChatInterfaceProps): JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>Spec Chat</h2>
        <button onClick={onNewSession}>New Session</button>
      </div>
      
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            message={msg}
            onSavePRD={msg.isPRD ? onSavePRD : undefined}
          />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
```

#### MessageBubble Component
Renders individual chat messages with markdown support.

```typescript
interface MessageBubbleProps {
  message: ChatMessage;
  onSavePRD?: (content: string, filename: string) => void;
}

function MessageBubble({ message, onSavePRD }: MessageBubbleProps): JSX.Element {
  const [showCopyButton, setShowCopyButton] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  const handleSave = () => {
    if (onSavePRD) {
      const filename = `prd-${Date.now()}.md`;
      onSavePRD(message.content, filename);
    }
  };

  return (
    <div
      className={`message-bubble ${message.role}`}
      onMouseEnter={() => setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
    >
      <div className="message-content">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
      
      {message.isPRD && (
        <div className="prd-actions">
          <button onClick={copyToClipboard}>Copy</button>
          <button onClick={handleSave}>Save to File</button>
        </div>
      )}
      
      {showCopyButton && !message.isPRD && (
        <button className="copy-button" onClick={copyToClipboard}>
          Copy
        </button>
      )}
    </div>
  );
}
```

## Data Models

### UserInputData
Structured data collected from the initial questionnaire.

```typescript
interface UserInputData {
  appType: string;              // e.g., "SaaS", "AI app", "marketplace", "fintech"
  expectedUsers: string;        // e.g., "1000-10000", "10000+"
  trafficPattern: string;       // e.g., "steady", "spiky", "seasonal"
  processingType: 'real-time' | 'batch';
  dataSensitivity: string;      // e.g., "public", "internal", "confidential", "regulated"
  regions: string[];            // e.g., ["us-east-1", "eu-west-1"]
  availabilityRequirement: string; // e.g., "99.9%", "99.99%", "99.999%"
  detailedDescription: string;  // Free-form text description
}
```

### ChatMessage
Represents a single message in the conversation.

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isPRD?: boolean;  // True if this message contains a generated PRD
}
```

### Configuration
Extension configuration settings.

```typescript
interface InfraGenieConfig {
  apiEndpoint: string;    // Backend API base URL
  apiTimeout: number;     // Request timeout in milliseconds
}
```

## Data Flow

### Initial Session Flow

1. User activates extension → Main menu displayed
2. User clicks "Spec" → User input form displayed
3. User fills form and submits → Form data validated
4. Valid form → Chat interface displayed with form data stored
5. User sends first message → Extension sends form data + message to API
6. API processes and returns response → Response displayed in chat

### Subsequent Message Flow

1. User types message in chat interface
2. Webview sends message to extension host
3. Extension host adds user message to session history
4. Extension host sends message + history to Backend API
5. Backend API processes and returns response
6. Extension host adds response to session history
7. Extension host sends response to webview
8. Webview displays response in chat interface

### PRD Generation Flow

1. Backend API determines PRD should be generated
2. API returns response with `isPRD: true` flag
3. Extension host receives response and forwards to webview
4. Webview displays PRD with special formatting
5. User can copy PRD or save to file
6. If save requested, webview sends save message to extension host
7. Extension host writes PRD to workspace file

### Error Handling Flow

1. Error occurs (network, API, validation)
2. Extension host catches error
3. Extension host sends error message to webview
4. Webview displays error notification
5. User can retry or continue session
6. Extension host logs error to output channel


## Error Handling

### Error Categories

1. **Network Errors**
   - Connection failures
   - Timeouts
   - DNS resolution failures

2. **API Errors**
   - 4xx client errors (bad request, unauthorized)
   - 5xx server errors (internal server error, service unavailable)
   - Invalid response format

3. **Validation Errors**
   - Missing required form fields
   - Invalid configuration values
   - Malformed user input

4. **File System Errors**
   - Permission denied when saving PRD
   - Disk full
   - Invalid file path

5. **Extension Errors**
   - Webview disposal during operation
   - Message passing failures
   - State corruption

### Error Handling Strategy

#### Network and API Errors

```typescript
async function handleAPIRequest<T>(
  requestFn: () => Promise<T>
): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network connectivity issue
      throw new NetworkError('Unable to reach the backend API. Please check your internet connection.');
    } else if (error.name === 'AbortError') {
      // Timeout
      throw new TimeoutError('Request timed out. The backend API is taking too long to respond.');
    } else if (error instanceof Response) {
      // HTTP error response
      const message = await error.text();
      throw new APIError(`API error (${error.status}): ${message}`);
    } else {
      // Unknown error
      throw new UnknownError('An unexpected error occurred. Please try again.');
    }
  }
}
```

#### Validation Errors

```typescript
function validateUserInput(data: Partial<UserInputData>): ValidationResult {
  const errors: ValidationErrors = {};
  
  // Check each required field
  if (!data.appType) errors.appType = 'App type is required';
  if (!data.expectedUsers) errors.expectedUsers = 'Expected users is required';
  // ... other validations
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
```

#### File System Errors

```typescript
async function savePRDToFile(content: string, filename: string): Promise<void> {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error('No workspace folder open. Please open a folder first.');
    }
    
    const filePath = vscode.Uri.joinPath(workspaceFolder.uri, filename);
    await vscode.workspace.fs.writeFile(
      filePath,
      Buffer.from(content, 'utf8')
    );
    
    vscode.window.showInformationMessage(`PRD saved to ${filename}`);
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error('Permission denied. Unable to write file.');
    } else if (error.code === 'ENOSPC') {
      throw new Error('Disk full. Unable to save file.');
    } else {
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }
}
```

#### Error Recovery

All errors should:
1. Be logged to the VS Code output channel for debugging
2. Display a user-friendly message in the UI
3. Preserve the current session state
4. Provide a retry mechanism where applicable
5. Not crash the extension or leave it in an unusable state

```typescript
function handleError(error: Error, context: string): void {
  // Log to output channel
  outputChannel.appendLine(`[${new Date().toISOString()}] Error in ${context}: ${error.message}`);
  outputChannel.appendLine(error.stack || '');
  
  // Send error to webview
  webviewPanel.webview.postMessage({
    type: 'error',
    data: {
      message: error.message,
      canRetry: error instanceof NetworkError || error instanceof TimeoutError
    }
  });
  
  // Show notification for critical errors
  if (error instanceof UnknownError) {
    vscode.window.showErrorMessage(
      `Infra Genie: ${error.message}`,
      'View Logs'
    ).then(selection => {
      if (selection === 'View Logs') {
        outputChannel.show();
      }
    });
  }
}
```

## Testing Strategy

The initial implementation will focus on manual testing to verify the application works correctly. Automated tests can be added in future iterations if needed.

### Manual Testing Checklist

1. **Extension Activation**: Verify extension activates and displays main menu
2. **Navigation**: Test clicking on Spec, Traffic Simulator, and Deployer options
3. **User Input Form**: Fill out form with various inputs and test validation
4. **Chat Interface**: Send messages and verify they appear correctly
5. **API Communication**: Test backend integration with real API calls
6. **PRD Display**: Verify PRD is displayed with proper formatting
7. **Error Handling**: Test with network disconnected, invalid inputs, etc.
8. **Session Management**: Test new session, closing/reopening extension
9. **File Operations**: Test saving PRD to workspace
10. **Configuration**: Test changing API endpoint and timeout settings
