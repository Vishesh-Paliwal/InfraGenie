import React, { useState, useEffect, createContext, useContext } from 'react';
import { ExtensionMessage, WebviewMessage, ChatMessage, UserInputData } from '../types';
import { vscode } from './index';
import MainMenu from './MainMenu';
import UserInputForm from './UserInputForm';

// Context for managing application state
interface AppState {
  currentView: 'mainMenu' | 'userInputForm' | 'chatInterface';
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  setCurrentView: (view: 'mainMenu' | 'userInputForm' | 'chatInterface') => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
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

  // Function to send messages to extension host
  const sendMessage = (message: WebviewMessage) => {
    vscode.postMessage(message);
  };

  // Function to add a message to the chat
  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
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
          setError(null);
          break;

        case 'error':
          // Display error message
          setError(message.data.message);
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
          setError(null);
          setIsLoading(false);
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
    setCurrentView,
    setMessages,
    addMessage,
    setIsLoading,
    setError,
    sendMessage
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app">
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
          <div className="chat-interface">
            <h2>Chat Interface</h2>
            <p>Chat component will be implemented in task 11</p>
            <div className="messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  {msg.content}
                </div>
              ))}
            </div>
            {isLoading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}

export default App;
