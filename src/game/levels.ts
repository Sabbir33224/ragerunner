import { LevelData } from './types';

const W = 800;
const H = 500;
const TILE = 32;

// Helper to create ground
const ground = (x: number, y: number, w: number, h = TILE) => ({
  x, y, w, h, type: 'solid' as const
});

// Helper to create platform
const plat = (x: number, y: number, w: number, h = TILE) => ({
  x, y, w, h, type: 'solid' as const
});

const fakePlat = (x: number, y: number, w: number) => ({
  x, y, w, h: TILE, type: 'fake' as const
});

const disappearPlat = (x: number, y: number, w: number, delay = 500) => ({
  x, y, w, h: TILE, type: 'disappearing' as const, disappearDelay: delay
});

const movingPlat = (x: number, y: number, w: number, mx: number, my: number, speed = 1, phase = 0) => ({
  x, y, w, h: TILE, type: 'moving' as const, moveX: mx, moveY: my, moveSpeed: speed, movePhase: phase
});

const icePlat = (x: number, y: number, w: number) => ({
  x, y, w, h: TILE, type: 'ice' as const
});

const spike = (x: number, y: number, dir: 'up' | 'down' | 'left' | 'right' = 'up', w = TILE, h = TILE/2) => ({
  x, y, w, h, direction: dir
});

const hiddenSpike = (x: number, y: number, trigX: number, dir: 'up' | 'down' | 'left' | 'right' = 'up') => ({
  x, y, w: TILE, h: TILE/2, direction: dir, hidden: true, triggerX: trigX
});

const saw = (x: number, y: number, r: number, px?: number[], py?: number[], speed = 2) => ({
  x, y, radius: r, pathX: px, pathY: py, speed
});

const coin = (x: number, y: number) => ({ x, y });

const door = (x: number, y: number, fake = false, mx?: number, my?: number) => ({
  x, y, w: 40, h: 56, fake, moveToX: mx, moveToY: my
});

const checkpoint = (x: number, y: number) => ({ x, y });

const trigger = (x: number, y: number, w: number, h: number, action: any, duration = 3000) => ({
  x, y, w, h, action, duration
});

const fallingBlock = (x: number, y: number, w: number, h: number, trigX?: number, delay = 0) => ({
  x, y, w, h, triggerX: trigX, _delay: delay
});

const teleporter = (x: number, y: number, tx: number, ty: number) => ({
  x, y, targetX: tx, targetY: ty
});

export function generateLevels(): LevelData[] {
  const levels: LevelData[] = [];

  // ============ WORLD 1: BEGINNER CHAOS (Levels 1-20) ============

  // Level 1 - Simple run to door
  levels.push({
    id: 1, name: 'First Steps', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#16213e',
    platforms: [
      ground(0, H - TILE, W, TILE), // floor
    ],
    spikes: [],
    saws: [],
    coins: [coin(200, H - 80), coin(350, H - 80), coin(500, H - 80)],
    doors: [door(W - 80, H - TILE - 56)],
    checkpoints: [],
    triggerZones: [],
    fallingBlocks: [],
    teleporters: [],
    message: 'Arrow Keys to move, SPACE to jump!'
  });

  // Level 2 - Simple jump
  levels.push({
    id: 2, name: 'Baby Jump', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#16213e',
    platforms: [
      ground(0, H - TILE, 300, TILE),
      ground(400, H - TILE, 400, TILE),
    ],
    spikes: [spike(320, H - TILE, 'up', 60, 16)],
    saws: [],
    coins: [coin(450, H - 80)],
    doors: [door(W - 80, H - TILE - 56)],
    checkpoints: [],
    triggerZones: [],
    fallingBlocks: [],
    teleporters: [],
    message: 'Jump over the gap!'
  });

  // Level 3 - Multiple platforms
  levels.push({
    id: 3, name: 'Step Up', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#16213e',
    platforms: [
      ground(0, H - TILE, 200, TILE),
      plat(250, H - 80, 100),
      plat(400, H - 140, 100),
      plat(550, H - 200, 100),
      ground(680, H - TILE, 120, TILE),
    ],
    spikes: [],
    saws: [],
    coins: [coin(290, H - 120), coin(440, H - 180), coin(590, H - 240)],
    doors: [door(W - 80, H - TILE - 56)],
    checkpoints: [],
    triggerZones: [],
    fallingBlocks: [],
    teleporters: [],
  });

  // Level 4 - First trap! Floor disappears
  levels.push({
    id: 4, name: 'Trust Issues', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#0f3460',
    platforms: [
      ground(0, H - TILE, 200, TILE),
      disappearPlat(220, H - TILE, 120, 800),
      ground(360, H - TILE, 100, TILE),
      disappearPlat(480, H - TILE, 120, 800),
      ground(620, H - TILE, 180, TILE),
    ],
    spikes: [spike(220, H - 4, 'up', 120, 4)], // death below disappearing
    saws: [],
    coins: [coin(270, H - 80)],
    doors: [door(W - 80, H - TILE - 56)],
    checkpoints: [],
    triggerZones: [],
    fallingBlocks: [],
    teleporters: [],
    message: 'Some floors aren\'t what they seem...'
  });

  // Level 5 - Spikes introduction
  levels.push({
    id: 5, name: 'Pointy Welcome', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#16213e',
    platforms: [
      ground(0, H - TILE, W, TILE),
    ],
    spikes: [
      spike(200, H - TILE - 16, 'up', 32, 16),
      spike(280, H - TILE - 16, 'up', 32, 16),
      spike(360, H - TILE - 16, 'up', 32, 16),
      spike(500, H - TILE - 16, 'up', 64, 16),
    ],
    saws: [],
    coins: [coin(240, H - 100), coin(440, H - 100)],
    doors: [door(W - 80, H - TILE - 56)],
    checkpoints: [],
    triggerZones: [],
    fallingBlocks: [],
    teleporters: [],
  });

  // Level 6 - Moving platform
  levels.push({
    id: 6, name: 'Moving On', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#16213e',
    platforms: [
      ground(0, H - TILE, 180, TILE),
      movingPlat(250, H - 100, 80, 150, 0, 1.5),
      ground(500, H - TILE, 100, TILE),
      movingPlat(620, H - 120, 80, 0, 80, 1),
      plat(720, H - 180, 80),
    ],
    spikes: [],
    saws: [],
    coins: [coin(290, H - 150), coin(660, H - 170)],
    doors: [door(730, H - 180 - 56)],
    checkpoints: [],
    triggerZones: [],
    fallingBlocks: [],
    teleporters: [],
    message: 'Platforms move! Time your jumps.'
  });

  // Level 7 - Fake platform trap
  levels.push({
    id: 7, name: 'Liar Liar', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#0f3460',
    platforms: [
      ground(0, H - TILE, 200, TILE),
      plat(260, H - 80, 80),
      fakePlat(390, H - 80, 80),
      plat(390, H - 140, 80),
      plat(520, H - 80, 80),
      ground(640, H - TILE, 160, TILE),
    ],
    spikes: [],
    saws: [],
    coins: [coin(300, H - 120), coin(430, H - 180)],
    doors: [door(W - 80, H - TILE - 56)],
    checkpoints: [],
    triggerZones: [],
    fallingBlocks: [],
    teleporters: [],
    message: 'Not every platform is real...'
  });

  // Level 8 - Hidden spikes
  levels.push({
    id: 8, name: 'Surprise!', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#16213e',
    platforms: [
      ground(0, H - TILE, W, TILE),
    ],
    spikes: [
      hiddenSpike(300, H - TILE - 16, 250, 'up'),
      hiddenSpike(500, H - TILE - 16, 450, 'up'),
    ],
    saws: [],
    coins: [coin(350, H - 80), coin(600, H - 80)],
    doors: [door(W - 80, H - TILE - 56)],
    checkpoints: [],
    triggerZones: [],
    fallingBlocks: [],
    teleporters: [],
  });

  // Level 9 - Saw blade
  levels.push({
    id: 9, name: 'Buzz Buzz', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#16213e',
    platforms: [
      ground(0, H - TILE, 250, TILE),
      plat(350, H - 120, 100),
      ground(550, H - TILE, 250, TILE),
    ],
    spikes: [],
    saws: [
      saw(400, H - 60, 20, [350, 450], [H - 60, H - 60], 2),
    ],
    coins: [coin(400, H - 170)],
    doors: [door(W - 80, H - TILE - 56)],
    checkpoints: [],
    triggerZones: [],
    fallingBlocks: [],
    teleporters: [],
  });

  // Level 10 - Combo level
  levels.push({
    id: 10, name: 'Getting Real', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#0f3460',
    platforms: [
      ground(0, H - TILE, 150, TILE),
      disappearPlat(180, H - TILE, 80, 600),
      plat(300, H - 100, 80),
      movingPlat(420, H - 160, 80, 100, 0, 1.5),
      plat(600, H - 100, 80),
      ground(700, H - TILE, 100, TILE),
    ],
    spikes: [
      spike(300, H - 100 - 16, 'up', 20, 8),
    ],
    saws: [],
    coins: [coin(220, H - 80), coin(460, H - 200), coin(640, H - 140)],
    doors: [door(W - 60, H - TILE - 56)],
    checkpoints: [checkpoint(400, H - 200)],
    triggerZones: [],
    fallingBlocks: [],
    teleporters: [],
  });

  // Level 11 - Falling blocks
  levels.push({
    id: 11, name: 'Watch Your Head', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#16213e',
    platforms: [ground(0, H - TILE, W, TILE)],
    spikes: [],
    saws: [],
    coins: [coin(300, H - 120), coin(500, H - 120)],
    doors: [door(W - 80, H - TILE - 56)],
    checkpoints: [],
    triggerZones: [],
    fallingBlocks: [
      fallingBlock(250, 40, 48, 48, 220, 0),
      fallingBlock(400, 40, 48, 48, 370, 200),
      fallingBlock(550, 40, 48, 48, 520, 100),
    ],
    teleporters: [],
  });

  // Level 12 - Fake door!
  levels.push({
    id: 12, name: 'Not That Door', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#0f3460',
    platforms: [
      ground(0, H - TILE, W, TILE),
      plat(100, H - 160, 120),
    ],
    spikes: [
      spike(W - 80, H - TILE - 16, 'up', 40, 16), // spikes near fake door
    ],
    saws: [],
    coins: [coin(160, H - 200)],
    doors: [
      door(W - 80, H - TILE - 56, true), // FAKE door
      door(140, H - 160 - 56), // Real door up on platform
    ],
    checkpoints: [],
    triggerZones: [],
    fallingBlocks: [],
    teleporters: [],
    message: 'Not every door leads to safety...'
  });

  // Level 13 - Double jump needed
  levels.push({
    id: 13, name: 'Fly High', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#16213e',
    platforms: [
      ground(0, H - TILE, 150, TILE),
      plat(250, H - 150, 60),
      plat(400, H - 250, 60),
      plat(550, H - 180, 80),
      ground(680, H - TILE, 120, TILE),
    ],
    spikes: [],
    saws: [],
    coins: [coin(280, H - 200), coin(430, H - 300), coin(590, H - 230)],
    doors: [door(W - 70, H - TILE - 56)],
    checkpoints: [],
    triggerZones: [],
    fallingBlocks: [],
    teleporters: [],
    message: 'Press JUMP twice for double jump!'
  });

  // Level 14 - Spike gauntlet
  levels.push({
    id: 14, name: 'Spike Valley', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#0f3460',
    platforms: [ground(0, H - TILE, W, TILE)],
    spikes: Array.from({ length: 8 }, (_, i) => spike(180 + i * 60, H - TILE - 16, 'up', 24, 16)),
    saws: [],
    coins: Array.from({ length: 4 }, (_, i) => coin(210 + i * 120, H - 120)),
    doors: [door(W - 80, H - TILE - 56)],
    checkpoints: [],
    triggerZones: [],
    fallingBlocks: [],
    teleporters: [],
  });

  // Level 15 - Walls closing
  levels.push({
    id: 15, name: 'Closing In', world: 1, width: W, height: H,
    spawnX: 60, spawnY: H - 96,
    bgColor: '#1a1a2e', bgColor2: '#16213e',
    platforms: [
      ground(0, H - TILE, 200, TILE),
      plat(300, H - 100, 200),
      ground(600, H - TILE, 200, TILE),
    ],
    spikes: [],
    saws: [],
    coins: [coin(400, H - 150)],
    doors: [door(W - 80, H - TILE - 56)],
    checkpoints: [],
    triggerZones: [trigger(350, H - 200, 40, 100, 'wall_close', 2000)],
    fallingBlocks: [],
    teleporters: [],
  });

  // Levels 16-20 - Increasing combos
  for (let i = 16; i <= 20; i++) {
    const difficulty = i - 15;
    levels.push({
      id: i, name: `Chaos ${i - 15}`, world: 1, width: W, height: H,
      spawnX: 60, spawnY: H - 96,
      bgColor: '#1a1a2e', bgColor2: i % 2 === 0 ? '#0f3460' : '#16213e',
      platforms: [
        ground(0, H - TILE, 150, TILE),
        ...(difficulty >= 2 ? [disappearPlat(180, H - TILE, 80, 700)] : [plat(180, H - TILE, 80)]),
        movingPlat(300, H - 120, 70, 80 + difficulty * 20, 0, 1 + difficulty * 0.3),
        plat(460, H - 180, 80),
        ...(difficulty >= 3 ? [fakePlat(560, H - 120, 60)] : []),
        plat(560 + (difficulty >= 3 ? 0 : 0), H - (difficulty >= 3 ? 200 : 120), 60),
        ground(660, H - TILE, 140, TILE),
      ],
      spikes: [
        spike(460, H - TILE - 16, 'up', 24, 16),
        ...(difficulty >= 2 ? [spike(660, H - TILE - 16, 'up', 24, 16)] : []),
      ],
      saws: difficulty >= 4 ? [saw(400, H - 60, 16, [380, 420], [H - 60, H - 60], 2)] : [],
      coins: [coin(340, H - 170), coin(500, H - 230)],
      doors: [door(W - 70, H - TILE - 56)],
      checkpoints: difficulty >= 3 ? [checkpoint(460, H - 220)] : [],
      triggerZones: difficulty >= 5 ? [trigger(600, H - 250, 40, 60, 'reverse_controls', 2000)] : [],
      fallingBlocks: [],
      teleporters: [],
    });
  }

  // ============ WORLD 2: TRAP FACTORY (Levels 21-40) ============
  const w2Bg1 = '#2d1b00';
  const w2Bg2 = '#4a2800';

  for (let i = 21; i <= 40; i++) {
    const d = i - 20;
    const numSpikes = 2 + Math.floor(d / 3);
    const numSaws = d >= 5 ? Math.floor((d - 4) / 3) + 1 : 0;
    const hasFake = d >= 3;
    const hasDisappear = d >= 4;
    const hasMoving = d >= 2;
    const hasHidden = d >= 6;
    const hasFalling = d >= 8;
    const hasFakeDoor = d >= 10;
    const hasCheckpoint = d >= 5 && d % 3 === 0;

    const platforms: any[] = [ground(0, H - TILE, 130, TILE)];
    
    // Build path
    let px = 160;
    const segments = 3 + Math.floor(d / 4);
    for (let s = 0; s < segments; s++) {
      const pWidth = 60 + Math.random() * 40;
      const py = H - 60 - Math.random() * 180;
      
      if (hasMoving && s % 3 === 1) {
        platforms.push(movingPlat(px, py, pWidth, 40 + d * 5, 0, 0.8 + d * 0.1, s * 0.5));
      } else if (hasDisappear && s % 4 === 2) {
        platforms.push(disappearPlat(px, py, pWidth, 500 + (20 - d) * 30));
      } else if (hasFake && s === segments - 2) {
        platforms.push(fakePlat(px, py, pWidth));
        platforms.push(plat(px, py - 70, pWidth));
      } else {
        platforms.push(plat(px, py, pWidth));
      }
      px += pWidth + 30 + Math.random() * 40;
    }
    platforms.push(ground(Math.min(px, W - 120), H - TILE, 120, TILE));

    const spikes: any[] = [];
    for (let s = 0; s < numSpikes; s++) {
      spikes.push(spike(150 + s * (W - 200) / numSpikes, H - TILE - 16, 'up', 24, 16));
    }
    if (hasHidden) {
      spikes.push(hiddenSpike(px - 100, H - TILE - 16, px - 150, 'up'));
    }

    const saws: any[] = [];
    for (let s = 0; s < numSaws; s++) {
      const sx = 200 + s * 150;
      saws.push(saw(sx, H - 100, 14 + d / 2, [sx - 30, sx + 30], [H - 100, H - 100], 1.5 + d * 0.1));
    }

    const doors: any[] = [];
    if (hasFakeDoor && d % 5 === 0) {
      doors.push(door(Math.min(px, W - 120) + 20, H - TILE - 56, true));
      doors.push(door(Math.min(px - 200, W - 200), H - 200));
    } else {
      doors.push(door(Math.min(px + 20, W - 60), H - TILE - 56));
    }

    const coins: any[] = [];
    for (let c = 0; c < 2 + Math.floor(d / 5); c++) {
      coins.push(coin(160 + c * 120, H - 200 - Math.random() * 80));
    }

    levels.push({
      id: i, name: `Factory ${d}`, world: 2, width: W, height: H,
      spawnX: 60, spawnY: H - 96,
      bgColor: w2Bg1, bgColor2: w2Bg2,
      platforms, spikes, saws, coins, doors,
      checkpoints: hasCheckpoint ? [checkpoint(W / 2, H - 200)] : [],
      triggerZones: d >= 12 ? [trigger(W / 2 - 20, H - 300, 40, 100, d % 2 === 0 ? 'reverse_controls' : 'gravity_flip', 1500 + d * 100)] : [],
      fallingBlocks: hasFalling ? [fallingBlock(W / 2, 30, 40, 40, W / 2 - 30)] : [],
      teleporters: d >= 15 ? [teleporter(W / 2, H - 60, 100, H - 200)] : [],
    });
  }

  // ============ WORLD 3: NIGHTMARE CITY (Levels 41-60) ============
  const w3Bg1 = '#0d0221';
  const w3Bg2 = '#1a0536';

  for (let i = 41; i <= 60; i++) {
    const d = i - 40;
    const platforms: any[] = [ground(0, H - TILE, 110, TILE)];
    
    let px = 140;
    const segs = 4 + Math.floor(d / 4);
    for (let s = 0; s < segs; s++) {
      const pw = 45 + Math.random() * 35;
      const py = H - 50 - Math.random() * 200;
      const rnd = Math.random();
      if (rnd < 0.25) platforms.push(movingPlat(px, py, pw, 30 + d * 8, d >= 10 ? 40 : 0, 1 + d * 0.15, s));
      else if (rnd < 0.4) platforms.push(disappearPlat(px, py, pw, 400));
      else if (rnd < 0.5) platforms.push(fakePlat(px, py, pw));
      else if (rnd < 0.6) platforms.push(icePlat(px, py, pw));
      else platforms.push(plat(px, py, pw));
      px += pw + 25 + Math.random() * 35;
    }
    platforms.push(ground(Math.min(px, W - 100), H - TILE, 100, TILE));

    const spikes: any[] = [];
    for (let s = 0; s < 3 + d / 2; s++) {
      const dir = s % 3 === 0 ? 'up' : s % 3 === 1 ? 'down' : 'left';
      spikes.push(spike(130 + s * 80, dir === 'up' ? H - TILE - 16 : dir === 'down' ? 20 : H / 2, dir, 20, 12));
    }

    const saws: any[] = [];
    for (let s = 0; s < 1 + Math.floor(d / 4); s++) {
      const sx = 200 + s * 160;
      saws.push(saw(sx, H / 2, 16, [sx - 50, sx + 50], [H / 2 - 40, H / 2 + 40], 2 + d * 0.15));
    }

    levels.push({
      id: i, name: `Nightmare ${d}`, world: 3, width: W, height: H,
      spawnX: 50, spawnY: H - 96,
      bgColor: w3Bg1, bgColor2: w3Bg2,
      platforms, spikes, saws,
      coins: Array.from({ length: 3 }, (_, c) => coin(150 + c * 150, H - 250)),
      doors: d % 7 === 0 
        ? [door(W - 60, H - TILE - 56, true), door(Math.min(px - 100, W - 150), H - 250)]
        : [door(Math.min(px + 10, W - 50), H - TILE - 56)],
      checkpoints: d % 3 === 0 ? [checkpoint(W / 2, H - 250)] : [],
      triggerZones: d >= 5 ? [trigger(W / 3, H - 200, 30, 80, ['reverse_controls', 'gravity_flip', 'jump_change'][d % 3] as any, 2000)] : [],
      fallingBlocks: d >= 3 ? Array.from({ length: Math.min(d / 3, 4) }, (_, b) => fallingBlock(150 + b * 140, 20, 36, 36, 130 + b * 140, b * 300)) : [],
      teleporters: d >= 10 ? [teleporter(W * 0.7, H - 80, 100, H - 300)] : [],
    });
  }

  // ============ WORLD 4: IMPOSSIBLE DIMENSION (Levels 61-80) ============
  const w4Bg1 = '#1a0000';
  const w4Bg2 = '#330000';

  for (let i = 61; i <= 80; i++) {
    const d = i - 60;
    const platforms: any[] = [ground(0, H - TILE, 90, TILE)];
    
    let px = 110;
    const segs = 5 + Math.floor(d / 3);
    for (let s = 0; s < segs; s++) {
      const pw = 35 + Math.random() * 30;
      const py = H - 40 - Math.random() * 220;
      const rnd = Math.random();
      if (rnd < 0.3) platforms.push(movingPlat(px, py, pw, 40 + d * 10, 30 + d * 5, 1.5 + d * 0.2, s * 0.7));
      else if (rnd < 0.45) platforms.push(disappearPlat(px, py, pw, 300));
      else if (rnd < 0.55) platforms.push(fakePlat(px, py, pw));
      else if (rnd < 0.65) platforms.push(icePlat(px, py, pw));
      else platforms.push(plat(px, py, pw));
      px += pw + 20 + Math.random() * 30;
    }
    platforms.push(ground(Math.min(px, W - 80), H - TILE, 80, TILE));

    const spikes: any[] = [];
    for (let s = 0; s < 4 + d; s++) {
      const dirs: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
      spikes.push(spike(100 + s * 55, 
        s % 2 === 0 ? H - TILE - 16 : 10, 
        dirs[s % 4], 18, 12));
    }

    const saws: any[] = [];
    for (let s = 0; s < 2 + Math.floor(d / 3); s++) {
      const sx = 180 + s * 120;
      saws.push(saw(sx, H / 2, 18, [sx - 60, sx + 60], [H / 2 - 60, H / 2 + 60], 2.5 + d * 0.2));
    }

    levels.push({
      id: i, name: `Impossible ${d}`, world: 4, width: W, height: H,
      spawnX: 40, spawnY: H - 96,
      bgColor: w4Bg1, bgColor2: w4Bg2,
      platforms, spikes, saws,
      coins: Array.from({ length: 4 }, (_, c) => coin(120 + c * 130, H - 280)),
      doors: d % 5 === 0 
        ? [door(W - 50, H - TILE - 56, true), door(200, 80)]
        : [door(Math.min(px + 5, W - 50), H - TILE - 56)],
      checkpoints: d % 4 === 0 ? [checkpoint(W / 2, H - 300)] : [],
      triggerZones: [
        trigger(W / 4, H - 180, 25, 60, ['reverse_controls', 'gravity_flip', 'jump_change'][d % 3] as any, 1500 + d * 50),
        ...(d >= 10 ? [trigger(W * 0.6, H - 180, 25, 60, 'falling_blocks', 0)] : []),
      ],
      fallingBlocks: Array.from({ length: Math.min(2 + d / 3, 6) }, (_, b) => fallingBlock(100 + b * 100, 10, 32, 32, 80 + b * 100, b * 200)),
      teleporters: d >= 5 ? [teleporter(W * 0.8, H - 60, 60, 100)] : [],
    });
  }

  // ============ WORLD 5: FINAL RAGE (Levels 81-100) ============
  const w5Bg1 = '#000000';
  const w5Bg2 = '#1a0020';

  for (let i = 81; i <= 100; i++) {
    const d = i - 80;
    const platforms: any[] = [ground(0, H - TILE, 70, TILE)];
    
    let px = 90;
    const segs = 6 + Math.floor(d / 2);
    for (let s = 0; s < segs; s++) {
      const pw = 30 + Math.random() * 25;
      const py = H - 30 - Math.random() * 240;
      const rnd = Math.random();
      if (rnd < 0.35) platforms.push(movingPlat(px, py, pw, 50 + d * 12, 40 + d * 8, 2 + d * 0.25, s * 0.5));
      else if (rnd < 0.5) platforms.push(disappearPlat(px, py, pw, 250));
      else if (rnd < 0.6) platforms.push(fakePlat(px, py, pw));
      else if (rnd < 0.7) platforms.push(icePlat(px, py, pw));
      else platforms.push(plat(px, py, pw));
      px += pw + 15 + Math.random() * 25;
    }
    platforms.push(ground(Math.min(px, W - 60), H - TILE, 60, TILE));

    const spikes: any[] = [];
    for (let s = 0; s < 5 + d * 1.5; s++) {
      const dirs: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
      spikes.push(spike(80 + (s * 40) % (W - 100),
        s % 2 === 0 ? H - TILE - 16 : 5,
        dirs[s % 4], 16, 10));
    }
    // Add hidden spikes
    for (let s = 0; s < d / 3; s++) {
      spikes.push(hiddenSpike(200 + s * 120, H - TILE - 16, 180 + s * 120, 'up'));
    }

    const saws: any[] = [];
    for (let s = 0; s < 3 + Math.floor(d / 2); s++) {
      const sx = 150 + s * 90;
      saws.push(saw(sx, 100 + Math.random() * 200, 20, 
        [sx - 70, sx + 70], 
        [100 + Math.random() * 100, 250 + Math.random() * 100], 
        3 + d * 0.3));
    }

    levels.push({
      id: i, name: i === 100 ? 'FINAL RAGE' : `Rage ${d}`, world: 5, width: W, height: H,
      spawnX: 30, spawnY: H - 96,
      bgColor: w5Bg1, bgColor2: w5Bg2,
      platforms, spikes, saws,
      coins: Array.from({ length: 5 }, (_, c) => coin(100 + c * 120, 80 + Math.random() * 100)),
      doors: d % 4 === 0 
        ? [door(W - 40, H - TILE - 56, true), door(W / 2, 60)]
        : [door(Math.min(px + 5, W - 40), H - TILE - 56)],
      checkpoints: d % 5 === 0 ? [checkpoint(W / 2, H - 350)] : [],
      triggerZones: [
        trigger(W / 5, H - 160, 20, 50, 'reverse_controls', 1200),
        trigger(W * 0.5, H - 160, 20, 50, 'gravity_flip', 1000),
        ...(d >= 5 ? [trigger(W * 0.7, H - 160, 20, 50, 'jump_change', 1500)] : []),
      ],
      fallingBlocks: Array.from({ length: Math.min(3 + d / 2, 8) }, (_, b) => fallingBlock(70 + b * 80, 5, 28, 28, 50 + b * 80, b * 150)),
      teleporters: d >= 3 ? [teleporter(W * 0.85, H - 50, 50, 80)] : [],
    });
  }

  return levels;
}

export const WORLD_NAMES = [
  '', // index 0
  'Beginner Chaos',
  'Trap Factory',
  'Nightmare City',
  'Impossible Dimension',
  'Final Rage'
];

export const WORLD_COLORS = [
  '',
  '#1a1a2e',
  '#2d1b00',
  '#0d0221',
  '#1a0000',
  '#000000'
];
