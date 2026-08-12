import { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { generateLevels, WORLD_NAMES } from './game/levels';
import { SaveManager } from './game/SaveManager';
import { AudioManager } from './audio/AudioManager';
import { GameScreen } from './game/types';
import {
  PlayIcon, PauseIcon, RestartIcon,
  ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, DashIcon,
  SkullIcon, CoinIcon,
  TrophyIcon, ChartIcon, SettingsIcon, PaletteIcon,
  DoorIcon, StarIcon, StarOutlineIcon, LockIcon,
  MusicIcon, SpeakerIcon, VolumeIcon, TrashIcon, CheckIcon,
  HomeIcon, ForwardIcon, CelebrationIcon, AngryFaceIcon,
  ColorSwatch,
  GoldMedalIcon, SilverMedalIcon, BronzeMedalIcon,
  MedalIcon, SparkleIcon, FlameIcon, LeafIcon, GearIcon, MoonIcon,
  TrendUpIcon,
} from './components/Icons';

const LEVELS = generateLevels();

const SKINS = [
  { id: 'default', name: 'Blobby', color: '#ff8c42', cost: 0 },
  { id: 'blue', name: 'Frosty', color: '#4299e1', cost: 50 },
  { id: 'green', name: 'Slimey', color: '#48bb78', cost: 50 },
  { id: 'pink', name: 'Bubbly', color: '#ed64a6', cost: 100 },
  { id: 'purple', name: 'Mystic', color: '#9f7aea', cost: 100 },
  { id: 'gold', name: 'Golden', color: '#ffd700', cost: 200 },
  { id: 'red', name: 'Angry', color: '#e53e3e', cost: 150 },
  { id: 'white', name: 'Ghost', color: '#f7fafc', cost: 300 },
];

const ACHIEVEMENTS: { id: string; name: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'first_win', name: 'First Steps', desc: 'Complete your first level', icon: <TrophyIcon size={24} color="#ffd700" /> },
  { id: 'ten_levels', name: 'Getting Good', desc: 'Complete 10 levels', icon: <StarIcon size={24} color="#ffd700" /> },
  { id: 'quarter', name: 'Quarter Master', desc: 'Complete 25 levels', icon: <MedalIcon size={24} color="#ffd700" /> },
  { id: 'rage_100', name: 'Rage Starter', desc: 'Die 100 times', icon: <SkullIcon size={24} color="#e53e3e" /> },
  { id: 'rage_500', name: 'Rage Master', desc: 'Die 500 times', icon: <SkullIcon size={24} color="#ff4444" /> },
  { id: 'rich', name: 'Coin Collector', desc: 'Collect 100 coins', icon: <CoinIcon size={24} /> },
  { id: 'no_death', name: 'Perfect Run', desc: 'Complete a level with 0 deaths', icon: <SparkleIcon size={24} color="#ffd700" /> },
];

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedWorld, setSelectedWorld] = useState(1);
  const [saveData, setSaveData] = useState(SaveManager.load());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [, setShowDeathCount] = useState(0);
  const [gameWidth, setGameWidth] = useState(800);
  const [gameHeight, setGameHeight] = useState(500);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive canvas sizing
  useEffect(() => {
    const resize = () => {
      const maxW = Math.min(window.innerWidth, 900);
      const maxH = Math.min(window.innerHeight - (screen === 'playing' ? 80 : 0), 562);
      const aspect = 800 / 500;
      let w = maxW;
      let h = w / aspect;
      if (h > maxH) { h = maxH; w = h * aspect; }
      setGameWidth(Math.floor(w));
      setGameHeight(Math.floor(h));
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [screen]);

  // Init audio on first interaction
  useEffect(() => {
    const handler = () => {
      AudioManager.init();
      AudioManager.resume();
    };
    window.addEventListener('click', handler, { once: true });
    window.addEventListener('touchstart', handler, { once: true });
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, []);

  const refreshSave = useCallback(() => {
    setSaveData({ ...SaveManager.load() });
  }, []);

  const startLevel = useCallback((levelId: number) => {
    const levelData = LEVELS.find(l => l.id === levelId);
    if (!levelData) return;

    setCurrentLevel(levelId);
    setScreen('playing');
    setShowDeathCount(0);

    AudioManager.init();
    AudioManager.resume();
    AudioManager.stopMusic();

    setTimeout(() => {
      if (!canvasRef.current) return;
      if (engineRef.current) {
        engineRef.current.stop();
      }
      const canvas = canvasRef.current;
      canvas.width = 800;
      canvas.height = 500;

      const engine = new GameEngine(canvas);
      engineRef.current = engine;
      engine.loadLevel(levelData);

      engine.onDeath = () => {
        setShowDeathCount(prev => prev + 1);
      };

      engine.onLevelComplete = (time: number, deaths: number, coins: number) => {
        SaveManager.completeLevel(levelId, time, deaths, coins);
        refreshSave();
        setTimeout(() => {
          engine.stop();
          setScreen('levelComplete');
        }, 500);
      };

      engine.start();
    }, 50);
  }, [refreshSave]);

  const handlePause = useCallback(() => {
    if (engineRef.current) engineRef.current.pause();
    setScreen('paused');
  }, []);

  const handleResume = useCallback(() => {
    if (engineRef.current) engineRef.current.resume();
    setScreen('playing');
  }, []);

  const handleRestart = useCallback(() => {
    if (engineRef.current) engineRef.current.stop();
    startLevel(currentLevel);
  }, [currentLevel, startLevel]);

  const handleQuit = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }
    setScreen('levelSelect');
  }, []);

  const handleNextLevel = useCallback(() => {
    const nextLevel = currentLevel + 1;
    if (nextLevel <= LEVELS.length) {
      startLevel(nextLevel);
    } else {
      setScreen('title');
    }
  }, [currentLevel, startLevel]);

  // Keyboard pause handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (screen === 'playing') handlePause();
        else if (screen === 'paused') handleResume();
      }
      if (e.code === 'KeyR' && screen === 'playing') handleRestart();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, handlePause, handleResume, handleRestart]);

  // ==================== TOUCH CONTROLS ====================

  const touchControls = screen === 'playing' && (
    <div className="flex justify-between items-end w-full px-2 pb-2 select-none" style={{ maxWidth: gameWidth }}>
      {/* Left side: D-pad */}
      <div className="flex gap-1.5">
        <button
          className="w-16 h-16 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center active:bg-white/25 transition-colors touch-none"
          onTouchStart={(e) => { e.preventDefault(); if (engineRef.current) engineRef.current.touchLeft = true; }}
          onTouchEnd={(e) => { e.preventDefault(); if (engineRef.current) engineRef.current.touchLeft = false; }}
          onMouseDown={() => { if (engineRef.current) engineRef.current.touchLeft = true; }}
          onMouseUp={() => { if (engineRef.current) engineRef.current.touchLeft = false; }}
          onMouseLeave={() => { if (engineRef.current) engineRef.current.touchLeft = false; }}
        >
          <ArrowLeftIcon size={28} color="#ffffff" />
        </button>
        <button
          className="w-16 h-16 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center active:bg-white/25 transition-colors touch-none"
          onTouchStart={(e) => { e.preventDefault(); if (engineRef.current) engineRef.current.touchRight = true; }}
          onTouchEnd={(e) => { e.preventDefault(); if (engineRef.current) engineRef.current.touchRight = false; }}
          onMouseDown={() => { if (engineRef.current) engineRef.current.touchRight = true; }}
          onMouseUp={() => { if (engineRef.current) engineRef.current.touchRight = false; }}
          onMouseLeave={() => { if (engineRef.current) engineRef.current.touchRight = false; }}
        >
          <ArrowRightIcon size={28} color="#ffffff" />
        </button>
      </div>

      {/* Right side: Action buttons */}
      <div className="flex gap-1.5">
        <button
          className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-center active:bg-amber-500/35 transition-colors touch-none"
          onTouchStart={(e) => { e.preventDefault(); if (engineRef.current) engineRef.current.touchDash = true; }}
          onTouchEnd={(e) => { e.preventDefault(); if (engineRef.current) engineRef.current.touchDash = false; }}
          onMouseDown={() => { if (engineRef.current) engineRef.current.touchDash = true; }}
          onMouseUp={() => { if (engineRef.current) engineRef.current.touchDash = false; }}
          onMouseLeave={() => { if (engineRef.current) engineRef.current.touchDash = false; }}
        >
          <DashIcon size={26} color="#f59e0b" />
        </button>
        <button
          className="w-20 h-16 bg-green-500/15 border border-green-500/30 rounded-xl flex items-center justify-center active:bg-green-500/35 transition-colors touch-none"
          onTouchStart={(e) => { e.preventDefault(); if (engineRef.current) engineRef.current.touchJump = true; }}
          onTouchEnd={(e) => { e.preventDefault(); if (engineRef.current) engineRef.current.touchJump = false; }}
          onMouseDown={() => { if (engineRef.current) engineRef.current.touchJump = true; }}
          onMouseUp={() => { if (engineRef.current) engineRef.current.touchJump = false; }}
          onMouseLeave={() => { if (engineRef.current) engineRef.current.touchJump = false; }}
        >
          <ArrowUpIcon size={30} color="#22c55e" />
        </button>
      </div>
    </div>
  );

  // ==================== TITLE SCREEN ====================

  if (screen === 'title') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 overflow-auto">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-10"
              style={{
                width: 4 + Math.random() * 8,
                height: 4 + Math.random() * 8,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#ff8c42', '#e53e3e', '#ffd700', '#48bb78'][i % 4],
                animation: `float ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-3 p-4" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          {/* Logo */}
          <div className="mb-1" style={{ animation: 'float 2s ease-in-out infinite' }}>
            <AngryFaceIcon size={72} />
          </div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400 tracking-tight">
            RAGE RUNNER
          </h1>
          <p className="text-gray-400 text-sm tracking-wider">A Troll Platformer by RageWorks</p>

          {/* Stats bar */}
          <div className="flex gap-5 text-xs text-gray-500 mt-1 items-center">
            <span className="flex items-center gap-1"><CoinIcon size={14} /> {saveData.totalCoins}</span>
            <span className="flex items-center gap-1"><SkullIcon size={14} color="#9ca3af" /> {saveData.totalDeaths}</span>
            <span className="flex items-center gap-1"><ChartIcon size={14} color="#9ca3af" /> Lv.{saveData.currentLevel}</span>
          </div>

          {/* Main buttons */}
          <div className="flex flex-col gap-2 mt-4 w-64">
            <MenuButton onClick={() => { AudioManager.init(); AudioManager.playClick(); setScreen('levelSelect'); }} primary>
              <PlayIcon size={18} /> PLAY
            </MenuButton>
            <MenuButton onClick={() => { AudioManager.playClick(); setScreen('skins'); }}>
              <PaletteIcon size={18} /> SKINS
            </MenuButton>
            <MenuButton onClick={() => { AudioManager.playClick(); setScreen('achievements'); }}>
              <TrophyIcon size={18} /> ACHIEVEMENTS
            </MenuButton>
            <MenuButton onClick={() => { AudioManager.playClick(); setScreen('highscores'); }}>
              <ChartIcon size={18} /> HIGH SCORES
            </MenuButton>
            <MenuButton onClick={() => { AudioManager.playClick(); setScreen('settings'); }}>
              <SettingsIcon size={18} /> SETTINGS
            </MenuButton>
          </div>

          <p className="text-gray-600 text-xs mt-4 text-center leading-relaxed">
            Controls: Arrow Keys / WASD to move<br />
            Space / Up to Jump &middot; Shift to Dash &middot; R Restart &middot; Esc Pause
          </p>
        </div>
      </div>
    );
  }

  // ==================== LEVEL SELECT ====================

  if (screen === 'levelSelect') {
    const worldLevels = LEVELS.filter(l => l.world === selectedWorld);
    return (
      <div className="w-full h-full flex flex-col items-center bg-gradient-to-b from-gray-950 to-gray-900 overflow-auto p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { AudioManager.playClick(); setScreen('title'); }} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
              <ArrowLeftIcon size={24} />
            </button>
            <h2 className="text-xl font-bold text-white">SELECT LEVEL</h2>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <CoinIcon size={16} /> {saveData.totalCoins}
            </div>
          </div>

          {/* World tabs */}
          <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5].map(w => {
              const worldIcons = [null, <LeafIcon key="l" size={12} />, <GearIcon key="g" size={12} />, <MoonIcon key="m" size={12} />, <FlameIcon key="f" size={12} />, <SkullIcon key="s" size={12} />];
              return (
                <button
                  key={w}
                  onClick={() => { AudioManager.playClick(); setSelectedWorld(w); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedWorld === w
                      ? 'bg-orange-500 text-white scale-105'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {worldIcons[w]}
                  {WORLD_NAMES[w]}
                </button>
              );
            })}
          </div>

          {/* Level grid */}
          <div className="grid grid-cols-5 gap-2">
            {worldLevels.map(level => {
              const save = SaveManager.getLevelSave(level.id);
              const unlocked = SaveManager.isLevelUnlocked(level.id);
              const completed = save?.completed;
              const stars = save?.stars || 0;

              return (
                <button
                  key={level.id}
                  onClick={() => {
                    if (unlocked) { AudioManager.playClick(); startLevel(level.id); }
                  }}
                  disabled={!unlocked}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                    completed ? 'bg-green-900/50 border border-green-700 hover:bg-green-800/50' :
                    unlocked ? 'bg-gray-800 border border-gray-600 hover:bg-gray-700 hover:scale-105' :
                    'bg-gray-900 border border-gray-800 opacity-40 cursor-not-allowed'
                  }`}
                >
                  {unlocked ? (
                    <>
                      <span className={`font-bold text-lg ${completed ? 'text-green-400' : 'text-white'}`}>
                        {level.id}
                      </span>
                      {completed && (
                        <span className="flex">
                          {Array.from({ length: 3 }).map((_, i) => (
                            i < stars
                              ? <StarIcon key={i} size={10} color="#facc15" />
                              : <StarOutlineIcon key={i} size={10} color="#555" />
                          ))}
                        </span>
                      )}
                      {save && (
                        <span className="text-gray-500 text-[9px] flex items-center gap-0.5 mt-0.5">
                          <SkullIcon size={8} color="#6b7280" />{save.deaths}
                        </span>
                      )}
                    </>
                  ) : (
                    <LockIcon size={20} color="#4b5563" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==================== PLAYING / PAUSED ====================

  if (screen === 'playing' || screen === 'paused') {
    return (
      <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center bg-black">
        <div className="relative" style={{ width: gameWidth, height: gameHeight }}>
          <canvas
            ref={canvasRef}
            style={{ width: gameWidth, height: gameHeight }}
            className="block"
          />
          {/* Pause button */}
          <button
            onClick={handlePause}
            className="absolute top-1 right-1 w-8 h-8 bg-black/50 rounded flex items-center justify-center hover:bg-black/70 z-10 transition"
          >
            <PauseIcon size={16} color="#ffffff" />
          </button>
          {/* Restart button */}
          <button
            onClick={handleRestart}
            className="absolute top-1 right-11 w-8 h-8 bg-black/50 rounded flex items-center justify-center hover:bg-black/70 z-10 transition"
          >
            <RestartIcon size={14} color="#ffffff" />
          </button>

          {/* Pause overlay */}
          {screen === 'paused' && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20" style={{ animation: 'fadeIn 0.2s ease-out' }}>
              <h2 className="text-3xl font-black text-white mb-6">PAUSED</h2>
              <div className="flex flex-col gap-3 w-48">
                <MenuButton onClick={handleResume} primary>
                  <PlayIcon size={18} /> RESUME
                </MenuButton>
                <MenuButton onClick={handleRestart}>
                  <RestartIcon size={16} /> RESTART
                </MenuButton>
                <MenuButton onClick={handleQuit}>
                  <DoorIcon size={18} /> QUIT
                </MenuButton>
              </div>
            </div>
          )}
        </div>

        {touchControls}
      </div>
    );
  }

  // ==================== LEVEL COMPLETE ====================

  if (screen === 'levelComplete') {
    const save = SaveManager.getLevelSave(currentLevel);
    const stars = save?.stars || 0;
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-green-950 to-gray-950">
        <div className="flex flex-col items-center gap-4 p-6" style={{ animation: 'bounceIn 0.4s ease-out' }}>
          <div style={{ animation: 'float 2s ease-in-out infinite' }}>
            <CelebrationIcon size={72} />
          </div>
          <h2 className="text-3xl font-black text-green-400">LEVEL COMPLETE!</h2>

          {/* Star rating */}
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              i < stars
                ? <StarIcon key={i} size={36} color="#facc15" />
                : <StarOutlineIcon key={i} size={36} color="#555" />
            ))}
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 w-64 space-y-2">
            <StatRow label="Level" value={`${currentLevel}`} />
            <StatRow label="Time" value={`${((save?.bestTime || 0) / 1000).toFixed(2)}s`} />
            <StatRow label="Deaths" value={`${save?.deaths || 0}`} />
            <StatRow label="Coins" value={`${save?.coins || 0}`} />
            <StatRow label="Attempts" value={`${save?.attempts || 1}`} />
          </div>

          <div className="flex gap-3 mt-2">
            <MenuButton onClick={handleRestart}>
              <RestartIcon size={16} /> Retry
            </MenuButton>
            <MenuButton onClick={handleNextLevel} primary>
              {currentLevel < LEVELS.length
                ? <><ForwardIcon size={18} /> Next Level</>
                : <><HomeIcon size={18} /> Menu</>
              }
            </MenuButton>
          </div>
          <button onClick={handleQuit} className="text-gray-500 text-sm hover:text-gray-300 transition mt-1">
            Back to levels
          </button>
        </div>
      </div>
    );
  }

  // ==================== SKINS ====================

  if (screen === 'skins') {
    return (
      <div className="w-full h-full flex flex-col items-center bg-gradient-to-b from-gray-950 to-gray-900 overflow-auto p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setScreen('title')} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
              <ArrowLeftIcon size={24} />
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PaletteIcon size={22} /> SKINS
            </h2>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <CoinIcon size={16} /> {saveData.totalCoins}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SKINS.map(skin => {
              const owned = saveData.unlockedSkins.includes(skin.id);
              const equipped = saveData.currentSkin === skin.id;
              const canBuy = saveData.totalCoins >= skin.cost;

              return (
                <button
                  key={skin.id}
                  onClick={() => {
                    AudioManager.playClick();
                    if (equipped) return;
                    if (owned) { SaveManager.setSkin(skin.id); refreshSave(); }
                    else if (canBuy) {
                      SaveManager.addCoins(-skin.cost);
                      SaveManager.unlockSkin(skin.id);
                      SaveManager.setSkin(skin.id);
                      refreshSave();
                    }
                  }}
                  className={`p-4 rounded-xl border transition-all flex flex-col items-center ${
                    equipped ? 'border-orange-500 bg-orange-500/10' :
                    owned ? 'border-gray-600 bg-gray-800 hover:bg-gray-700' :
                    'border-gray-700 bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  <ColorSwatch color={skin.color} size={40} />
                  <div className="font-bold text-white text-sm mt-2">{skin.name}</div>
                  {equipped && (
                    <div className="text-orange-400 text-xs flex items-center gap-1 mt-0.5">
                      <CheckIcon size={12} color="#fb923c" /> Equipped
                    </div>
                  )}
                  {owned && !equipped && <div className="text-green-400 text-xs mt-0.5">Owned</div>}
                  {!owned && (
                    <div className={`text-xs flex items-center gap-1 mt-0.5 ${canBuy ? 'text-yellow-400' : 'text-gray-500'}`}>
                      <CoinIcon size={12} /> {skin.cost}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==================== ACHIEVEMENTS ====================

  if (screen === 'achievements') {
    return (
      <div className="w-full h-full flex flex-col items-center bg-gradient-to-b from-gray-950 to-gray-900 overflow-auto p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setScreen('title')} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
              <ArrowLeftIcon size={24} />
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrophyIcon size={22} /> ACHIEVEMENTS
            </h2>
            <div className="text-sm text-gray-400">{saveData.achievements.length}/{ACHIEVEMENTS.length}</div>
          </div>

          <div className="space-y-2">
            {ACHIEVEMENTS.map(a => {
              const unlocked = saveData.achievements.includes(a.id);
              return (
                <div key={a.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                  unlocked ? 'bg-yellow-900/20 border border-yellow-700/30' : 'bg-gray-800/50 border border-gray-700/30 opacity-50'
                }`}>
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    {unlocked ? a.icon : <LockIcon size={20} color="#6b7280" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm">{a.name}</div>
                    <div className="text-gray-400 text-xs">{a.desc}</div>
                  </div>
                  {unlocked && <CheckIcon size={18} color="#4ade80" className="shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==================== HIGH SCORES ====================

  if (screen === 'highscores') {
    const scores = SaveManager.getHighScores();
    return (
      <div className="w-full h-full flex flex-col items-center bg-gradient-to-b from-gray-950 to-gray-900 overflow-auto p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setScreen('title')} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
              <ArrowLeftIcon size={24} />
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ChartIcon size={22} /> HIGH SCORES
            </h2>
            <div />
          </div>

          {scores.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">No scores yet. Play some levels!</p>
          ) : (
            <div className="space-y-2">
              {scores.map((score, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                  i < 3 ? 'bg-yellow-900/20 border border-yellow-700/30' : 'bg-gray-800/50'
                }`}>
                  <span className={`font-bold text-lg w-8 ${
                    i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    #{i + 1}
                  </span>
                  <span className="text-white font-bold flex-1">{score.toLocaleString()}</span>
                  {i === 0 && <GoldMedalIcon size={24} />}
                  {i === 1 && <SilverMedalIcon size={24} />}
                  {i === 2 && <BronzeMedalIcon size={24} />}
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 bg-gray-800/50 rounded-xl p-4 space-y-2">
            <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
              <TrendUpIcon size={16} color="#fff" /> Overall Stats
            </h3>
            <StatRow label="Total Deaths" value={`${saveData.totalDeaths}`} />
            <StatRow label="Total Coins" value={`${saveData.totalCoins}`} />
            <StatRow label="Levels Cleared" value={`${Object.values(saveData.levels).filter(l => l.completed).length}`} />
            <StatRow label="Current Level" value={`${saveData.currentLevel}`} />
          </div>
        </div>
      </div>
    );
  }

  // ==================== SETTINGS ====================

  if (screen === 'settings') {
    return (
      <div className="w-full h-full flex flex-col items-center bg-gradient-to-b from-gray-950 to-gray-900 overflow-auto p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setScreen('title')} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
              <ArrowLeftIcon size={24} />
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <SettingsIcon size={22} /> SETTINGS
            </h2>
            <div />
          </div>

          <div className="space-y-4">
            {/* Music toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-white text-sm flex items-center gap-2">
                <MusicIcon size={18} /> Music
              </span>
              <button
                onClick={() => { AudioManager.toggleMusic(); refreshSave(); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  AudioManager.getMusicOn() ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {AudioManager.getMusicOn() ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* SFX toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-white text-sm flex items-center gap-2">
                <SpeakerIcon size={18} /> Sound Effects
              </span>
              <button
                onClick={() => { AudioManager.toggleSfx(); refreshSave(); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  AudioManager.getSfxOn() ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {AudioManager.getSfxOn() ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Volume */}
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <span className="text-white text-sm flex items-center gap-2">
                <VolumeIcon size={18} /> Volume
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={AudioManager.getVolume() * 100}
                onChange={(e) => AudioManager.setVolume(parseInt(e.target.value) / 100)}
                className="w-full mt-2 accent-orange-500"
              />
            </div>

            {/* Reset progress */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset ALL progress? This cannot be undone!')) {
                  SaveManager.resetAll();
                  refreshSave();
                }
              }}
              className="w-full p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-400 text-sm hover:bg-red-900/50 transition flex items-center justify-center gap-2"
            >
              <TrashIcon size={16} color="#f87171" /> Reset All Progress
            </button>

            {/* About */}
            <div className="p-4 bg-gray-800/30 rounded-lg text-center">
              <p className="text-white font-bold">RAGE RUNNER</p>
              <p className="text-gray-400 text-xs">by RageWorks</p>
              <p className="text-gray-500 text-xs mt-1">v1.0 — Original Troll Platformer</p>
              <p className="text-gray-600 text-xs mt-2">2025 RageWorks. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ==================== UI Components ====================

function MenuButton({ children, onClick, primary = false }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 hover:scale-105 flex items-center justify-center gap-2 ${
        primary
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50'
          : 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700 hover:border-gray-600'
      }`}
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      {children}
    </button>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}
