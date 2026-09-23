# PrivaNotes AI

On-device AI meeting assistant & privacy shield, built for the Snapdragon®
AI Lab Build & Present Challenge (Qualcomm). Transcribes, redacts, and
summarizes meetings locally — no audio ever leaves the device, no mandatory
cloud API.

> **Status: Batch 2 of 5 — Local Speech-to-Text.**
> Meeting capture and local transcription are implemented. Privacy
> redaction, summarization, action-item extraction, and Snapdragon NPU
> acceleration are **not implemented yet** — see [Roadmap](#roadmap) below.
> Every panel that isn't built yet says so explicitly in the UI rather than
> faking data, and transcription in this batch runs on **CPU via WASM
> only** — no NPU/QNN claim is made here.

## What's implemented

**Batch 1 — Foundation & meeting capture**
- React + Vite + Tailwind application shell, with the PrivaNotes AI brand
  mark and a two-panel workspace layout (capture rail + tabbed dashboard).
- Microphone recording: start / pause / resume / stop, a live timer, and a
  live input-level meter, via `MediaRecorder` + the Web Audio API.
- Audio file upload: drag-and-drop or file picker, with type validation
  (WAV, MP3, M4A, OGG, WEBM, FLAC) and a clear error message for
  unsupported files.
- Playback preview of whichever audio (recorded or uploaded) is active,
  and a "start over" reset.
- Loading and error states (mic permission denied, unsupported browser,
  invalid upload) all handled and surfaced in the UI.

**Batch 2 — Local speech-to-text**
- Fully local transcription via [Transformers.js](https://huggingface.co/docs/transformers.js)
  (`@huggingface/transformers`) running `onnx-community/whisper-base` on
  CPU/WASM, inside a dedicated Web Worker so the UI never blocks.
- Audio preprocessing (decode → resample to 16kHz → downmix to mono) via
  the Web Audio API.
- Model-download progress (first run only — cached afterward), a
  transcribing state, and a completed state showing a timestamped
  transcript with a copy-to-clipboard action.
- The engine-status badge in the top bar reflects real state: "Engine not
  loaded yet" → "Downloading model…" → "CPU · WASM — transcribing" →
  "CPU · WASM (Transformers.js)". It never claims NPU/hardware acceleration
  in this batch.
- Errors surfaced explicitly: audio decode failures, worker crashes, and
  model load failures all show a real message, not a silent failure.

See `docs/STT.md` for the full architecture, model choice rationale, and
documented limitations of this batch.

## What's explicitly NOT implemented yet

- No PII detection/redaction — Batch 3.
- No summarization or action-item extraction — Batch 4.
- No Snapdragon/QNN NPU path, no WebNN, no benchmarking — Batch 5.

## Roadmap

| Batch | Scope |
|---|---|
| 1 | Foundation & meeting capture — done |
| 2 (this one) | Local speech-to-text (Transformers.js / ONNX Runtime Web, CPU/WASM baseline) — done |
| 3 | Privacy Shield (PII detection + redaction) |
| 4 | Meeting intelligence (summary + action items) |
| 5 | Snapdragon optimization: Qualcomm AI Hub Whisper + ONNX Runtime QNN Execution Provider on the Hexagon NPU, with verified (not assumed) NPU-usage evidence, benchmarking, and final documentation |

See the project's technical blueprint (`PrivaNotes-AI-Technical-Blueprint.md`,
carried alongside this repo) for the full architecture decisions and the
reasoning behind the fallback strategy.

## Getting started

Requires [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`) in
**Chrome or Edge** (recommended — best WASM/SIMD performance and the
browsers later batches' NPU work will target). Firefox and Safari can run
this batch's CPU/WASM path too, but haven't been exhaustively tested here.

Grant microphone access when prompted to test recording, or drop an audio
file onto the upload panel, then click **Transcribe locally** on the
Transcript tab. The first transcription downloads the Whisper model
(~80–100MB) — subsequent ones reuse the browser-cached copy and are much
faster to start.

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build locally
npm run lint      # ESLint
```

### Troubleshooting `npm install`

If `npm install` fails while installing `onnxruntime-node` with a message
about downloading from `nuget.org`: that package is the **Node.js/native**
backend of ONNX Runtime, pulled in as a transitive dependency of
`@huggingface/transformers`. PrivaNotes AI never uses it — the browser app
only uses `onnxruntime-web` — so this failure doesn't affect the app
itself. Either ensure your network allows access to `nuget.org`, or run:

```bash
npm install --ignore-scripts
```

## Environment variables

**No external API is required through Batch 2.** See `.env.example` — it's
currently a placeholder documenting that convention for later batches, not
because anything needs to be filled in today. The Whisper model is fetched
from the Hugging Face Hub (a public, unauthenticated CDN download), not an
API call requiring a key.

## Project structure

```
src/
  components/         UI components (rail, dashboard, controls, tabs)
    panels/           The four dashboard tab panels
  context/            MeetingSessionContext — session/audio/transcript state
  hooks/              useAudioRecorder, useWhisperTranscriber
  workers/            whisperWorker.js — local Whisper pipeline (off-main-thread)
  utils/              audio.js, audioPreprocessing.js, classNames.js
docs/
  DESIGN.md           Design token rationale
  STT.md              Batch 2 architecture, model choice, and limitations
```

## Privacy & offline behavior (current state)

Audio capture, preprocessing, and transcription all happen entirely
client-side — no audio or transcript data is ever sent to a server. The
one network dependency in this batch is the Whisper model download on
first use (from the Hugging Face Hub) and Google Fonts at page load;
neither touches meeting content. After the first successful transcription,
the model is served from the browser's Cache Storage and transcription
works without internet access. See `docs/STT.md` for the precise
offline-capable-vs-zero-network-activity distinction.
