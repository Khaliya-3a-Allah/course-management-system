/**
 * ResourceState — renders loading, error, or empty states for a data-fetching
 * view. When status is "success" AND the list is non-empty, it renders the
 * children instead. Callers that need to render empty differently can pass
 * `renderEmpty` to override the default empty block.
 */
export default function ResourceState({
  status,
  error,
  isEmpty = false,
  onRetry,
  loadingLabel = "Loading…",
  emptyLabel = "Nothing to show here yet.",
  renderEmpty,
  children,
}) {
  if (status === "loading" || status === "idle") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-center py-16 px-6 text-center text-text-dim"
      >
        <span className="inline-flex items-center gap-3">
          <span
            className="inline-block h-4 w-4 rounded-full border-2 border-[rgba(245,158,11,0.6)] border-t-transparent animate-spin"
            aria-hidden="true"
          />
          {loadingLabel}
        </span>
      </div>
    );
  }

  if (status === "error") {
    const message = describeError(error);
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)]"
      >
        <p className="text-[0.95rem] text-[#f87171] mb-2">Something went wrong.</p>
        <p className="text-text-dim text-[0.85rem] mb-5 max-w-[420px]">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2 rounded-lg font-semibold text-[0.85rem] border border-[rgba(217,119,6,0.35)] bg-[rgba(217,119,6,0.08)] text-[#f6c56b]"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    if (renderEmpty) return renderEmpty();
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-xl border border-[rgba(255,255,255,0.07)] bg-surface text-text-dim">
        {emptyLabel}
      </div>
    );
  }

  return children;
}

function describeError(error) {
  if (!error) return "We couldn't load this data. Please try again.";
  if (error.status === 0) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  if (error.status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  if (error.status === 404) {
    return "We couldn't find what you were looking for.";
  }
  if (error.status >= 500) {
    return "The server is having trouble right now. Please try again in a moment.";
  }
  return error.message || "Unknown error. Please try again.";
}
