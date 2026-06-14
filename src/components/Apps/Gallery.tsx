/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Image, Upload, Eye, Check, Sliders, Sunset, Settings, Layers } from 'lucide-react';
import { Wallpaper, LauncherSettings } from '../../types';
import { playCuteSound } from '../../utils/audio';

interface GalleryProps {
  settings: LauncherSettings;
  setSettings: React.SetStateAction<any>;
  currentWallpaperId: string;
  changeWallpaper: (id: string) => void;
  unlockedWallpapers: string[];
}

export default function Gallery({
  settings,
  setSettings,
  currentWallpaperId,
  changeWallpaper,
  unlockedWallpapers
}: GalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // List of stock wallpapers, referencing the generated absolute asset files we created earlier!
  const stockWallpapers: Wallpaper[] = [
    {
      id: 'catgirl_starry',
      name: 'Neko Starry Sky 🐾',
      url: '/src/assets/images/anime_catgirl_starry_sky_1781454322290.jpg',
      theme: 'pastel',
      unlocked: true,
      price: 0
    },
    {
      id: 'cyberpunk_tokyo',
      name: 'Neon Tokyo Night 🌌',
      url: '/src/assets/images/anime_cyberpunk_tokyo_1781454342321.jpg',
      theme: 'cyberpunk',
      unlocked: true,
      price: 0
    },
    {
      id: 'sunset_glow',
      name: 'Atardecer Lofi Retro 🌆',
      url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      theme: 'cyberpunk',
      unlocked: unlockedWallpapers.includes('sunset_glow'),
      price: 150
    },
    {
      id: 'ghibli_coffee',
      name: 'Cafetería de Fantasía ☕',
      url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      theme: 'pastel',
      unlocked: unlockedWallpapers.includes('ghibli_coffee'),
      price: 250
    }
  ];

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (settings.soundEnabled) {
      playCuteSound('success', settings.volume);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      // Triggers custom wallpaper setting
      changeWallpaper(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSelect = (wp: Wallpaper) => {
    if (wp.unlocked || unlockedWallpapers.includes(wp.id)) {
      if (settings.soundEnabled) {
        playCuteSound('tap', settings.volume);
      }
      changeWallpaper(wp.id);
    } else {
      if (settings.soundEnabled) {
        playCuteSound('laser', settings.volume);
      }
    }
  };

  return (
    <div id="gallery-app" className="flex flex-col h-full bg-slate-900/90 text-slate-100 font-sans rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="w-5 h-5 text-cyan-400" />
          <div>
            <span className="font-bold text-sm tracking-tight">Galería Neko-Paper</span>
            <div className="text-[10px] text-cyan-300">Personaliza Fondos y Filtros</div>
          </div>
        </div>
        <button
          id="btn-upload-paper"
          onClick={() => fileInputRef.current?.click()}
          className="bg-white/5 hover:bg-white/10 border border-white/15 text-[10px] px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Upload className="w-3 h-3 text-cyan-300" />
          Subir Propio
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCustomUpload}
        />
      </div>

      {/* Grid of Wallpapers */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block mb-2">
            Colección Disponible
          </span>
          <div className="grid grid-cols-2 gap-3">
            {stockWallpapers.map(wp => {
              const itemUnlocked = wp.unlocked || unlockedWallpapers.includes(wp.id);
              const isActive = currentWallpaperId === wp.id;

              return (
                <button
                  key={wp.id}
                  id={`gallery-item-${wp.id}`}
                  onClick={() => handleSelect(wp)}
                  className={`relative aspect-[9/14] rounded-2xl overflow-hidden border text-left group transition-all flex flex-col justify-end p-2.5 ${
                    isActive
                      ? 'border-cyan-400 ring-2 ring-cyan-400/20 scale-[1.02]'
                      : 'border-white/10 hover:border-white/20'
                  } ${!itemUnlocked ? 'brightness-50 cursor-not-allowed' : ''}`}
                >
                  <img
                    src={wp.url}
                    alt={wp.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {/* Backdrop shading for fonts */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                  
                  {/* Status overlays */}
                  <div className="relative z-10 flex flex-col w-full text-white">
                    <span className="font-bold text-[10px] md:text-xs leading-none tracking-tight drop-shadow-md truncate">
                      {wp.name}
                    </span>
                    <span className="text-[8px] text-slate-300 font-mono tracking-wide mt-1 uppercase">
                      {wp.theme}
                    </span>
                  </div>

                  {isActive && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-400 border border-white flex items-center justify-center text-slate-950 shadow z-10">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  {!itemUnlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 z-10 p-2 text-center text-[10px]">
                      <span className="text-xl">🔒</span>
                      <span className="text-pink-400 font-mono font-bold mt-1">TIENDA • {wp.price} pts</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Wallpaper Custom Filters panel */}
        <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-1">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-[11px] tracking-wide uppercase font-mono text-slate-300">Filtros de Fondo</span>
          </div>

          <div className="space-y-3">
            {/* Blur intensity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Desenfoque (Blur)</span>
                <span className="font-mono text-cyan-400">{settings.blurIntensity}px</span>
              </div>
              <input
                id="filter-blur-slider"
                type="range"
                min="0"
                max="24"
                step="2"
                value={settings.blurIntensity}
                onChange={(e) => setSettings(prev => ({ ...prev, blurIntensity: parseInt(e.target.value) }))}
                className="w-full accent-cyan-400 h-1 bg-white/10 rounded-lg focus:outline-none"
              />
            </div>

            {/* Dark overlay intensity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Atenuación Oscura (Dim)</span>
                <span className="font-mono text-cyan-400">{settings.dimIntensity}%</span>
              </div>
              <input
                id="filter-dim-slider"
                type="range"
                min="0"
                max="80"
                step="5"
                value={settings.dimIntensity}
                onChange={(e) => setSettings(prev => ({ ...prev, dimIntensity: parseInt(e.target.value) }))}
                className="w-full accent-cyan-400 h-1 bg-white/10 rounded-lg focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
