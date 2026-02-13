import React, { useState, useEffect, createContext, useContext } from 'react';
import { ExtensionMessage, WebviewMessage, ChatMessage, UserInputData } from '../types';
import { vscode } from './index';
import MainMenu from './MainMenu';
import UserInputForm from './UserInputForm';
import ChatInterface from './ChatInterface';
import ErrorNotification from './ErrorNotification';
import './styles.css';

// Context for managing application state
interface AppState {
  currentView: 'mainMenu' | 'userInputForm' | 'chatInterface';
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  canRetry: boolean;
  setCurrentView: (view: 'mainMenu' | 'userInputForm' | 'chatInterface') => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null, canRetry?: boolean) => void;
  sendMessage: (message: WebviewMessage) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

function App() {
  const [currentView, setCurrentView] = useState<'mainMenu' | 'userInputForm' | 'chatInterface'>('mainMenu');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  // Function to send messages to extension host
  const sendMessage = (message: WebviewMessage) => {
    vscode.postMessage(message);
  };

  // Function to add a message to the chat
  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  // Function to set error with optional retry flag
  const handleSetError = (errorMessage: string | null, retry: boolean = false) => {
    setError(errorMessage);
    setCanRetry(retry);
  };

  // Set up message listener for extension messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent<ExtensionMessage>) => {
      const message = event.data;

      switch (message.type) {
        case 'chatResponse':
          // Add assistant message to chat
          addMessage({
            role: 'assistant',
            content: message.data.message,
            timestamp: Date.now(),
            isPRD: message.data.isPRD
          });
          setIsLoading(false);
          handleSetError(null); // Clear errors on successful operation
          break;

        case 'error':
          // Display error message with retry option if available
          handleSetError(message.data.message, message.data.canRetry || false);
          setIsLoading(false);
          break;

        case 'loading':
          // Update loading state
          setIsLoading(message.data.isLoading);
          break;

        case 'sessionCleared':
          // Clear session and return to main menu
          setMessages([]);
          setCurrentView('mainMenu');
          handleSetError(null); // Clear errors
          setIsLoading(false);
          setLastMessage(null);
          break;
      }
    };

    // Add event listener for messages from extension
    window.addEventListener('message', handleMessage);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Context value
  const contextValue: AppState = {
    currentView,
    messages,
    isLoading,
    error,
    canRetry,
    setCurrentView,
    setMessages,
    addMessage,
    setIsLoading,
    setError: handleSetError,
    sendMessage
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app">
        {/* Error notification displayed across all views */}
        {error && (
          <ErrorNotification
            message={error}
            canRetry={canRetry}
            onRetry={() => {
              // Clear error and retry last message
              handleSetError(null);
              if (lastMessage && currentView === 'chatInterface') {
                setIsLoading(true);
                sendMessage({ type: 'sendChatMessage', data: { message: lastMessage } });
              }
            }}
            onDismiss={() => handleSetError(null)}
          />
        )}

        {currentView === 'mainMenu' && (
          <MainMenu onSelectFeature={(feature) => {
            if (feature === 'spec') {
              setCurrentView('userInputForm');
            }
          }} />
        )}

        {currentView === 'userInputForm' && (
          <UserInputForm onSubmit={(data: UserInputData) => {
            // Send user input to extension
            sendMessage({ type: 'submitUserInput', data });
            // Transition to chat interface
            setCurrentView('chatInterface');
          }} />
        )}

        {currentView === 'chatInterface' && (
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={(message) => {
              // Store last message for retry
              setLastMessage(message);
              // Add user message to local state
              addMessage({
                role: 'user',
                content: message,
                timestamp: Date.now()
              });
              // Send message to extension
              sendMessage({ type: 'sendChatMessage', data: { message } });
              // Set loading state
              setIsLoading(true);
            }}
            onNewSession={() => {
              // Send new session message to extension
              sendMessage({ type: 'newSession' });
            }}
            onSavePRD={(content, filename) => {
              // Send save PRD message to extension
              sendMessage({ type: 'savePRD', data: { content, filename } });
            }}
          />
        )}
      </div>
    </AppContext.Provider>
  );
}

export default App;
