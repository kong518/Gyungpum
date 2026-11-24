/**
 * Animations Engine - Discord Cheerful Edition
 * 1. Ambient Joyful Stardust & Aurora
 * 2. High-Energy Celebration Confetti Cannon
 * 3. Realistic Lotto Air Tumbler
 * 4. Realistic & Adorable 2.5D Horse Racing Derby (Natural Pack Sprint, Cute Chibi Horses, Seamless Finish)
 */

// --- 1. Ambient Background Particles & Aurora ---
class BackgroundParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.count = 35;
    this.animationFrame = null;

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);

    window.addEventListener('resize', this.resize);
    this.resize();
    this.initParticles();
    this.loop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    const colors = [
      'rgba(88, 101, 242, 0.4)',  // Blurple
      'rgba(87, 242, 135, 0.35)', // Spring Green
      'rgba(0, 176, 244, 0.35)',  // Vivid Cerulean
      'rgba(235, 69, 158, 0.35)', // Fuchsia
      'rgba(255, 215, 0, 0.4)'    // Gold
    ];

    for (let i = 0; i < this.count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 3 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: -Math.random() * 0.4 - 0.1,
        pulse: Math.random() * Math.PI,
        pulseSpeed: Math.random() * 0.03 + 0.015
      });
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += p.pulseSpeed;

      if (p.y < -15) {
        p.y = this.canvas.height + 15;
        p.x = Math.random() * this.canvas.width;
      }
      if (p.x < -15) p.x = this.canvas.width + 15;
      if (p.x > this.canvas.width + 15) p.x = -15;

      const alpha = 0.35 + 0.5 * Math.sin(p.pulse);

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0.1, alpha);
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1.0;
    this.animationFrame = requestAnimationFrame(this.loop);
  }

  destroy() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    window.removeEventListener('resize', this.resize);
  }
}

// --- 2. High-Energy Celebration Confetti Cannon ---
class ConfettiCannon {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    this.animationFrame = null;

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(count = 180) {
    this.resize();
    const isDiscord = document.documentElement.getAttribute('data-theme') === 'discord';
    const colors = isDiscord ? [
      '#5865F2', '#3442D9', '#8891F2', '#57F287',
      '#EB459E', '#00B0F4', '#FDA220', '#FFFFFF'
    ] : [
      '#FFD700', '#F5D76E', '#FFF8DC', '#D4AF37',
      '#F3E5AB', '#DAA520', '#C5A059', '#FFFFFF'
    ];

    for (let i = 0; i < count; i++) {
      const sourceSide = Math.random();
      let startX = this.canvas.width * 0.5;
      let startY = this.canvas.height * 0.7;
      let angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      let speed = Math.random() * 20 + 12;

      if (sourceSide < 0.35) {
        startX = this.canvas.width * 0.15;
        startY = this.canvas.height * 0.9;
        angle = -Math.PI / 3 + (Math.random() - 0.5) * 0.6;
      } else if (sourceSide > 0.65) {
        startX = this.canvas.width * 0.85;
        startY = this.canvas.height * 0.9;
        angle = (-2 * Math.PI) / 3 + (Math.random() - 0.5) * 0.6;
      }

      this.particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        width: Math.random() * 12 + 6,
        height: Math.random() * 16 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.28,
        tilt: Math.random() * 10,
        tiltSpeed: Math.random() * 0.18 + 0.06,
        gravity: 0.38,
        drag: 0.965,
        alpha: 1.0,
        decay: Math.random() * 0.007 + 0.005,
        type: Math.random() > 0.25 ? 'rect' : 'circle'
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.loop();
    }
  }

  loop() {
    if (!this.animating) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.tilt += p.tiltSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > this.canvas.height + 60) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;

      const scaleX = Math.sin(p.tilt);
      this.ctx.scale(scaleX, 1);

      if (p.type === 'rect') {
        this.ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.width * 0.45, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationFrame = requestAnimationFrame(this.loop);
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  stop() {
    this.particles = [];
    this.animating = false;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// --- 3. Realistic Lotto Air Tumbler ---
class LottoAirTumbler {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.balls = [];
    this.mode = 'idle';
    this.animationFrame = null;
    this.airAngle = 0;

    this.ballPalettes = [
      { base: '#f59e0b', light: '#fef3c7', shadow: '#b45309', text: '#000' },
      { base: '#3b82f6', light: '#dbeafe', shadow: '#1d4ed8', text: '#fff' },
      { base: '#ef4444', light: '#fee2e2', shadow: '#b91c1c', text: '#fff' },
      { base: '#10b981', light: '#d1fae5', shadow: '#047857', text: '#fff' },
      { base: '#8b5cf6', light: '#ede9fe', shadow: '#6d28d9', text: '#fff' }
    ];

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    this.resize();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const size = Math.min(parent ? parent.clientWidth : 520, 520);
    this.canvas.width = size;
    this.canvas.height = size;
    this.centerX = size / 2;
    this.centerY = size / 2;
    this.chamberRadius = size * 0.42;
    this.ballRadius = Math.max(22, Math.round(size * 0.058));
  }

  initBalls(availableNumbers = []) {
    this.resize();
    this.balls = [];
    const sampleCount = Math.min(22, Math.max(10, availableNumbers.length));
    const shuffled = [...availableNumbers].sort(() => Math.random() - 0.5).slice(0, sampleCount);

    shuffled.forEach((num, idx) => {
      const angle = Math.PI * 0.2 + (Math.PI * 0.6) * (idx / sampleCount) + (Math.random() - 0.5) * 0.2;
      const dist = Math.random() * (this.chamberRadius * 0.65);
      const palette = this.ballPalettes[idx % this.ballPalettes.length];

      this.balls.push({
        num: num,
        x: this.centerX + Math.cos(angle) * dist,
        y: this.centerY + Math.sin(angle) * dist + 40,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: this.ballRadius,
        palette: palette,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02
      });
    });

    this.startLoop();
  }

  setMode(mode) {
    this.mode = mode;
  }

  startLoop() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  stopLoop() {
    this.isRunning = false;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }

  loop() {
    if (!this.isRunning) return;

    this.airAngle += this.mode === 'turbo' ? 0.22 : 0.015;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawChamber();

    const isTurbo = this.mode === 'turbo';
    const innerRadius = this.chamberRadius - 6;

    for (let b of this.balls) {
      if (isTurbo) {
        b.vy -= 1.4 + Math.random() * 0.8;
        b.vx += Math.cos(this.airAngle + b.y * 0.05) * 1.5 + (Math.random() - 0.5) * 1.2;
        b.vy += 0.75;
        b.vx *= 0.96;
        b.vy *= 0.96;
      } else {
        b.vy += 0.04;
        b.vx += Math.sin(this.airAngle + b.num) * 0.03;
        b.vy += Math.cos(this.airAngle * 0.8 + b.num) * 0.03;
        b.vx *= 0.985;
        b.vy *= 0.985;
      }

      b.x += b.vx;
      b.y += b.vy;

      const dist = Math.hypot(b.x - this.centerX, b.y - this.centerY);
      if (dist + b.r > innerRadius) {
        const nx = (b.x - this.centerX) / dist;
        const ny = (b.y - this.centerY) / dist;
        b.x = this.centerX + nx * (innerRadius - b.r);
        b.y = this.centerY + ny * (innerRadius - b.r);

        const dot = b.vx * nx + b.vy * ny;
        const elasticity = isTurbo ? 0.88 : 0.65;
        b.vx = (b.vx - 2 * dot * nx) * elasticity;
        b.vy = (b.vy - 2 * dot * ny) * elasticity;
      }

      this.draw3DBall(b);
    }

    this.drawChamberGlare();
    this.animationFrame = requestAnimationFrame(this.loop);
  }

  drawChamber() {
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);

    const bgGrad = this.ctx.createRadialGradient(0, -this.chamberRadius * 0.3, this.chamberRadius * 0.1, 0, 0, this.chamberRadius);
    bgGrad.addColorStop(0, 'rgba(40, 44, 70, 0.45)');
    bgGrad.addColorStop(0.7, 'rgba(25, 28, 48, 0.7)');
    bgGrad.addColorStop(1, 'rgba(15, 17, 32, 0.88)');

    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.chamberRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = bgGrad;
    this.ctx.fill();

    const ringGrad = this.ctx.createLinearGradient(-this.chamberRadius, -this.chamberRadius, this.chamberRadius, this.chamberRadius);
    ringGrad.addColorStop(0, 'rgba(88, 101, 242, 0.85)');
    ringGrad.addColorStop(0.5, 'rgba(0, 176, 244, 0.9)');
    ringGrad.addColorStop(1, 'rgba(235, 69, 158, 0.85)');

    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = ringGrad;
    this.ctx.shadowBlur = 24;
    this.ctx.shadowColor = 'rgba(88, 101, 242, 0.6)';
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.ellipse(0, this.chamberRadius * 0.82, this.chamberRadius * 0.32, 12, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(10, 12, 22, 0.95)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(88, 101, 242, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.restore();
  }

  draw3DBall(b) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(b.x + 3, b.y + 4, b.r, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.fill();

    const grad = this.ctx.createRadialGradient(
      b.x - b.r * 0.35,
      b.y - b.r * 0.35,
      b.r * 0.1,
      b.x,
      b.y,
      b.r
    );
    grad.addColorStop(0, b.palette.light);
    grad.addColorStop(0.35, b.palette.base);
    grad.addColorStop(0.85, b.palette.shadow);
    grad.addColorStop(1, '#090a14');

    this.ctx.beginPath();
    this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    this.ctx.fillStyle = grad;
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = b.palette.base;
    this.ctx.fill();

    const badgeR = b.r * 0.58;
    this.ctx.beginPath();
    this.ctx.arc(b.x, b.y, badgeR, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.shadowBlur = 3;
    this.ctx.shadowColor = 'rgba(0,0,0,0.4)';
    this.ctx.fill();

    this.ctx.strokeStyle = b.palette.shadow;
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.fillStyle = '#111827';
    this.ctx.font = `900 ${Math.round(b.r * 0.65)}px "Pretendard", "Outfit", "Montserrat", sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 0;
    this.ctx.fillText(b.num, b.x, b.y + 1);

    this.ctx.beginPath();
    this.ctx.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.28, b.r * 0.16, -Math.PI / 4, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    this.ctx.fill();

    this.ctx.restore();
  }

  drawChamberGlare() {
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);

    this.ctx.beginPath();
    this.ctx.ellipse(-this.chamberRadius * 0.35, -this.chamberRadius * 0.35, this.chamberRadius * 0.42, this.chamberRadius * 0.22, -Math.PI / 4, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    this.ctx.fill();

    this.ctx.restore();
  }

  destroy() {
    this.stopLoop();
    this.balls = [];
    window.removeEventListener('resize', this.resize);
  }
}

// --- 4. Authentic & Charming 2.5D Horse Racing Derby ---
// Features: Starting Stalls Gate Burst, Physics-Driven Pack Sprint, Seamless Finish Line Dash,
//           Adorably Stylized Chibi Horses with Realistic 4-Joint Rotary Gallop, and 1.6s Winner Showcase.
class DerbyRaceTrack {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.horses = [];
    this.mode = 'idle'; // 'idle', 'racing', 'showcase', 'finished'
    this.animationFrame = null;
    this.trackScroll = 0;
    this.trackSpeed = 0;
    this.turfClods = [];
    this.sparks = [];
    this.lastTime = 0;
    this.raceTime = 0;
    this.showcaseTimer = 0;
    this.showcaseDuration = 1.6;

    // 10 Distinct Rich Horse Coats & Colorful Silks
    this.palettes = [
      { silk: '#ef4444', cap: '#ffffff', horse: '#854d0e', highlight: '#a16207', muzzle: '#fed7aa', mane: '#451a03' }, // #1 Red (Chestnut)
      { silk: '#3b82f6', cap: '#ffffff', horse: '#1e293b', highlight: '#334155', muzzle: '#cbd5e1', mane: '#020617' }, // #2 Blue (Black Beauty)
      { silk: '#f59e0b', cap: '#000000', horse: '#b45309', highlight: '#d97706', muzzle: '#ffedd5', mane: '#78350f' }, // #3 Gold (Bay)
      { silk: '#10b981', cap: '#ffffff', horse: '#f8fafc', highlight: '#ffffff', muzzle: '#f1f5f9', mane: '#94a3b8' }, // #4 Emerald (Pure White)
      { silk: '#8b5cf6', cap: '#ffffff', horse: '#581c87', highlight: '#6b21a8', muzzle: '#e9d5ff', mane: '#3b0764' }, // #5 Purple (Midnight Bay)
      { silk: '#ec4899', cap: '#ffffff', horse: '#9a3412', highlight: '#c2410c', muzzle: '#ffedd5', mane: '#431407' }, // #6 Pink (Sorrel)
      { silk: '#06b6d4', cap: '#000000', horse: '#64748b', highlight: '#94a3b8', muzzle: '#e2e8f0', mane: '#334155' }, // #7 Cyan (Dappled Gray)
      { silk: '#f97316', cap: '#ffffff', horse: '#ca8a04', highlight: '#eab308', muzzle: '#fef08a', mane: '#713f12' }, // #8 Orange (Palomino)
      { silk: '#84cc16', cap: '#000000', horse: '#78350f', highlight: '#92400e', muzzle: '#fef3c7', mane: '#451a03' }, // #9 Lime (Dark Chestnut)
      { silk: '#e11d48', cap: '#ffffff', horse: '#292524', highlight: '#44403c', muzzle: '#d6d3d1', mane: '#0c0a09' }  // #10 Rose (Smoky Black)
    ];

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    this.resize();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const w = parent ? parent.clientWidth : 920;
    const h = 420;
    this.canvas.width = Math.min(w, 1020);
    this.canvas.height = h;

    // Pre-cache turf gradient to avoid creating gradient objects every frame
    this.turfGrad = this.ctx.createLinearGradient(0, 0, 0, h);
    this.turfGrad.addColorStop(0, '#15803d');
    this.turfGrad.addColorStop(0.2, '#16a34a');
    this.turfGrad.addColorStop(0.7, '#22c55e');
    this.turfGrad.addColorStop(1, '#15803d');
  }

  initHorses(assignedWinners = [], count = 8) {
    this.resize();
    this.horses = [];
    this.turfClods = [];
    this.sparks = [];
    this.mode = 'idle';
    this.trackScroll = 0;
    this.trackSpeed = 0;
    this.raceTime = 0;
    this.showcaseTimer = 0;

    const fieldSize = Math.max(assignedWinners.length, 8);
    const topMargin = 52;
    const bottomMargin = 45;
    const usableHeight = this.canvas.height - topMargin - bottomMargin;
    const laneStep = usableHeight / fieldSize;

    // Starting Gate initial position
    this.startGateX = 140;
    this.startGateOpen = false;
    this.finishLineX = 99999; // Stays offscreen until final stretch

    for (let i = 0; i < fieldSize; i++) {
      const isWinner = i < assignedWinners.length;
      const targetNum = isWinner ? assignedWinners[i] : null;
      const rank = isWinner ? (i + 1) : null;
      const pal = this.palettes[i % this.palettes.length];

      // 2.5D Perspective depth scaling
      const perspectiveT = i / (fieldSize - 1);
      const scale = 0.90 + perspectiveT * 0.26;

      // Starting stall position behind gate
      const stallX = 75 + (i % 2) * 8;

      this.horses.push({
        idx: i,
        num: i + 1,
        rank: rank,
        pal: pal,
        isWinner: isWinner,
        winNum: targetNum,
        scale: scale,
        currentX: stallX,
        y: topMargin + i * laneStep + laneStep * 0.5,
        laneY: topMargin + i * laneStep,
        gallopPhase: Math.random() * Math.PI * 2,

        // Natural pack positioning (no forced diagonal or artificial rank ordering!)
        naturalOffset: (Math.sin(i * 1.8) * 35) + ((i % 3) * 15),
        wobbleFreq1: 2.2 + Math.random() * 1.5,
        wobbleFreq2: 3.5 + Math.random() * 2.0,
        wobblePhase: Math.random() * Math.PI * 2,

        // Crossing & badge states
        passedFinish: false,
        badgePopped: false,
        badgeScale: 0,
        badgeAlpha: 0
      });
    }

    this.startLoop();
  }

  startRace(param1, param2) {
    if (typeof param1 === 'function') {
      this.onFinish = param1;
    } else if (typeof param2 === 'function') {
      this.onFinish = param2;
    } else {
      this.onFinish = null;
    }

    this.mode = 'racing';
    this.raceTime = 0;
    this.showcaseTimer = 0;
    this.trackScroll = 0;
    this.startGateOpen = true;
    this.startGateX = 140;
    this.finishLineX = 99999;

    this.horses.forEach(h => {
      h.passedFinish = false;
      h.badgePopped = false;
      h.badgeScale = 0;
      h.badgeAlpha = 0;
    });
  }

  startLoop() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  stopLoop() {
    this.isRunning = false;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }

  loop(currentTime) {
    if (!this.isRunning) return;
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    this.animationFrame = requestAnimationFrame(this.loop);
  }

  update(dt) {
    if (this.mode === 'idle') {
      // Gentle stall trot in place awaiting starter pistol
      this.trackSpeed = 0;
      for (let h of this.horses) {
        h.gallopPhase += dt * 4.0;
        h.currentX = 75 + Math.sin(h.gallopPhase + h.idx) * 2.5;
      }
      return;
    }

    this.raceTime += dt;
    const t = this.raceTime;
    const canvasW = this.canvas.width;

    // --- Perfectly Balanced Timeline (Not too fast, not too slow, crystal clear finish) ---
    // 0.0s ~ 0.7s: Smooth Gate Burst & Acceleration
    // 0.7s ~ 3.0s: Exciting Pack Racing (Horses run naturally together at pleasant speed)
    // 3.0s ~ 4.4s: Finish line glides past smoothly so everyone clearly watches the finish!
    // 4.4s ~ 5.9s: 1.5s Showcase with winner badges floating proudly, then finish!

    if (t < 0.7) {
      // Smooth natural acceleration out of the gate
      const p = t / 0.7;
      this.trackSpeed = p * 520;
      this.startGateX -= this.trackSpeed * dt;

      for (let h of this.horses) {
        h.gallopPhase += dt * (10 + p * 14);
        const targetX = canvasW * 0.38 + h.naturalOffset;
        h.currentX = 75 + (targetX - 75) * (p * p);
      }
    } else if (t < 3.0) {
      // Pleasant, exciting pack racing speed (520px/s)
      this.trackSpeed = 520 + Math.sin(t * 3.5) * 35;
      this.startGateX = -999;

      for (let h of this.horses) {
        h.gallopPhase += dt * 24; // Smooth, realistic galloping legs

        // Natural organic jostling within the pack
        const bob = Math.sin(t * h.wobbleFreq1 + h.wobblePhase) * 28;
        const micro = Math.cos(t * h.wobbleFreq2) * 12;
        const targetX = canvasW * 0.38 + h.naturalOffset + bob + micro;

        h.currentX += (targetX - h.currentX) * (dt * 3.8);
      }
    } else if (this.mode === 'racing') {
      // 3.0s ~ 4.4s: Finish Line appears at canvasW * 0.60, and HORSES SPRINT FORWARD THROUGH AND BEYOND IT!
      this.trackSpeed = 480;

      // Finish line glides in from right to a fixed position at canvasW * 0.58
      const finishTargetX = canvasW * 0.58;
      if (this.finishLineX > 90000) {
        this.finishLineX = canvasW + 120;
      }
      this.finishLineX += (finishTargetX - this.finishLineX) * (dt * 3.5);

      let allCrossed = true;

      for (let h of this.horses) {
        h.gallopPhase += dt * 26;

        // Horses surge FORWARD from 0.40 to 0.82 (passing completely THROUGH and BEYOND the finish line!)
        const targetX = canvasW * 0.82 + h.naturalOffset;
        h.currentX += (targetX - h.currentX) * (dt * 2.8);

        // Check if horse has physically crossed the finish line
        if (h.currentX >= this.finishLineX) {
          if (!h.passedFinish) {
            h.passedFinish = true;
            this.spawnSparks(h.currentX, h.y);
            if (h.isWinner) {
              h.badgePopped = true;
            }
          }
        } else {
          allCrossed = false;
        }

        // Pop winner badge
        if (h.badgePopped) {
          h.badgeScale = Math.min(1.0, h.badgeScale + dt * 5.0);
          h.badgeAlpha = Math.min(1.0, h.badgeAlpha + dt * 5.0);
        }
      }

      // Once all horses have clearly crossed past the finish line (or time threshold), transition to showcase!
      if ((allCrossed && this.horses.every(h => h.currentX > this.finishLineX + 30)) || t > 4.5) {
        this.mode = 'showcase';
        this.showcaseTimer = 0;
      }
    } else if (this.mode === 'showcase') {
      // Showcase hold (1.5s): Horses are safely BEYOND the finish line, victory trotting with badges shining!
      this.showcaseTimer += dt;
      this.trackSpeed = Math.max(70, this.trackSpeed - dt * 250);

      for (let h of this.horses) {
        h.gallopPhase += dt * Math.max(8, 18 - (this.showcaseTimer / this.showcaseDuration) * 10);
        // Maintain position beyond finish line
        const targetX = canvasW * 0.82 + h.naturalOffset;
        h.currentX += (targetX - h.currentX) * (dt * 2.0);

        if (h.badgePopped) {
          h.badgeScale = 1.0;
          h.badgeAlpha = 1.0;
        }
      }

      // Exactly 1.5s showcase, then trigger result screen
      if (this.showcaseTimer >= 1.5) {
        this.mode = 'finished';
        if (this.onFinish) {
          this.onFinish();
        }
      }
    }

    // Scroll track background
    this.trackScroll += this.trackSpeed * dt;

    // Spawn turf clods during active running
    if (this.trackSpeed > 60 && Math.random() < 0.5) {
      const activeHorse = this.horses[Math.floor(Math.random() * this.horses.length)];
      if (activeHorse) {
        this.turfClods.push({
          x: activeHorse.currentX - 35 * activeHorse.scale,
          y: activeHorse.y + 18 * activeHorse.scale,
          vx: -(Math.random() * 140 + 80),
          vy: -(Math.random() * 90 + 30),
          size: Math.random() * 3.5 + 1.5,
          alpha: 1.0
        });
      }
    }

    // Update turf clods
    for (let i = this.turfClods.length - 1; i >= 0; i--) {
      const c = this.turfClods[i];
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += 320 * dt;
      c.alpha -= dt * 2.2;
      if (c.alpha <= 0) this.turfClods.splice(i, 1);
    }

    // Update celebration sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.alpha -= dt * 2.0;
      if (s.alpha <= 0) this.sparks.splice(i, 1);
    }
  }

  spawnSparks(x, y) {
    const colors = ['#f59e0b', '#fbbf24', '#ffffff', '#ec4899', '#3b82f6'];
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 150 + 60;
      this.sparks.push({
        x: x,
        y: y - 20,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3.5 + 1.5,
        alpha: 1.0
      });
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Turf Track Background
    this.drawTurfBackground(ctx, w, h);

    // 2. Parallax Rails & Distant Grandstand Fence
    this.drawRailsAndLines(ctx, w, h);

    // 3. Starting Gate (if still on screen)
    if (this.startGateX > -120 && this.startGateX < w + 60) {
      this.drawStartGate(ctx, this.startGateX, h);
    }

    // 4. Finish Line Ground Checkers
    if (this.finishLineX < w + 200) {
      this.drawFinishLine(ctx, this.finishLineX, h);
    }

    // 5. Turf Clods
    for (let c of this.turfClods) {
      ctx.save();
      ctx.fillStyle = '#14532d';
      ctx.globalAlpha = Math.max(0, c.alpha);
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. Horses (sorted by lane Y for realistic 2.5D depth)
    const sortedHorses = [...this.horses].sort((a, b) => a.y - b.y);
    for (let horse of sortedHorses) {
      this.draw3DCuteHorse(ctx, horse);
    }

    // 7. Finish Arch Overhead Banner (Drawn over horses)
    if (this.finishLineX < w + 200) {
      this.drawFinishArchOverhead(ctx, this.finishLineX, h);
    }

    // 8. Celebration Sparks (Ultra-lightweight without heavy shadowBlur)
    for (let s of this.sparks) {
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 9. Floating Winner Badges (Drawn on top for supreme clarity)
    for (let horse of sortedHorses) {
      if (horse.badgePopped && horse.badgeScale > 0.05) {
        this.drawWinnerBadge(ctx, horse);
      }
    }
  }

  drawTurfBackground(ctx, w, h) {
    // Reuse cached gradient
    ctx.fillStyle = this.turfGrad || '#16a34a';
    ctx.fillRect(0, 0, w, h);

    // Mowed lawn stripes (scrolling effect)
    const stripeW = 80;
    const offset = (this.trackScroll % (stripeW * 2));
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';

    for (let x = -stripeW * 2 - offset; x < w + stripeW * 2; x += stripeW * 2) {
      ctx.fillRect(x, 0, stripeW, h);
    }

    // Dirt edge runner
    ctx.fillStyle = 'rgba(120, 53, 15, 0.2)';
    ctx.fillRect(0, h - 30, w, 30);
  }

  drawRailsAndLines(ctx, w, h) {
    // Upper white railing (Clean vector without heavy shadowBlur)
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, 42);
    ctx.lineTo(w, 42);
    ctx.stroke();

    const postStep = 60;
    const postOffset = (this.trackScroll * 0.4) % postStep;
    ctx.lineWidth = 2.5;
    for (let x = -postOffset; x < w + postStep; x += postStep) {
      ctx.beginPath();
      ctx.moveTo(x, 42);
      ctx.lineTo(x, 26);
      ctx.stroke();
    }

    // Lower white railing
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, h - 18);
    ctx.lineTo(w, h - 18);
    ctx.stroke();
    ctx.restore();

    // Subtle lane guide dashes
    const fieldSize = this.horses.length;
    const topMargin = 52;
    const bottomMargin = 45;
    const usableHeight = h - topMargin - bottomMargin;
    const laneStep = usableHeight / fieldSize;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 14]);
    ctx.lineDashOffset = -this.trackScroll;

    for (let i = 1; i < fieldSize; i++) {
      const ly = topMargin + i * laneStep;
      ctx.beginPath();
      ctx.moveTo(0, ly);
      ctx.lineTo(w, ly);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- Starting Stalls Gate with High-Contrast Black START text ---
  drawStartGate(ctx, gateX, h) {
    ctx.save();

    // Ground starting line
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(gateX - 4, 38, 8, h - 54);

    // Starting Gate Stalls Frame (Solid vibrant color instead of gradient per frame)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(gateX - 18, 12, 12, h - 25);
    ctx.fillRect(gateX + 6, 12, 12, h - 25);

    // Gate doors/bars
    const gateAngle = this.startGateOpen ? -Math.PI * 0.45 : 0;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fef08a';

    for (let horse of this.horses) {
      const gy = horse.y;
      ctx.save();
      ctx.translate(gateX + 6, gy);
      ctx.rotate(gateAngle);
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(26, -10);
      ctx.lineTo(26, 10);
      ctx.lineTo(0, 10);
      ctx.stroke();
      ctx.restore();
    }

    // Overhead Banner Box with Bold Black START Text
    const bannerW = 120;
    const bannerH = 34;
    const bannerX = gateX - bannerW * 0.5;
    const bannerY = 8;

    // Glowing Neon Yellow Badge Plate (Clean vector border instead of shadowBlur)
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 6);
    ctx.fill();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // HIGH CONTRAST BLACK "START" TEXT
    ctx.fillStyle = '#000000';
    ctx.font = '900 20px "Pretendard", "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('START', gateX, bannerY + bannerH * 0.5 + 1);

    ctx.restore();
  }

  // --- Finish Line Ground Checkers ---
  drawFinishLine(ctx, fx, h) {
    ctx.save();

    const checkW = 14;
    const checkH = 14;
    const rows = Math.ceil((h - 50) / checkH);

    for (let col = 0; col < 2; col++) {
      for (let r = 0; r < rows; r++) {
        const isBlack = (col + r) % 2 === 0;
        ctx.fillStyle = isBlack ? '#111827' : '#ffffff';
        ctx.fillRect(fx - checkW + col * checkW, 38 + r * checkH, checkW, checkH);
      }
    }

    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(fx - 4, 18, 8, h - 30);

    ctx.restore();
  }

  // --- Overhead Arch with High-Contrast Black FINISH Text ---
  drawFinishArchOverhead(ctx, fx, h) {
    ctx.save();

    const bannerW = 130;
    const bannerH = 36;
    const bannerX = fx - bannerW * 0.5;
    const bannerY = 6;

    // Golden Banner Plate (Solid vibrant yellow/gold with double stroke)
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 8);
    ctx.fill();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Checker side accents
    ctx.fillStyle = '#000000';
    ctx.fillRect(bannerX + 5, bannerY + 7, 7, 10);
    ctx.fillRect(bannerX + 12, bannerY + 17, 7, 10);
    ctx.fillRect(bannerX + bannerW - 19, bannerY + 7, 7, 10);
    ctx.fillRect(bannerX + bannerW - 12, bannerY + 17, 7, 10);

    // HIGH CONTRAST BLACK "FINISH" TEXT
    ctx.fillStyle = '#000000';
    ctx.font = '900 22px "Pretendard", "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FINISH', fx, bannerY + bannerH * 0.5 + 1);

    ctx.restore();
  }

  // --- Adorable & Charming Stylized Horse with Realistic Full-Body Gallop ---
  // Features: Organic Horse Anatomy, Animated Fluffy Mane & Tail, Big Sparkling Manga Eyes,
  //           4-Joint Articulated Legs with Hooves and Socks, and Chibi Jockey!
  draw3DCuteHorse(ctx, h) {
    ctx.save();
    ctx.translate(h.currentX, h.y);
    ctx.scale(h.scale, h.scale);

    const phase = h.gallopPhase;
    const pal = h.pal;

    // Organic Gallop Physics: Full-Body Stretch & Gather Cycle
    // Extended phase (sin < 0): legs reach forward and back, body stretches
    // Gathered phase (sin > 0): legs tuck under body, torso rounds, floats in air
    const stretchFactor = 1.0 + Math.sin(phase) * 0.08;
    const verticalBob = Math.sin(phase * 2) * 3.5;
    const bodyPitch = Math.cos(phase) * 0.09;

    // 1. Dynamic Drop Shadow on Turf
    ctx.save();
    ctx.translate(0, 22);
    ctx.scale(stretchFactor, 0.26);
    ctx.beginPath();
    ctx.arc(0, 0, 32 + verticalBob * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fill();
    ctx.restore();

    ctx.translate(0, verticalBob);
    ctx.rotate(bodyPitch);

    // 2. Far Legs (Back leg & Front leg behind the body)
    this.drawArticulatedLeg(ctx, -16, 10, phase + Math.PI * 0.95, pal, true, true);
    this.drawArticulatedLeg(ctx, 16, 10, phase + Math.PI * 0.25, pal, false, true);

    // 3. Luxurious Animated Ponytail Tail
    this.drawFlowingTail(ctx, -26, 0, phase, pal);

    // 4. Voluptuous & Cute Horse Torso
    ctx.save();
    ctx.scale(stretchFactor, 1.0);

    // Torso Gradient for 3D Volume
    const torsoGrad = ctx.createLinearGradient(-30, -18, 28, 16);
    torsoGrad.addColorStop(0, pal.horse);
    torsoGrad.addColorStop(0.4, pal.highlight);
    torsoGrad.addColorStop(1, pal.horse);

    ctx.fillStyle = torsoGrad;
    ctx.beginPath();
    // Smooth horse body contour: Rump -> Spine -> Withers -> Chest -> Flank
    ctx.moveTo(-28, -2);
    ctx.bezierCurveTo(-28, -14, -14, -16, -2, -13); // Rump & Back
    ctx.bezierCurveTo(12, -15, 24, -10, 28, 0);     // Withers & Chest
    ctx.bezierCurveTo(30, 12, 14, 18, 0, 16);       // Deep Chest & Belly
    ctx.bezierCurveTo(-14, 17, -28, 12, -28, -2);   // Flank to Rump
    ctx.closePath();
    ctx.fill();

    // Subtle 3D Rim Highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 5. Derby Number Saddle Cloth (Numbered 1~10)
    ctx.fillStyle = pal.silk;
    ctx.beginPath();
    ctx.roundRect(-10, -9, 20, 16, 4);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 10.5px "Pretendard", "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(h.num, 0, 0);

    ctx.restore(); // Restore torso stretch

    // 6. Cute Chibi Jockey
    this.drawChibiJockey(ctx, 2, -11, pal, phase);

    // 7. Graceful Arched Neck, Head & Big Sparkling Anime Eye
    this.drawHeadAndNeck(ctx, 22, -6, phase, pal);

    // 8. Near Legs (Front leg & Back leg in foreground)
    this.drawArticulatedLeg(ctx, -14, 10, phase, pal, true, false);
    this.drawArticulatedLeg(ctx, 18, 10, phase + Math.PI * 0.7, pal, false, false);

    ctx.restore();
  }

  // --- Head, Neck, Muzzle, Big Sparkly Eyes, Ears, and Flowing Mane ---
  drawHeadAndNeck(ctx, rootX, rootY, phase, pal) {
    ctx.save();
    ctx.translate(rootX, rootY);

    const headBob = Math.sin(phase + 0.4) * 0.12;
    ctx.rotate(headBob);

    // Beautiful Arched Neck
    const neckGrad = ctx.createLinearGradient(-8, 10, 14, -16);
    neckGrad.addColorStop(0, pal.horse);
    neckGrad.addColorStop(0.5, pal.highlight);
    neckGrad.addColorStop(1, pal.horse);

    ctx.fillStyle = neckGrad;
    ctx.beginPath();
    ctx.moveTo(-6, 12);
    ctx.quadraticCurveTo(-4, -6, 8, -14);   // Crest of neck
    ctx.lineTo(16, -10);
    ctx.quadraticCurveTo(8, 2, 6, 14);     // Throat
    ctx.closePath();
    ctx.fill();

    // Flowing Mane Locks (3 Waves of Mane)
    this.drawFlowingMane(ctx, phase, pal);

    // Horse Head Oval & Cute Muzzle
    ctx.save();
    ctx.translate(14, -12);

    // Head base
    ctx.fillStyle = pal.horse;
    ctx.beginPath();
    ctx.moveTo(-4, -4);
    ctx.quadraticCurveTo(8, -10, 16, -6);  // Forehead to nose bridge
    ctx.quadraticCurveTo(24, -2, 22, 6);   // Soft rounded muzzle
    ctx.quadraticCurveTo(14, 10, 4, 8);    // Jaw
    ctx.quadraticCurveTo(-6, 8, -4, -4);   // Cheek
    ctx.closePath();
    ctx.fill();

    // Soft Cute Muzzle Pad
    ctx.fillStyle = pal.muzzle;
    ctx.beginPath();
    ctx.ellipse(18, 2, 6, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Cute Nostril
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(20, 2, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Smiling Lip Line
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(17, 5, 2.5, 0.2, Math.PI * 0.7);
    ctx.stroke();

    // --- Big Sparkling Anime Horse Eye ---
    const eyeX = 8;
    const eyeY = -3;
    // Eye white base
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, 4.2, 5.2, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = pal.mane;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Iris (Rich Dark with Top Gradient)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(eyeX + 0.5, eyeY, 3.2, 4.2, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Dual Sparkling Light Catchers (Manga Sparkle)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX + 1.4, eyeY - 1.5, 1.5, 0, Math.PI * 2); // Primary big gleam
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeX - 0.6, eyeY + 1.4, 0.8, 0, Math.PI * 2); // Secondary tiny gleam
    ctx.fill();

    // Cute Ears (Foreground Ear & Background Ear)
    // Far Ear
    ctx.fillStyle = pal.mane;
    ctx.beginPath();
    ctx.moveTo(-1, -7);
    ctx.lineTo(2, -17);
    ctx.lineTo(6, -8);
    ctx.closePath();
    ctx.fill();

    // Near Ear
    ctx.fillStyle = pal.horse;
    ctx.beginPath();
    ctx.moveTo(3, -6);
    ctx.lineTo(8, -18);
    ctx.lineTo(12, -7);
    ctx.closePath();
    ctx.fill();

    // Inner Pink Ear Shadow
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.moveTo(5, -7);
    ctx.lineTo(8, -15);
    ctx.lineTo(10, -8);
    ctx.closePath();
    ctx.fill();

    ctx.restore(); // Head
    ctx.restore(); // Root
  }

  // --- Dynamic Flowing Mane ---
  drawFlowingMane(ctx, phase, pal) {
    ctx.save();
    ctx.fillStyle = pal.mane;

    const maneWave = Math.sin(phase * 1.5) * 4;

    for (let i = 0; i < 3; i++) {
      const my = 4 - i * 7;
      const mx = -2 - i * 3;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.quadraticCurveTo(mx - 12 + maneWave, my - 6, mx - 16 + maneWave * 1.2, my + 4);
      ctx.quadraticCurveTo(mx - 8, my + 2, mx + 2, my + 4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // --- Luxurious Wavy Ponytail Tail ---
  drawFlowingTail(ctx, rootX, rootY, phase, pal) {
    ctx.save();
    ctx.translate(rootX, rootY);

    const tailWave1 = Math.sin(phase) * 0.35 - 0.2;
    const tailWave2 = Math.cos(phase * 1.2) * 6;

    ctx.rotate(tailWave1);

    const tailGrad = ctx.createLinearGradient(0, 0, -28, 14);
    tailGrad.addColorStop(0, pal.mane);
    tailGrad.addColorStop(1, '#090a0f');

    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.quadraticCurveTo(-16, -10 + tailWave2, -32, 4 + tailWave2);
    ctx.quadraticCurveTo(-26, 18, -4, 6);
    ctx.closePath();
    ctx.fill();

    // Secondary tail strand for fluffiness
    ctx.fillStyle = pal.mane;
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.quadraticCurveTo(-14, 2 + tailWave2 * 0.8, -26, 16 + tailWave2 * 0.8);
    ctx.quadraticCurveTo(-16, 22, -6, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // --- Chibi Jockey Riding Forward ---
  drawChibiJockey(ctx, x, y, pal, phase) {
    ctx.save();
    ctx.translate(x, y);

    const lean = Math.sin(phase) * 0.08 - 0.15;
    ctx.rotate(lean);

    // Torso in Racing Silk
    ctx.fillStyle = pal.silk;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 9, 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Helmet Head
    ctx.fillStyle = pal.cap;
    ctx.beginPath();
    ctx.arc(6, -9, 5.8, 0, Math.PI * 2);
    ctx.fill();

    // Helmet Peak/Brim
    ctx.fillStyle = pal.silk;
    ctx.beginPath();
    ctx.ellipse(10, -7, 4, 1.8, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Racing Goggles
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(6, -10, 5.5, 3.2, 1.2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Hands holding reins
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(10, 2, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Reins Line to horse bit
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(10, 2);
    ctx.lineTo(26, -4);
    ctx.stroke();

    ctx.restore();
  }

  // --- Fully Articulated 4-Joint Legs (Thigh -> Hock/Knee -> Fetlock -> White Sock -> Hoof) ---
  drawArticulatedLeg(ctx, hipX, hipY, phaseVal, pal, isBackLeg, isFar) {
    ctx.save();

    const legColor = isFar ? '#1c1917' : pal.horse;
    const highlightColor = isFar ? '#292524' : pal.highlight;

    ctx.strokeStyle = legColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const swing = Math.sin(phaseVal) * 18;
    const bend = Math.abs(Math.cos(phaseVal)) * 10;

    let kneeX, kneeY, ankleX, ankleY, hoofX, hoofY;

    if (isBackLeg) {
      // Rear leg: Muscular thigh -> backward hock bend -> ankle -> hoof
      kneeX = hipX - 8 - swing * 0.4;
      kneeY = hipY + 10 + bend * 0.45;

      ankleX = kneeX - 4 - swing * 0.6;
      ankleY = kneeY + 10 + bend * 0.35;

      hoofX = ankleX + 4;
      hoofY = ankleY + 6 - Math.max(0, -Math.sin(phaseVal)) * 6;
    } else {
      // Fore leg: Shoulder -> forward knee bend -> ankle -> hoof
      kneeX = hipX + 6 + swing * 0.55;
      kneeY = hipY + 9 + bend * 0.5;

      ankleX = kneeX + 4 + swing * 0.5;
      ankleY = kneeY + 9 - Math.max(0, Math.sin(phaseVal)) * 4;

      hoofX = ankleX + 2;
      hoofY = ankleY + 6;
    }

    // 1. Muscular Upper Thigh / Shoulder (Thick stroke)
    ctx.lineWidth = isFar ? 5.5 : 6.8;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(kneeX, kneeY);
    ctx.stroke();

    // 2. Cannon Bone / Shank (Medium stroke)
    ctx.lineWidth = isFar ? 4.2 : 5.0;
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.lineTo(ankleX, ankleY);
    ctx.stroke();

    // 3. Cute White "Sock" Marking above Hoof
    ctx.strokeStyle = isFar ? '#94a3b8' : '#ffffff';
    ctx.lineWidth = isFar ? 3.8 : 4.4;
    ctx.beginPath();
    ctx.moveTo(ankleX, ankleY);
    ctx.lineTo(hoofX, hoofY - 2);
    ctx.stroke();

    // 4. Solid Black Polished Hoof
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(hoofX - 2.8, hoofY - 2);
    ctx.lineTo(hoofX + 3.2, hoofY - 1);
    ctx.lineTo(hoofX + 2.5, hoofY + 2.5);
    ctx.lineTo(hoofX - 3.2, hoofY + 2.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // --- Floating 3D Winner Badge (Visible for 1.6s before transition) ---
  drawWinnerBadge(ctx, h) {
    ctx.save();
    ctx.translate(h.currentX, h.y - 48 * h.scale);
    ctx.scale(h.badgeScale, h.badgeScale);
    ctx.globalAlpha = h.badgeAlpha;

    // Gentle celebratory pulse
    const pulse = 1.0 + Math.sin(performance.now() * 0.009 + h.rank) * 0.06;
    ctx.scale(pulse, pulse);

    const isFirst = h.rank === 1;
    const badgeW = isFirst ? 100 : 88;
    const badgeH = 34;
    const rx = -badgeW * 0.5;
    const ry = -badgeH * 0.5;

    // Ultra-lightweight glowing halo backing (0% shadowBlur cost!)
    ctx.fillStyle = isFirst ? 'rgba(250, 204, 21, 0.35)' : 'rgba(59, 130, 246, 0.28)';
    ctx.beginPath();
    ctx.roundRect(rx - 3, ry - 3, badgeW + 6, badgeH + 6, 20);
    ctx.fill();

    // Solid plate
    ctx.fillStyle = isFirst ? '#fbbf24' : '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(rx, ry, badgeW, badgeH, 17);
    ctx.fill();

    // Shiny Border
    ctx.lineWidth = isFirst ? 2.5 : 2;
    ctx.strokeStyle = isFirst ? '#ffffff' : '#3b82f6';
    ctx.stroke();

    // Text: Rank + Winner Number (e.g. "1등 #25" or "#25")
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const hasRank = h.rank !== null && h.rank !== undefined;
    const rankText = hasRank ? `${h.rank}등` : '';
    const numText = `#${h.winNum}`;

    if (isFirst) {
      // Golden Crown above 1st place
      ctx.fillStyle = '#f59e0b';
      ctx.font = '15px sans-serif';
      ctx.fillText('👑', 0, ry - 7);

      if (hasRank) {
        ctx.fillStyle = '#78350f';
        ctx.font = '900 13px "Pretendard", sans-serif';
        ctx.fillText(rankText, -badgeW * 0.22, 1);

        ctx.fillStyle = '#111827';
        ctx.font = '900 16px "Pretendard", "Outfit", sans-serif';
        ctx.fillText(numText, badgeW * 0.2, 1);
      } else {
        ctx.fillStyle = '#111827';
        ctx.font = '900 17px "Pretendard", "Outfit", sans-serif';
        ctx.fillText(numText, 0, 1);
      }
    } else {
      if (hasRank) {
        ctx.fillStyle = '#1e3a8a';
        ctx.font = '800 12px "Pretendard", sans-serif';
        ctx.fillText(rankText, -badgeW * 0.22, 1);

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 15px "Pretendard", "Outfit", sans-serif';
        ctx.fillText(numText, badgeW * 0.2, 1);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 16px "Pretendard", "Outfit", sans-serif';
        ctx.fillText(numText, 0, 1);
      }
    }

    ctx.restore();
  }

  destroy() {
    this.stopLoop();
    this.horses = [];
    this.turfClods = [];
    this.sparks = [];
    window.removeEventListener('resize', this.resize);
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

window.BackgroundParticleSystem = BackgroundParticleSystem;
window.ConfettiCannon = ConfettiCannon;
window.LottoAirTumbler = LottoAirTumbler;
window.DerbyRaceTrack = DerbyRaceTrack;
