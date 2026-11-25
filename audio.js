/**
 * Web Audio API Sound Synthesizer
 * 100% offline, zero-dependency procedural audio engine
 * Provides: Background Music (BGM), Drawing Tension SFX, Winning Fanfare SFX
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.drawGain = null;
    this.winGain = null;

    // Settings
    this.isMuted = false;
    this.bgmEnabled = true;
    this.drawSfxEnabled = true;
    this.winSfxEnabled = true;

    this.bgmVolume = 0.4;
    this.drawVolume = 0.7;
    this.winVolume = 0.8;

    this.bgmInterval = null;
    this.drawSfxOscillators = [];
    this.isBgmPlaying = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      console.warn('Web Audio API not supported in this browser.');
      return;
    }
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : 1;
    this.masterGain.connect(this.ctx.destination);

    // BGM Bus
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = this.bgmEnabled ? this.bgmVolume : 0;
    this.bgmGain.connect(this.masterGain);

    // Draw SFX Bus
    this.drawGain = this.ctx.createGain();
    this.drawGain.gain.value = this.drawSfxEnabled ? this.drawVolume : 0;
    this.drawGain.connect(this.masterGain);

    // Win SFX Bus
    this.winGain = this.ctx.createGain();
    this.winGain.gain.value = this.winSfxEnabled ? this.winVolume : 0;
    this.winGain.connect(this.masterGain);
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(mute ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }

  setBgmEnabled(enabled) {
    this.bgmEnabled = enabled;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(enabled ? this.bgmVolume : 0, this.ctx.currentTime, 0.05);
    }
    if (enabled && !this.isBgmPlaying) {
      this.startBgm();
    } else if (!enabled && this.isBgmPlaying) {
      this.stopBgm();
    }
  }

  setBgmVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGain && this.ctx && this.bgmEnabled) {
      this.bgmGain.gain.setTargetAtTime(this.bgmVolume, this.ctx.currentTime, 0.05);
    }
  }

  setDrawSfxEnabled(enabled) {
    this.drawSfxEnabled = enabled;
    if (this.drawGain && this.ctx) {
      this.drawGain.gain.setTargetAtTime(enabled ? this.drawVolume : 0, this.ctx.currentTime, 0.05);
    }
  }

  setDrawVolume(val) {
    this.drawVolume = Math.max(0, Math.min(1, val));
    if (this.drawGain && this.ctx && this.drawSfxEnabled) {
      this.drawGain.gain.setTargetAtTime(this.drawVolume, this.ctx.currentTime, 0.05);
    }
  }

  setWinSfxEnabled(enabled) {
    this.winSfxEnabled = enabled;
    if (this.winGain && this.ctx) {
      this.winGain.gain.setTargetAtTime(enabled ? this.winVolume : 0, this.ctx.currentTime, 0.05);
    }
  }

  setWinVolume(val) {
    this.winVolume = Math.max(0, Math.min(1, val));
    if (this.winGain && this.ctx && this.winSfxEnabled) {
      this.winGain.gain.setTargetAtTime(this.winVolume, this.ctx.currentTime, 0.05);
    }
  }

  // --- Procedural BGM: Elegant Award Ceremony Ambient Pad & Chords ---
  startBgm() {
    this.ensureContext();
    if (!this.ctx || this.isBgmPlaying || !this.bgmEnabled) return;
    this.isBgmPlaying = true;

    // A progression of warm, luxurious ambient chords: Dmaj9 -> Bm7 -> Gmaj7 -> A(add9)
    const chords = [
      [146.83, 220.00, 277.18, 369.99, 440.00], // D3, A3, C#4, F#4, A4
      [123.47, 185.00, 220.00, 293.66, 369.99], // B2, F#3, A3, D4, F#4
      [98.00, 146.83, 196.00, 293.66, 369.99],  // G2, D3, G3, D4, F#4
      [110.00, 164.81, 220.00, 277.18, 329.63]  // A2, E3, A3, C#4, E4
    ];

    let chordIndex = 0;
    const playChord = () => {
      if (!this.isBgmPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = chords[chordIndex % chords.length];
      chordIndex++;

      // Create warm pad synth notes
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Lowpass filter for smooth warmth
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600 + idx * 250, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04 / notes.length, now + 1.2);
        gain.gain.setValueAtTime(0.04 / notes.length, now + 3.0);
        gain.gain.linearRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 4.6);
      });

      // Subtle high sparkle chime occasionally
      if (Math.random() > 0.4) {
        const chimeFreqs = [587.33, 739.99, 880.00, 1108.73];
        const chimeFreq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(chimeFreq, now + 0.8);

        chimeGain.gain.setValueAtTime(0, now + 0.8);
        chimeGain.gain.linearRampToValueAtTime(0.015, now + 0.9);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.bgmGain);
        chimeOsc.start(now + 0.8);
        chimeOsc.stop(now + 2.6);
      }
    };

    playChord();
    this.bgmInterval = setInterval(playChord, 3800);
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // --- Draw SFX: Tension Riser / Rapid Mechanical Click / Drumroll / Horse Gallop ---
  startDrawSound(style = 'slot') {
    this.ensureContext();
    if (!this.ctx || !this.drawSfxEnabled) return;
    this.stopDrawSound();

    if (style === 'derby') {
      // 1. Bugle Call at start
      const now = this.ctx.currentTime;
      const bugleNotes = [
        { f: 261.63, t: 0 },    // C4
        { f: 329.63, t: 0.12 }, // E4
        { f: 392.00, t: 0.24 }, // G4
        { f: 523.25, t: 0.36 }, // C5
        { f: 392.00, t: 0.54 }, // G4
        { f: 523.25, t: 0.66 }  // C5
      ];

      bugleNotes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.f, now + n.t);

        gain.gain.setValueAtTime(0, now + n.t);
        gain.gain.linearRampToValueAtTime(0.12, now + n.t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + 0.16);

        osc.connect(gain);
        gain.connect(this.drawGain);
        osc.start(now + n.t);
        osc.stop(now + n.t + 0.18);
      });

      // 2. Galloping Hooves Sound (Clip-Clop rhythmic galloping)
      let step = 0;
      this.drawInterval = setInterval(() => {
        if (!this.ctx) return;
        const cur = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, cur);

        // Alternating hoof pitch
        osc.type = 'triangle';
        const pitch = step % 2 === 0 ? 160 : 120;
        osc.frequency.setValueAtTime(pitch, cur);
        osc.frequency.exponentialRampToValueAtTime(50, cur + 0.05);

        gain.gain.setValueAtTime(0.18, cur);
        gain.gain.exponentialRampToValueAtTime(0.001, cur + 0.05);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.drawGain);

        osc.start(cur);
        osc.stop(cur + 0.06);
        step++;
      }, 75); // fast gallop

    } else if (style === 'luckyball') {
      // Tumbler whoosh & rhythmic bouncing ball sound
      this.drawInterval = setInterval(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Woody / metallic ping
        osc.type = 'triangle';
        const baseFreq = 420 + Math.random() * 260;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.drawGain);

        osc.start(now);
        osc.stop(now + 0.09);
      }, 90);
    } else {
      // Slot machine reel tick click
      let speed = 60; // ms
      let count = 0;
      const playTick = () => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + (count % 4) * 80, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(this.drawGain);

        osc.start(now);
        osc.stop(now + 0.04);
        count++;
      };

      this.drawInterval = setInterval(playTick, speed);
    }
  }

  stopDrawSound() {
    if (this.drawInterval) {
      clearInterval(this.drawInterval);
      this.drawInterval = null;
    }
  }

  // --- Win SFX: Majestic Fanfare + Golden Chimes ---
  playWinSound() {
    this.ensureContext();
    if (!this.ctx || !this.winSfxEnabled) return;

    this.stopDrawSound();
    const now = this.ctx.currentTime;

    // Powerful golden fanfare chord progression: Bb3 -> D4 -> F4 -> Bb4 -> D5 -> F5
    const fanfareNotes = [233.08, 293.66, 349.23, 466.16, 587.33, 698.46, 932.33];

    fanfareNotes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = idx * 0.06;

      osc.type = idx < 3 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.08, now + delay + 0.08);
      gain.gain.setValueAtTime(0.08, now + delay + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.4);

      osc.connect(gain);
      gain.connect(this.winGain);

      osc.start(now + delay);
      osc.stop(now + delay + 2.5);
    });

    // Cascading magical sparkle chimes
    const sparkles = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00, 2349.32];
    sparkles.forEach((freq, i) => {
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      const chimeTime = now + 0.4 + i * 0.09;

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, chimeTime);

      chimeGain.gain.setValueAtTime(0.05, chimeTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 0.8);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.winGain);

      chimeOsc.start(chimeTime);
      chimeOsc.stop(chimeTime + 0.85);
    });
  }

  // Quick UI feedback click
  playClick() {
    this.ensureContext();
    if (!this.ctx || !this.drawSfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.drawGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }
}

// Global Sound Instance
window.soundEngine = new SoundEngine();
