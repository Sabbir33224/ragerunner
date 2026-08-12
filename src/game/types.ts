// Core game types

export interface Vec2 {
  x: number;
  y: number;
}

export type TrapType =
  | 'spike'
  | 'spike_hidden'
  | 'spike_wall'
  | 'spike_ceiling'
  | 'falling_block'
  | 'moving_saw'
  | 'fake_platform'
  | 'disappearing_floor'
  | 'moving_platform'
  | 'fake_door'
  | 'teleport'
  | 'reverse_controls'
  | 'gravity_flip'
  | 'rotating_platform'
  | 'wall_closing'
  | 'falling_object'
  | 'jump_change';

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'solid' | 'fake' | 'disappearing' | 'moving' | 'rotating' | 'ice';
  // For moving platforms
  moveX?: number;
  moveY?: number;
  moveSpeed?: number;
  movePhase?: number;
  // For disappearing
  disappearDelay?: number;
  // For rotating
  rotateSpeed?: number;
  // Runtime state
  _offsetX?: number;
  _offsetY?: number;
  _timer?: number;
  _visible?: boolean;
  _triggered?: boolean;
  _angle?: number;
  _shakeTimer?: number;
}

export interface Spike {
  x: number;
  y: number;
  w: number;
  h: number;
  direction: 'up' | 'down' | 'left' | 'right';
  hidden?: boolean;
  triggerX?: number; // x position that triggers reveal
  _revealed?: boolean;
  _revealTimer?: number;
}

export interface Saw {
  x: number;
  y: number;
  radius: number;
  pathX?: number[];
  pathY?: number[];
  speed?: number;
  _pathIndex?: number;
  _t?: number;
}

export interface Coin {
  x: number;
  y: number;
  _collected?: boolean;
  _bobPhase?: number;
}

export interface Door {
  x: number;
  y: number;
  w: number;
  h: number;
  fake?: boolean;
  moveToX?: number;
  moveToY?: number;
  _moved?: boolean;
  _moveTimer?: number;
}

export interface Checkpoint {
  x: number;
  y: number;
  _activated?: boolean;
}

export interface TriggerZone {
  x: number;
  y: number;
  w: number;
  h: number;
  action: 'reverse_controls' | 'gravity_flip' | 'jump_change' | 'spawn_spikes' | 'wall_close' | 'falling_blocks';
  duration?: number;
  _triggered?: boolean;
  _data?: any;
}

export interface FallingBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  triggerX?: number;
  _falling?: boolean;
  _vy?: number;
  _delay?: number;
  _delayTimer?: number;
}

export interface Teleporter {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  _cooldown?: number;
}

export interface LevelData {
  id: number;
  name: string;
  world: number;
  width: number;
  height: number;
  spawnX: number;
  spawnY: number;
  bgColor: string;
  bgColor2?: string;
  platforms: Platform[];
  spikes: Spike[];
  saws: Saw[];
  coins: Coin[];
  doors: Door[];
  checkpoints: Checkpoint[];
  triggerZones: TriggerZone[];
  fallingBlocks: FallingBlock[];
  teleporters: Teleporter[];
  hasCheckpoint?: boolean;
  parTime?: number; // ms for 3-star
  message?: string; // Tutorial message
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'square' | 'circle' | 'spark';
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  onGround: boolean;
  jumpsLeft: number;
  maxJumps: number;
  facing: number; // 1 or -1
  isDead: boolean;
  isWinning: boolean;
  dashCooldown: number;
  isDashing: boolean;
  dashTimer: number;
  coyoteTime: number;
  jumpBuffer: number;
  squashX: number;
  squashY: number;
  eyeScale: number;
  // Effects
  reverseControls: boolean;
  reverseTimer: number;
  gravityFlipped: boolean;
  gravityTimer: number;
  jumpMultiplier: number;
  jumpTimer: number;
  invincibleTimer: number;
  trailPositions: Vec2[];
}

export type GameScreen = 'title' | 'levelSelect' | 'playing' | 'paused' | 'dead' | 'levelComplete' | 'settings' | 'skins' | 'achievements' | 'highscores';
