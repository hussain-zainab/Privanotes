// Audio helpers used by both the microphone recorder and the file-upload
// path. Kept dependency-free and framework-agnostic on purpose so Batch 2
// (local Whisper STT) can reuse this module without pulling in React.

/** MIME types / extensions PrivaNotes AI accepts for "Accept audio file" uploads. */
export const SUPPORTED_AUDIO_TYPES = [
  "audio/wav",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/ogg",
  "audio/webm",
  "audio/flac",
];

const SUPPORTED_EXTENSIONS = [".wav", ".mp3", ".m4a", ".ogg", ".webm", ".flac", ".mp4"];

/**
 * Loosely validates that a File is a playable audio file. Browsers are
 * inconsistent about reporting MIME types for audio, so this falls back to
 * checking the file extension when `file.type` is empty or unrecognized.
 */
export function isSupportedAudioFile(file) {
  if (!file) return false;
  if (file.type && SUPPORTED_AUDIO_TYPES.includes(file.type)) return true;
  const name = file.name?.toLowerCase() ?? "";
  return SUPPORTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

/** Formats a duration in seconds as `mm:ss` (or `h:mm:ss` past one hour). */
export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

/** Formats a byte count as a short human-readable size. */
export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
