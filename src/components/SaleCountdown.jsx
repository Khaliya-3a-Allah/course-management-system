import { useEffect, useMemo, useState } from "react";

function getRemainingParts(targetDate) {
  const endTime = targetDate instanceof Date ? targetDate.getTime() : new Date(targetDate).getTime();
  const remainingMs = Math.max(0, endTime - Date.now());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalSeconds };
}

function twoDigits(value) {
  return String(value).padStart(2, "0");
}

export default function SaleCountdown({ endsAt, compact = false, className = "" }) {
  const targetDate = useMemo(() => (endsAt ? new Date(endsAt) : null), [endsAt]);
  const [remaining, setRemaining] = useState(() => (targetDate ? getRemainingParts(targetDate) : null));

  useEffect(() => {
    if (!targetDate || Number.isNaN(targetDate.getTime())) return undefined;

    const update = () => setRemaining(getRemainingParts(targetDate));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [targetDate]);

  if (!targetDate || Number.isNaN(targetDate.getTime()) || !remaining) return null;

  if (remaining.totalSeconds <= 0) {
    return (
      <span className={`text-[0.76rem] font-semibold text-[#fca5a5] ${className}`}>
        Sale ended
      </span>
    );
  }

  const label = compact
    ? `${remaining.days > 0 ? `${remaining.days}d ` : ""}${twoDigits(remaining.hours)}:${twoDigits(remaining.minutes)}:${twoDigits(remaining.seconds)}`
    : `${remaining.days > 0 ? `${remaining.days}d ` : ""}${twoDigits(remaining.hours)}h ${twoDigits(remaining.minutes)}m ${twoDigits(remaining.seconds)}s`;

  return (
    <span
      className={`inline-flex items-center rounded-md border border-[rgba(239,68,68,0.28)] bg-[rgba(239,68,68,0.1)] px-2 py-1 font-mono text-[0.74rem] font-bold text-[#fca5a5] ${className}`}
      aria-label={`Sale ends in ${label}`}
    >
      {label}
    </span>
  );
}
