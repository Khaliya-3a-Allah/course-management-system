import { useEffect } from "react";
import { CloseIcon } from "./Icons";

export default function Modal({ isOpen, onClose, title, children }) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[1000] p-4 bg-[rgba(0,0,0,0.72)]"
      style={{ backdropFilter: "blur(4px)" }}
      onClick={onClose}
      role="presentation"
    >
      <dialog
        open
        className="relative w-full max-w-[420px] rounded-2xl border border-[rgba(255,255,255,0.09)] p-0 m-0 bg-surface text-[#e8e6e0]"
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5">
          {title && (
            <h2
              id="modal-title"
              className="font-heading text-[1.15rem] m-0 text-text-primary"
            >
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="border-none cursor-pointer text-[1rem] leading-none p-1 ml-auto text-text-dim hover:text-text-muted transition-colors bg-transparent"
          >
            <CloseIcon size={16} />
          </button>
        </header>

        <hr className="border-[rgba(255,255,255,0.06)]" />

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </dialog>
    </div>
  );
}