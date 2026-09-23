import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder.js";
import { useWhisperTranscriber } from "../hooks/useWhisperTranscriber.js";
import { decodeAudioToMono16k } from "../utils/audioPreprocessing.js";
import { isSupportedAudioFile } from "../utils/audio.js";

const MeetingSessionContext = createContext(null);

/**
 * MeetingSessionProvider — the single source of truth for "what audio is
 * this session working with, where did it come from, and what has local
 * processing produced from it."
 *
 * Batch 1: capture + upload + session metadata.
 * Batch 2 (this one): local speech-to-text on top of that audio.
 * Batch 3/4 will add redaction/summary/action-item state the same way —
 * extending this context rather than replacing it.
 */
export function MeetingSessionProvider({ children }) {
  const recorder = useAudioRecorder();
  const transcriber = useWhisperTranscriber();

  const [meetingTitle, setMeetingTitle] = useState("Untitled meeting");
  const [source, setSource] = useState(null); // "microphone" | "upload" | null
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [preprocessError, setPreprocessError] = useState(null);

  const loadUploadedFile = useCallback((file) => {
    setUploadError(null);
    if (!file) return;
    if (!isSupportedAudioFile(file)) {
      setUploadError(
        `"${file.name}" doesn't look like a supported audio file. Try WAV, MP3, M4A, OGG, WEBM, or FLAC.`
      );
      return;
    }
    recorder.resetRecorder();
    transcriber.reset();
    setUploadedFile(file);
    setSource("upload");
  }, [recorder, transcriber]);

  const beginMicRecording = useCallback(async () => {
    setUploadedFile(null);
    setUploadError(null);
    transcriber.reset();
    setSource("microphone");
    await recorder.startRecording();
  }, [recorder, transcriber]);

  const resetSession = useCallback(() => {
    recorder.resetRecorder();
    transcriber.reset();
    setUploadedFile(null);
    setUploadError(null);
    setPreprocessError(null);
    setSource(null);
  }, [recorder, transcriber]);

  const uploadedAudioUrl = useMemo(
    () => (uploadedFile ? URL.createObjectURL(uploadedFile) : null),
    [uploadedFile]
  );

  const activeAudioUrl = source === "upload" ? uploadedAudioUrl : recorder.audioUrl;
  const activeAudioBlob = source === "upload" ? uploadedFile : recorder.audioBlob;
  const hasAudio = Boolean(activeAudioBlob);

  const runTranscription = useCallback(async () => {
    if (!activeAudioBlob) return;
    setPreprocessError(null);
    try {
      const { samples } = await decodeAudioToMono16k(activeAudioBlob);
      transcriber.transcribeAudio(samples);
    } catch (err) {
      setPreprocessError(
        err?.message || "Couldn't prepare this audio for transcription. Try a different file."
      );
    }
  }, [activeAudioBlob, transcriber]);

  // Whether the model is still being fetched (first run only — cached by
  // the browser after that) vs. actively running inference on already-
  // loaded weights. Both fall under engineStatus "transcribing".
  const isDownloadingModel = Object.values(transcriber.modelProgress).some(
    (f) => f.status !== "done"
  );

  const pipelineStatus =
    transcriber.engineStatus === "transcribing"
      ? isDownloadingModel
        ? "loading-model"
        : "transcribing"
      : transcriber.transcript
        ? "ready"
        : "not-started";

  const engineLabel =
    pipelineStatus === "ready" || pipelineStatus === "transcribing"
      ? "CPU \u00b7 WASM (Transformers.js)"
      : null;

  const value = {
    meetingTitle,
    setMeetingTitle,
    source,
    hasAudio,
    activeAudioUrl,
    uploadedFile,
    uploadError,
    loadUploadedFile,
    beginMicRecording,
    resetSession,
    // Recorder pass-through
    recorderStatus: recorder.recorderStatus,
    elapsedSeconds: recorder.elapsedSeconds,
    micLevel: recorder.micLevel,
    recorderError: recorder.error,
    pauseRecording: recorder.pauseRecording,
    resumeRecording: recorder.resumeRecording,
    stopRecording: recorder.stopRecording,
    // Local speech-to-text (Batch 2)
    runTranscription,
    transcript: transcriber.transcript,
    transcriptionError: transcriber.error || preprocessError,
    modelProgress: transcriber.modelProgress,
    // Downstream pipeline status, shared across the dashboard tabs. Batch
    // 3/4 will extend `pipelineStatus` with "protecting"/"summarizing"
    // rather than introducing a parallel status field.
    pipelineStatus, // "not-started" | "loading-model" | "transcribing" | "ready"
    engineLabel, // null until an engine has actually run; never claims NPU in this batch
  };

  return (
    <MeetingSessionContext.Provider value={value}>{children}</MeetingSessionContext.Provider>
  );
}

export function useMeetingSession() {
  const ctx = useContext(MeetingSessionContext);
  if (!ctx) {
    throw new Error("useMeetingSession must be used within a MeetingSessionProvider");
  }
  return ctx;
}
