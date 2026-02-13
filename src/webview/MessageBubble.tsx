import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import { ChatMessage } from '../types';
// Styles imported in App.tsx

interface MessageBubbleProps {
  message: ChatMessage;
  onSavePRD?: (content: string, filename: string) => void;
}

function MessageBubble({ message, onSavePRD }: MessageBubbleProps) {
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  // Parse markdown content
  const htmlContent = useMemo(() => {
    return marked.parse(message.content);
  }, [message.content]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Copy message content to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Handle save PRD to file
  const handleSave = () => {
    if (onSavePRD) {
      const filename = `prd-${Date.now()}.md`;
      onSavePRD(message.content, filename);
    }
  };

  return (
    <div
      className={`messageBubble ${message.role}`}
      onMouseEnter={() => setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
      role="article"
      aria-label={`${message.role === 'user' ? 'User' : 'Assistant'} message from ${formatTimestamp(message.timestamp)}`}
    >
      <div 
        className="messageContent"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        aria-label="Message content"
      />
      
      <div className="messageTimestamp" aria-label={`Sent at ${formatTimestamp(message.timestamp)}`}>
        {formatTimestamp(message.timestamp)}
      </div>
      
      {/* PRD-specific actions - show Copy and Save buttons */}
      {message.isPRD && (
        <div className="prdActions" role="group" aria-label="PRD actions">
          <button 
            className="prdActionButton"
            onClick={copyToClipboard}
            aria-label="Copy PRD content to clipboard"
          >
            {copyFeedback ? '✓ Copied!' : 'Copy'}
          </button>
          <button 
            className="prdActionButton"
            onClick={handleSave}
            aria-label="Save PRD to file in workspace"
          >
            Save to File
          </button>
        </div>
      )}
      
      {/* Regular copy button on hover for non-PRD messages */}
      {!message.isPRD && showCopyButton && (
        <button 
          className="copyButton"
          onClick={copyToClipboard}
          aria-label="Copy message content to clipboard"
        >
          {copyFeedback ? '✓ Copied!' : 'Copy'}
        </button>
      )}
    </div>
  );
}

export default MessageBubble;
