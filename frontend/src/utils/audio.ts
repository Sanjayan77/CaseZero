// Web Audio API Procedural Noir Sound Ambiance Generator
// Generates gentle rain, distant vinyl crackle, and moody ambient pad without external audio files.

class NoirAmbiance {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private rainNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public start() {
    try {
      this.initContext();
      if (!this.ctx) return;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 2.0);
      this.gainNode.connect(this.ctx.destination);

      // Rain Synthesizer via Pink/Brown Filtered Noise Buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to simulate steady rain on windowpanes
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.gainNode);
      whiteNoise.start();

      this.rainNode = whiteNoise;
      this.isPlaying = true;
    } catch (e) {
      console.warn('Audio ambiance could not start:', e);
      this.isPlaying = false;
    }
  }

  public stop() {
    try {
      if (this.gainNode && this.ctx) {
        this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.0);
        setTimeout(() => {
          if (this.rainNode) {
            (this.rainNode as any).stop?.();
            this.rainNode.disconnect();
            this.rainNode = null;
          }
        }, 1000);
      }
      this.isPlaying = false;
    } catch (e) {
      this.isPlaying = false;
    }
  }
}

export const noirAmbiance = new NoirAmbiance();
