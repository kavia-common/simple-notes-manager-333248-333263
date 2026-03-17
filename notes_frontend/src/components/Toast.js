import React, { useEffect } from 'react';

/**
 * Toast notification component.
 * Displays a temporary notification message that auto-dismisses.
 * 
 * Props:
 *   message {string}      - message to display
 *   type {string}         - 'success' | 'error' | 'info'
 *   onClose {Function}    - callback to dismiss the toast
 *   duration {number}     - auto-dismiss duration in ms (default: 3000)
 */

// PUBLIC_INTERFACE
function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  // Auto-dismiss after duration
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="polite">
      <span className="toast-icon" aria-hidden="true">{icons[type] || icons.info}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  );
}

export default Toast;
