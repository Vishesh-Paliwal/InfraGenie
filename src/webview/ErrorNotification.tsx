import React from 'react';
import styles from './ErrorNotification.module.css';

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
    <div className={styles.errorNotification} role="alert" aria-live="assertive">
      <div className={styles.errorContent}>
        <div className={styles.errorIcon} aria-hidden="true">⚠️</div>
        <div className={styles.errorMessage}>{message}</div>
      </div>
      <div className={styles.errorActions}>
        {canRetry && onRetry && (
          <button 
            className={styles.retryButton}
            onClick={onRetry}
            aria-label="Retry operation"
          >
            Retry
          </button>
        )}
        <button 
          className={styles.dismissButton}
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
