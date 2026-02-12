import React from 'react';

interface ErrorNotificationProps {
  message: string;
  canRetry?: boolean;
  onRetry?: () => void;
  onDismiss: () => void;
}

function ErrorNotification({
  message,
  canRetry = false,
  onRetry,
  onDismiss
}: ErrorNotificationProps) {
  return (
    <div className="error-notification" role="alert" aria-live="assertive">
      <div className="error-content">
        <div className="error-icon" aria-hidden="true">⚠️</div>
        <div className="error-message">{message}</div>
      </div>
      <div className="error-actions">
        {canRetry && onRetry && (
          <button 
            className="retry-button"
            onClick={onRetry}
            aria-label="Retry operation"
          >
            Retry
          </button>
        )}
        <button 
          className="dismiss-button"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default ErrorNotification;
