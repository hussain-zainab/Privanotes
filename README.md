# PrivaNotes AI

On-device meeting intelligence built for Snapdragon PCs.

PrivaNotes AI transcribes, redacts, summarizes, and extracts action items from your meetings completely locally. Audio is processed directly in the browser using WebAssembly and WebNN NPU acceleration. Nothing ever leaves your device.

**Live Demo:** https://privanotes.vercel.app

## Core Capabilities

- **Flexible Audio Capture:** Record from your microphone, drag and drop audio files, or capture live meeting audio directly from browser tabs.
- **Local Speech-to-Text:** On-device transcription using Whisper models compatible with Qualcomm AI Hub running via Web Workers to keep the UI smooth and responsive.
- **Automatic Privacy Shield:** Instant client-side PII redaction for payment cards, emails, phone numbers, and government identification numbers using deterministic pattern matching and Luhn checksum validation.
- **Extractive Summarization:** Generates meeting summaries built strictly from verified transcript sentences without generative hallucination risks.
- **Smart Action Item Extraction:** Rules-based task parser that identifies assignees, trigger commitments, and meeting-anchored deadline dates.
- **Snapdragon NPU Acceleration:** Dedicated WebNN execution path targeting Snapdragon Hexagon NPUs with transparent performance benchmarks and automatic WebAssembly CPU fallback.

## System Architecture
PrivaNotes AI processes meetings through an isolated pipeline:

1. **Ingestion:** Raw audio is captured through browser APIs or local file streams.
2. **Transcription:** Audio chunks pass to a Web Worker running Whisper STT on either the Snapdragon NPU (via WebNN `deviceType:'npu'`) or the CPU (via WebAssembly).
3. **Redaction:** Transcripts are scrubbed immediately upon creation using local regex and checksum validation before any secondary processing occurs.
4. **Intelligence:** Summaries and action items are derived exclusively from the redacted text layer.

## Snapdragon & WebNN Execution

PrivaNotes AI is built to leverage Snapdragon X-series hardware through WebNN browser interfaces.

- **Dynamic Hardware Detection:** The application automatically checks for native WebNN interface support on startup.
- **Explicit NPU Targeting:** Users can toggle NPU acceleration for transcription tasks with full status transparency.
- **Graceful Fallback:** If WebNN is unavailable or unsupported by the host browser, processing falls back seamlessly to CPU-based WebAssembly without interrupting the user workflow.
- **Performance Benchmarking:** Includes an integrated benchmark harness (N=5 test cycles) measuring real execution latency in milliseconds.

For complete hardware verification steps, Task Manager NPU monitoring instructions, and execution provider log analysis, see `docs/SNAPDRAGON.md`.

## Tech Stack

- **Frontend & UI:** React, Vite, Tailwind CSS
- **Speech Recognition:** Transformers.js, Qualcomm AI Hub Whisper ONNX layout
- **Hardware Acceleration:** WebNN API, WebAssembly
- **Natural Language Parsing:** Chrono-node, Custom Regex Engine

## Quick Start

### Prerequisites
- Node.js 18 or higher
- Chrome or Edge (WebNN flags enabled for hardware NPU execution)

### Installation

```bash
# Clone the repository
git clone [https://github.com/your-username/privanotes-ai.git](https://github.com/your-username/privanotes-ai.git)
cd privanotes-ai

# Install dependencies
npm install

# Start the local development server
npm run dev
