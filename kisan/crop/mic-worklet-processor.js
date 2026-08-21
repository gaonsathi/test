// ===================================================================
//  mic-worklet-processor.js — runs on the audio rendering thread.
//  Buffers incoming mic samples into fixed-size Float32 chunks and
//  posts each finished chunk back to the main thread via port. This
//  replaces crop.js's old ScriptProcessorNode(512, 1, 1) + onaudioprocess
//  callback, which is deprecated. Must be loaded with
//  audioContext.audioWorklet.addModule(...) — it does not run as a
//  normal <script>.
// ===================================================================

class MicCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const chunkSize = (options && options.processorOptions && options.processorOptions.chunkSize) || 512;
    this._chunkSize = chunkSize;
    this._buffer = new Float32Array(chunkSize);
    this._writeIndex = 0;
  }

  process(inputs) {
    const input = inputs[0];
    const channel = input && input[0];
    if (channel && channel.length) {
      for (let i = 0; i < channel.length; i++) {
        this._buffer[this._writeIndex++] = channel[i];
        if (this._writeIndex === this._chunkSize) {
          // Send a copy — the underlying buffer is reused immediately
          // for the next chunk, so the receiver needs its own copy.
          this.port.postMessage(this._buffer.slice(0));
          this._writeIndex = 0;
        }
      }
    }
    // Returning true keeps this processor (and its node) alive for the
    // life of the mic stream, same as ScriptProcessorNode used to.
    return true;
  }
}

registerProcessor('mic-capture-processor', MicCaptureProcessor);
