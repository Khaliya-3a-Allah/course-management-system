import { useAppContext } from "../context/AppContext";

/**
 * ColdStartBanner — renders only when the backend has been unreachable for
 * more than ~3 s, which on Render's free tier usually means the server is
 * cold-starting. Prevents users from assuming the app is broken during the
 * ~30 s wake-up window.
 */
export default function ColdStartBanner() {
  const { isBackendWaking } = useAppContext();
  if (!isBackendWaking) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-[0.82rem] text-[#f6c56b]"
      style={{
        background: "linear-gradient(90deg, rgba(217,119,6,0.18), rgba(245,158,11,0.14))",
        borderBottom: "1px solid rgba(245,158,11,0.35)",
        backdropFilter: "blur(6px)",
      }}
    >
      <span
        className="inline-block h-2.5 w-2.5 rounded-full border-2 border-[#f6c56b] border-t-transparent animate-spin align-middle mr-2"
        aria-hidden="true"
      />
      Waking up the server… this can take up to 30 seconds after inactivity.
    </div>
  );
}
