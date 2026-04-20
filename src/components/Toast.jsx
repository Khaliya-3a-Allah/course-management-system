import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

/**
 * Renders a stack of toast notifications in the top-right corner.
 * Each toast auto-dismisses after a short delay with a slide-out animation.
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto flex flex-col gap-2 z-[9999] pointer-events-none" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          variant={toast.variant}
          durationMs={toast.durationMs}
          onDismiss={removeToast}
        />
      ))}
    </div>
  );
}

const AUTO_DISMISS_MS = 3000;
const EXIT_ANIMATION_MS = 300;

function ToastItem({ id, message, variant, durationMs, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
    }, durationMs || AUTO_DISMISS_MS);

    return () => clearTimeout(dismissTimer);
  }, [durationMs]);

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
      className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg min-w-0 sm:min-w-[280px] sm:max-w-[420px] border shadow-[0_12px_28px_rgba(0,0,0,0.38)] backdrop-blur-md ${variantStyle}`}
      style={{
        animation: isExiting
          ? `toastSlideOut ${EXIT_ANIMATION_MS}ms ease forwards`
          : "toastSlideIn 0.3s ease forwards",
      }}
    >
      <span className="text-base font-bold shrink-0">{variantIcons[variant] || variantIcons.info}</span>
      <span className="flex-1 text-[0.9rem] leading-snug">{message}</span>
      <button
        type="button"
        onClick={handleDismissClick}
        className="bg-transparent border-none text-inherit opacity-70 hover:opacity-100 cursor-pointer text-[1.15rem] leading-none px-1 shrink-0"
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
  success: "bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.55)] text-[#d1fae5]",
  error: "bg-[rgba(239,68,68,0.2)] border-[rgba(239,68,68,0.55)] text-[#fee2e2]",
  info: "bg-[rgba(59,130,246,0.2)] border-[rgba(59,130,246,0.55)] text-[#dbeafe]",
};
