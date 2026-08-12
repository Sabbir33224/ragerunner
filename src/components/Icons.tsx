// All SVG icon components — no emojis used anywhere

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

const defaults = { size: 20, className: '', color: 'currentColor' };

export function PlayIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function PauseIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );
}

export function RestartIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
}

export function ArrowRightIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z" />
    </svg>
  );
}

export function ArrowUpIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
    </svg>
  );
}

export function DashIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" className={className}>
      <path d="M13 5l4 7h-8l4 7" />
      <path d="M5 12h3M16 12h3" />
      <path d="M3 8l2 4-2 4" />
    </svg>
  );
}

export function SkullIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 3.07 1.39 5.82 3.57 7.65V22h2v-1.35c.64.22 1.31.35 2 .35h.86v1h2.14v-1h.86c.69 0 1.36-.13 2-.35V22h2v-2.35C20.61 17.82 22 15.07 22 12c0-5.52-4.48-10-10-10zM8.5 14a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    </svg>
  );
}

export function CoinIcon({ size = defaults.size, className, color = '#ffd700' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill={color} stroke="#b8860b" strokeWidth="1.5" />
      <text x="12" y="16" textAnchor="middle" fill="#8B6914" fontSize="12" fontWeight="bold" fontFamily="Arial">$</text>
    </svg>
  );
}

export function TimerIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M9 2h6" />
      <path d="M12 2v2" />
    </svg>
  );
}

export function TrophyIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}

export function ChartIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M3 13h2v8H3zm4-4h2v12H7zm4-4h2v16h-2zm4 8h2v8h-2zm4-4h2v12h-2z" />
    </svg>
  );
}

export function SettingsIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
    </svg>
  );
}

export function PaletteIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10a2.5 2.5 0 0 0 2.5-2.5c0-.61-.23-1.21-.64-1.67A1.46 1.46 0 0 1 13 16.5c0-.83.67-1.5 1.5-1.5H17c2.76 0 5-2.24 5-5 0-4.42-4.03-8-10-8zm-5.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    </svg>
  );
}

export function DoorIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 14H9V7h6v10zm-2-6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
    </svg>
  );
}

export function StarIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
    </svg>
  );
}

export function StarOutlineIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
    </svg>
  );
}

export function LockIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
    </svg>
  );
}

export function MusicIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

export function SpeakerIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

export function VolumeIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M3 9v6h4l5 5V4L7 9H3zm10-.17v6.34L16.5 12 13 8.83z" />
    </svg>
  );
}

export function TrashIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

export function CheckIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function MedalIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1z" />
    </svg>
  );
}

export function SparkleIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
    </svg>
  );
}

export function FlameIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
    </svg>
  );
}

export function LeafIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M6 21s1.5-2 3-2c2 0 3 2 5 2s5-6 5-11c0-4-2-8-7-8S5 6 5 10c0 3 0 5-2 8l3 3z" />
      <path d="M9 12c3-3 7-3 9-1" fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function GearIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
    </svg>
  );
}

export function MoonIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}

export function HomeIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

export function ForwardIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
    </svg>
  );
}

export function CelebrationIcon({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M2 22L10 2l3 9 9 3L2 22z" fill="#48bb78" />
      <circle cx="18" cy="5" r="1.5" fill="#ffd700" />
      <circle cx="15" cy="3" r="1" fill="#ff6b6b" />
      <circle cx="20" cy="8" r="1" fill="#63b3ed" />
      <path d="M14 2l1 2M20 4l-1 2M21 10l-2 .5" stroke="#ffd700" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function AngryFaceIcon({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <circle cx="24" cy="24" r="22" fill="#ff8c42" stroke="#e06c22" strokeWidth="2" />
      {/* Angry eyebrows */}
      <line x1="13" y1="16" x2="19" y2="19" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="35" y1="16" x2="29" y2="19" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="17" cy="22" r="3" fill="#1a1a1a" />
      <circle cx="31" cy="22" r="3" fill="#1a1a1a" />
      {/* Angry mouth */}
      <path d="M16 34 Q24 28 32 34" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Color swatch for skins
export function ColorSwatch({ color, size = 36, className }: { color: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <circle cx="20" cy="20" r="16" fill={color} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      {/* Cute eyes */}
      <circle cx="15" cy="18" r="3" fill="#fff" />
      <circle cx="25" cy="18" r="3" fill="#fff" />
      <circle cx="15.5" cy="18.5" r="1.5" fill="#1a1a1a" />
      <circle cx="25.5" cy="18.5" r="1.5" fill="#1a1a1a" />
      {/* Mouth */}
      <path d="M17 25 Q20 28 23 25" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Medal icons for high scores
export function GoldMedalIcon({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="14" r="8" fill="#ffd700" stroke="#b8860b" strokeWidth="1.5" />
      <text x="12" y="18" textAnchor="middle" fill="#8B6914" fontSize="10" fontWeight="bold" fontFamily="Arial">1</text>
      <path d="M8 2l4 6 4-6" fill="#e53e3e" />
    </svg>
  );
}

export function SilverMedalIcon({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="14" r="8" fill="#c0c0c0" stroke="#888" strokeWidth="1.5" />
      <text x="12" y="18" textAnchor="middle" fill="#555" fontSize="10" fontWeight="bold" fontFamily="Arial">2</text>
      <path d="M8 2l4 6 4-6" fill="#4299e1" />
    </svg>
  );
}

export function BronzeMedalIcon({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="14" r="8" fill="#cd7f32" stroke="#8B5E23" strokeWidth="1.5" />
      <text x="12" y="18" textAnchor="middle" fill="#5A3A12" fontSize="10" fontWeight="bold" fontFamily="Arial">3</text>
      <path d="M8 2l4 6 4-6" fill="#48bb78" />
    </svg>
  );
}

// Lightning icon for effects
export function LightningIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M7 2v11h3v9l7-12h-4l4-8z" />
    </svg>
  );
}

// Gravity flip icon
export function GravityIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 4v16M17 4v16" />
      <path d="M7 8l5-4 5 4" />
      <path d="M7 16l5 4 5-4" />
    </svg>
  );
}

// Spring / jump change icon
export function SpringIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" className={className}>
      <path d="M6 20h12M12 16v-2M8 14l4-10 4 10" />
      <path d="M8 8h8" />
    </svg>
  );
}

// Trend up icon for stats
export function TrendUpIcon({ size = defaults.size, className, color = defaults.color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
