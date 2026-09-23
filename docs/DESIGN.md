# PrivaNotes AI — Design Notes

## Concept
A calm, control-room workspace for a private meeting — not a chat app, not a
marketing landing page. The one idea the UI is built around: this is a
*shield*, not a cloud service. The brand mark is a simple geometric shield
glyph, reused as the "Protected" tab icon and the privacy empty-state icon,
rather than a generic AI sparkle/orb.

## Color
| Token | Hex | Role |
|---|---|---|
| `ink-900` | `#10141A` | App background |
| `ink-800` | `#171D26` | Panel surfaces |
| `ink-700` / `ink-600` | `#1E2530` / `#262E3A` | Hairline borders |
| `mist-100` | `#E7EAEE` | Primary text |
| `mist-300` / `mist-400` | `#8B93A1` / `#5C6577` | Secondary / muted text |
| `shield` | `#35C48C` | "Local / protected / offline" signal — used sparingly, on the Protected tab, offline badge, and success states |
| `live` | `#E2A63D` | Recording / in-progress signal |
| `alert` | `#E2574C` | Errors only |

Flat panels with 1px hairline borders, not drop shadows — this is a tool you
work in for the length of a meeting, not a marketing surface you scroll past
once.

## Type
- **Manrope** for all UI text — one family, varied by weight, so the
  interface doesn't feel like it's mixing typefaces for effect.
- **IBM Plex Mono** used narrowly, for genuinely technical/tabular content
  (the Batch 5 EP-status readout, benchmark numbers, durations) — not as a
  default label font.

## Layout
Two-column workspace: a fixed-width capture rail on the left (microphone,
upload, session state — the input side) and a tabbed dashboard on the right
(transcript, protected transcript, summary, action items — the output
side). This mirrors the actual data flow in the technical blueprint (capture
→ processing → output) rather than a generic card grid.

## What later batches should preserve
- Keep the shield glyph as the only "brand" motif — don't introduce a second
  icon system for AI/processing states.
- The `shield` accent color is reserved for "this is local / protected /
  verified" states. Don't reuse it for arbitrary UI accents — its meaning is
  load-bearing once Batch 5 uses a status badge to distinguish a verified
  NPU/QNN path from a CPU/WASM fallback.
- `live` (amber) is reserved for "something is actively happening right now"
  (recording, processing) — not for warnings (that's `alert`).
