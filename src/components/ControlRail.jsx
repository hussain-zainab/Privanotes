import { Sparkles } from "lucide-react";
import { useMeetingSession } from "../context/MeetingSessionContext.jsx";
import { Logo } from "./Logo.jsx";
import { RecordingControls } from "./RecordingControls.jsx";
import { UploadPanel } from "./UploadPanel.jsx";
import { AudioPreview } from "./AudioPreview.jsx";
import { ErrorBanner } from "./ErrorBanner.jsx";

export function ControlRail() {
  const { recorderError, uploadError, hasAudio, source } = useMeetingSession();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 border-b border-ink-700 bg-ink-900 p-5 md:w-[320px] md:border-b-0 md:border-r md:max-h-screen md:overflow-y-auto">
      <Logo />

      <div>
        <p className="text-[13px] font-medium text-mist-100">Meeting capture</p>
        <p className="mt-1 text-xs leading-relaxed text-mist-400">
          Record from your microphone or bring in an existing recording. Nothing leaves this
          device.
        </p>
      </div>

      <ErrorBanner message={recorderError} />
      <ErrorBanner message={uploadError} />

      <RecordingControls />
      <div className="flex items-center gap-3 text-xs text-mist-400">
        <span className="h-px flex-1 bg-ink-600" />
        or
        <span className="h-px flex-1 bg-ink-600" />
      </div>
      <UploadPanel />
      <AudioPreview />

      <div className="mt-auto rounded-lg border border-ink-600 bg-ink-800 p-3.5">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mist-300" strokeWidth={1.75} />
          <p className="text-xs leading-relaxed text-mist-300">
            {hasAudio
              ? `Audio ready from your ${source === "upload" ? "upload" : "recording"}. Local transcription arrives in Batch 2.`
              : "Record or upload audio to prepare a session. Local transcription arrives in Batch 2."}
          </p>
        </div>
      </div>
    </aside>
  );
}
