// Web Audio API Synthesizer for realistic piano / Rhodes electric piano sounds
import { midiToFrequency } from './musicTheory';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.6;
  private activeOscillators: Map<number, { stop: () => void }> = new Map();

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Play a single note by MIDI number
  public playNote(midi: number, durationSec: number = 1.2, velocity: number = 0.8) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const freq = midiToFrequency(midi);
    const now = this.ctx.currentTime;

    // Master gain for this note
    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0, now);

    // Warm low-pass filter to simulate acoustic body resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 5, 8000), now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 1.5, 300), now + durationSec);

    // Primary fundamental oscillator (triangle for acoustic warmth)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    // Secondary overtone oscillator (sine for pure body harmonic)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.25, now);

    // Slight tine attack (electric piano bell overtone)
    const tineOsc = this.ctx.createOscillator();
    tineOsc.type = 'sine';
    tineOsc.frequency.setValueAtTime(freq * 4.02, now);

    const tineGain = this.ctx.createGain();
    tineGain.gain.setValueAtTime(0.12 * velocity, now);
    tineGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    // Connect node graph
    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    tineOsc.connect(tineGain);
    tineGain.connect(filter);

    filter.connect(noteGain);
    noteGain.connect(this.ctx.destination);

    // ADSR Envelope
    const peakGain = this.volume * velocity * 0.45;
    const attackTime = 0.008;
    const decayTime = durationSec * 0.4;
    const sustainGain = peakGain * 0.35;

    noteGain.gain.linearRampToValueAtTime(peakGain, now + attackTime);
    noteGain.gain.exponentialRampToValueAtTime(sustainGain, now + attackTime + decayTime);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    // Start oscillators
    osc1.start(now);
    osc2.start(now);
    tineOsc.start(now);

    osc1.stop(now + durationSec + 0.05);
    osc2.stop(now + durationSec + 0.05);
    tineOsc.stop(now + durationSec + 0.05);
  }

  // Play a full chord together (simultaneous block chord or slight strum)
  public playChord(midiNotes: number[], arpeggiateSpeedMs: number = 0, duration: number = 2.0) {
    if (this.isMuted || midiNotes.length === 0) return;
    this.initContext();

    midiNotes.forEach((midi, index) => {
      const delay = (index * arpeggiateSpeedMs) / 1000;
      setTimeout(() => {
        this.playNote(midi, duration, 0.75 - index * 0.04);
      }, delay * 1000);
    });
  }

  // Play an ascending & descending scale arpeggio
  public playScaleArpeggio(midiNotes: number[], bpm: number = 130, onNotePlayed?: (midi: number) => void) {
    if (this.isMuted || midiNotes.length === 0) return;
    this.initContext();

    // Sequence: ascending then descending
    const fullSequence = [...midiNotes];
    if (midiNotes.length > 1) {
      const descending = [...midiNotes.slice(0, -1)].reverse();
      fullSequence.push(...descending);
    }

    const noteDurationMs = (60 / bpm / 2) * 1000; // 8th notes

    fullSequence.forEach((midi, index) => {
      setTimeout(() => {
        this.playNote(midi, 0.6, 0.85);
        if (onNotePlayed) {
          onNotePlayed(midi);
        }
      }, index * noteDurationMs);
    });
  }
}

export const audioSynth = new AudioEngine();
