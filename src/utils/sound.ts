class SoundController {
  private ctx: AudioContext | null = null;
  private muted = false;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(val: boolean): void {
    this.muted = val;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.08,
    endFreq?: number,
    delay = 0,
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public click() {
    this.tone(540 + Math.random() * 60, 0.05, 'triangle', 0.06, 320);
  }

  public tileToggle(selected: boolean) {
    this.tone(selected ? 680 : 420, 0.065, 'sine', 0.06, selected ? 840 : 340);
  }

  public wrong() {
    this.tone(185, 0.14, 'sawtooth', 0.08, 120, 0);
    this.tone(145, 0.22, 'sawtooth', 0.08, 95, 0.11);
  }

  public quack() {
    this.tone(620, 0.08, 'sawtooth', 0.07, 420, 0);
    this.tone(540, 0.09, 'sawtooth', 0.06, 360, 0.07);
  }

  public glitch() {
    this.tone(920, 0.04, 'square', 0.05, 190, 0);
    this.tone(240, 0.05, 'sawtooth', 0.05, 780, 0.04);
    this.tone(510, 0.05, 'square', 0.04, 120, 0.08);
  }

  public radarPing(heat: 'hit' | 'scalding' | 'warm' | 'cool' | 'freezing') {
    const map = {
      freezing: 220,
      cool: 340,
      warm: 540,
      scalding: 820,
      hit: 1120,
    };
    this.tone(map[heat], 0.12, 'sine', 0.07, map[heat] * 1.15);
  }

  public success() {
    this.tone(523.25, 0.09, 'triangle', 0.07, undefined, 0);
    this.tone(659.25, 0.09, 'triangle', 0.07, undefined, 0.08);
    this.tone(783.99, 0.16, 'triangle', 0.08, undefined, 0.16);
  }

  public fakeSuccessBetrayal() {
    this.tone(523.25, 0.08, 'triangle', 0.07, undefined, 0);
    this.tone(659.25, 0.08, 'triangle', 0.07, undefined, 0.08);
    this.tone(130, 0.28, 'sawtooth', 0.09, 85, 0.2);
  }

  public victoryFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.tone(n, 0.18, 'triangle', 0.08, undefined, i * 0.09));
  }

  public defeatSting() {
    const notes = [311.13, 293.66, 277.18, 220];
    notes.forEach((n, i) => this.tone(n, 0.22, 'sawtooth', 0.07, n * 0.92, i * 0.14));
  }
}

export const sound = new SoundController();
