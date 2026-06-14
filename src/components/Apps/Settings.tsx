/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings, Volume2, Grid, RotateCcw, Palette, Wifi, HelpCircle, HardDrive, Bell } from 'lucide-react';
import { LauncherSettings } from '../../types';
import { playCuteSound } from '../../utils/audio';

interface LauncherSettingsAppProps {
  settings: LauncherSettings;
  setSettings: React.Dispatch<React.SetStateAction<LauncherSettings>>;
  onFactoryReset: () => void;
}

export default function LauncherSettingsApp({ settings, setSettings, onFactoryReset }: LauncherSettingsAppProps) {
  
  const handleToggleSound = () => {
    const nextVal = !settings.soundEnabled;
    setSettings(prev => ({ ...prev, soundEnabled: nextVal }));
    if (nextVal) {
      playCuteSound('success', settings.volume);
    }
  };

  const handleGridChange = (cols: number) => {
    if (settings.soundEnabled) {
      playCuteSound('tap', settings.volume);
    }
    setSettings(prev => ({ ...prev, gridColumns: cols }));
  };

  const handleIconStyleChange = (style: 'kawaii' | 'tech-neon' | 'cartoon-sketch') => {
    if (settings.soundEnabled) {
      playCuteSound('bubble', settings.volume);
    }
    
    // Automatically switch corresponding themes to maximize visual synergy
    let correspondingTheme: typeof settings.theme = settings.theme;
    if (style === 'kawaii') correspondingTheme = 'pastel';
    if (style === 'tech-neon') correspondingTheme = 'cyberpunk';
    if (style === 'cartoon-sketch') correspondingTheme = 'retro-scribble';

    setSettings(prev => ({
      ...prev,
      iconStyle: style,
      theme: correspondingTheme
    }));
  };

  return (
    <div id="settings-app" className="flex flex-col h-full bg-slate-900/90 text-slate-100 font-sans rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-teal-400 animate-spin-slow" />
          <div>
            <span className="font-bold text-sm tracking-tight">Launcher de Ajustes</span>
            <div className="text-[10px] text-teal-300">Modifica los Estilos Visuales</div>
          </div>
        </div>
        <span className="text-[9px] bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-400/20 font-mono">
          Neko OS v2.4
        </span>
      </div>

      {/* Main Options */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-teal-500/20 to-indigo-500/20 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-teal-400 border border-white/20 flex items-center justify-center text-2xl shadow">
            🌸
          </div>
          <div>
            <h3 className="font-bold text-sm">Sempai Kawaii</h3>
            <p className="text-[10px] text-teal-200">Nivel de Afiliación Neko: Diamante ✨</p>
          </div>
        </div>

        {/* 1. Theme and Icon Styles */}
        <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5">
            <Palette className="w-4 h-4 text-teal-400" />
            <span className="font-mono text-[10px] text-slate-300 font-bold tracking-wider uppercase">Estilo de Menú e Iconos</span>
          </div>

          <div className="space-y-1.5">
            {[
              { id: 'kawaii' as const, label: 'Pastel Kawaii (Macaron) 🐾', desc: 'Tonos suaves, bordes redondeados y caritas tiernas.' },
              { id: 'tech-neon' as const, label: 'Cyberpunk Neón (Hexagonal) ⚡', desc: 'Celdas futuristas brillantes, cian y rosa espacial.' },
              { id: 'cartoon-sketch' as const, label: 'Dibujo Escolar (Tiza) ✏️', desc: 'Estampados de lápiz, contornos hechos a mano.' }
            ].map(style => {
              const active = settings.iconStyle === style.id;
              return (
                <button
                  key={style.id}
                  id={`style-select-${style.id}`}
                  onClick={() => handleIconStyleChange(style.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    active
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/8'
                  }`}
                >
                  <div>
                    <span className="font-semibold block">{style.label}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 block leading-tight">{style.desc}</span>
                  </div>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-teal-500/50 shadow-md" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. App Grid Columns */}
        <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5">
            <Grid className="w-4 h-4 text-teal-400" />
            <span className="font-mono text-[10px] text-slate-300 font-bold tracking-wider uppercase">Rejilla de Aplicaciones</span>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-slate-300">Columnas del Escritorio</span>
            <div className="flex gap-2">
              {[3, 4, 5].map(cols => {
                const active = settings.gridColumns === cols;
                return (
                  <button
                    key={cols}
                    id={`grid-cols-${cols}`}
                    onClick={() => handleGridChange(cols)}
                    className={`w-10 h-8 rounded-lg border text-xs font-bold font-mono transition-all ${
                      active
                        ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cols}x{cols}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Audio / System Volume Feedback */}
        <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5">
            <Volume2 className="w-4 h-4 text-teal-400" />
            <span className="font-mono text-[10px] text-slate-300 font-bold tracking-wider uppercase">Efectos de Sonido</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="text-left">
              <span className="text-xs text-slate-200 font-medium block">Audio del Sistema</span>
              <span className="text-[9px] text-slate-400 leading-normal block">Pops de burbuja, taps de botón, etc.</span>
            </div>
            <button
              id="sound-opt-toggle"
              onClick={handleToggleSound}
              className={`w-12 h-6.5 rounded-full p-0.5 transition-all duration-300 border ${
                settings.soundEnabled
                  ? 'bg-teal-500 border-teal-400 flex justify-end text-right'
                  : 'bg-white/10 border-white/15 flex justify-start'
              }`}
            >
              <div className="w-5.5 h-5.5 bg-white rounded-full shadow-inner shadow-black/10" />
            </button>
          </div>
        </div>

        {/* 4. Telemetry Mock Specifications */}
        <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-indigo-400" /> Espacio en Caché</span>
            <span>4.8 MB / 128 MB</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-indigo-400" /> Protocolo Wi-Fi</span>
            <span>NekoNet 6G Secure</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1"><Bell className="w-3.5 h-3.5 text-indigo-400" /> Notificaciones</span>
            <span>Estilos de Cabecera Pop-up</span>
          </div>
        </div>

        {/* Reset Block */}
        <div className="pt-2">
          <button
            id="factory-reset-launcher"
            onClick={() => {
              if (confirm('¿Sempai, estás seguro de borrar los datos del launcher y reiniciar a fábrica? (Se perderán las monedas y temas comprados)')) {
                onFactoryReset();
              }
            }}
            className="w-full bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 transition-all border border-rose-500/40 text-rose-300 py-2.5 rounded-2xl text-xs font-bold font-sans flex items-center justify-center gap-2 shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" /> RECOGER DATOS (RESETEO DE FÁBRICA)
          </button>
        </div>
      </div>
    </div>
  );
}
