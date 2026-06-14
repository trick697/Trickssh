/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wifi, Battery, ShieldAlert, Sparkles, MessageSquare, Flame, 
  Menu, X, Volume2, Moon, Sun, ArrowLeft, RefreshCw, Smartphone
} from 'lucide-react';
import { AppIcon, LauncherSettings, NekoPetState, Wallpaper } from '../types';
import { PRESET_SONGS, playCuteSound } from '../utils/audio';
import Widgets from './Widgets';
import AppDrawer from './AppDrawer';
import ChatCompanion from './Apps/ChatCompanion';
import MusicPlayer from './Apps/MusicPlayer';
import MiniGame from './Apps/MiniGame';
import Gallery from './Apps/Gallery';
import SettingsApp from './Apps/Settings';

interface PhoneFrameProps {
  settings: LauncherSettings;
  setSettings: React.Dispatch<React.SetStateAction<LauncherSettings>>;
  apps: AppIcon[];
  setApps: React.Dispatch<React.SetStateAction<AppIcon[]>>;
  petState: NekoPetState;
  setPetState: React.Dispatch<React.SetStateAction<NekoPetState>>;
  unlockedWallpapers: string[];
  setUnlockedWallpapers: React.Dispatch<React.SetStateAction<string[]>>;
  unlockedIcons: string[];
  setUnlockedIcons: React.Dispatch<React.SetStateAction<string[]>>;
  currentWallpaperUrl: string;
  currentWallpaperId: string;
  changeWallpaper: (id: string) => void;
  activeSongIndex: number;
  setActiveSongIndex: (idx: number) => void;
  isPlayingGlobal: boolean;
  setIsPlayingGlobal: (playing: boolean) => void;
  onFactoryReset: () => void;
}

export default function PhoneFrame({
  settings,
  setSettings,
  apps,
  setApps,
  petState,
  setPetState,
  unlockedWallpapers,
  setUnlockedWallpapers,
  unlockedIcons,
  setUnlockedIcons,
  currentWallpaperUrl,
  currentWallpaperId,
  changeWallpaper,
  activeSongIndex,
  setActiveSongIndex,
  isPlayingGlobal,
  setIsPlayingGlobal,
  onFactoryReset,
}: PhoneFrameProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [petMessage, setPetMessage] = useState('¡Hola, Sempai! ✨ Acaríciame.');
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  // Time & date updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', weekday: 'short' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Toggles music from anywhere
  const handleToggleMusicPlay = () => {
    if (settings.soundEnabled) {
      playCuteSound('tap', settings.volume);
    }
    const song = PRESET_SONGS[activeSongIndex];
    if (isPlayingGlobal) {
      setIsPlayingGlobal(false);
    } else {
      setIsPlayingGlobal(true);
    }
  };

  const unlockFeature = (type: 'wallpaper' | 'icon', id: string, cost: number): boolean => {
    if (type === 'wallpaper') {
      if (!unlockedWallpapers.includes(id)) {
        setUnlockedWallpapers(prev => [...prev, id]);
        return true;
      }
    } else if (type === 'icon') {
      if (!unlockedIcons.includes(id)) {
        setUnlockedIcons(prev => [...prev, id]);
        // Also unlock the visual icon bundle in lists!
        setApps(prevApps => prevApps.map(app => {
          if (app.id === 'neko_arcade') {
            return { ...app, unlocked: true };
          }
          return app;
        }));
        return true;
      }
    }
    return false;
  };

  // Chat/Aiko action command for quick wallpaper transitions
  const quickChangeWallpaper = (id: string) => {
    changeWallpaper(id);
  };

  const handlePetNeko = () => {
    if (settings.soundEnabled) {
      playCuteSound('bubble', settings.volume);
    }

    setPetState(prev => {
      const nextAffection = Math.min(prev.affection + 5, 100);
      const nextCoins = prev.coins + 2;
      let nextLevel = prev.level;
      if (nextAffection >= 100) {
        nextLevel += 1;
        if (settings.soundEnabled) playCuteSound('level', settings.volume);
        setPetMessage('¡Sempai, llegamos a un nuevo nivel de amistad! 🎉🐾');
        return {
          ...prev,
          affection: 0,
          coins: prev.coins + 50,
          level: nextLevel
        };
      }
      return {
        ...prev,
        affection: nextAffection,
        coins: nextCoins
      };
    });

    // Fun random response list
    const phrases = [
      '¡Nyaaa~! Qué suaves caricias. (*^·^*)',
      '¡Eso me hace ronronear de alegría! 🐾',
      '¿Compramos algo en la tienda Neko, Sempai?',
      '¡Doble click en el Walkman para cambiar de LoFi!',
      '¿Quieres jugar al Star Catcher? ¡Adelante!',
      '¡Te quiero mucho Sempai! 💖'
    ];
    setPetMessage(phrases[Math.floor(Math.random() * phrases.length)]);
  };

  // Feed Neko directly from quick settings
  const handleFeedNeko = () => {
    if (settings.soundEnabled) {
      playCuteSound('success', settings.volume);
    }
    setPetState(prev => ({
      ...prev,
      hunger: Math.max(prev.hunger - 15, 0),
      affection: Math.min(prev.affection + 2, 100),
      coins: prev.coins + 1
    }));
    setPetMessage('🐾 ¡Mamy, qué rica golosina! Delicioso.');
  };

  const handleAppLaunch = (id: string) => {
    setActiveAppId(id);
    setIsDrawerOpen(false);
  };

  const handleToggleHomeShortcut = (id: string) => {
    setApps(prev => prev.map(app => {
      if (app.id === id) {
        return { ...app, onHome: !app.onHome };
      }
      return app;
    }));
  };

  // Swapping icons drag & drop implementation in home grid
  const handleDragStart = (id: string) => {
    setDraggedAppId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedAppId || draggedAppId === targetId) return;
    
    // Simple visual swap mechanism for launcher app shortcuts
    setApps(prev => {
      const list = [...prev];
      const srcIdx = list.findIndex(a => a.id === draggedAppId);
      const tgtIdx = list.findIndex(a => a.id === targetId);
      if (srcIdx !== -1 && tgtIdx !== -1) {
        const temp = list[srcIdx].homePosition;
        list[srcIdx].homePosition = list[tgtIdx].homePosition;
        list[tgtIdx].homePosition = temp;
      }
      return list;
    });
    
    if (settings.soundEnabled) {
      playCuteSound('tap', settings.volume);
    }
    setDraggedAppId(null);
  };

  const gainCoins = (amount: number) => {
    setPetState(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  // Map individual custom vector SVGs or lovely emoji graphics representing the mockup icons style
  const homeApps = apps.filter(app => app.onHome);

  return (
    <div id="phone-frame-container" className="relative w-full max-w-sm aspect-[9/19] bg-black rounded-[54px] p-3.5 border-[6px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] mx-auto overflow-hidden select-none select-none">
      
      {/* Outer Phone Ring Bezel Details */}
      <div className="absolute top-0 inset-x-0 h-4 bg-slate-800 rounded-t-[54px] pointer-events-none z-50 flex items-center justify-center">
        {/* Notch camera / speaker housing */}
        <div className="w-24 h-4 bg-black rounded-b-2xl flex items-center justify-around px-4">
          <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800 shadow-inner" /> {/* Lens */}
          <div className="w-10 h-1 bg-slate-800 rounded-full" /> {/* Speaker */}
        </div>
      </div>

      {/* Internal screen panel */}
      <div className="relative w-full h-full rounded-[40px] overflow-hidden flex flex-col justify-between select-none">
        
        {/* BACK-GRID WALLPAPER CONTAINER with filters (blur, saturation, brightness) */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-500 transform scale-[1.01]" 
          style={{ 
            backgroundImage: `url(${currentWallpaperUrl})`,
            filter: `blur(${settings.blurIntensity}px)`,
          }}
        />
        
        {/* Dim overlay layer for high legibility */}
        <div 
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none z-0" 
          style={{ backgroundColor: `rgba(15, 23, 42, ${settings.dimIntensity / 100})` }}
        />

        {/* TOP STATUS BAR WIDGETS */}
        <div 
          onClick={() => {
            setIsQuickSettingsOpen(!isQuickSettingsOpen);
            if (settings.soundEnabled) playCuteSound('tap', settings.volume);
          }}
          className="relative z-30 flex justify-between items-center px-6 pt-5 pb-2 text-[11px] text-white font-mono cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors pointer-events-auto"
        >
          {/* Status Left */}
          <div className="flex items-center gap-1.5 drop-shadow">
            <span className="font-extrabold">{currentTime}</span>
            <span className="text-[9px] opacity-75">AM</span>
          </div>

          {/* Status Right */}
          <div className="flex items-center gap-2 drop-shadow">
            <span className="text-[9px] bg-pink-500/30 text-pink-300 px-1.5 py-0.5 rounded border border-pink-400/20 font-sans tracking-tight">
              Aiko LTE
            </span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-bold">{settings.batteryLevel}%</span>
              <Battery className={`w-4 h-4 text-emerald-400`} />
            </div>
          </div>
        </div>

        {/* QUICK SETTINGS EXPANDABLE PANEL (SLIDE DOWN FROM TOP) */}
        <div className={`absolute top-12 inset-x-3.5 bg-slate-950/95 border border-white/10 rounded-3xl p-4.5 z-40 shadow-2xl space-y-3.5 transition-all duration-300 transform font-sans ${
          isQuickSettingsOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div>
              <span className="font-extrabold text-xs text-slate-100 block">Neko Configuración Rápida</span>
              <span className="text-[9.5px] text-slate-400 font-mono">Controladores de Interface</span>
            </div>
            <button
              id="close-quick-settings"
              onClick={() => setIsQuickSettingsOpen(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* System Control Options */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            {/* Audio Toggle */}
            <button
              id="q-toggle-audio"
              onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-all ${
                settings.soundEnabled
                  ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                  : 'bg-white/5 border-white/5 text-slate-400'
              }`}
            >
              <Volume2 className="w-4 h-4" /> {settings.soundEnabled ? 'Sonido ON' : 'Silencio'}
            </button>

            {/* WiFi Mock connection toggle */}
            <button
              id="q-toggle-wifi"
              onClick={() => setSettings(prev => ({ ...prev, wifiConnected: !prev.wifiConnected }))}
              className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-all ${
                settings.wifiConnected
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/5 border-white/5 text-slate-400'
              }`}
            >
              <Wifi className="w-4 h-4" /> Wi-Fi: {settings.wifiConnected ? 'Conectado' : 'Fuera'}
            </button>
          </div>

          {/* Battery level slider mock */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1"><Battery className="w-4 h-4 text-emerald-400" /> Nivel de Batería</span>
              <span className="font-mono">{settings.batteryLevel}%</span>
            </div>
            <input
              id="quick-batt-slider"
              type="range"
              min="10"
              max="100"
              value={settings.batteryLevel}
              onChange={(e) => setSettings(prev => ({ ...prev, batteryLevel: parseInt(e.target.value) }))}
              className="w-full accent-pink-500 h-1 bg-white/10 rounded-lg focus:outline-none"
            />
          </div>

          {/* Quick Pet Pet Care button */}
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center justify-between gap-3 text-xs">
            <div className="text-left">
              <span className="font-bold text-slate-100 block">Neko Care 🐾</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Alimentar aumenta monedas.</span>
            </div>
            <button
              id="btn-quick-feed"
              onClick={handleFeedNeko}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-[10.5px] px-3.5 py-1.5 rounded-xl active:scale-95 transition-all shadow"
            >
              🍡 Alimentar
            </button>
          </div>
        </div>

        {/* OVERLAY APPS WINDOW RENDERER (SLIDES UP) */}
        {activeAppId && (
          <div className="absolute inset-0 bg-slate-950 z-40 flex flex-col justify-between pt-7 pb-4">
            
            {/* Top Close header bar */}
            <div className="p-3 bg-slate-900 border-b border-white/5 flex items-center justify-between z-50 text-white font-sans">
              <button
                id="btn-app-exit"
                onClick={() => {
                  if (settings.soundEnabled) playCuteSound('tap', settings.volume);
                  setActiveAppId(null);
                }}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white active:scale-95 transition-all px-3 py-1.5 rounded-xl bg-white/5 border border-white/5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Atrás al Inicio
              </button>
              <Smartphone className="w-4 h-4 text-pink-400 animate-pulse" />
            </div>

            {/* Core Render Screen */}
            <div className="flex-1 w-full overflow-hidden relative">
              {activeAppId === 'chat_companion' && (
                <ChatCompanion 
                  settings={settings} 
                  setSettings={setSettings} 
                  changeWallpaper={quickChangeWallpaper}
                  gainCoins={gainCoins}
                />
              )}
              {activeAppId === 'music' && (
                <MusicPlayer 
                  settings={settings}
                  setSettings={setSettings}
                  activeSongIndex={activeSongIndex}
                  setActiveSongIndex={setActiveSongIndex}
                  isPlayingGlobal={isPlayingGlobal}
                  setIsPlayingGlobal={setIsPlayingGlobal}
                />
              )}
              {activeAppId === 'neko_arcade' && (
                <MiniGame
                  settings={settings}
                  petState={petState}
                  setPetState={setPetState}
                  unlockFeature={unlockFeature}
                  unlockedWallpapers={unlockedWallpapers}
                  unlockedIcons={unlockedIcons}
                />
              )}
              {activeAppId === 'gallery' && (
                <Gallery 
                  settings={settings}
                  setSettings={setSettings}
                  currentWallpaperId={currentWallpaperId}
                  changeWallpaper={quickChangeWallpaper}
                  unlockedWallpapers={unlockedWallpapers}
                />
              )}
              {activeAppId === 'settings' && (
                <SettingsApp 
                  settings={settings}
                  setSettings={setSettings}
                  onFactoryReset={onFactoryReset}
                />
              )}
            </div>

            {/* Android/iOS simulated standard swipe bar line */}
            <div className="w-full flex justify-center pt-2">
              <div 
                className="w-24 h-1.5 bg-white/45 hover:bg-white rounded-full cursor-pointer transition-colors" 
                onClick={() => setActiveAppId(null)}
              />
            </div>
          </div>
        )}

        {/* MIDDLE SCREENS - WORKSPACE HOME GRIDS & WIDGETS */}
        <div className="flex-1 flex flex-col justify-start overflow-y-auto no-scrollbar pt-1.5 relative z-10">
          
          {/* Main Clock / Date & Day Widget */}
          <div className="text-center py-6 pointer-events-none select-none drop-shadow">
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              {currentTime || '08:24'}
            </h1>
            <p className="text-[10px] text-pink-200 mt-1 block uppercase font-mono tracking-widest font-bold">
              {currentDate || 'Oct 26'}
            </p>
          </div>

          {/* Interactive Widgets Section */}
          <Widgets 
            settings={settings} 
            setSettings={setSettings}
            activeSongIndex={activeSongIndex}
            setActiveSongIndex={setActiveSongIndex}
            isPlayingGlobal={isPlayingGlobal}
            setIsPlayingGlobal={setIsPlayingGlobal}
            toggleMusicPlay={handleToggleMusicPlay}
            coinsCount={petState.coins}
          />

          {/* Flopping Mascot floating Pet companion */}
          <div className="px-5 py-2 flex justify-center items-center">
            <div 
              id="mascot-clickable-bubble"
              onClick={handlePetNeko}
              className="relative max-w-[280px] bg-slate-900/80 border border-white/10 hover:border-pink-500/30 p-3 rounded-2xl flex items-center gap-3.5 cursor-pointer active:scale-95 transition-all shadow-lg select-none"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-pink-400 border border-white/20 flex items-center justify-center text-xl shadow-inner animate-pulse">
                  🐱
                </div>
                {/* Level indicator pin */}
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-950 font-bold font-mono text-[8px] px-1 rounded-full border border-slate-900 leading-tight">
                  Lv{petState.level}
                </div>
              </div>
              <div className="text-left">
                <p className="text-[10px] md:text-xs text-white leading-relaxed font-sans font-medium line-clamp-1">
                  {petMessage}
                </p>
                {/* Amity stats bar */}
                <div className="w-32 bg-slate-950 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-300"
                    style={{ width: `${petState.affection}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* WORKSPACE APP SHORTCUTS GRID */}
          <div 
            className="p-5"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${settings.gridColumns}, minmax(0, 1fr))`, 
              gap: '12px',
              textAlign: 'center' 
            }}
          >
            {homeApps.map((app) => (
              <div
                key={app.id}
                id={`home-app-shortcut-${app.id}`}
                draggable
                onDragStart={() => handleDragStart(app.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(app.id)}
                onClick={() => handleAppLaunch(app.id)}
                className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
              >
                {/* Customized themed container box styled depending on active themes */}
                <div className={`w-11.5 h-11.5 flex items-center justify-center text-lg shadow-md transition-all ${
                  settings.iconStyle === 'tech-neon'
                    ? 'bg-gradient-to-tr from-pink-500/15 to-cyan-500/15 border border-cyan-400 rounded-xl hover:shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                    : settings.iconStyle === 'cartoon-sketch'
                    ? 'bg-white/5 border border-white border-dashed rounded-none'
                    : 'bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl'
                }`}>
                  {app.customSvg ? (
                    <div dangerouslySetInnerHTML={{ __html: app.customSvg }} />
                  ) : (
                    <span>🐾</span>
                  )}
                </div>
                
                {/* Text tag label */}
                <span className="text-[9.5px] text-white tracking-wide font-medium mt-1.5 font-sans drop-shadow leading-tight truncate w-full max-w-[54px]">
                  {app.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM QUICK HOTSEAT ACTIONS PANEL */}
        <div className="relative z-10 bg-gradient-to-t from-slate-950/70 to-slate-950/20 pt-1 pb-6 px-4.5 border-t border-white/5 flex items-center justify-between z-10">
          
          {/* Quick Shortcuts */}
          <div className="flex-1 grid grid-cols-4 gap-2 text-center items-center">
            {/* 1. Launch Companion Messages widget shortcut */}
            <button
              id="h-chat-shortcut"
              onClick={() => handleAppLaunch('chat_companion')}
              className="flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-base hover:scale-105 active:scale-90 transition-all shadow shadow-pink-500/10">
                💬
              </div>
            </button>

            {/* 2. Gallery quick button */}
            <button
              id="h-gallery-shortcut"
              onClick={() => handleAppLaunch('gallery')}
              className="flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-base hover:scale-105 active:scale-90 transition-all shadow shadow-cyan-500/10">
                🖼️
              </div>
            </button>

            {/* 3. Sliding Launcher App Drawer core trigger knob */}
            <button
              id="h-drawer-shortcut"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="flex flex-col items-center"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 flex items-center justify-center text-lg hover:scale-105 active:scale-90 transition-all shadow-lg hover:shadow-pink-500/25">
                🐾
              </div>
            </button>

            {/* 4. Settings quick button */}
            <button
              id="h-settings-shortcut"
              onClick={() => handleAppLaunch('settings')}
              className="flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-base hover:scale-105 active:scale-90 transition-all shadow shadow-teal-500/10">
                ⚙️
              </div>
            </button>
          </div>
        </div>

        {/* BOTTOM BAR SWIPE AND APP DRAWER DRAGGABLE SHEET */}
        <AppDrawer
          settings={settings}
          apps={apps}
          onToggleHomeShortcut={handleToggleHomeShortcut}
          onLaunchApp={handleAppLaunch}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />

      </div>
    </div>
  );
}
