/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Check, Star, Trash2 } from 'lucide-react';
import { AppIcon, LauncherSettings } from '../types';
import { playCuteSound } from '../utils/audio';

interface AppDrawerProps {
  settings: LauncherSettings;
  apps: AppIcon[];
  onToggleHomeShortcut: (appId: string) => void;
  onLaunchApp: (appId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AppDrawer({
  settings,
  apps,
  onToggleHomeShortcut,
  onLaunchApp,
  isOpen,
  onClose,
}: AppDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering list by query
  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAppClick = (appId: string) => {
    if (settings.soundEnabled) {
      playCuteSound('tap', settings.volume);
    }
    onLaunchApp(appId);
  };

  const handleToggleShortcut = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation(); // prevent launch
    if (settings.soundEnabled) {
      playCuteSound('bubble', settings.volume);
    }
    onToggleHomeShortcut(appId);
  };

  return (
    <div
      id="app-drawer-root"
      className={`absolute inset-x-0 bottom-0 h-[88%] bg-slate-950/90 text-white rounded-t-[36px] border-t border-white/10 shadow-2xl transition-all duration-300 transform flex flex-col z-40 select-none ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Top Slide indicator bar handle */}
      <div className="w-full flex justify-center py-2.5 cursor-pointer" onClick={onClose}>
        <div className="w-12 h-1 bg-white/20 rounded-full hover:bg-white/40 active:bg-pink-500 transition-colors" />
      </div>

      {/* Header & Search */}
      <div className="px-5 pb-3 pt-1 border-b border-white/5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 font-sans">
              Cajón de Aplicaciones
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Filtrar • {apps.length} Instaladas</span>
          </div>
          <button
            id="btn-close-drawer"
            onClick={onClose}
            className="text-[10px] bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-slate-300 px-2.5 py-1 rounded-full border border-white/5 font-sans"
          >
            Atrás
          </button>
        </div>

        {/* Search entry bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="drawer-search-box"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar aplicación..."
            className="w-full bg-white/5 border border-white/10 focus:border-pink-500 focus:outline-none rounded-2xl pl-10 pr-4 py-2 text-xs md:text-sm text-white placeholder-slate-500 transition-all font-sans"
          />
        </div>
      </div>

      {/* Grid Content list */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
        {filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <span className="text-2xl">😿</span>
            <p className="text-xs font-sans mt-2">Sempai, no encontré ninguna aplicación con ese nombre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-y-5 gap-x-2 text-center">
            {filteredApps.map((app) => {
              const isOnHome = app.onHome;

              return (
                <div
                  key={app.id}
                  id={`drawer-app-${app.id}`}
                  onClick={() => handleAppClick(app.id)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  {/* Hexagon/Circle icon housing */}
                  <div className="relative group">
                    <div className={`w-13 h-13 flex items-center justify-center text-xl transition-all duration-200 active:scale-90 ${
                      settings.iconStyle === 'tech-neon'
                        ? 'bg-gradient-to-tr from-pink-500/10 to-cyan-500/10 border border-cyan-400/40 rounded-xl hover:border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.2)] hover:shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                        : settings.iconStyle === 'cartoon-sketch'
                        ? 'bg-transparent border-2 border-dashed border-white rounded-none tracking-tighter'
                        : 'bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl hover:scale-105'
                    }`}>
                      {app.customSvg ? (
                        <div dangerouslySetInnerHTML={{ __html: app.customSvg }} />
                      ) : (
                        <span>❓</span>
                      )}
                    </div>

                    {/* Quick shortcut pinnable plus pill */}
                    <button
                      id={`pin-btn-${app.id}`}
                      onClick={(e) => handleToggleShortcut(e, app.id)}
                      className={`absolute -top-1 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] shadow border transition-all ${
                        isOnHome
                          ? 'bg-pink-500 border-pink-400 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 border-white/20 text-slate-300'
                      }`}
                      title={isOnHome ? 'Quitar del Inicio' : 'Fijar en Inicio'}
                    >
                      {isOnHome ? (
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      ) : (
                        <Plus className="w-2.5 h-2.5" />
                      )}
                    </button>
                  </div>

                  {/* Icon label name */}
                  <span className="text-[10px] text-slate-300 font-sans tracking-tight mt-1.5 font-medium block truncate max-w-[62px] leading-tight group-hover:text-white">
                    {app.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
