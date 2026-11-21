class SoundController {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;
  private paused = false;
  private lastPlayed: Record<string, number> = {};

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(val: boolean): void {
    this.muted = val;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(val ? 0 : 0.72, this.ctx.currentTime, 0.015);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public setPaused(val: boolean): void {
    this.paused = val;
    if (!this.ctx) return;
    if (val && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    } else if (!val && !this.muted && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private canPlay(key: string, minIntervalMs: number): boolean {
    const now = performance.now();
    const prev = this.lastPlayed[key] ?? 0;
    if (now - prev < minIntervalMs) return false;
    this.lastPlayed[key] = now;
    return true;
  }

  private getContext(allowWhilePaused = false): AudioContext | null {
    if (this.muted || (this.paused && !allowWhilePaused) || typeof window === 'undefined') {
      return null;
    }
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.72;
      this.masterGain.connect(this.ctx.destination);
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
    gainPeak = 0.075,
    endFreq?: number,
    delay = 0,
    allowWhilePaused = false,
  ) {
    const ctx = this.getContext(allowWhilePaused);
    if (!ctx || !this.masterGain) return;
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
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.025);
  }

  private jitter(base: number, pct = 0.05): number {
    return base * (1 + (Math.random() * 2 - 1) * pct);
  }

  public click() {
    if (!this.canPlay('click', 45)) return;
    this.tone(this.jitter(540), 0.045, 'triangle', 0.055, 320, 0, true);
  }

  public pauseToggle(isNowPaused: boolean) {
    if (!this.canPlay('pause', 80)) return;
    if (isNowPaused) {
      this.tone(420, 0.08, 'sine', 0.05, 290, 0, true);
    } else {
      this.tone(320, 0.08, 'sine', 0.05, 480, 0, true);
    }
  }

  public tileToggle(selected: boolean) {
    if (!this.canPlay('tile', 40)) return;
    this.tone(
      this.jitter(selected ? 680 : 420),
      0.06,
      'sine',
      0.055,
      selected ? 840 : 340,
    );
  }

  public wrong() {
    if (!this.canPlay('wrong', 180)) return;
    this.tone(185, 0.13, 'sawtooth', 0.065, 120, 0);
    this.tone(145, 0.2, 'sawtooth', 0.065, 95, 0.11);
  }

  public quack() {
    if (!this.canPlay('quack', 150)) return;
    this.tone(this.jitter(610, 0.07), 0.075, 'sawtooth', 0.055, 410, 0);
    this.tone(this.jitter(530, 0.07), 0.085, 'sawtooth', 0.05, 350, 0.07);
  }

  public glitch() {
    if (!this.canPlay('glitch', 130)) return;
    this.tone(this.jitter(880), 0.038, 'square', 0.04, 210, 0);
    this.tone(250, 0.045, 'sawtooth', 0.04, 760, 0.038);
    this.tone(490, 0.045, 'square', 0.035, 130, 0.08);
  }

  public countdownTick() {
    if (!this.canPlay('tick', 250)) return;
    this.tone(740, 0.04, 'triangle', 0.045, 620);
  }

  public holdTick(progressPct: number) {
    if (!this.canPlay('hold', 170)) return;
    const freq = 260 + (progressPct / 100) * 520;
    this.tone(freq, 0.07, 'triangle', 0.045, freq * 1.06);
  }

  public radarPing(heat: 'hit' | 'scalding' | 'warm' | 'cool' | 'freezing') {
    if (!this.canPlay('radar', 90)) return;
    const map = {
      freezing: 220,
      cool: 340,
      warm: 540,
      scalding: 820,
      hit: 1120,
    };
    this.tone(map[heat], 0.11, 'sine', 0.06, map[heat] * 1.15);
  }

  public success() {
    if (!this.canPlay('success', 180)) return;
    this.tone(523.25, 0.085, 'triangle', 0.065, undefined, 0);
    this.tone(659.25, 0.085, 'triangle', 0.065, undefined, 0.075);
    this.tone(783.99, 0.15, 'triangle', 0.07, undefined, 0.15);
  }

  public fakeSuccessBetrayal() {
    if (!this.canPlay('fakeSuccess', 300)) return;
    this.tone(523.25, 0.075, 'triangle', 0.06, undefined, 0);
    this.tone(659.25, 0.075, 'triangle', 0.06, undefined, 0.08);
    this.tone(135, 0.26, 'sawtooth', 0.075, 85, 0.22);
  }

  public victoryFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.tone(n, 0.18, 'triangle', 0.07, undefined, i * 0.09, true));
  }

  public defeatSting() {
    const notes = [311.13, 293.66, 277.18, 220];
    notes.forEach((n, i) => this.tone(n, 0.22, 'sawtooth', 0.06, n * 0.92, i * 0.14, true));
  }
}

export const sound = new SoundController();
