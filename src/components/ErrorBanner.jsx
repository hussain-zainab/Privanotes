import { AlertTriangle, X } from "lucide-react";

export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 rounded border border-alert/30 bg-alert-soft px-3.5 py-2.5">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-alert" strokeWidth={1.75} />
      <p className="flex-1 text-sm leading-relaxed text-mist-100">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 text-mist-300 hover:text-mist-100"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  );
}
