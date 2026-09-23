import { WifiOff } from "lucide-react";
import { useMeetingSession } from "../context/MeetingSessionContext.jsx";
import { StatusChip } from "./StatusChip.jsx";

const ENGINE_LABEL_BY_STATUS = {
  "not-started": "Engine not loaded yet",
  "loading-model": "Downloading model\u2026",
  transcribing: "CPU \u00b7 WASM \u2014 transcribing",
  ready: "CPU \u00b7 WASM (Transformers.js)",
};

const ENGINE_TONE_BY_STATUS = {
  "not-started": "neutral",
  "loading-model": "live",
  transcribing: "live",
  ready: "shield",
};

export function TopBar() {
  const { meetingTitle, setMeetingTitle, pipelineStatus } = useMeetingSession();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-ink-700 px-5">
      <input
        value={meetingTitle}
        onChange={(event) => setMeetingTitle(event.target.value)}
        aria-label="Meeting title"
        className="min-w-0 flex-1 truncate bg-transparent text-[15px] font-medium text-mist-100 outline-none placeholder:text-mist-400 focus-visible:outline-none"
        placeholder="Untitled meeting"
      />
      <div className="flex shrink-0 items-center gap-2">
        <StatusChip tone={ENGINE_TONE_BY_STATUS[pipelineStatus]} dot={pipelineStatus !== "not-started"}>
          {ENGINE_LABEL_BY_STATUS[pipelineStatus]}
        </StatusChip>
        <StatusChip tone="shield" dot>
          <WifiOff className="h-3 w-3" strokeWidth={2} />
          Runs offline
        </StatusChip>
      </div>
    </header>
  );
}
