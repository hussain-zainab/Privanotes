# Local Speech-to-Text (Batch 2)

## What this batch implements
A CPU/WASM baseline for local transcription — the reliable fallback path
described in the technical blueprint, built first so later batches
(Privacy Shield, Meeting Intelligence, Snapdragon NPU) all have real
transcript data to work against.

**This batch makes no Snapdragon or NPU acceleration claim of any kind.**
The `engineLabel` shown in the UI reads `CPU · WASM (Transformers.js)` and
nothing else in this batch.

## Stack
| Piece | Choice | Why |
|---|---|---|
| Library | [`@huggingface/transformers`](https://www.npmjs.com/package/@huggingface/transformers) v4.3.0 (Transformers.js) | The maintained successor to `@xenova/transformers`; wraps ONNX Runtime Web. Verified against the installed `package-lock.json`, not assumed. |
| Model | [`onnx-community/whisper-base`](https://huggingface.co/onnx-community/whisper-base) | Whisper "base" size — deliberately the same size the technical blueprint identifies as the Batch 5 Qualcomm AI Hub QNN target, so a later CPU-vs-NPU benchmark compares the same model rather than two different ones. |
| Execution provider | `device: 'wasm'`, `dtype: 'q8'` (explicit, in `src/workers/whisperWorker.js`) | CPU via WebAssembly. Deliberately not `'webgpu'` — this batch optimizes for "works the same on every judge's/teammate's laptop," not peak speed. WebGPU/WebNN experimentation is explicitly a Batch 5 topic, not this one. |
| Runtime location | Dedicated module Web Worker (`src/workers/whisperWorker.js`) | Model download, decompression, and inference all happen off the main thread — the UI (including the recording level meter) never freezes during transcription. |

## Data flow
```
Audio Blob (from mic recorder or file upload)
        ↓
decodeAudioToMono16k()  — Web Audio API: decode → resample to 16kHz → downmix to mono
        ↓  (Float32Array, transferred to the worker — not copied)
whisperWorker.js  — pipeline('automatic-speech-recognition', 'onnx-community/whisper-base',
                              { device: 'wasm', dtype: 'q8' })
        ↓  (return_timestamps: true, chunk_length_s: 30, stride_length_s: 5)
{ text, chunks: [{ text, timestamp: [start, end] }, ...] }
        ↓
MeetingSessionContext (transcript, pipelineStatus, engineLabel)
        ↓
TranscriptPanel / TranscriptSegments (UI)
```

## Model loading, caching, and offline behavior
- On first use, the worker calls `pipeline(...)`, which fetches the model's
  ONNX weights and tokenizer files from the Hugging Face Hub.
  `progress_callback` reports per-file `initiate` → `download`/`progress`
  (0–100%, with byte counts) → `done` events, which `useWhisperTranscriber`
  turns into the `ModelLoadProgress` UI.
- Transformers.js's `env.useBrowserCache` defaults to `true`, meaning it
  stores fetched model files in the browser's Cache Storage API. In
  practice: **the first transcription on a given browser profile requires
  internet access; subsequent transcriptions reuse the cached weights and
  do not require it**, as long as the browser's cache/site data for this
  origin isn't cleared. This is "offline-capable after first run," not
  "zero network activity on every run" — see the blueprint's §9 distinction
  between those two claims.
- `env.allowLocalModels = false` is set explicitly in the worker: this
  batch does not bundle model weights into the app itself, so there's no
  local-model path to accidentally fall through to.

## Known limitations (stated plainly, not hidden)
- Transcription quality depends on Whisper-base's inherent accuracy —
  accents, cross-talk, and background noise will degrade results, same as
  any Whisper-family model this size.
- `chunk_length_s: 30` / `stride_length_s: 5` enables long-form chunked
  transcription, but very long recordings (many minutes) will still take
  a while on CPU — there's no progress indicator *during* inference itself
  (only during model download), since the underlying pipeline call doesn't
  expose per-chunk progress.
- No language is pinned — Whisper's automatic language detection is used.
  For a single-language demo this is fine; for mixed-language meetings,
  results may be inconsistent.
- Timestamps come directly from Whisper's own segment boundaries, which
  are approximate, not word-level-precise.

## What a later batch (Batch 5) will change here
- Batch 5 adds a **separate**, Snapdragon-specific path (Qualcomm AI Hub's
  precompiled QNN Whisper-Base package via the ONNX Runtime QNN Execution
  Provider) and a verified way to distinguish "requested provider" from
  "actually executed provider" (per the blueprint's NPU-verification
  section). This batch's WASM path becomes the permanent fallback when
  QNN/NPU isn't available, not something that gets deleted.
