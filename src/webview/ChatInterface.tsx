import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
// Styles imported in App.tsx

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus on textarea when component mounts
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Handle sending a message
  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
      // Return focus to textarea after sending
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  // Handle Enter key to send (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    <div className="chatInterface" role="main">
      {/* Header with title and New Session button */}
      <header className="chatHeader">
        <h2 id="chat-title">Spec Chat</h2>
        <button 
          className="newSessionButton"
          onClick={handleNewSession}
          aria-label="Start a new session and clear current conversation"
        >
          New Session
        </button>
      </header>
      
      {/* Scrollable messages container */}
      <div 
        className="messagesContainer" 
        role="log" 
        aria-live="polite" 
        aria-atomic="false"
        aria-label="Chat messages"
        aria-describedby="chat-title"
      >
        {/* Render messages from state */}
        {messages.length === 0 && (
          <div className="emptyState" role="status">
            <p>Start a conversation by typing a message below.</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            message={msg}
            onSavePRD={msg.isPRD ? onSavePRD : undefined}
          />
        ))}
        
        {/* Show loading indicator when API is processing */}
        {isLoading && <LoadingIndicator text="Thinking..." />}
        
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>
      
      {/* Input area with textarea and send button */}
      <div className="inputContainer" role="form" aria-label="Message input form">
        <label htmlFor="message-input" className="visually-hidden">
          Type your message
        </label>
        <textarea
          id="message-input"
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
          disabled={isLoading}
          className="messageInput"
          aria-label="Message input"
          aria-describedby="send-hint"
          rows={3}
        />
        <span id="send-hint" className="visually-hidden">
          Press Enter to send message, or Shift+Enter to add a new line
        </span>
        <button 
          onClick={handleSend}
          disabled={isLoading || !inputValue.trim()}
          className="sendButton"
          aria-label={isLoading ? "Sending message..." : "Send message"}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;
