import { cn } from "../utils/classNames.js";

const TONES = {
  neutral: "border-ink-600 bg-ink-800 text-mist-300",
  shield: "border-shield/30 bg-shield-soft text-shield",
  live: "border-live/30 bg-live-soft text-live",
  alert: "border-alert/30 bg-alert-soft text-alert",
};

export function StatusChip({ tone = "neutral", dot = false, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium leading-none",
        TONES[tone]
      )}
    >
      {dot ? (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "shield" && "bg-shield",
            tone === "live" && "bg-live animate-pulse",
            tone === "alert" && "bg-alert",
            tone === "neutral" && "bg-mist-400"
          )}
        />
      ) : null}
      {children}
    </span>
  );
}
