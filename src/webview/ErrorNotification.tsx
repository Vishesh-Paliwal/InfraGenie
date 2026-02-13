import React from 'react';
// Styles imported in App.tsx

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
    <div className="errorNotification" role="alert" aria-live="assertive">
      <div className="errorContent">
        <div className="errorIcon" aria-hidden="true">⚠️</div>
        <div className="errorMessage">{message}</div>
      </div>
      <div className="errorActions">
        {canRetry && onRetry && (
          <button 
            className="retryButton"
            onClick={onRetry}
            aria-label="Retry operation"
          >
            Retry
          </button>
        )}
        <button 
          className="dismissButton"
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
