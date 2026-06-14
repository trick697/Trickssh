/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CloudRain, Sun, Play, Pause, SkipForward, Edit, Check, Bookmark, FileText } from 'lucide-react';
import { LauncherSettings, Song } from '../types';
import { PRESET_SONGS, playCuteSound } from '../utils/audio';

interface WidgetsProps {
  settings: LauncherSettings;
  setSettings: React.Dispatch<React.SetStateAction<LauncherSettings>>;
  activeSongIndex: number;
  setActiveSongIndex: (idx: number) => void;
  isPlayingGlobal: boolean;
  setIsPlayingGlobal: (playing: boolean) => void;
  toggleMusicPlay: () => void;
  coinsCount: number;
}

export default function Widgets({
  settings,
  setSettings,
  activeSongIndex,
  setActiveSongIndex,
  isPlayingGlobal,
  setIsPlayingGlobal,
  toggleMusicPlay,
  coinsCount,
}: WidgetsProps) {
  const [memoText, setMemoText] = useState('¡Hola Sempai! Recuerda jugar en Neko Starry Catcher para conseguir monedas e intercambiar temas... ✨🐾');
  const [isEditingMemo, setIsEditingMemo] = useState(false);

  const activeSong = PRESET_SONGS[activeSongIndex];

  // Weather dialogues in lovely cute anime voice
  const weatherThoughts = [
    { weather: 'Soleado ☀️', temp: '74°F', comment: '¡El sol resplandece hoy, Sempai! Excelente día para caminar juntos. ✨' },
    { weather: 'Lluvioso 🌧️', temp: '62°F', comment: 'Está lloviendo... perfecto para acurrucarse en lo-fi y ver anime de romance. ☔' }
  ];
  
  // Decide active weather simulation based on columns or randomized selection
  const weatherObj = (coinsCount % 2 === 0) ? weatherThoughts[0] : weatherThoughts[1];

  const handleNextTrack = () => {
    if (settings.soundEnabled) playCuteSound('bubble', settings.volume);
    const nextIdx = (activeSongIndex + 1) % PRESET_SONGS.length;
    setActiveSongIndex(nextIdx);
  };

  const saveMemo = () => {
    setIsEditingMemo(false);
    if (settings.soundEnabled) playCuteSound('success', settings.volume);
  };

  const triggerEdit = () => {
    setIsEditingMemo(true);
    if (settings.soundEnabled) playCuteSound('tap', settings.volume);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-3.5 h-auto overflow-visible select-none font-sans">
      
      {/* 1. Custom Cute Anime Weather Widget */}
      <div className={`rounded-3xl p-4 flex flex-col justify-between overflow-hidden shadow-lg border relative transition-all duration-300 ${
        settings.theme === 'cyberpunk'
          ? 'bg-gradient-to-br from-pink-500/10 to-cyan-500/15 border-cyan-500/30'
          : 'bg-white/8 text-slate-900 border-white/20'
      }`}>
        {/* Subtle grid pattern for cyber */}
        {settings.theme === 'cyberpunk' && (
          <div className="absolute inset-0 bg-cyberpunk-grid opacity-10 pointer-events-none" />
        )}

        <div className="flex items-center justify-between pointer-events-none">
          <div>
            <span className="text-[10px] uppercase tracking-wider block font-mono font-extrabold text-pink-400">
              Pronóstico del Tiempo
            </span>
            <span className="text-2xl font-black mt-1 block">
              {weatherObj.temp}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {weatherObj.weather} • Tokio, JP
            </span>
          </div>
          {weatherObj.weather.includes('Soleado') ? (
            <Sun className="w-12 h-12 text-amber-300 animate-spin-slow drop-shadow-[0_0_8px_rgba(252,211,77,0.4)]" />
          ) : (
            <CloudRain className="w-12 h-12 text-cyan-400 animate-bounce drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
          )}
        </div>

        <p className="text-[10.5px] italic text-slate-300 mt-3 pt-2.5 border-t border-white/5 leading-snug tracking-tight">
          "{weatherObj.comment}"
        </p>
      </div>

      {/* 2. Walkman Lo-fi Compact Player Widget */}
      <div className={`rounded-3xl p-4 flex flex-col justify-between overflow-hidden shadow-lg border transition-all duration-300 ${
        settings.theme === 'cyberpunk'
          ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/15 border-pink-500/30 text-white'
          : 'bg-white/8 text-slate-900 border-white/20'
      }`}>
        <div className="flex justify-between items-start">
          <div className="truncate pr-4">
            <span className="text-[9px] uppercase tracking-wider block font-mono font-extrabold text-purple-400">
              Reproducción Lo-Fi
            </span>
            <span className="text-xs font-bold font-sans mt-1.5 block leading-tight text-pink-300 truncate">
              {activeSong.title}
            </span>
            <span className="text-[9.5px] text-slate-400 font-mono italic block mt-0.5">
              {activeSong.genre} • {activeSong.tempo} bpm
            </span>
          </div>
          <div className="relative">
            <div className={`w-8.5 h-8.5 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center ${isPlayingGlobal ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
              <div className="w-3.5 h-3.5 rounded-full bg-pink-400" />
            </div>
          </div>
        </div>

        {/* Sequencer audio controls */}
        <div className="flex items-center justify-between gap-2.5 pt-3.5 mt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <button
              id="w-play-trigger"
              onClick={toggleMusicPlay}
              className="w-8 h-8 rounded-full bg-pink-500 active:bg-pink-600 flex items-center justify-center text-white active:scale-95 transition-all shadow-md shadow-pink-500/10"
            >
              {isPlayingGlobal ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>
            <button
              id="w-next-trigger"
              onClick={handleNextTrack}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center text-slate-300 border border-white/5"
            >
              <SkipForward className="w-3 h-3" />
            </button>
          </div>
          {isPlayingGlobal && (
            <div className="flex gap-1 items-end h-3 pr-1 animate-pulse">
              <span className="w-1 bg-pink-400 animate-music-bar h-1" />
              <span className="w-1 bg-purple-400 animate-music-bar h-2.5" />
              <span className="w-1 bg-cyan-400 animate-music-bar h-2" />
            </div>
          )}
        </div>
      </div>

      {/* 3. Notebook / Quick Sticky Memo Board */}
      <div className={`md:col-span-2 rounded-3xl p-4 flex flex-col justify-between overflow-hidden shadow-lg border transition-all duration-300 ${
        settings.theme === 'cyberpunk'
          ? 'bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-blue-500/20 text-white'
          : 'bg-white/8 text-slate-900 border-white/20'
      }`}>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] uppercase tracking-wider flex items-center gap-1 mr-2 font-mono font-extrabold text-blue-400">
            <Bookmark className="w-3 h-3" /> Agenda de Notas
          </span>
          {isEditingMemo ? (
            <button
              id="save-memo-btn"
              onClick={saveMemo}
              className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all"
            >
              <Check className="w-3 h-3" /> Guardar
            </button>
          ) : (
            <button
              id="edit-memo-btn"
              onClick={triggerEdit}
              className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all"
            >
              <Edit className="w-3 h-3" /> Editar
            </button>
          )}
        </div>

        {isEditingMemo ? (
          <textarea
            id="memo-input"
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
            className="w-full text-xs bg-slate-950/60 border border-white/10 focus:border-blue-500 focus:outline-none rounded-xl px-2.5 py-1.5 min-h-[50px] text-white resize-none"
            rows={2}
          />
        ) : (
          <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-3 select-text select-none">
            {memoText || 'La nota está en blanco... ¡Toca editar para apuntar algo! 🖊️'}
          </p>
        )}
      </div>

    </div>
  );
}
