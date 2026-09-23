// Audio preprocessing for local STT — the "Audio preprocessing" stage from
// the technical blueprint's data-flow diagram (§2a): resample to 16 kHz,
// downmix to mono. What happens after this (mel-spectrogram extraction) is
// internal to the Whisper pipeline itself.

export const WHISPER_SAMPLE_RATE = 16000;

/**
 * Decodes an arbitrary audio Blob/File into mono 16 kHz Float32 PCM samples.
 * Runs entirely client-side via the Web Audio API — the audio bytes never
 * leave the browser.
 *
 * @param {Blob} blob
 * @returns {Promise<{ samples: Float32Array, durationSeconds: number }>}
 */
export async function decodeAudioToMono16k(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextImpl = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextImpl) {
    throw new Error("This browser doesn't support the Web Audio API needed to process audio.");
  }

  const decodingContext = new AudioContextImpl();
  let decoded;
  try {
    decoded = await decodingContext.decodeAudioData(arrayBuffer);
  } catch {
    throw new Error(
      "Couldn't decode this audio. The file may be corrupted or in an unsupported codec."
    );
  } finally {
    decodingContext.close().catch(() => {});
  }

  const durationSeconds = decoded.duration;

  // Already the right shape — avoid an unnecessary resample pass.
  if (decoded.sampleRate === WHISPER_SAMPLE_RATE && decoded.numberOfChannels === 1) {
    return { samples: decoded.getChannelData(0).slice(), durationSeconds };
  }

  const offlineContext = new OfflineAudioContext(
    1,
    Math.max(1, Math.ceil(decoded.duration * WHISPER_SAMPLE_RATE)),
    WHISPER_SAMPLE_RATE
  );
  const source = offlineContext.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineContext.destination);
  source.start(0);

  const rendered = await offlineContext.startRendering();
  return { samples: rendered.getChannelData(0), durationSeconds };
}
