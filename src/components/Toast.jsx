import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

/**
 * Renders a stack of toast notifications in the top-right corner.
 * Each toast auto-dismisses after a short delay with a slide-out animation.
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useAppContext();

  return (
    <div style={styles.container} aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          variant={toast.variant}
          onDismiss={removeToast}
        />
      ))}
    </div>
  );
}

const AUTO_DISMISS_MS = 3000;
const EXIT_ANIMATION_MS = 300;

function ToastItem({ id, message, variant, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(dismissTimer);
  }, []);

  useEffect(() => {
    if (!isExiting) return;

    const removeTimer = setTimeout(() => {
      onDismiss(id);
    }, EXIT_ANIMATION_MS);

    return () => clearTimeout(removeTimer);
  }, [isExiting, id, onDismiss]);

  const handleDismissClick = () => {
    setIsExiting(true);
  };

  const variantStyle = variantStyles[variant] || variantStyles.info;

  return (
    <div
      role="status"
      style={{
        ...styles.toast,
        ...variantStyle,
        animation: isExiting
          ? `toastSlideOut ${EXIT_ANIMATION_MS}ms ease forwards`
          : "toastSlideIn 0.3s ease forwards",
      }}
    >
      <span style={styles.icon}>{variantIcons[variant] || variantIcons.info}</span>
      <span style={styles.message}>{message}</span>
      <button
        type="button"
        onClick={handleDismissClick}
        style={styles.closeButton}
        aria-label="Dismiss notification"
      >
        ×
      </button>

      <style>{keyframes}</style>
    </div>
  );
}

const keyframes = `
  @keyframes toastSlideIn {
    from { opacity: 0; transform: translateX(100%); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes toastSlideOut {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(100%); }
  }
`;

const variantIcons = {
  success: "\u2713",
  error: "\u2717",
  info: "\u2139",
};

const variantStyles = {
  success: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    color: "#6ee7b7",
  },
  error: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#f87171",
  },
  info: {
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    color: "#93c5fd",
  },
};

const styles = {
  container: {
    position: "fixed",
    top: "1.25rem",
    right: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    zIndex: 9999,
    pointerEvents: "none",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.88rem",
    minWidth: "260px",
    maxWidth: "380px",
    pointerEvents: "auto",
    backdropFilter: "blur(8px)",
  },
  icon: {
    fontSize: "1rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  message: {
    flex: 1,
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "inherit",
    opacity: 0.6,
    cursor: "pointer",
    fontSize: "1.15rem",
    lineHeight: 1,
    padding: "0 0.15rem",
    flexShrink: 0,
  },
};
