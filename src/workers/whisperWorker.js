import { pipeline, env } from "@huggingface/transformers";

// PrivaNotes AI — local speech-to-text worker (Batch 2)
//
// This is a CPU/WASM baseline: `device: 'wasm'` is set explicitly and is
// the only execution path implemented in this batch. It is NOT a
// Snapdragon NPU path — that is Qualcomm AI Hub's precompiled QNN Whisper
// package via the ONNX Runtime QNN Execution Provider, implemented in
// Batch 5. Nothing here should be read as, or later relabeled as, NPU
// acceleration without that separate implementation and verification.
//
// Runs in a Web Worker so model download/decompression and inference never
// block the UI thread.

// Model weights are fetched from the Hugging Face Hub and cached by the
// browser (see docs/STT.md for exactly what that means for offline use).
env.allowLocalModels = false;

// onnx-community/whisper-base: the same Whisper "base" size the technical
// blueprint identifies as the Batch 5 Qualcomm AI Hub QNN target, so later
// benchmark comparisons (Batch 5, CPU/WASM vs. QNN/NPU) are comparing the
// same model size rather than two different models.
const MODEL_ID = "onnx-community/whisper-base";

/** @type {Promise<any> | null} */
let transcriberPromise = null;

function loadTranscriber(onProgress) {
  if (!transcriberPromise) {
    transcriberPromise = pipeline("automatic-speech-recognition", MODEL_ID, {
      device: "wasm",
      dtype: "q8",
      progress_callback: onProgress,
    }).catch((err) => {
      // Allow a failed load to be retried on the next request instead of
      // permanently caching a rejected promise.
      transcriberPromise = null;
      throw err;
    });
  }
  return transcriberPromise;
}

function serializeError(err) {
  if (err instanceof Error) return err.message;
  return typeof err === "string" ? err : "The local transcription engine hit an unexpected error.";
}

self.onmessage = async (event) => {
  const { type, requestId, audio } = event.data ?? {};
  if (type !== "transcribe") return;

  const reportProgress = (progress) => {
    self.postMessage({ type: "progress", requestId, progress });
  };

  try {
    const transcriber = await loadTranscriber(reportProgress);

    const output = await transcriber(audio, {
      return_timestamps: true,
      chunk_length_s: 30,
      stride_length_s: 5,
    });

    self.postMessage({ type: "complete", requestId, result: output });
  } catch (err) {
    self.postMessage({ type: "error", requestId, message: serializeError(err) });
  }
};
