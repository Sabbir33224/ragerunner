// Audio Manager - generates all sounds using Web Audio API
class AudioManagerClass {
  private ctx: AudioContext | null = null;
  private musicOn = true;
  private sfxOn = true;
  private volume = 0.5;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentMusic: OscillatorNode[] = [];

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.volume * 0.3;
    this.musicGain.connect(this.ctx.destination);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.volume;
    this.sfxGain.connect(this.ctx.destination);
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const s = localStorage.getItem('rr_audio');
      if (s) {
        const d = JSON.parse(s);
        this.musicOn = d.musicOn ?? true;
        this.sfxOn = d.sfxOn ?? true;
        this.volume = d.volume ?? 0.5;
        this.updateGains();
      }
    } catch {}
  }

  saveSettings() {
    localStorage.setItem('rr_audio', JSON.stringify({
      musicOn: this.musicOn,
      sfxOn: this.sfxOn,
      volume: this.volume
    }));
  }

  private updateGains() {
    if (this.musicGain) this.musicGain.gain.value = this.musicOn ? this.volume * 0.3 : 0;
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxOn ? this.volume : 0;
  }

  toggleMusic() { this.musicOn = !this.musicOn; this.updateGains(); this.saveSettings(); return this.musicOn; }
  toggleSfx() { this.sfxOn = !this.sfxOn; this.updateGains(); this.saveSettings(); return this.sfxOn; }
  setVolume(v: number) { this.volume = v; this.updateGains(); this.saveSettings(); }
  getMusicOn() { return this.musicOn; }
  getSfxOn() { return this.sfxOn; }
  getVolume() { return this.volume; }

  private playTone(freq: number, duration: number, type: OscillatorType = 'square', dest?: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(dest || this.sfxGain || this.ctx.destination);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  playJump() {
    if (!this.ctx || !this.sfxOn) return;
    this.playTone(300, 0.1, 'square');
    setTimeout(() => this.playTone(500, 0.1, 'square'), 30);
  }

  playDoubleJump() {
    if (!this.ctx || !this.sfxOn) return;
    this.playTone(400, 0.08, 'square');
    setTimeout(() => this.playTone(600, 0.08, 'square'), 40);
    setTimeout(() => this.playTone(800, 0.08, 'square'), 80);
  }

  playLand() {
    if (!this.ctx || !this.sfxOn) return;
    this.playTone(150, 0.05, 'triangle');
  }

  playCoin() {
    if (!this.ctx || !this.sfxOn) return;
    this.playTone(880, 0.08, 'square');
    setTimeout(() => this.playTone(1100, 0.12, 'square'), 60);
  }

  playDeath() {
    if (!this.ctx || !this.sfxOn) return;
    this.playTone(400, 0.1, 'sawtooth');
    setTimeout(() => this.playTone(300, 0.1, 'sawtooth'), 80);
    setTimeout(() => this.playTone(200, 0.15, 'sawtooth'), 160);
    setTimeout(() => this.playTone(100, 0.3, 'sawtooth'), 240);
  }

  playTrapActivate() {
    if (!this.ctx || !this.sfxOn) return;
    this.playTone(200, 0.15, 'sawtooth');
    this.playTone(250, 0.15, 'sawtooth');
  }

  playLevelComplete() {
    if (!this.ctx || !this.sfxOn) return;
    const notes = [523, 587, 659, 784, 880, 1047];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 0.15, 'square'), i * 80);
    });
  }

  playCheckpoint() {
    if (!this.ctx || !this.sfxOn) return;
    this.playTone(600, 0.1, 'triangle');
    setTimeout(() => this.playTone(800, 0.15, 'triangle'), 100);
  }

  playClick() {
    if (!this.ctx || !this.sfxOn) return;
    this.playTone(700, 0.04, 'square');
  }

  playDoorOpen() {
    if (!this.ctx || !this.sfxOn) return;
    this.playTone(300, 0.1, 'triangle');
    setTimeout(() => this.playTone(400, 0.1, 'triangle'), 80);
    setTimeout(() => this.playTone(500, 0.15, 'triangle'), 160);
  }

  startMenuMusic() {
    this.stopMusic();
    if (!this.ctx || !this.musicOn) return;
    // Simple looping melody
    const playMelody = () => {
      if (!this.ctx || !this.musicOn) return;
      const melody = [262, 294, 330, 349, 330, 294, 262, 247, 262, 294, 330, 349, 392, 349, 330, 294];
      melody.forEach((note, i) => {
        setTimeout(() => {
          if (this.musicOn && this.ctx) {
            this.playTone(note, 0.25, 'triangle', this.musicGain!);
          }
        }, i * 280);
      });
      if (this.musicOn) {
        setTimeout(playMelody, melody.length * 280);
      }
    };
    playMelody();
  }

  stopMusic() {
    this.currentMusic.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    this.currentMusic = [];
  }

  resume() {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }
}

export const AudioManager = new AudioManagerClass();
