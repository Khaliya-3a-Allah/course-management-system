import { useEffect } from "react";

/**
 * Modal — reusable overlay dialog
 * Props: isOpen, onClose, title, children
 */
export default function Modal({ isOpen, onClose, title, children }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 text-stone-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="font-display text-xl text-stone-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 transition hover:text-zinc-200"
            aria-label="Close modal"
          >
            Close
          </button>
        </div>
        <div className="h-px bg-white/10" />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
