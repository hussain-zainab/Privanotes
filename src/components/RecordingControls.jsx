import { Mic, Pause, Play, Square } from "lucide-react";
import { useMeetingSession } from "../context/MeetingSessionContext.jsx";
import { formatDuration } from "../utils/audio.js";
import { cn } from "../utils/classNames.js";

const LEVEL_BARS = 12;

function LevelMeter({ level, active }) {
  return (
    <div className="flex h-6 items-end gap-[3px]" aria-hidden="true">
      {Array.from({ length: LEVEL_BARS }).map((_, index) => {
        const barThreshold = (index + 1) / LEVEL_BARS;
        const isLit = active && level >= barThreshold * 0.85;
        return (
          <span
            key={index}
            className={cn(
              "w-[3px] rounded-full transition-colors",
              isLit ? "bg-live" : "bg-ink-600"
            )}
            style={{ height: `${30 + index * 5}%` }}
          />
        );
      })}
    </div>
  );
}

export function RecordingControls() {
  const {
    source,
    recorderStatus,
    elapsedSeconds,
    micLevel,
    beginMicRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useMeetingSession();

  const isThisSourceActive = source === "microphone";
  const isRecording = isThisSourceActive && recorderStatus === "recording";
  const isPaused = isThisSourceActive && recorderStatus === "paused";
  const isRequesting = isThisSourceActive && recorderStatus === "requesting-permission";
  const isLive = isRecording || isPaused;

  return (
    <div className="rounded-lg border border-ink-600 bg-ink-800 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-mist-100">Microphone</p>
        {isLive ? (
          <span className="font-mono text-sm tabular-nums text-mist-200">
            {formatDuration(elapsedSeconds)}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <LevelMeter level={micLevel} active={isRecording} />

        <div className="flex items-center gap-2">
          {!isLive ? (
            <button
              type="button"
              onClick={beginMicRecording}
              disabled={isRequesting}
              className="inline-flex items-center gap-2 rounded bg-live px-3.5 py-2 text-sm font-medium text-ink-950 transition hover:brightness-110 disabled:opacity-60"
            >
              <Mic className="h-4 w-4" strokeWidth={2} />
              {isRequesting ? "Requesting access…" : "Record"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="inline-flex h-9 w-9 items-center justify-center rounded border border-ink-600 text-mist-100 transition hover:border-mist-400"
                aria-label={isPaused ? "Resume recording" : "Pause recording"}
              >
                {isPaused ? (
                  <Play className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <Pause className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-2 rounded bg-mist-100 px-3.5 py-2 text-sm font-medium text-ink-950 transition hover:brightness-95"
              >
                <Square className="h-3.5 w-3.5" strokeWidth={2} fill="currentColor" />
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      {isLive ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-mist-300">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isPaused ? "bg-mist-400" : "bg-live animate-pulse"
            )}
          />
          {isPaused ? "Paused — audio stays on this device" : "Recording — audio stays on this device"}
        </p>
      ) : (
        <p className="mt-3 text-xs text-mist-400">
          Nothing is sent anywhere. Audio is captured and processed on this device.
        </p>
      )}
    </div>
  );
}
