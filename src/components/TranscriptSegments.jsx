import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { formatDuration } from "../utils/audio.js";

export function TranscriptSegments({ transcript }) {
  const [copied, setCopied] = useState(false);
  const chunks = transcript?.chunks ?? [];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript?.text ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied by the browser — fail quietly, the
      // text is still selectable/readable on screen.
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-mist-100">Transcript</p>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded border border-ink-600 px-2.5 py-1.5 text-xs text-mist-300 transition hover:border-mist-400 hover:text-mist-100"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-shield" strokeWidth={2} />
          ) : (
            <Copy className="h-3.5 w-3.5" strokeWidth={2} />
          )}
          {copied ? "Copied" : "Copy text"}
        </button>
      </div>

      {chunks.length > 0 ? (
        <ol className="space-y-3.5">
          {chunks.map((chunk, index) => {
            const [start, end] = chunk.timestamp ?? [null, null];
            return (
              <li key={index} className="flex gap-3.5">
                <span className="mt-0.5 shrink-0 select-none font-mono text-xs text-mist-400">
                  {typeof start === "number" ? formatDuration(start) : "--:--"}
                  {typeof end === "number" ? ` \u2013 ${formatDuration(end)}` : ""}
                </span>
                <p className="text-[15px] leading-relaxed text-mist-100">{chunk.text.trim()}</p>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-[15px] leading-relaxed text-mist-100">{transcript?.text}</p>
      )}
    </div>
  );
}
