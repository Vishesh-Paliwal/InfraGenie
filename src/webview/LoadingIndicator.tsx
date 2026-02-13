import React from 'react';
// Styles imported in App.tsx

interface LoadingIndicatorProps {
  text?: string;
}

/**
 * LoadingIndicator component displays a spinner and optional text
 * to indicate that an operation is in progress.
 */
function LoadingIndicator({ text = 'Loading...' }: LoadingIndicatorProps) {
  return (
    <div className="loadingIndicator" role="status" aria-live="polite">
      <div className="loadingSpinner" aria-label="Loading spinner"></div>
      <span className="loadingText">{text}</span>
    </div>
  );
}

export default LoadingIndicator;
