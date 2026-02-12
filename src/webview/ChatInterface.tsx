import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import MessageBubble from './MessageBubble';

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
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  // Handle Enter key to send (Shift+Enter for new line)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle new session - sends message to extension and clears local state
  const handleNewSession = () => {
    onNewSession();
  };

  return (
    <div className="chat-interface">
      {/* Header with title and New Session button */}
      <div className="chat-header">
        <h2>Spec Chat</h2>
        <button 
          className="new-session-button"
          onClick={handleNewSession}
          aria-label="Start a new session"
        >
          New Session
        </button>
      </div>
      
      {/* Scrollable messages container */}
      <div className="messages-container">
        {/* Render messages from state */}
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            message={msg}
            onSavePRD={msg.isPRD ? onSavePRD : undefined}
          />
        ))}
        
        {/* Show loading indicator when API is processing */}
        {isLoading && (
          <div className="loading-indicator">
            <div className="loading-spinner" aria-label="Loading"></div>
            <span>Thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area with textarea and send button */}
      <div className="input-container">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          className="message-input"
          aria-label="Message input"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !inputValue.trim()}
          className="send-button"
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;
