import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useAudioRecorder — wraps getUserMedia + MediaRecorder for in-browser
 * microphone capture, plus a lightweight Web Audio analyser for a live
 * input-level meter.
 *
 * This hook only captures and hands back a raw audio Blob. It deliberately
 * knows nothing about transcription — that's Batch 2 (local Whisper STT),
 * which will consume `audioBlob` from here or from the upload path.
 *
 * recorderStatus: "idle" | "requesting-permission" | "recording" | "paused" | "stopped" | "error"
 */
export function useAudioRecorder() {
  const [recorderStatus, setRecorderStatus] = useState("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);

  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);

  const stopLevelMetering = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setMicLevel(0);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const releaseStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const startLevelMetering = useCallback((stream) => {
    const AudioContextImpl = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextImpl) return;

    const audioContext = new AudioContextImpl();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const average = data.reduce((sum, value) => sum + value, 0) / data.length;
      setMicLevel(Math.min(1, average / 128));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setRecorderStatus("requesting-permission");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "This browser doesn't support microphone capture (getUserMedia is unavailable)."
        );
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setAudioBlob(blob);
        setAudioUrl((prevUrl) => {
          if (prevUrl) URL.revokeObjectURL(prevUrl);
          return URL.createObjectURL(blob);
        });
        releaseStream();
        stopLevelMetering();
      };

      recorder.start();
      startLevelMetering(stream);

      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      setRecorderStatus("recording");
    } catch (err) {
      const message =
        err?.name === "NotAllowedError"
          ? "Microphone access was denied. Allow microphone access in your browser's site settings and try again."
          : err?.message || "Couldn't start the microphone. Check your device and try again.";
      setError(message);
      setRecorderStatus("error");
      releaseStream();
    }
  }, [releaseStream, startLevelMetering, stopLevelMetering]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecorderStatus("paused");
      stopTimer();
    }
  }, [stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecorderStatus("recording");
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      ["recording", "paused"].includes(mediaRecorderRef.current.state)
    ) {
      mediaRecorderRef.current.stop();
    }
    stopTimer();
    setRecorderStatus("stopped");
  }, [stopTimer]);

  const resetRecorder = useCallback(() => {
    stopTimer();
    stopLevelMetering();
    releaseStream();
    setAudioBlob(null);
    setAudioUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return null;
    });
    setElapsedSeconds(0);
    setError(null);
    setRecorderStatus("idle");
  }, [releaseStream, stopLevelMetering, stopTimer]);

  useEffect(() => {
    return () => {
      stopTimer();
      stopLevelMetering();
      releaseStream();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    recorderStatus,
    elapsedSeconds,
    micLevel,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecorder,
  };
}
