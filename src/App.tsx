/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Smartphone, Award, Music, MessageSquare, Compass, 
  HelpCircle, Monitor, Laptop, Swords, ChevronRight, Volume2 
} from 'lucide-react';
import { AppIcon, LauncherSettings, NekoPetState } from './types';
import PhoneFrame from './components/PhoneFrame';
import { playCuteSound } from './utils/audio';

// Default initial Launcher settings.
const DEFAULT_SETTINGS: LauncherSettings = {
  theme: 'pastel',
  iconStyle: 'kawaii',
  gridColumns: 4,
  blurIntensity: 0,
  dimIntensity: 10,
  soundEnabled: true,
  aikoVoiceEnabled: true,
  batteryLevel: 88,
  isCharging: false,
  wifiConnected: true,
  cellularBars: 4,
  volume: 0.5
};

// Default Initial state of Pet care coins.
const DEFAULT_PET_STATE: NekoPetState = {
  affection: 35,
  hunger: 10,
  sleep: 5,
  coins: 50,
  streak: 1,
  level: 1
};

export default function App() {
  const [settings, setSettings] = useState<LauncherSettings>(() => {
    const cached = localStorage.getItem('neko_launcher_settings');
    return cached ? JSON.parse(cached) : DEFAULT_SETTINGS;
  });

  const [petState, setPetState] = useState<NekoPetState>(() => {
    const cached = localStorage.getItem('neko_launcher_pet_state');
    return cached ? JSON.parse(cached) : DEFAULT_PET_STATE;
  });

  const [unlockedWallpapers, setUnlockedWallpapers] = useState<string[]>(() => {
    const cached = localStorage.getItem('neko_unlocked_wallpapers');
    return cached ? JSON.parse(cached) : ['catgirl_starry', 'cyberpunk_tokyo'];
  });

  const [unlockedIcons, setUnlockedIcons] = useState<string[]>(() => {
    const cached = localStorage.getItem('neko_unlocked_icons');
    return cached ? JSON.parse(cached) : ['standard_pack'];
  });

  // Active wallpaper tracking
  const [currentWallpaperId, setCurrentWallpaperId] = useState(() => {
    return localStorage.getItem('neko_current_wallpaper_id') || 'catgirl_starry';
  });

  // Track base64 custom wallpapers uploaded by the user!
  const [customWallpaperB64, setCustomWallpaperB64] = useState<string | null>(() => {
    return localStorage.getItem('neko_custom_wallpaper_b64') || null;
  });

  const [activeSongIndex, setActiveSongIndex] = useState(0);
  const [isPlayingGlobal, setIsPlayingGlobal] = useState(false);
  const [viewEnvironment, setViewEnvironment] = useState<'cozy-desk' | 'neon-arcade' | 'standalone'>('cozy-desk');

  // List of preloaded high fidelity, beautiful custom vectors representing original mockup app icons!
  const [apps, setApps] = useState<AppIcon[]>([
    {
      id: 'chat_companion',
      name: 'Aiko Chat',
      iconName: 'cat',
      category: 'social',
      customSvg: `<svg viewBox="0 0 24 24" fill="none" class="w-7 h-7 stroke-pink-400" stroke="currentColor" stroke-width="2"><path d="M12 21c-5 0-9-3-9-7s4-7 9-7 9 3 9 7c0 1.8-.8 3.5-2.2 4.7l.2 2.3-2.5-1.3c-1.3.6-2.9.9-4.5.9z"/><path d="M9 13.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5-.5.2-.5.5.2.5.5.5zm6 0c.3 0 .5-.2.5-.5s-.2-.5-.5-.5-.5.2-.5.5.2.5.5.5z"/><path d="M12 16v-.5c0-.3-.2-.5-.5-.5s-.5.2-.5.5v.5c0 .3.2.5.5.5s.5-.2.5-.5z"/><path d="M4.5 10c.8-1.5 2.2-2.5 3.5-3 .8-.3 1 1 .5 1.5-1 .8-2 2-2.3 3.5.3-.3.8-.5 1.3-.5 1 0 1.5.5 1.5 1.5s-1 2-2 2c-1.5 0-2.5-1.5-2.5-3.5z" opacity="0.3"/></svg>`,
      unlocked: true,
      price: 0,
      onHome: true,
      homePosition: { x: 0, y: 0 }
    },
    {
      id: 'gallery',
      name: 'Galería',
      iconName: 'image',
      category: 'tools',
      customSvg: `<svg viewBox="0 0 24 24" fill="none" class="w-7 h-7 stroke-cyan-400" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
      unlocked: true,
      price: 0,
      onHome: true,
      homePosition: { x: 1, y: 0 }
    },
    {
      id: 'music',
      name: 'Walkman lofi',
      iconName: 'music',
      category: 'system',
      customSvg: `<svg viewBox="0 0 24 24" fill="none" class="w-7 h-7 stroke-purple-400" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
      unlocked: true,
      price: 0,
      onHome: true,
      homePosition: { x: 2, y: 0 }
    },
    {
      id: 'neko_arcade',
      name: 'Neko Game',
      iconName: 'gamepad',
      category: 'games',
      customSvg: `<svg viewBox="0 0 24 24" fill="none" class="w-7 h-7 stroke-yellow-400" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12V6M6 12h4M8 10v4"/><circle cx="16" cy="12" r="1"/><circle cx="18" cy="12" r="1"/></svg>`,
      unlocked: true,
      price: 0,
      onHome: true,
      homePosition: { x: 3, y: 0 }
    },
    {
      id: 'settings',
      name: 'Ajustes',
      iconName: 'settings',
      category: 'system',
      customSvg: `<svg viewBox="0 0 24 24" fill="none" class="w-7 h-7 stroke-teal-400" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
      unlocked: true,
      price: 0,
      onHome: true,
      homePosition: { x: 0, y: 1 }
    },
    // Simulation Apps (can be pinned/unpinned via drawer checking)
    {
      id: 'youtube',
      name: 'YouTube',
      iconName: 'video',
      category: 'social',
      customSvg: `<svg viewBox="0 0 24 24" fill="none" class="w-7 h-7 stroke-rose-400" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`,
      unlocked: true,
      price: 0,
      onHome: true,
      homePosition: { x: 1, y: 1 }
    },
    {
      id: 'spotify',
      name: 'Spotify',
      iconName: 'radio',
      category: 'social',
      customSvg: `<svg viewBox="0 0 24 24" fill="none" class="w-7 h-7 stroke-emerald-400" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14.5c2.5-1 5.5-1 8 0M7 11.5c3-1.5 7-1.5 10 0M6 8.5c4-2 8.5-2 12.5 0"/></svg>`,
      unlocked: true,
      price: 0,
      onHome: true,
      homePosition: { x: 2, y: 1 }
    },
    {
      id: 'discord',
      name: 'Discord',
      iconName: 'disc',
      category: 'social',
      customSvg: `<svg viewBox="0 0 24 24" fill="none" class="w-7 h-7 stroke-indigo-400" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8.5 10.5c0-.6.4-1 1-1h5c.6 0 1 .4 1 1M8 13.5v1M16 13.5v1"/></svg>`,
      unlocked: true,
      price: 0,
      onHome: true,
      homePosition: { x: 3, y: 1 }
    },
    {
      id: 'genshin',
      name: 'Genshin',
      iconName: 'sparkles',
      category: 'games',
      customSvg: `<svg viewBox="0 0 24 24" fill="none" class="w-7 h-7 stroke-amber-400" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></svg>`,
      unlocked: true,
      price: 0,
      onHome: false,
      homePosition: null
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      iconName: 'music-2',
      category: 'social',
      customSvg: `<svg viewBox="0 0 24 24" fill="none" class="w-7 h-7 stroke-red-400" stroke="currentColor" stroke-width="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>`,
      unlocked: true,
      price: 0,
      onHome: false,
      homePosition: null
    },
    {
      id: 'google_maps',
      name: 'Maps',
      iconName: 'map-pin',
      category: 'tools',
      customSvg: `<svg viewBox="0 0 24 24" fill="none" class="w-7 h-7 stroke-orange-400" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>`,
      unlocked: true,
      price: 0,
      onHome: false,
      homePosition: null
    }
  ]);

  // Sync state to local storage to make user experience highly persistent and authentic!
  useEffect(() => {
    localStorage.setItem('neko_launcher_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('neko_launcher_pet_state', JSON.stringify(petState));
  }, [petState]);

  useEffect(() => {
    localStorage.setItem('neko_unlocked_wallpapers', JSON.stringify(unlockedWallpapers));
  }, [unlockedWallpapers]);

  useEffect(() => {
    localStorage.setItem('neko_unlocked_icons', JSON.stringify(unlockedIcons));
  }, [unlockedIcons]);

  useEffect(() => {
    localStorage.setItem('neko_current_wallpaper_id', currentWallpaperId);
  }, [currentWallpaperId]);

  useEffect(() => {
    if (customWallpaperB64) {
      localStorage.setItem('neko_custom_wallpaper_b64', customWallpaperB64);
    } else {
      localStorage.removeItem('neko_custom_wallpaper_b64');
    }
  }, [customWallpaperB64]);

  const handleFactoryReset = () => {
    localStorage.clear();
    setSettings(DEFAULT_SETTINGS);
    setPetState(DEFAULT_PET_STATE);
    setUnlockedWallpapers(['catgirl_starry', 'cyberpunk_tokyo']);
    setUnlockedIcons(['standard_pack']);
    setCurrentWallpaperId('catgirl_starry');
    setCustomWallpaperB64(null);
    setIsPlayingGlobal(false);
    
    // reset pinned apps
    setApps(prev => prev.map(app => {
      const defaultPins = ['chat_companion', 'gallery', 'music', 'neko_arcade', 'settings', 'youtube', 'spotify', 'discord'];
      return { ...app, onHome: defaultPins.includes(app.id) };
    }));

    if (settings.soundEnabled) {
      playCuteSound('level', settings.volume);
    }
    alert('¡El launcher se ha reiniciado correctamente a sus valores predeterminados, Sempai! 🌸✨');
  };

  const handleWallpaperChange = (id: string) => {
    if (id.startsWith('data:image')) {
      // Custom user uploaded wallpaper
      setCustomWallpaperB64(id);
      setCurrentWallpaperId('custom');
    } else {
      // Stock preloaded wallpaper
      setCurrentWallpaperId(id);
    }
  };

  // Resolve url
  let currentWallpaperUrl = '';
  if (currentWallpaperId === 'custom' && customWallpaperB64) {
    currentWallpaperUrl = customWallpaperB64;
  } else {
    // Maps
    if (currentWallpaperId === 'catgirl_starry') {
      currentWallpaperUrl = '/src/assets/images/anime_catgirl_starry_sky_1781454322290.jpg';
    } else if (currentWallpaperId === 'cyberpunk_tokyo') {
      currentWallpaperUrl = '/src/assets/images/anime_cyberpunk_tokyo_1781454342321.jpg';
    } else if (currentWallpaperId === 'sunset_glow') {
      currentWallpaperUrl = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
    } else {
      currentWallpaperUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
    }
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 font-sans flex flex-col justify-between overflow-x-hidden ${
      viewEnvironment === 'cozy-desk' 
        ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-amber-950/20 text-slate-100' 
        : viewEnvironment === 'neon-arcade'
        ? 'bg-gradient-to-tr from-[#020617] via-[#1e1b4b] to-[#4c1d95] text-slate-100'
        : 'bg-slate-950 text-white'
    }`}>
      
      {/* 1. Primary Page Header Dashboard */}
      <header className="px-6 py-4 bg-slate-950/45 border-b border-white/5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center shadow-lg text-2xl animate-spin-slow">
            🐾
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-1.5 font-sans">
              Kawaii Anime Launcher
              <Sparkles className="w-4 h-4 text-pink-400 animate-bounce" />
            </h1>
            <p className="text-[10px] text-pink-300 font-mono">NEKO OS v2.4 • INTERACTIVE SMARTPHONE EMULATOR</p>
          </div>
        </div>

        {/* Studio desk custom environmental controllers */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 mr-1 hidden sm:inline">ENTORNO DE VISUALIZACIÓN:</span>
          
          <div className="bg-slate-950/60 p-1 rounded-2xl border border-white/10 flex gap-1">
            <button
              id="env-desk-btn"
              onClick={() => {
                setViewEnvironment('cozy-desk');
                if (settings.soundEnabled) playCuteSound('tap', settings.volume);
              }}
              className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold flex items-center gap-1.5 transition-all ${
                viewEnvironment === 'cozy-desk'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" /> Escritorio Cálido
            </button>
            <button
              id="env-arcade-btn"
              onClick={() => {
                setViewEnvironment('neon-arcade');
                if (settings.soundEnabled) playCuteSound('tap', settings.volume);
              }}
              className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold flex items-center gap-1.5 transition-all ${
                viewEnvironment === 'neon-arcade'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" /> Neón Arcade
            </button>
            <button
              id="env-stand-btn"
              onClick={() => {
                setViewEnvironment('standalone');
                if (settings.soundEnabled) playCuteSound('tap', settings.volume);
              }}
              className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold flex items-center gap-1.5 transition-all ${
                viewEnvironment === 'standalone'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Celular Limpio
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main content setup wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center">
        
        {/* Left Side: Tutorial Guide & System panel */}
        {viewEnvironment !== 'standalone' && (
          <div className="lg:col-span-4 space-y-5 flex flex-col justify-center h-full text-slate-300 font-sans">
            
            {/* Features Board checklist */}
            <div className="bg-slate-900/60 p-5 rounded-[28px] border border-white/5 shadow-xl space-y-4">
              <h2 className="font-extrabold text-[#f472b6] text-sm tracking-tight flex items-center gap-2">
                🏆 GUÍA DE ACTIVIDADES LAUNCHER
              </h2>
              
              <ul className="space-y-3.5 text-xs">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center font-mono font-bold text-[10px]">1</div>
                  <div>
                    <strong className="text-white block">Acaricia a Neko en el inicio</strong>
                    <span className="text-[11px] text-slate-400 leading-normal block">Toca la barra del gatito en la pantalla del celular para subir su nivel y ganar Neko Monedas extra. 🐾</span>
                  </div>
                </li>
                
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-yellow-400/10 text-yellow-300 flex items-center justify-center font-mono font-bold text-[10px]">2</div>
                  <div>
                    <strong className="text-white block">Juega al arcade Star Catcher</strong>
                    <span className="text-[11px] text-slate-400 leading-normal block">Abre la app "Neko Game" y atrapa estrellas con las flechas o teclas de dirección táctiles para enriquecer tu monedero. ⭐</span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-400/10 text-cyan-300 flex items-center justify-center font-mono font-bold text-[10px]">3</div>
                  <div>
                    <strong className="text-white block">Desbloquea regalos en la Tienda</strong>
                    <span className="text-[11px] text-slate-400 leading-normal block">Canjea tus monedas en el botón "Tienda" del minijuego para conseguir el Atardecer Lofi o los Iconos Neón. 🎁</span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-400/10 text-purple-300 flex items-center justify-center font-mono font-bold text-[10px]">4</div>
                  <div>
                    <strong className="text-white block">Chatea con Aiko</strong>
                    <span className="text-[11px] text-slate-400 leading-normal block">Escribe comandos como "cyberpunk", "lofi", "difuminar" o "chiste" en la app "Aiko Chat" para modificar tu interfaz al instante. 💬</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Quick stats board */}
            <div className="bg-slate-900/40 p-5 rounded-[28px] border border-white/5 flex gap-4 items-center justify-between shadow">
              <div>
                <span className="text-[10px] text-slate-400 tracking-wider uppercase font-mono block">Neko Monedas Totales</span>
                <span className="text-2xl font-black text-yellow-400 tracking-tight mt-1 block">
                  {petState.coins} 🌟
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 tracking-wider uppercase font-mono block">Amistad con Aiko</span>
                <span className="text-sm font-semibold text-pink-300 mt-1 block">
                  Nivel {petState.level} ({petState.affection}%)
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Center: The Smartphone frame simulator shell */}
        <div className={`lg:col-span-4 ${viewEnvironment === 'standalone' ? 'lg:col-span-12' : ''} flex justify-center`}>
          <PhoneFrame
            settings={settings}
            setSettings={setSettings}
            apps={apps}
            setApps={setApps}
            petState={petState}
            setPetState={setPetState}
            unlockedWallpapers={unlockedWallpapers}
            setUnlockedWallpapers={setUnlockedWallpapers}
            unlockedIcons={unlockedIcons}
            setUnlockedIcons={setUnlockedIcons}
            currentWallpaperUrl={currentWallpaperUrl}
            currentWallpaperId={currentWallpaperId}
            changeWallpaper={handleWallpaperChange}
            activeSongIndex={activeSongIndex}
            setActiveSongIndex={setActiveSongIndex}
            isPlayingGlobal={isPlayingGlobal}
            setIsPlayingGlobal={setIsPlayingGlobal}
            onFactoryReset={handleFactoryReset}
          />
        </div>

        {/* Right Side: App Logs / Theme Info panel */}
        {viewEnvironment !== 'standalone' && (
          <div className="lg:col-span-4 space-y-5 text-slate-300 font-sans">
            
            {/* Visualizer card */}
            <div className="bg-slate-900/60 p-5 rounded-[28px] border border-white/5 shadow-xl space-y-4 text-left">
              <h2 className="font-extrabold text-[#22d3ee] text-sm tracking-tight flex items-center gap-2">
                🌸 SINTONIZADOR DE WALKMAN LO-FI
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                ¡Nuestras pistas están compuestas del sintetizador procedimental del navegador Web Audio! Escucha loops sin descargas:
              </p>

              <div className="space-y-2 pt-1">
                {[
                  { id: 'lofi_clouds', title: 'Lofi Starry Clouds 🌌', bpm: '80 bpm' },
                  { id: 'neko_dance', title: 'Neko Paw Beats 🐾', bpm: '120 bpm' },
                  { id: 'cyber_night', title: 'Cyberpunk Ramen 🍜', bpm: '100 bpm' }
                ].map((track, tidx) => {
                  const isActive = activeSongIndex === tidx;
                  return (
                    <div 
                      key={track.id}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                        isActive
                          ? 'bg-[#22d3ee]/5 border-[#22d3ee]/30 text-cyan-300'
                          : 'bg-white/5 border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] opacity-40">0{tidx + 1}</span>
                        <span className="font-medium truncate">{track.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">{track.bpm}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick settings widget */}
            <div className="bg-slate-900/60 p-5 rounded-[28px] border border-white/5 shadow-xl space-y-4">
              <h2 className="font-extrabold text-teal-400 text-sm tracking-tight flex items-center gap-2">
                ⚙️ CONFIGURACIÓN DE FILTROS CÉLULARES
              </h2>
              <div className="space-y-3.5 text-xs text-slate-400">
                <p className="leading-relaxed">
                  Puedes regular el desenfoque del fondo de pantalla (blur) y la atenuación de oscuridad (dim) para un confort visual personalizado.
                </p>
                <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
                  <div className="bg-slate-950 p-2 rounded-xl border border-white/5 text-slate-300">
                    BLUR: <strong className="text-teal-400">{settings.blurIntensity}px</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-white/5 text-slate-300">
                    DIMM: <strong className="text-teal-400">{settings.dimIntensity}%</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 3. Footer credits */}
      <footer className="w-full text-center py-5 bg-slate-950/25 border-t border-white/5 text-[10px] font-mono text-slate-500 z-10">
        KAWAII ANIME LAUNCHER • SIMULADOR DE INTERFAZ CREATIVO EN REACT Y TAILWIND CSS
      </footer>

    </div>
  );
}
