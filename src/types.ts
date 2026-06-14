/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Wallpaper {
  id: string;
  name: string;
  url: string;
  isCustom?: boolean;
  blur?: number;
  brightness?: number;
  theme: 'pastel' | 'cyberpunk' | 'vintage';
  unlocked: boolean;
  price: number;
}

export interface AppIcon {
  id: string;
  name: string;
  iconName: string; // Lucide icon or custom drawing
  category: 'social' | 'games' | 'tools' | 'system';
  customSvg?: string; // fallback if we want to draw custom aesthetic shapes like in the mockup
  unlocked: boolean;
  price: number;
  onHome: boolean;
  homePosition: { x: number; y: number } | null;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  reaction?: string; // cute anime expressions (e.g. ^_~, o(〃＾▽＾〃)o, >_<)
}

export interface Song {
  id: string;
  title: string;
  genre: string;
  tempo: number; // BPM
  notes: Array<{ note: string; duration: number }>; // simple notes array to synthesize via Web Audio!
}

export interface LauncherSettings {
  theme: 'pastel' | 'cyberpunk' | 'retro-scribble';
  iconStyle: 'kawaii' | 'tech-neon' | 'cartoon-sketch';
  gridColumns: number;
  blurIntensity: number;
  dimIntensity: number;
  soundEnabled: boolean;
  aikoVoiceEnabled: boolean;
  batteryLevel: number;
  isCharging: boolean;
  wifiConnected: boolean;
  cellularBars: number;
  volume: number;
}

export interface ArcadeLeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export interface NekoPetState {
  affection: number; // 0 to 100
  hunger: number;    // 0 to 100
  sleep: number;     // 0 to 100
  coins: number;     // earned in minigame to unlock shop items
  streak: number;    // tap streak
  level: number;
}
