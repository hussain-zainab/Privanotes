import { AudioLines, Sparkles } from "lucide-react";
import { useMeetingSession } from "../../context/MeetingSessionContext.jsx";
import { EmptyState } from "../EmptyState.jsx";
import { ErrorBanner } from "../ErrorBanner.jsx";
import { ModelLoadProgress } from "../ModelLoadProgress.jsx";
import { TranscriptSegments } from "../TranscriptSegments.jsx";

export function TranscriptPanel() {
  const {
    hasAudio,
    source,
    pipelineStatus,
    modelProgress,
    transcript,
    transcriptionError,
    runTranscription,
  } = useMeetingSession();

  if (!hasAudio) {
    return (
      <EmptyState
        icon={AudioLines}
        title="No transcript yet"
        description="Record from your microphone or upload an audio file to get started. Transcription runs locally on this device."
      />
    );
  }

  if (pipelineStatus === "loading-model" || pipelineStatus === "transcribing") {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded border border-ink-600 text-shield">
          <AudioLines className="h-5 w-5 animate-pulse" strokeWidth={1.75} />
        </div>
        <p className="text-[15px] font-medium text-mist-100">
          {pipelineStatus === "loading-model"
            ? "Downloading the local speech model"
            : "Transcribing locally\u2026"}
        </p>
        <p className="max-w-sm text-sm leading-relaxed text-mist-300">
          {pipelineStatus === "loading-model"
            ? "First run only \u2014 the model is cached by your browser after this, so future transcriptions start immediately."
            : "Running on CPU via WebAssembly. Longer recordings take longer \u2014 this is not accelerated by any specialized hardware in this batch."}
        </p>
        {pipelineStatus === "loading-model" ? <ModelLoadProgress progress={modelProgress} /> : null}
      </div>
    );
  }

  if (pipelineStatus === "ready" && transcript) {
    return <TranscriptSegments transcript={transcript} />;
  }

  // hasAudio, but nothing started yet (or the last run errored) — the CTA state.
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="mb-1 flex h-11 w-11 items-center justify-center rounded border border-ink-600 text-mist-300">
        <Sparkles className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <p className="text-[15px] font-medium text-mist-100">
        Audio ready from your {source === "upload" ? "upload" : "recording"}
      </p>
      <p className="max-w-sm text-sm leading-relaxed text-mist-300">
        Transcription runs locally in your browser — nothing is uploaded anywhere. The first run
        downloads a small speech model (cached afterward).
      </p>

      {transcriptionError ? (
        <div className="w-full max-w-sm">
          <ErrorBanner message={transcriptionError} />
        </div>
      ) : null}

      <button
        type="button"
        onClick={runTranscription}
        className="mt-1 inline-flex items-center gap-2 rounded bg-shield px-4 py-2 text-sm font-medium text-ink-950 transition hover:brightness-110"
      >
        <AudioLines className="h-4 w-4" strokeWidth={2} />
        {transcriptionError ? "Try again" : "Transcribe locally"}
      </button>
    </div>
  );
}
