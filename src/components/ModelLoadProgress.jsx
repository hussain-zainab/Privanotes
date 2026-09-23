import { formatFileSize } from "../utils/audio.js";

function fileStatusLabel(entry) {
  if (entry.status === "done") return "Ready";
  if (typeof entry.percent === "number") return `${Math.round(entry.percent)}%`;
  if (entry.status === "initiate") return "Starting\u2026";
  return "Downloading\u2026";
}

export function ModelLoadProgress({ progress }) {
  const files = Object.entries(progress);
  if (files.length === 0) {
    return <p className="text-sm text-mist-300">Preparing the local speech-to-text model&hellip;</p>;
  }

  return (
    <div className="w-full max-w-sm space-y-2.5">
      {files.map(([file, entry]) => {
        const percent = entry.status === "done" ? 100 : entry.percent ?? 0;
        return (
          <div key={file}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-mist-300" title={file}>
                {file}
              </span>
              <span className="shrink-0 font-mono text-mist-400">
                {entry.total ? `${formatFileSize(entry.loaded ?? 0)} / ${formatFileSize(entry.total)}` : fileStatusLabel(entry)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
              <div
                className="h-full rounded-full bg-shield transition-[width]"
                style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
