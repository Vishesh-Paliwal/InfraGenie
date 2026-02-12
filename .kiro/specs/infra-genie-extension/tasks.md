# Implementation Plan: Infra Genie Extension

## Overview

This implementation plan breaks down the Infra Genie VS Code extension into discrete coding tasks. The extension will be built using TypeScript for the extension host and React for the webview UI. The implementation focuses on the Spec feature, which provides an AI-powered chat interface for requirements gathering and PRD generation.

## Tasks

- [x] 1. Set up React and webpack configuration
  - Install React, ReactDOM, and related dependencies
  - Install webpack and loaders for bundling
  - Create webpack.config.js for extension and webview bundles
  - Create webview source directory structure
  - Update package.json scripts for webpack build
  - _Requirements: 1.1_

- [x] 2. Update extension activation and command registration
  - Update extension.ts activate() function
  - Replace 'infragenie.helloWorld' with 'infra-genie.open' command
  - Update package.json to register new command
  - Set up extension context and subscriptions
  - Create VS Code output channel for logging
  - _Requirements: 1.1, 6.5_

- [x] 3. Implement WebviewPanelManager
  - [x] 3.1 Create WebviewPanelManager class with singleton pattern
    - Implement createOrShow() method to create or reveal panel
    - Set up webview panel with proper options (enableScripts, retainContextWhenHidden)
    - Configure Content Security Policy for webview
    - _Requirements: 1.1, 9.1_
  
  - [x] 3.2 Implement message passing infrastructure
    - Set up onDidReceiveMessage listener
    - Create handleMessage() method with message type routing
    - Implement sendMessage() method to send messages to webview
    - Define TypeScript interfaces for WebviewMessage and ExtensionMessage types
    - _Requirements: 9.2_
  
  - [x] 3.3 Implement webview HTML generation
    - Create getWebviewContent() method to generate HTML
    - Include React bundle script in webview HTML
    - Set up proper CSP meta tags
    - Configure nonce for inline scripts
    - _Requirements: 9.1_
  
  - [x] 3.4 Implement panel lifecycle management
    - Handle panel disposal and cleanup
    - Clear session data on panel close
    - Prevent multiple panels from being created
    - _Requirements: 7.3_

- [x] 4. Implement SessionManager
  - Create SessionManager class to manage session state
  - Implement initializeSession() to store user input data
  - Implement addMessage() to append messages to history
  - Implement getHistory() to retrieve conversation history
  - Implement clearSession() to reset session state
  - Implement getUserInput() to retrieve stored user input
  - _Requirements: 2.5, 5.5, 7.1, 7.2_

- [x] 5. Implement BackendAPIClient
  - [x] 5.1 Create BackendAPIClient class with configuration
    - Read API endpoint and timeout from VS Code configuration
    - Set up fetch with proper headers and timeout
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [x] 5.2 Implement sendInitialRequest() method
    - Accept UserInputData and first message
    - Make POST request to /spec/init endpoint
    - Handle response parsing and error cases
    - _Requirements: 4.1_
  
  - [x] 5.3 Implement sendMessage() method
    - Accept message and conversation history
    - Make POST request to /spec/chat endpoint
    - Handle response parsing and error cases
    - _Requirements: 4.2_
  
  - [x] 5.4 Implement error handling for API calls
    - Handle network errors (connection refused, DNS failure)
    - Handle timeout errors
    - Handle HTTP error responses (4xx, 5xx)
    - Return structured error information
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 6. Implement input sanitization
  - Create sanitization utility functions
  - Implement sanitizeUserInput() for form data and messages
  - Implement sanitizeAPIResponse() for backend responses
  - Use DOMPurify or similar library for HTML sanitization
  - _Requirements: 9.3, 9.4_

- [ ] 7. Implement message handlers in WebviewPanelManager
  - [ ] 7.1 Implement handleUserInputSubmission()
    - Receive user input form data from webview
    - Initialize session with user input
    - Send acknowledgment to webview
    - _Requirements: 2.3, 2.5_
  
  - [ ] 7.2 Implement handleChatMessage()
    - Receive chat message from webview
    - Add user message to session history
    - Send loading state to webview
    - Call BackendAPIClient to send message
    - Add API response to session history
    - Send response to webview
    - Handle errors and send error messages to webview
    - _Requirements: 3.3, 4.2, 4.3, 4.4, 4.5, 6.4_
  
  - [ ] 7.3 Implement handleNewSession()
    - Clear session data via SessionManager
    - Send session cleared message to webview
    - _Requirements: 7.1, 7.5_
  
  - [ ] 7.4 Implement handleSavePRD()
    - Receive PRD content and filename from webview
    - Get workspace folder
    - Write PRD content to file using VS Code file system API
    - Handle file system errors
    - Show success/error notification
    - _Requirements: 5.4_

- [x] 8. Set up React webview application structure
  - Create React app entry point (index.tsx)
  - Set up VS Code API acquisition for message passing
  - Create App component with routing logic
  - Set up state management (useState/useContext)
  - Configure message listener for extension messages
  - _Requirements: 1.1_

- [x] 9. Implement MainMenu component
  - Create MainMenu component with three feature cards
  - Implement FeatureCard component for each option
  - Add click handlers for Spec (navigate), Traffic Simulator (coming soon), Deployer (coming soon)
  - Style cards to indicate availability status
  - Send navigation message to extension when Spec is clicked
  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [x] 10. Implement UserInputForm component
  - [x] 10.1 Create form structure with all required fields
    - App type dropdown/select
    - Expected users input field
    - Traffic pattern input field
    - Processing type radio buttons (real-time/batch)
    - Data sensitivity dropdown
    - Regions multi-select
    - Availability requirement input
    - Detailed description textarea
    - _Requirements: 2.2_
  
  - [x] 10.2 Implement form validation
    - Create validation logic for required fields
    - Display error messages for missing fields
    - Prevent submission when validation fails
    - _Requirements: 2.4_
  
  - [x] 10.3 Implement form submission
    - Collect form data on submit
    - Send submitUserInput message to extension
    - Transition to chat interface on success
    - _Requirements: 2.3_

- [ ] 11. Implement ChatInterface component
  - [ ] 11.1 Create chat layout structure
    - Header with title and "New Session" button
    - Scrollable messages container
    - Input area with textarea and send button
    - _Requirements: 3.1, 3.2, 7.5_
  
  - [ ] 11.2 Implement message display
    - Render messages from state
    - Use MessageBubble component for each message
    - Show loading indicator when API is processing
    - _Requirements: 3.3, 4.3_
  
  - [ ] 11.3 Implement auto-scroll behavior
    - Create ref for messages end
    - Use useEffect to scroll on new messages
    - Smooth scroll to bottom
    - _Requirements: 3.5_
  
  - [ ] 11.4 Implement message input handling
    - Controlled textarea with state
    - Send button click handler
    - Enter key to send (Shift+Enter for new line)
    - Disable input while loading
    - Clear input after sending
    - Send sendChatMessage to extension
    - _Requirements: 3.3_
  
  - [ ] 11.5 Implement new session handler
    - New Session button click handler
    - Send newSession message to extension
    - Clear local message state
    - Return to user input form
    - _Requirements: 7.1, 7.5_

- [ ] 12. Implement MessageBubble component
  - [ ] 12.1 Create message bubble layout
    - Different styling for user vs assistant messages
    - Display message content
    - Show timestamp
    - _Requirements: 3.4_
  
  - [ ] 12.2 Implement markdown rendering
    - Use react-markdown library
    - Render message content with markdown support
    - Apply syntax highlighting for code blocks
    - _Requirements: 5.2_
  
  - [ ] 12.3 Implement copy functionality
    - Show copy button on hover
    - Copy message content to clipboard
    - Show feedback on successful copy
    - _Requirements: 5.3_
  
  - [ ] 12.4 Implement PRD-specific actions
    - Detect if message is a PRD (isPRD flag)
    - Show Copy and Save buttons for PRD messages
    - Send savePRD message to extension on save click
    - _Requirements: 5.3, 5.4_

- [ ] 13. Implement error handling in webview
  - Create ErrorNotification component
  - Display error messages from extension
  - Show retry button for recoverable errors
  - Clear errors on successful operations
  - _Requirements: 4.5, 6.1, 6.2, 6.3_

- [ ] 14. Implement loading states in webview
  - Create LoadingIndicator component
  - Show loading spinner during API calls
  - Display loading text
  - Disable input during loading
  - _Requirements: 4.3, 10.3_

- [ ] 15. Implement accessibility features
  - Add ARIA labels to all interactive elements
  - Ensure keyboard navigation works for all controls
  - Add focus management for form fields
  - Test with screen reader
  - _Requirements: 10.1, 10.2_

- [ ] 16. Implement styling and theming
  - Create CSS modules for components
  - Use VS Code CSS variables for theming
  - Ensure styles respect light/dark theme
  - Make UI responsive
  - _Requirements: 10.4_

- [ ] 17. Implement configuration settings
  - Define configuration schema in package.json
  - Add infraGenie.apiEndpoint setting
  - Add infraGenie.apiTimeout setting
  - Provide default values
  - Add configuration validation
  - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [ ] 18. Implement configuration change handling
  - Listen for configuration changes in extension
  - Update BackendAPIClient when config changes
  - Apply new settings to subsequent requests
  - _Requirements: 8.3_

- [ ] 19. Implement error logging
  - Create logging utility
  - Log all errors to VS Code output channel
  - Include timestamps and context
  - Format error stack traces
  - _Requirements: 6.5_

- [ ] 20. Checkpoint - Manual testing
  - Test extension activation and main menu display
  - Test navigation between features
  - Test user input form validation
  - Test chat interface message sending
  - Test API integration (with mock or real backend)
  - Test PRD display and actions
  - Test error scenarios
  - Test session management
  - Test configuration settings
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Build and package extension
  - Configure webpack for production build
  - Optimize bundle size
  - Create .vsix package
  - Test packaged extension installation
  - _Requirements: All_

## Notes

- The extension uses TypeScript for type safety and better developer experience
- React is used for the webview UI to provide a modern, component-based architecture
- Webpack bundles the extension and webview separately for optimal loading
- All API communication goes through the extension host for security
- The webview uses message passing to communicate with the extension host
- Manual testing will be performed to verify functionality
- Each task builds incrementally on previous tasks
- Task 20 is a checkpoint to ensure everything works before final packaging
