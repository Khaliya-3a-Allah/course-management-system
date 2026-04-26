import { useEffect } from "react";
import { createPortal } from "react-dom";
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

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] overflow-y-auto bg-[rgba(0,0,0,0.72)] backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div className="min-h-full w-full flex items-start justify-center p-4 sm:py-8">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          className="relative w-full max-w-[420px] rounded-2xl border border-[rgba(255,255,255,0.09)] p-0 m-0 bg-surface text-[#e8e6e0] shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
          onClick={(e) => e.stopPropagation()}
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
        </div>
      </div>
    </div>,
    document.body
  );
}