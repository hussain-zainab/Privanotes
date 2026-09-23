import { useRef, useState } from "react";
import { FileAudio, UploadCloud } from "lucide-react";
import { useMeetingSession } from "../context/MeetingSessionContext.jsx";
import { formatFileSize } from "../utils/audio.js";
import { cn } from "../utils/classNames.js";

export function UploadPanel() {
  const { source, uploadedFile, loadUploadedFile, recorderStatus } = useMeetingSession();
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const disabled = recorderStatus === "recording" || recorderStatus === "paused";

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (file) loadUploadedFile(file);
  };

  return (
    <div className="rounded-lg border border-ink-600 bg-ink-800 p-4">
      <p className="text-sm font-medium text-mist-100">Audio file</p>

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          if (!disabled) handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "mt-3 flex w-full flex-col items-center gap-2 rounded border border-dashed px-4 py-5 text-center transition disabled:cursor-not-allowed disabled:opacity-60",
          isDragOver ? "border-shield bg-shield-soft" : "border-ink-500 hover:border-mist-400"
        )}
      >
        {source === "upload" && uploadedFile ? (
          <>
            <FileAudio className="h-5 w-5 text-shield" strokeWidth={1.75} />
            <span className="max-w-full truncate text-sm font-medium text-mist-100">
              {uploadedFile.name}
            </span>
            <span className="text-xs text-mist-400">
              {formatFileSize(uploadedFile.size)} · click or drop to replace
            </span>
          </>
        ) : (
          <>
            <UploadCloud className="h-5 w-5 text-mist-300" strokeWidth={1.75} />
            <span className="text-sm text-mist-200">
              Drop an audio file, or <span className="text-shield">browse</span>
            </span>
            <span className="text-xs text-mist-400">WAV, MP3, M4A, OGG, WEBM, FLAC</span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm,.flac"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}
