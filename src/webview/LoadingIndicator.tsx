import React from 'react';
import styles from './LoadingIndicator.module.css';

interface LoadingIndicatorProps {
  text?: string;
}

/**
 * LoadingIndicator component displays a spinner and optional text
 * to indicate that an operation is in progress.
 */
function LoadingIndicator({ text = 'Loading...' }: LoadingIndicatorProps) {
  return (
    <div className={styles.loadingIndicator} role="status" aria-live="polite">
      <div className={styles.loadingSpinner} aria-label="Loading spinner"></div>
      <span className={styles.loadingText}>{text}</span>
    </div>
  );
}

export default LoadingIndicator;
