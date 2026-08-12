import { PlayerState, LevelData, Particle, Vec2, Platform } from './types';
import { AudioManager } from '../audio/AudioManager';
import { SaveManager } from './SaveManager';

const GRAVITY = 0.55;
const JUMP_FORCE = -10.5;
const MOVE_SPEED = 4.5;
const DASH_SPEED = 12;
const DASH_DURATION = 8;
const DASH_COOLDOWN = 30;
const MAX_FALL = 12;
const COYOTE_FRAMES = 6;
const JUMP_BUFFER_FRAMES = 6;
const FRICTION = 0.85;
const ICE_FRICTION = 0.97;
const PLAYER_W = 24;
const PLAYER_H = 28;

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  player: PlayerState;
  level: LevelData | null = null;
  particles: Particle[] = [];
  screenShake: Vec2 = { x: 0, y: 0 };
  screenShakeTimer = 0;
  camera: Vec2 = { x: 0, y: 0 };
  
  // Input
  keys: Record<string, boolean> = {};
  touchLeft = false;
  touchRight = false;
  touchJump = false;
  touchDash = false;

  // Game state
  deaths = 0;
  attempts = 0;
  levelStartTime = 0;
  levelTime = 0;
  coinsCollected = 0;
  isPaused = false;
  isRunning = false;
  levelComplete = false;
  isDead = false;
  deathTimer = 0;
  winTimer = 0;
  checkpointPos: Vec2 | null = null;
  globalTime = 0;
  message = '';
  messageTimer = 0;
  comboCounter = 0;

  // Callbacks
  onDeath?: () => void;
  onLevelComplete?: (time: number, deaths: number, coins: number) => void;
  onPause?: () => void;

  private animFrame = 0;
  private _raf = 0;
  private lastTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.player = this.createPlayer(60, 400);
    this.setupInput();
  }

  private createPlayer(x: number, y: number): PlayerState {
    return {
      x, y, vx: 0, vy: 0,
      w: PLAYER_W, h: PLAYER_H,
      onGround: false, jumpsLeft: 2, maxJumps: 2,
      facing: 1, isDead: false, isWinning: false,
      dashCooldown: 0, isDashing: false, dashTimer: 0,
      coyoteTime: 0, jumpBuffer: 0,
      squashX: 1, squashY: 1, eyeScale: 1,
      reverseControls: false, reverseTimer: 0,
      gravityFlipped: false, gravityTimer: 0,
      jumpMultiplier: 1, jumpTimer: 0,
      invincibleTimer: 0,
      trailPositions: []
    };
  }

  private setupInput() {
    const keyHandler = (e: KeyboardEvent, down: boolean) => {
      this.keys[e.code] = down;
      if (down && (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW')) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', (e) => keyHandler(e, true));
    window.addEventListener('keyup', (e) => keyHandler(e, false));
  }

  loadLevel(levelData: LevelData) {
    this.level = JSON.parse(JSON.stringify(levelData)); // Deep clone
    this.player = this.createPlayer(levelData.spawnX, levelData.spawnY);
    this.particles = [];
    this.screenShake = { x: 0, y: 0 };
    this.screenShakeTimer = 0;
    this.deaths = 0;
    this.attempts = 1;
    this.coinsCollected = 0;
    this.isPaused = false;
    this.levelComplete = false;
    this.isDead = false;
    this.deathTimer = 0;
    this.winTimer = 0;
    this.checkpointPos = null;
    this.levelStartTime = Date.now();
    this.levelTime = 0;
    this.comboCounter = 0;

    // Init runtime state
    this.level!.platforms.forEach(p => {
      p._offsetX = 0;
      p._offsetY = 0;
      p._timer = 0;
      p._visible = true;
      p._triggered = false;
      p._angle = 0;
      p._shakeTimer = 0;
    });

    this.level!.coins.forEach(c => {
      c._collected = false;
      c._bobPhase = Math.random() * Math.PI * 2;
    });

    this.level!.doors.forEach(d => {
      d._moved = false;
      d._moveTimer = 0;
    });

    this.level!.checkpoints.forEach(c => {
      c._activated = false;
    });

    this.level!.triggerZones.forEach(t => {
      t._triggered = false;
    });

    this.level!.fallingBlocks.forEach(fb => {
      fb._falling = false;
      fb._vy = 0;
      fb._delayTimer = fb._delay || 0;
    });

    this.level!.spikes.forEach(s => {
      s._revealed = !s.hidden;
      s._revealTimer = 0;
    });

    this.level!.saws.forEach(s => {
      s._pathIndex = 0;
      s._t = 0;
    });

    this.level!.teleporters.forEach(t => {
      t._cooldown = 0;
    });

    if (levelData.message) {
      this.message = levelData.message;
      this.messageTimer = 180;
    }
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  private loop = (now: number) => {
    if (!this.isRunning) return;
    
    const dt = Math.min(now - this.lastTime, 33.33); // Cap at ~30fps minimum
    this.lastTime = now;
    
    if (!this.isPaused) {
      // Fixed timestep at 60fps
      const steps = Math.max(1, Math.round(dt / 16.67));
      for (let i = 0; i < steps && i < 3; i++) {
        this.update();
      }
    }
    
    this.render();
    this._raf = requestAnimationFrame(this.loop);
  };

  private update() {
    if (!this.level || this.levelComplete) return;
    this.globalTime++;
    this.animFrame++;

    if (this.isDead) {
      this.deathTimer++;
      if (this.deathTimer > 40) {
        this.respawn();
      }
      this.updateParticles();
      return;
    }

    if (this.player.isWinning) {
      this.winTimer++;
      if (this.winTimer > 60) {
        this.levelComplete = true;
        this.levelTime = Date.now() - this.levelStartTime;
        this.onLevelComplete?.(this.levelTime, this.deaths, this.coinsCollected);
      }
      this.updateParticles();
      return;
    }

    // Update timers
    if (this.player.reverseTimer > 0) {
      this.player.reverseTimer--;
      if (this.player.reverseTimer === 0) this.player.reverseControls = false;
    }
    if (this.player.gravityTimer > 0) {
      this.player.gravityTimer--;
      if (this.player.gravityTimer === 0) this.player.gravityFlipped = false;
    }
    if (this.player.jumpTimer > 0) {
      this.player.jumpTimer--;
      if (this.player.jumpTimer === 0) this.player.jumpMultiplier = 1;
    }
    if (this.player.invincibleTimer > 0) this.player.invincibleTimer--;
    if (this.player.dashCooldown > 0) this.player.dashCooldown--;
    if (this.messageTimer > 0) this.messageTimer--;

    // Input
    let moveDir = 0;
    const leftKey = this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touchLeft;
    const rightKey = this.keys['ArrowRight'] || this.keys['KeyD'] || this.touchRight;
    const jumpKey = this.keys['Space'] || this.keys['ArrowUp'] || this.keys['KeyW'] || this.touchJump;
    const dashKey = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['KeyZ'] || this.touchDash;

    if (leftKey) moveDir = this.player.reverseControls ? 1 : -1;
    if (rightKey) moveDir = this.player.reverseControls ? -1 : 1;

    // Movement
    if (this.player.isDashing) {
      this.player.dashTimer--;
      if (this.player.dashTimer <= 0) {
        this.player.isDashing = false;
      }
    } else {
      const accel = 0.8;
      this.player.vx += moveDir * accel;
      
      // Check if on ice
      const onIce = this.level.platforms.some(p => 
        p.type === 'ice' && p._visible !== false && this.isStandingOn(this.player, p)
      );
      
      this.player.vx *= onIce ? ICE_FRICTION : FRICTION;
      
      if (Math.abs(this.player.vx) > MOVE_SPEED) {
        this.player.vx = Math.sign(this.player.vx) * MOVE_SPEED;
      }
    }

    if (moveDir !== 0) this.player.facing = moveDir;

    // Gravity
    const grav = this.player.gravityFlipped ? -GRAVITY : GRAVITY;
    this.player.vy += grav;
    if (this.player.vy > MAX_FALL) this.player.vy = MAX_FALL;
    if (this.player.vy < -MAX_FALL) this.player.vy = -MAX_FALL;

    // Coyote time
    if (this.player.onGround) {
      this.player.coyoteTime = COYOTE_FRAMES;
    } else if (this.player.coyoteTime > 0) {
      this.player.coyoteTime--;
    }

    // Jump buffer
    if (jumpKey && !this._prevJump) {
      this.player.jumpBuffer = JUMP_BUFFER_FRAMES;
    }
    if (this.player.jumpBuffer > 0) this.player.jumpBuffer--;

    // Jump
    if ((jumpKey && !this._prevJump) || this.player.jumpBuffer > 0) {
      if (this.player.coyoteTime > 0 || this.player.onGround) {
        const jf = JUMP_FORCE * this.player.jumpMultiplier;
        this.player.vy = this.player.gravityFlipped ? -jf : jf;
        this.player.onGround = false;
        this.player.coyoteTime = 0;
        this.player.jumpBuffer = 0;
        this.player.jumpsLeft = this.player.maxJumps - 1;
        this.player.squashX = 1.3;
        this.player.squashY = 0.7;
        AudioManager.playJump();
        this.spawnJumpParticles();
      } else if (this.player.jumpsLeft > 0 && (jumpKey && !this._prevJump)) {
        const jf = JUMP_FORCE * 0.85 * this.player.jumpMultiplier;
        this.player.vy = this.player.gravityFlipped ? -jf : jf;
        this.player.jumpsLeft--;
        this.player.squashX = 1.3;
        this.player.squashY = 0.7;
        AudioManager.playDoubleJump();
        this.spawnJumpParticles();
      }
    }
    this._prevJump = jumpKey;

    // Dash
    if (dashKey && !this._prevDash && this.player.dashCooldown <= 0 && !this.player.isDashing) {
      this.player.isDashing = true;
      this.player.dashTimer = DASH_DURATION;
      this.player.dashCooldown = DASH_COOLDOWN;
      this.player.vx = this.player.facing * DASH_SPEED;
      this.player.vy = 0;
      this.player.squashX = 1.5;
      this.player.squashY = 0.6;
      this.spawnDashParticles();
    }
    this._prevDash = dashKey;

    // Update platforms
    this.updatePlatforms();
    
    // Move and collide
    this.moveAndCollide();

    // Check hazards
    this.checkHazards();

    // Check coins
    this.checkCoins();

    // Check doors
    this.checkDoors();

    // Check checkpoints
    this.checkCheckpoints();

    // Check trigger zones
    this.checkTriggerZones();

    // Update falling blocks
    this.updateFallingBlocks();

    // Check teleporters
    this.checkTeleporters();

    // Update saws
    this.updateSaws();

    // Update hidden spikes
    this.updateHiddenSpikes();

    // Squash/stretch lerp
    this.player.squashX += (1 - this.player.squashX) * 0.15;
    this.player.squashY += (1 - this.player.squashY) * 0.15;

    // Eye scale
    const targetEye = this.player.vy < -5 ? 1.3 : this.player.vy > 5 ? 0.7 : 1;
    this.player.eyeScale += (targetEye - this.player.eyeScale) * 0.2;

    // Trail
    this.player.trailPositions.unshift({ x: this.player.x, y: this.player.y });
    if (this.player.trailPositions.length > 8) this.player.trailPositions.pop();

    // Running particles
    if (this.player.onGround && Math.abs(this.player.vx) > 1.5 && this.globalTime % 4 === 0) {
      this.particles.push({
        x: this.player.x + this.player.w / 2 - this.player.facing * 8,
        y: this.player.y + this.player.h,
        vx: -this.player.facing * (0.5 + Math.random()),
        vy: -Math.random() * 1.5,
        life: 12, maxLife: 12,
        color: '#aaaaaa',
        size: 2 + Math.random() * 2,
        type: 'circle'
      });
    }

    // Particles
    this.updateParticles();

    // Screen shake
    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer--;
      const intensity = this.screenShakeTimer * 0.5;
      this.screenShake.x = (Math.random() - 0.5) * intensity;
      this.screenShake.y = (Math.random() - 0.5) * intensity;
    } else {
      this.screenShake.x = 0;
      this.screenShake.y = 0;
    }

    // Fall off screen = death
    if (this.player.y > this.level.height + 100 || this.player.y < -200) {
      this.killPlayer();
    }
    if (this.player.x < -50 || this.player.x > this.level.width + 50) {
      this.killPlayer();
    }
  }

  private _prevJump = false;
  private _prevDash = false;

  private updatePlatforms() {
    if (!this.level) return;
    this.level.platforms.forEach(p => {
      if (p.type === 'moving' && p.moveX !== undefined) {
        const t = this.globalTime * (p.moveSpeed || 1) * 0.02 + (p.movePhase || 0);
        const prevOX = p._offsetX || 0;
        const prevOY = p._offsetY || 0;
        p._offsetX = Math.sin(t) * (p.moveX || 0);
        p._offsetY = Math.sin(t * 0.7) * (p.moveY || 0);
        // Carry player
        if (this.isStandingOn(this.player, p)) {
          this.player.x += (p._offsetX! - prevOX);
          this.player.y += (p._offsetY! - prevOY);
        }
      }
      if (p.type === 'disappearing') {
        if (p._triggered && p._visible !== false) {
          p._timer = (p._timer || 0) + 1;
          p._shakeTimer = (p._shakeTimer || 0) + 1;
          if ((p._timer || 0) > (p.disappearDelay || 500) / 16.67) {
            p._visible = false;
            this.spawnBlockBreakParticles(p.x + (p._offsetX || 0) + p.w / 2, p.y + (p._offsetY || 0) + p.h / 2);
            AudioManager.playTrapActivate();
            // Reappear after delay
            setTimeout(() => {
              p._visible = true;
              p._triggered = false;
              p._timer = 0;
              p._shakeTimer = 0;
            }, 2000);
          }
        }
      }
    });
  }

  private isStandingOn(player: PlayerState, p: Platform): boolean {
    const px = p.x + (p._offsetX || 0);
    const py = p.y + (p._offsetY || 0);
    return (
      player.x + player.w > px &&
      player.x < px + p.w &&
      Math.abs((player.y + player.h) - py) < 4 &&
      player.vy >= 0
    );
  }

  private moveAndCollide() {
    if (!this.level) return;
    const p = this.player;

    // Move X
    p.x += p.vx;
    
    // Collide X with platforms
    for (const plat of this.level.platforms) {
      if (plat._visible === false) continue;
      if (plat.type === 'fake') continue;
      
      const px = plat.x + (plat._offsetX || 0);
      const py = plat.y + (plat._offsetY || 0);
      
      if (this.rectOverlap(p.x, p.y, p.w, p.h, px, py, plat.w, plat.h)) {
        if (p.vx > 0) {
          p.x = px - p.w;
        } else if (p.vx < 0) {
          p.x = px + plat.w;
        }
        p.vx = 0;
      }
    }

    // Move Y
    p.y += p.vy;
    p.onGround = false;

    // Collide Y with platforms
    for (const plat of this.level.platforms) {
      if (plat._visible === false) continue;
      if (plat.type === 'fake') {
        // Fall through fake platforms
        if (this.rectOverlap(p.x, p.y, p.w, p.h, plat.x + (plat._offsetX || 0), plat.y + (plat._offsetY || 0), plat.w, plat.h)) {
          plat._visible = false;
          this.spawnBlockBreakParticles(plat.x + plat.w / 2, plat.y + plat.h / 2);
          AudioManager.playTrapActivate();
        }
        continue;
      }
      
      const px = plat.x + (plat._offsetX || 0);
      const py = plat.y + (plat._offsetY || 0);
      
      if (this.rectOverlap(p.x, p.y, p.w, p.h, px, py, plat.w, plat.h)) {
        if (p.vy > 0) {
          p.y = py - p.h;
          p.onGround = true;
          if (Math.abs(p.vy) > 3) {
            p.squashX = 0.7;
            p.squashY = 1.3;
            AudioManager.playLand();
          }
          p.vy = 0;
          p.jumpsLeft = p.maxJumps;
          
          // Trigger disappearing
          if (plat.type === 'disappearing' && !plat._triggered) {
            plat._triggered = true;
          }
        } else if (p.vy < 0) {
          p.y = py + plat.h;
          p.vy = 0;
        }
      }
    }
  }

  private rectOverlap(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  private checkHazards() {
    if (!this.level || this.player.invincibleTimer > 0) return;

    // Spikes
    for (const s of this.level.spikes) {
      if (!s._revealed) continue;
      const sx = s.x;
      const sy = s.y;
      if (this.rectOverlap(this.player.x + 2, this.player.y + 2, this.player.w - 4, this.player.h - 4, sx, sy, s.w, s.h)) {
        this.killPlayer();
        return;
      }
    }

    // Saws
    for (const s of this.level.saws) {
      const dx = (this.player.x + this.player.w / 2) - s.x;
      const dy = (this.player.y + this.player.h / 2) - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < s.radius + 8) {
        this.killPlayer();
        return;
      }
    }

    // Falling blocks
    for (const fb of this.level.fallingBlocks) {
      if (this.rectOverlap(this.player.x, this.player.y, this.player.w, this.player.h, fb.x, fb.y, fb.w, fb.h)) {
        this.killPlayer();
        return;
      }
    }
  }

  private checkCoins() {
    if (!this.level) return;
    for (const c of this.level.coins) {
      if (c._collected) continue;
      const cx = c.x;
      const cy = c.y + Math.sin((c._bobPhase || 0) + this.globalTime * 0.05) * 4;
      if (this.rectOverlap(this.player.x, this.player.y, this.player.w, this.player.h, cx - 10, cy - 10, 20, 20)) {
        c._collected = true;
        this.coinsCollected++;
        AudioManager.playCoin();
        this.spawnCoinParticles(cx, cy);
        this.comboCounter++;
      }
    }
  }

  private checkDoors() {
    if (!this.level) return;
    for (const d of this.level.doors) {
      const dx = d._moved ? (d.moveToX || d.x) : d.x;
      const dy = d._moved ? (d.moveToY || d.y) : d.y;
      
      if (this.rectOverlap(this.player.x, this.player.y, this.player.w, this.player.h, dx, dy, d.w, d.h)) {
        if (d.fake) {
          // Fake door trap!
          if (d.moveToX !== undefined && !d._moved) {
            d._moved = true;
            AudioManager.playTrapActivate();
            this.shake(8);
          } else {
            this.killPlayer();
          }
        } else {
          // Win!
          this.player.isWinning = true;
          AudioManager.playLevelComplete();
          this.spawnWinParticles();
        }
      }
    }
  }

  private checkCheckpoints() {
    if (!this.level) return;
    for (const cp of this.level.checkpoints) {
      if (cp._activated) continue;
      if (this.rectOverlap(this.player.x, this.player.y, this.player.w, this.player.h, cp.x - 12, cp.y - 32, 24, 32)) {
        cp._activated = true;
        this.checkpointPos = { x: cp.x, y: cp.y - 30 };
        AudioManager.playCheckpoint();
        this.spawnCheckpointParticles(cp.x, cp.y);
      }
    }
  }

  private checkTriggerZones() {
    if (!this.level) return;
    for (const tz of this.level.triggerZones) {
      if (tz._triggered) continue;
      if (this.rectOverlap(this.player.x, this.player.y, this.player.w, this.player.h, tz.x, tz.y, tz.w, tz.h)) {
        tz._triggered = true;
        const dur = Math.floor((tz.duration || 2000) / 16.67);

        switch (tz.action) {
          case 'reverse_controls':
            this.player.reverseControls = true;
            this.player.reverseTimer = dur;
            this.message = 'CONTROLS REVERSED!';
            this.messageTimer = 60;
            break;
          case 'gravity_flip':
            this.player.gravityFlipped = !this.player.gravityFlipped;
            this.player.gravityTimer = dur;
            this.message = 'GRAVITY FLIPPED!';
            this.messageTimer = 60;
            break;
          case 'jump_change':
            this.player.jumpMultiplier = 0.5 + Math.random();
            this.player.jumpTimer = dur;
            this.message = 'JUMP CHANGED!';
            this.messageTimer = 60;
            break;
          case 'falling_blocks':
            // Trigger all falling blocks
            this.level!.fallingBlocks.forEach(fb => { fb._falling = true; });
            break;
          case 'wall_close':
            // Add closing wall spikes
            this.shake(10);
            AudioManager.playTrapActivate();
            this.message = 'WALLS CLOSING!';
            this.messageTimer = 60;
            break;
        }

        AudioManager.playTrapActivate();
        this.shake(6);
        // Reset after timeout
        setTimeout(() => { tz._triggered = false; }, (tz.duration || 2000) + 3000);
      }
    }
  }

  private updateFallingBlocks() {
    if (!this.level) return;
    for (const fb of this.level.fallingBlocks) {
      // Check trigger
      if (!fb._falling && fb.triggerX !== undefined) {
        if (Math.abs(this.player.x - fb.triggerX) < 40) {
          if (fb._delayTimer && fb._delayTimer > 0) {
            fb._delayTimer--;
          } else {
            fb._falling = true;
          }
        }
      }
      if (fb._falling) {
        fb._vy = (fb._vy || 0) + 0.3;
        fb.y += fb._vy;
        if (fb.y > this.level.height + 100) {
          // Reset
          fb._falling = false;
          fb._vy = 0;
          fb.y = -50 - Math.random() * 50;
          fb._delayTimer = fb._delay || 0;
        }
      }
    }
  }

  private updateSaws() {
    if (!this.level) return;
    for (const s of this.level.saws) {
      if (s.pathX && s.pathY && s.pathX.length >= 2) {
        s._t = ((s._t || 0) + (s.speed || 1) * 0.01) % 1;
        const t = s._t;
        // Ping-pong between points
        const pingPong = t < 0.5 ? t * 2 : 2 - t * 2;
        s.x = s.pathX[0] + (s.pathX[1] - s.pathX[0]) * pingPong;
        s.y = s.pathY[0] + (s.pathY[1] - s.pathY[0]) * pingPong;
      }
    }
  }

  private updateHiddenSpikes() {
    if (!this.level) return;
    for (const s of this.level.spikes) {
      if (s.hidden && !s._revealed && s.triggerX !== undefined) {
        if (this.player.x >= s.triggerX) {
          s._revealed = true;
          s._revealTimer = 10;
          AudioManager.playTrapActivate();
          this.shake(4);
        }
      }
      if (s._revealTimer && s._revealTimer > 0) {
        s._revealTimer--;
      }
    }
  }

  private checkTeleporters() {
    if (!this.level) return;
    for (const t of this.level.teleporters) {
      if (t._cooldown && t._cooldown > 0) {
        t._cooldown--;
        continue;
      }
      const dist = Math.sqrt(
        Math.pow(this.player.x + this.player.w / 2 - t.x, 2) +
        Math.pow(this.player.y + this.player.h / 2 - t.y, 2)
      );
      if (dist < 20) {
        this.player.x = t.targetX - this.player.w / 2;
        this.player.y = t.targetY - this.player.h / 2;
        this.player.vx = 0;
        this.player.vy = 0;
        t._cooldown = 60;
        this.shake(5);
        this.spawnTeleportParticles(t.x, t.y);
        this.spawnTeleportParticles(t.targetX, t.targetY);
      }
    }
  }

  killPlayer() {
    if (this.isDead || this.player.isWinning) return;
    this.isDead = true;
    this.player.isDead = true;
    this.deaths++;
    this.deathTimer = 0;
    SaveManager.recordDeath();
    AudioManager.playDeath();
    this.shake(12);
    this.spawnDeathParticles();
    this.onDeath?.();
  }

  private respawn() {
    this.isDead = false;
    this.attempts++;
    
    const spawnX = this.checkpointPos?.x || this.level!.spawnX;
    const spawnY = this.checkpointPos?.y || this.level!.spawnY;
    
    this.player = this.createPlayer(spawnX, spawnY);
    this.player.invincibleTimer = 30;

    // Reset traps but keep checkpoints
    this.level!.platforms.forEach(p => {
      if (p.type === 'fake' || p.type === 'disappearing') {
        p._visible = true;
        p._triggered = false;
        p._timer = 0;
      }
    });
    this.level!.fallingBlocks.forEach(fb => {
      fb._falling = false;
      fb._vy = 0;
      fb.y = -50;
      fb._delayTimer = fb._delay || 0;
    });
    this.level!.triggerZones.forEach(t => {
      t._triggered = false;
    });
    this.level!.spikes.forEach(s => {
      if (s.hidden) {
        s._revealed = false;
        s._revealTimer = 0;
      }
    });
    this.level!.doors.forEach(d => {
      d._moved = false;
    });
    
    // Don't reset coins if checkpoint exists
    if (!this.checkpointPos) {
      this.level!.coins.forEach(c => { c._collected = false; });
      this.coinsCollected = 0;
    }
  }

  private shake(intensity: number) {
    this.screenShakeTimer = Math.max(this.screenShakeTimer, intensity);
  }

  // Particle spawners
  private spawnJumpParticles() {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.player.x + this.player.w / 2,
        y: this.player.y + this.player.h,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2,
        life: 20, maxLife: 20,
        color: '#ffffff',
        size: 3 + Math.random() * 3,
        type: 'circle'
      });
    }
  }

  private spawnDashParticles() {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.player.x + this.player.w / 2,
        y: this.player.y + this.player.h / 2,
        vx: -this.player.facing * (2 + Math.random() * 4),
        vy: (Math.random() - 0.5) * 3,
        life: 15, maxLife: 15,
        color: '#ffcc00',
        size: 4 + Math.random() * 4,
        type: 'spark'
      });
    }
  }

  private spawnDeathParticles() {
    const cx = this.player.x + this.player.w / 2;
    const cy = this.player.y + this.player.h / 2;
    const colors = ['#ff4444', '#ff6644', '#ff8844', '#ffaa44', '#ffffff'];
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30, maxLife: 30,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 5,
        type: 'square'
      });
    }
  }

  private spawnCoinParticles(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 20, maxLife: 20,
        color: '#ffdd00',
        size: 3 + Math.random() * 3,
        type: 'spark'
      });
    }
  }

  private spawnWinParticles() {
    const cx = this.player.x + this.player.w / 2;
    const cy = this.player.y + this.player.h / 2;
    const colors = ['#44ff44', '#44ffff', '#ffff44', '#ff44ff', '#4444ff', '#ffffff'];
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50;
      const speed = 1 + Math.random() * 5;
      this.particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 60, maxLife: 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 5,
        type: Math.random() > 0.5 ? 'circle' : 'spark'
      });
    }
  }

  private spawnBlockBreakParticles(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 25, maxLife: 25,
        color: '#888888',
        size: 3 + Math.random() * 4,
        type: 'square'
      });
    }
  }

  private spawnCheckpointParticles(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 4,
        life: 30, maxLife: 30,
        color: '#44ff88',
        size: 3 + Math.random() * 3,
        type: 'spark'
      });
    }
  }

  private spawnTeleportParticles(x: number, y: number) {
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        life: 20, maxLife: 20,
        color: '#aa44ff',
        size: 4,
        type: 'circle'
      });
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.vx *= 0.98;
      p.life--;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // ==================== RENDER ====================

  private render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.translate(this.screenShake.x, this.screenShake.y);

    if (!this.level) {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      return;
    }

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, this.level.bgColor);
    grad.addColorStop(1, this.level.bgColor2 || this.level.bgColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Background decorations
    this.renderBgDecor(ctx, w, h);

    // Platforms
    this.renderPlatforms(ctx);

    // Teleporters
    this.renderTeleporters(ctx);

    // Checkpoints
    this.renderCheckpoints(ctx);

    // Coins
    this.renderCoins(ctx);

    // Spikes
    this.renderSpikes(ctx);

    // Saws
    this.renderSaws(ctx);

    // Falling blocks
    this.renderFallingBlocks(ctx);

    // Trigger zones (subtle indicator)
    this.renderTriggerZones(ctx);

    // Doors
    this.renderDoors(ctx);

    // Trail
    this.renderTrail(ctx);

    // Player
    if (!this.isDead) {
      this.renderPlayer(ctx);
    }

    // Particles
    this.renderParticles(ctx);

    // Death overlay
    if (this.isDead) {
      this.renderDeathOverlay(ctx, w, h);
    }

    // Win overlay
    if (this.player.isWinning) {
      this.renderWinOverlay(ctx, w, h);
    }

    // HUD
    this.renderHUD(ctx, w, h);

    // Message
    if (this.messageTimer > 0 && this.message) {
      this.renderMessage(ctx, w, h);
    }

    // Effect indicators
    this.renderEffectIndicators(ctx, w);

    ctx.restore();
  }

  private renderBgDecor(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.globalAlpha = 0.1;
    // Grid pattern
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  private renderPlatforms(ctx: CanvasRenderingContext2D) {
    if (!this.level) return;
    for (const p of this.level.platforms) {
      if (p._visible === false) continue;
      const px = p.x + (p._offsetX || 0);
      const py = p.y + (p._offsetY || 0);

      // Shake for disappearing
      let shakeX = 0, shakeY = 0;
      if (p._shakeTimer && p._shakeTimer > 0) {
        shakeX = (Math.random() - 0.5) * 4;
        shakeY = (Math.random() - 0.5) * 4;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      switch (p.type) {
        case 'solid':
          ctx.fillStyle = '#4a5568';
          ctx.fillRect(px, py, p.w, p.h);
          ctx.fillStyle = '#5a6578';
          ctx.fillRect(px, py, p.w, 3);
          ctx.strokeStyle = '#2d3748';
          ctx.strokeRect(px, py, p.w, p.h);
          break;
        case 'fake':
          ctx.fillStyle = '#4a5568'; // Same as solid to trick player
          ctx.fillRect(px, py, p.w, p.h);
          ctx.fillStyle = '#5a6578';
          ctx.fillRect(px, py, p.w, 3);
          ctx.strokeStyle = '#2d3748';
          ctx.strokeRect(px, py, p.w, p.h);
          break;
        case 'disappearing':
          ctx.globalAlpha = p._triggered ? Math.max(0, 1 - (p._timer || 0) / 30) : 1;
          ctx.fillStyle = '#e2725b';
          ctx.fillRect(px, py, p.w, p.h);
          ctx.fillStyle = '#f2826b';
          ctx.fillRect(px, py, p.w, 3);
          ctx.strokeStyle = '#c2523b';
          ctx.strokeRect(px, py, p.w, p.h);
          ctx.globalAlpha = 1;
          break;
        case 'moving':
          ctx.fillStyle = '#4299e1';
          ctx.fillRect(px, py, p.w, p.h);
          ctx.fillStyle = '#63b3ed';
          ctx.fillRect(px, py, p.w, 3);
          ctx.strokeStyle = '#2b6cb0';
          ctx.strokeRect(px, py, p.w, p.h);
          // Arrow indicator (drawn as lines)
          ctx.globalAlpha = 0.3;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          const acx = px + p.w / 2;
          const acy = py + p.h / 2;
          ctx.beginPath();
          ctx.moveTo(acx - 8, acy);
          ctx.lineTo(acx + 8, acy);
          ctx.moveTo(acx - 8, acy);
          ctx.lineTo(acx - 4, acy - 3);
          ctx.moveTo(acx - 8, acy);
          ctx.lineTo(acx - 4, acy + 3);
          ctx.moveTo(acx + 8, acy);
          ctx.lineTo(acx + 4, acy - 3);
          ctx.moveTo(acx + 8, acy);
          ctx.lineTo(acx + 4, acy + 3);
          ctx.stroke();
          ctx.globalAlpha = 1;
          break;
        case 'ice':
          ctx.fillStyle = '#81e6d9';
          ctx.fillRect(px, py, p.w, p.h);
          ctx.fillStyle = '#b2f5ea';
          ctx.fillRect(px, py, p.w, 3);
          ctx.strokeStyle = '#38b2ac';
          ctx.strokeRect(px, py, p.w, p.h);
          // Shine effect
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 2, py + 2, p.w * 0.3, 2);
          ctx.globalAlpha = 1;
          break;
      }
      ctx.restore();
    }
  }

  private renderSpikes(ctx: CanvasRenderingContext2D) {
    if (!this.level) return;
    for (const s of this.level.spikes) {
      if (!s._revealed) continue;
      
      const alpha = s._revealTimer && s._revealTimer > 0 ? 0.5 + (10 - s._revealTimer) / 20 : 1;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#e53e3e';
      ctx.strokeStyle = '#c53030';
      ctx.lineWidth = 1;

      ctx.beginPath();
      switch (s.direction) {
        case 'up':
          for (let i = 0; i < s.w; i += 12) {
            ctx.moveTo(s.x + i, s.y + s.h);
            ctx.lineTo(s.x + i + 6, s.y);
            ctx.lineTo(s.x + i + 12, s.y + s.h);
          }
          break;
        case 'down':
          for (let i = 0; i < s.w; i += 12) {
            ctx.moveTo(s.x + i, s.y);
            ctx.lineTo(s.x + i + 6, s.y + s.h);
            ctx.lineTo(s.x + i + 12, s.y);
          }
          break;
        case 'left':
          for (let i = 0; i < s.h; i += 12) {
            ctx.moveTo(s.x + s.w, s.y + i);
            ctx.lineTo(s.x, s.y + i + 6);
            ctx.lineTo(s.x + s.w, s.y + i + 12);
          }
          break;
        case 'right':
          for (let i = 0; i < s.h; i += 12) {
            ctx.moveTo(s.x, s.y + i);
            ctx.lineTo(s.x + s.w, s.y + i + 6);
            ctx.lineTo(s.x, s.y + i + 12);
          }
          break;
      }
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  private renderSaws(ctx: CanvasRenderingContext2D) {
    if (!this.level) return;
    for (const s of this.level.saws) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(this.globalTime * 0.1);
      
      // Saw blade
      const teeth = 8;
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const angle = (Math.PI * 2 * i) / teeth;
        const nextAngle = (Math.PI * 2 * (i + 0.5)) / teeth;
        const r1 = s.radius;
        const r2 = s.radius * 0.65;
        ctx.lineTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
        ctx.lineTo(Math.cos(nextAngle) * r2, Math.sin(nextAngle) * r2);
      }
      ctx.closePath();
      ctx.fillStyle = '#a0aec0';
      ctx.fill();
      ctx.strokeStyle = '#718096';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Center
      ctx.beginPath();
      ctx.arc(0, 0, s.radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      
      ctx.restore();
    }
  }

  private renderCoins(ctx: CanvasRenderingContext2D) {
    if (!this.level) return;
    for (const c of this.level.coins) {
      if (c._collected) continue;
      const bob = Math.sin((c._bobPhase || 0) + this.globalTime * 0.05) * 4;
      const cx = c.x;
      const cy = c.y + bob;
      const pulse = 1 + Math.sin(this.globalTime * 0.08) * 0.1;
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);
      
      // Glow
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 221, 0, 0.2)';
      ctx.fill();
      
      // Coin
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.strokeStyle = '#b8860b';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Shine
      ctx.beginPath();
      ctx.arc(-2, -2, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
      
      ctx.restore();
    }
  }

  private renderDoors(ctx: CanvasRenderingContext2D) {
    if (!this.level) return;
    for (const d of this.level.doors) {
      const dx = d._moved ? (d.moveToX || d.x) : d.x;
      const dy = d._moved ? (d.moveToY || d.y) : d.y;
      
      // Door frame
      ctx.fillStyle = d.fake ? '#4a5568' : '#2d8659';
      ctx.fillRect(dx - 2, dy - 2, d.w + 4, d.h + 4);
      
      // Door
      ctx.fillStyle = d.fake ? '#6b7280' : '#48bb78';
      ctx.fillRect(dx, dy, d.w, d.h);
      
      // Door knob
      ctx.beginPath();
      ctx.arc(dx + d.w - 8, dy + d.h / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      
      // EXIT text
      if (!d.fake) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('EXIT', dx + d.w / 2, dy + 14);
      }
      
      // Glow for real doors
      if (!d.fake) {
        ctx.save();
        ctx.globalAlpha = 0.3 + Math.sin(this.globalTime * 0.05) * 0.1;
        ctx.shadowColor = '#48bb78';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#48bb78';
        ctx.fillRect(dx, dy, d.w, d.h);
        ctx.restore();
      }
    }
  }

  private renderCheckpoints(ctx: CanvasRenderingContext2D) {
    if (!this.level) return;
    for (const cp of this.level.checkpoints) {
      const activated = cp._activated;
      
      // Flag pole
      ctx.fillStyle = '#718096';
      ctx.fillRect(cp.x - 2, cp.y - 32, 4, 36);
      
      // Flag
      ctx.fillStyle = activated ? '#48bb78' : '#e53e3e';
      ctx.beginPath();
      ctx.moveTo(cp.x + 2, cp.y - 32);
      ctx.lineTo(cp.x + 18, cp.y - 24);
      ctx.lineTo(cp.x + 2, cp.y - 16);
      ctx.fill();
      
      if (activated) {
        ctx.globalAlpha = 0.3 + Math.sin(this.globalTime * 0.05) * 0.1;
        ctx.fillStyle = '#48bb78';
        ctx.beginPath();
        ctx.arc(cp.x, cp.y - 16, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  private renderTriggerZones(ctx: CanvasRenderingContext2D) {
    if (!this.level) return;
    for (const tz of this.level.triggerZones) {
      if (tz._triggered) continue;
      ctx.globalAlpha = 0.15 + Math.sin(this.globalTime * 0.05) * 0.05;
      ctx.fillStyle = tz.action === 'reverse_controls' ? '#ff6b6b' :
                      tz.action === 'gravity_flip' ? '#6b6bff' :
                      tz.action === 'jump_change' ? '#6bff6b' : '#ff6bff';
      ctx.fillRect(tz.x, tz.y, tz.w, tz.h);
      ctx.globalAlpha = 1;
    }
  }

  private renderFallingBlocks(ctx: CanvasRenderingContext2D) {
    if (!this.level) return;
    for (const fb of this.level.fallingBlocks) {
      if (fb.y > this.level.height) continue;
      ctx.fillStyle = '#e53e3e';
      ctx.fillRect(fb.x, fb.y, fb.w, fb.h);
      ctx.strokeStyle = '#c53030';
      ctx.strokeRect(fb.x, fb.y, fb.w, fb.h);
      // Warning symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('!', fb.x + fb.w / 2, fb.y + fb.h / 2 + 5);
    }
  }

  private renderTeleporters(ctx: CanvasRenderingContext2D) {
    if (!this.level) return;
    for (const t of this.level.teleporters) {
      const pulse = 1 + Math.sin(this.globalTime * 0.08) * 0.15;
      
      // Portal ring
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.scale(pulse, pulse);
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.strokeStyle = '#9f7aea';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(159, 122, 234, 0.4)';
      ctx.fill();
      ctx.restore();

      // Target indicator (smaller)
      ctx.save();
      ctx.translate(t.targetX, t.targetY);
      ctx.scale(pulse, pulse);
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#9f7aea';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  private renderTrail(ctx: CanvasRenderingContext2D) {
    if (this.isDead || this.player.trailPositions.length < 2) return;
    for (let i = 1; i < this.player.trailPositions.length; i++) {
      const pos = this.player.trailPositions[i];
      const alpha = (1 - i / this.player.trailPositions.length) * 0.3;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.player.isDashing ? '#ffcc00' : '#ffffff';
      const size = this.player.w * (1 - i / this.player.trailPositions.length) * 0.6;
      ctx.fillRect(
        pos.x + this.player.w / 2 - size / 2,
        pos.y + this.player.h / 2 - size / 2,
        size, size
      );
    }
    ctx.globalAlpha = 1;
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    
    // Invincibility blink
    if (p.invincibleTimer > 0 && Math.floor(this.globalTime / 3) % 2 === 0) return;

    ctx.save();
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    ctx.translate(cx, cy);
    ctx.scale(p.squashX * p.facing, p.squashY * (p.gravityFlipped ? -1 : 1));

    // Body
    const bodyColor = p.reverseControls ? '#ff6b6b' : 
                      p.isDashing ? '#ffcc00' : 
                      p.gravityFlipped ? '#6b6bff' : '#ff8c42';
    
    // Body shape (rounded rect blob)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    const bw = p.w / 2;
    const bh = p.h / 2;
    ctx.roundRect(-bw, -bh, p.w, p.h, 6);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    const eyeOffY = -3;
    const eyeSpacing = 5;
    const eyeSize = 4 * p.eyeScale;
    
    // White
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-eyeSpacing, eyeOffY, eyeSize + 1, eyeSize + 1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(eyeSpacing, eyeOffY, eyeSize + 1, eyeSize + 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils (look in movement direction)
    const pupilOff = p.vx !== 0 ? Math.sign(p.vx) * 1.5 : 0;
    const pupilOffY = p.vy > 2 ? 1.5 : p.vy < -2 ? -1.5 : 0;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-eyeSpacing + pupilOff, eyeOffY + pupilOffY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeSpacing + pupilOff, eyeOffY + pupilOffY, 2, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    const mouthY = 5;
    if (p.vy < -3) {
      // Scared mouth (O shape)
      ctx.beginPath();
      ctx.arc(0, mouthY, 3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.onGround && Math.abs(p.vx) < 0.5) {
      // Neutral mouth
      ctx.beginPath();
      ctx.moveTo(-3, mouthY);
      ctx.lineTo(3, mouthY);
      ctx.stroke();
    } else {
      // Smile/grimace
      ctx.beginPath();
      ctx.arc(0, mouthY - 1, 4, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      
      switch (p.type) {
        case 'square':
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'spark':
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.atan2(p.vy, p.vx));
          ctx.fillRect(-p.size, -p.size / 4, p.size * 2, p.size / 2);
          ctx.restore();
          break;
      }
    }
    ctx.globalAlpha = 1;
  }

  private renderDeathOverlay(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const t = Math.min(this.deathTimer / 20, 1);
    ctx.globalAlpha = t * 0.4;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    if (this.deathTimer > 10) {
      // Skull icon drawn with canvas
      const cx = w / 2;
      const cy = h / 2 - 20;
      this.drawSkullIcon(ctx, cx - 18, cy - 14, 20);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('YOU DIED!', cx + 8, cy);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#cccccc';
      ctx.fillText(`Deaths: ${this.deaths}`, cx, cy + 35);
    }
  }

  private renderWinOverlay(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const t = Math.min(this.winTimer / 30, 1);
    ctx.globalAlpha = t * 0.3;
    ctx.fillStyle = '#44ff44';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    // Trophy/star icon
    const cx = w / 2;
    const cy = h / 2 - 20;
    this.drawStarIcon(ctx, cx - 22, cy - 12, 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LEVEL COMPLETE!', cx + 4, cy);

    ctx.font = '16px Arial';
    const elapsed = Date.now() - this.levelStartTime;
    ctx.fillText(`Time: ${(elapsed / 1000).toFixed(2)}s | Deaths: ${this.deaths} | Coins: ${this.coinsCollected}`, cx, cy + 35);
  }

  private renderHUD(ctx: CanvasRenderingContext2D, w: number, _h: number) {
    // Top HUD bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, w, 28);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Level name
    ctx.fillText(`Level ${this.level?.id || '?'}: ${this.level?.name || ''}`, 8, 14);

    // Timer with clock icon
    const elapsed = this.isDead || this.player.isWinning ? this.levelTime : Date.now() - this.levelStartTime;
    this.drawClockIcon(ctx, w / 2 - 40, 5, 10);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${(elapsed / 1000).toFixed(1)}s`, w / 2 + 4, 14);

    // Deaths with skull icon
    ctx.textAlign = 'right';
    this.drawSkullIcon(ctx, w - 100, 5, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${this.deaths}`, w - 68, 14);

    // Coins with coin icon
    this.drawCoinIcon(ctx, w - 48, 5, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${this.coinsCollected}`, w - 8, 14);

    // Dash cooldown indicator
    if (this.player.dashCooldown > 0) {
      const pct = this.player.dashCooldown / DASH_COOLDOWN;
      ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
      ctx.fillRect(w - 60, 30, 50 * (1 - pct), 4);
    }
  }

  private renderMessage(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const alpha = Math.min(1, this.messageTimer / 30);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    const mw = ctx.measureText(this.message).width + 40;
    ctx.fillRect(w / 2 - mw / 2, h - 60, mw, 30);
    ctx.fillStyle = '#ffdd00';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.message, w / 2, h - 45);
    ctx.globalAlpha = 1;
  }

  private renderEffectIndicators(ctx: CanvasRenderingContext2D, w: number) {
    let y = 36;
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'right';

    if (this.player.reverseControls) {
      // Lightning bolt icon
      this.drawLightningIcon(ctx, w - 90, y - 8, 10);
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('REVERSED', w - 8, y);
      y += 16;
    }
    if (this.player.gravityFlipped) {
      // Gravity arrows icon
      this.drawGravityIcon(ctx, w - 78, y - 8, 10);
      ctx.fillStyle = '#6b6bff';
      ctx.fillText('GRAVITY', w - 8, y);
      y += 16;
    }
    if (this.player.jumpMultiplier !== 1) {
      // Spring icon
      this.drawSpringIcon(ctx, w - 100, y - 8, 10);
      ctx.fillStyle = '#6bff6b';
      ctx.fillText(`JUMP x${this.player.jumpMultiplier.toFixed(1)}`, w - 8, y);
    }
  }

  // ==================== CANVAS ICON DRAWING ====================

  private drawSkullIcon(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x, y);
    const sc = s / 12;
    ctx.scale(sc, sc);
    // Head
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(12, 10, 10, Math.PI, 0);
    ctx.lineTo(22, 16);
    ctx.quadraticCurveTo(22, 22, 17, 22);
    ctx.lineTo(7, 22);
    ctx.quadraticCurveTo(2, 22, 2, 16);
    ctx.closePath();
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(8, 13, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(16, 13, 3, 0, Math.PI * 2);
    ctx.fill();
    // Nose
    ctx.beginPath();
    ctx.moveTo(11, 17);
    ctx.lineTo(13, 17);
    ctx.lineTo(12, 19);
    ctx.closePath();
    ctx.fill();
    // Teeth
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const tx = 7 + i * 3;
      ctx.beginPath();
      ctx.moveTo(tx, 20);
      ctx.lineTo(tx, 23);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawStarIcon(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x + s, y + s);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const r = i === 0 ? s : s;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
      const innerAngle = angle + (2 * Math.PI) / 10;
      const ir = s * 0.4;
      ctx.lineTo(Math.cos(innerAngle) * ir, Math.sin(innerAngle) * ir);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawClockIcon(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x + s, y + s);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    // Circle
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    // Hands
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -s * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(s * 0.35, 0);
    ctx.stroke();
    // Top tick
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.8);
    ctx.lineTo(0, -s);
    ctx.stroke();
    ctx.restore();
  }

  private drawCoinIcon(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x + s, y + s);
    // Outer ring
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Dollar sign
    ctx.fillStyle = '#8B6914';
    ctx.font = `bold ${s}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 1);
    ctx.restore();
  }

  private drawLightningIcon(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x, y);
    const sc = s / 12;
    ctx.scale(sc, sc);
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(6, 14);
    ctx.lineTo(10, 14);
    ctx.lineTo(8, 24);
    ctx.lineTo(18, 10);
    ctx.lineTo(14, 10);
    ctx.lineTo(16, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawGravityIcon(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x, y);
    const sc = s / 12;
    ctx.scale(sc, sc);
    ctx.strokeStyle = '#6b6bff';
    ctx.lineWidth = 2;
    // Up arrow
    ctx.beginPath();
    ctx.moveTo(12, 2);
    ctx.lineTo(8, 8);
    ctx.moveTo(12, 2);
    ctx.lineTo(16, 8);
    ctx.moveTo(12, 2);
    ctx.lineTo(12, 14);
    ctx.stroke();
    // Down arrow
    ctx.beginPath();
    ctx.moveTo(12, 22);
    ctx.lineTo(8, 16);
    ctx.moveTo(12, 22);
    ctx.lineTo(16, 16);
    ctx.moveTo(12, 22);
    ctx.lineTo(12, 10);
    ctx.stroke();
    ctx.restore();
  }

  private drawSpringIcon(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x, y);
    const sc = s / 12;
    ctx.scale(sc, sc);
    ctx.strokeStyle = '#6bff6b';
    ctx.lineWidth = 2;
    // Spring coil
    ctx.beginPath();
    ctx.moveTo(6, 22);
    ctx.lineTo(6, 18);
    ctx.lineTo(18, 14);
    ctx.lineTo(6, 10);
    ctx.lineTo(18, 6);
    ctx.lineTo(12, 2);
    ctx.stroke();
    // Base
    ctx.beginPath();
    ctx.moveTo(4, 22);
    ctx.lineTo(20, 22);
    ctx.stroke();
    ctx.restore();
  }
}
