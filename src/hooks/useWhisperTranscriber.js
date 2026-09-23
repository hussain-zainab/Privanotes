import { useCallback, useEffect, useRef, useState } from "react";

let requestCounter = 0;

/**
 * useWhisperTranscriber — owns the whisperWorker.js Web Worker and exposes
 * its state as React state.
 *
 * engineStatus: "idle" | "loading-model" | "transcribing" | "ready" | "error"
 *   - "loading-model" and "transcribing" can overlap on the very first run,
 *     since the worker downloads the model lazily on first use; the UI
 *     distinguishes them by checking whether `modelProgress` has any
 *     incomplete entries.
 */
export function useWhisperTranscriber() {
  const workerRef = useRef(null);
  const activeRequestId = useRef(null);

  const [engineStatus, setEngineStatus] = useState("idle");
  const [modelProgress, setModelProgress] = useState({});
  const [transcript, setTranscript] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const worker = new Worker(new URL("../workers/whisperWorker.js", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const { type, requestId, progress, result, message } = event.data ?? {};
      if (requestId !== activeRequestId.current) return; // stale response

      if (type === "progress" && progress) {
        // Transformers.js progress_callback events include "initiate",
        // "download", "progress" (with a numeric `progress` 0-100 and
        // byte counts), and "done", keyed by file name.
        if (progress.status && progress.file) {
          setModelProgress((prev) => ({
            ...prev,
            [progress.file]: {
              status: progress.status,
              percent: typeof progress.progress === "number" ? progress.progress : null,
              loaded: progress.loaded,
              total: progress.total,
            },
          }));
        }
        return;
      }

      if (type === "complete") {
        setTranscript(result);
        setEngineStatus("ready");
        return;
      }

      if (type === "error") {
        setError(message);
        setEngineStatus("error");
      }
    };

    worker.onerror = (event) => {
      setError(event?.message || "The local transcription engine crashed unexpectedly.");
      setEngineStatus("error");
    };

    return () => worker.terminate();
  }, []);

  const transcribeAudio = useCallback((samples) => {
    if (!workerRef.current) return;
    const requestId = ++requestCounter;
    activeRequestId.current = requestId;

    setError(null);
    setTranscript(null);
    setModelProgress({});
    setEngineStatus("transcribing");

    // Transfer the underlying buffer instead of copying it — these arrays
    // can be several megabytes for a multi-minute recording.
    workerRef.current.postMessage(
      { type: "transcribe", requestId, audio: samples },
      [samples.buffer]
    );
  }, []);

  const reset = useCallback(() => {
    activeRequestId.current = null;
    setTranscript(null);
    setError(null);
    setModelProgress({});
    setEngineStatus("idle");
  }, []);

  return { engineStatus, modelProgress, transcript, error, transcribeAudio, reset };
}
