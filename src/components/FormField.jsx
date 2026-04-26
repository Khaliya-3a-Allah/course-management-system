/**
 * Reusable form field wrapper — renders label, optional hint,
 * child input, and inline error in a consistent layout.
 */
export default function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[0.82rem] font-semibold text-text-secondary tracking-wide">
        {label}
      </label>
      {hint && <p id={htmlFor ? `${htmlFor}-hint` : undefined} className="text-[0.73rem] text-text-faint m-0">{hint}</p>}
      {children}
      {error && (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className="text-[0.77rem] text-red-400 m-0" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Shared Tailwind className string for text inputs. */
export const INPUT_CLASS =
  "w-full px-4 py-3 rounded-lg text-[0.93rem] text-text-primary bg-base outline-none transition-colors font-body";

/** Returns a Tailwind class string for a conditional error border. */
export function buildInputBorder(hasError) {
  return hasError ? "border border-[#ef4444]" : "border border-[rgba(255,255,255,0.09)]";
}
