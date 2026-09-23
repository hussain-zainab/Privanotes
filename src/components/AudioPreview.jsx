import { RotateCcw } from "lucide-react";
import { useMeetingSession } from "../context/MeetingSessionContext.jsx";

export function AudioPreview() {
  const { hasAudio, activeAudioUrl, source, resetSession, recorderStatus } = useMeetingSession();

  const isCapturing = recorderStatus === "recording" || recorderStatus === "paused";
  if (!hasAudio || isCapturing) return null;

  return (
    <div className="rounded-lg border border-ink-600 bg-ink-800 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-mist-100">
          {source === "upload" ? "Uploaded audio" : "Captured audio"}
        </p>
        <button
          type="button"
          onClick={resetSession}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-mist-300 transition hover:text-mist-100"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
          Start over
        </button>
      </div>
      <audio
        className="mt-3 w-full"
        controls
        src={activeAudioUrl ?? undefined}
        style={{ height: 32 }}
      />
    </div>
  );
}
