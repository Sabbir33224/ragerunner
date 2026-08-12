// Save Manager - handles all persistence via localStorage

export interface LevelSave {
  completed: boolean;
  bestTime: number; // ms
  deaths: number;
  attempts: number;
  stars: number; // 0-3
  coins: number;
}

export interface GameSave {
  currentLevel: number;
  totalCoins: number;
  totalDeaths: number;
  unlockedSkins: string[];
  currentSkin: string;
  levels: Record<number, LevelSave>;
  achievements: string[];
  highScores: number[];
}

const DEFAULT_SAVE: GameSave = {
  currentLevel: 1,
  totalCoins: 0,
  totalDeaths: 0,
  unlockedSkins: ['default'],
  currentSkin: 'default',
  levels: {},
  achievements: [],
  highScores: [],
};

class SaveManagerClass {
  private data: GameSave = { ...DEFAULT_SAVE };
  private key = 'rage_runner_save';

  load(): GameSave {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        this.data = { ...DEFAULT_SAVE, ...JSON.parse(raw) };
      }
    } catch {
      this.data = { ...DEFAULT_SAVE };
    }
    return this.data;
  }

  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    } catch {}
  }

  getData(): GameSave { return this.data; }

  completeLevel(level: number, time: number, deaths: number, coins: number) {
    const existing = this.data.levels[level];
    const stars = deaths === 0 ? 3 : deaths <= 3 ? 2 : 1;
    
    this.data.levels[level] = {
      completed: true,
      bestTime: existing ? Math.min(existing.bestTime, time) : time,
      deaths: existing ? Math.min(existing.deaths, deaths) : deaths,
      attempts: (existing?.attempts || 0) + 1,
      stars: existing ? Math.max(existing.stars, stars) : stars,
      coins: existing ? Math.max(existing.coins, coins) : coins,
    };

    if (level >= this.data.currentLevel) {
      this.data.currentLevel = level + 1;
    }
    this.data.totalCoins += coins;
    this.data.totalDeaths += deaths;

    // Update high scores
    const score = Math.max(0, 10000 - time - deaths * 500 + coins * 100);
    this.data.highScores.push(score);
    this.data.highScores.sort((a, b) => b - a);
    this.data.highScores = this.data.highScores.slice(0, 10);

    this.checkAchievements();
    this.save();
  }

  recordDeath() {
    this.data.totalDeaths++;
    this.save();
  }

  getLevelSave(level: number): LevelSave | undefined {
    return this.data.levels[level];
  }

  isLevelUnlocked(level: number): boolean {
    return level <= this.data.currentLevel;
  }

  addCoins(amount: number) {
    this.data.totalCoins += amount;
    this.save();
  }

  unlockSkin(skin: string) {
    if (!this.data.unlockedSkins.includes(skin)) {
      this.data.unlockedSkins.push(skin);
      this.save();
    }
  }

  setSkin(skin: string) {
    this.data.currentSkin = skin;
    this.save();
  }

  private checkAchievements() {
    const a = this.data.achievements;
    const completed = Object.values(this.data.levels).filter(l => l.completed).length;
    
    if (completed >= 1 && !a.includes('first_win')) a.push('first_win');
    if (completed >= 10 && !a.includes('ten_levels')) a.push('ten_levels');
    if (completed >= 25 && !a.includes('quarter')) a.push('quarter');
    if (this.data.totalDeaths >= 100 && !a.includes('rage_100')) a.push('rage_100');
    if (this.data.totalDeaths >= 500 && !a.includes('rage_500')) a.push('rage_500');
    if (this.data.totalCoins >= 100 && !a.includes('rich')) a.push('rich');
    
    // Check for no-death run on any level
    const noDeath = Object.values(this.data.levels).some(l => l.completed && l.deaths === 0);
    if (noDeath && !a.includes('no_death')) a.push('no_death');
  }

  getHighScores(): number[] {
    return this.data.highScores;
  }

  resetAll() {
    this.data = { ...DEFAULT_SAVE };
    this.save();
  }
}

export const SaveManager = new SaveManagerClass();
