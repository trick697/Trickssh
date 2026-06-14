/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Music, Disc, Volume2, Sliders, ChevronRight } from 'lucide-react';
import { Song, LauncherSettings } from '../../types';
import { PRESET_SONGS, startSequencedSong, stopSequencedSong, playCuteSound } from '../../utils/audio';

interface MusicPlayerProps {
  settings: LauncherSettings;
  setSettings: React.Dispatch<React.SetStateAction<LauncherSettings>>;
  activeSongIndex: number;
  setActiveSongIndex: (idx: number) => void;
  isPlayingGlobal: boolean;
  setIsPlayingGlobal: (playing: boolean) => void;
}

export default function MusicPlayer({
  settings,
  setSettings,
  activeSongIndex,
  setActiveSongIndex,
  isPlayingGlobal,
  setIsPlayingGlobal
}: MusicPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [pitchMode, setPitchMode] = useState<'normal' | 'lofi' | 'high'>('normal');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const activeSong = PRESET_SONGS[activeSongIndex];

  // Callback whenever sequencer steps forward
  const onStepForward = (step: number) => {
    setCurrentStep(step);
  };

  const handleTogglePlay = () => {
    if (settings.soundEnabled) {
      playCuteSound('tap', settings.volume);
    }
    if (isPlayingGlobal) {
      stopSequencedSong();
      setIsPlayingGlobal(false);
    } else {
      setIsPlayingGlobal(true);
      startSequencedSong(activeSong, settings.volume, onStepForward);
    }
  };

  const handleNext = () => {
    if (settings.soundEnabled) {
      playCuteSound('bubble', settings.volume);
    }
    const nextIdx = (activeSongIndex + 1) % PRESET_SONGS.length;
    setActiveSongIndex(nextIdx);
    
    if (isPlayingGlobal) {
      startSequencedSong(PRESET_SONGS[nextIdx], settings.volume, onStepForward);
    }
  };

  const selectSong = (idx: number) => {
    if (settings.soundEnabled) {
      playCuteSound('tap', settings.volume);
    }
    setActiveSongIndex(idx);
    if (isPlayingGlobal) {
      startSequencedSong(PRESET_SONGS[idx], settings.volume, onStepForward);
    }
  };

  // Draw cute procedural anime music wave on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bars = Array(20).fill(10);
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / bars.length;

      // Draw starry pastel scan lines background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Procedural floating particles
      angle += 0.03;
      
      // Update bars - dynamic sound visualization
      bars = bars.map((val, idx) => {
        const factor = isPlayingGlobal ? Math.abs(Math.sin(angle + idx * 0.4)) * 38 + 5 : 4;
        const noteFactor = i => (idx === currentStep % bars.length) ? 20 : 0;
        return Math.max(factor + noteFactor(idx), 6);
      });

      // Draw sound bars with aesthetic cyan/pink gradient
      bars.forEach((barHeight, idx) => {
        const x = idx * barWidth + 2;
        const gr = ctx.createLinearGradient(x, height, x, height - barHeight);
        
        if (settings.theme === 'cyberpunk') {
          gr.addColorStop(0, 'rgba(236, 72, 153, 0.9)'); // raw pink
          gr.addColorStop(1, 'rgba(6, 182, 212, 0.9)'); // raw cyan
        } else {
          gr.addColorStop(0, 'rgba(168, 85, 247, 0.8)'); // pastel violet
          gr.addColorStop(1, 'rgba(244, 114, 182, 0.8)'); // pastel baby pink
        }
        
        ctx.fillStyle = gr;
        
        // Draw rounded capsule bars
        const drawH = Math.min(barHeight, height - 10);
        const radius = barWidth / 2 - 1.5;
        ctx.beginPath();
        const topY = height - drawH;
        ctx.roundRect(x, topY, barWidth - 3, drawH, radius);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlayingGlobal, currentStep, settings.theme]);

  // Handle live volume or song settings updating dynamically
  useEffect(() => {
    if (isPlayingGlobal) {
      startSequencedSong(activeSong, settings.volume, onStepForward);
    }
  }, [settings.volume]);

  return (
    <div id="music-app" className="flex flex-col h-full bg-slate-900/90 text-slate-100 font-sans rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Visual Header */}
      <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Disc className={`w-5 h-5 text-pink-400 ${isPlayingGlobal ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          <div>
            <span className="font-bold text-sm tracking-tight">Walkman Retro Player</span>
            <div className="text-[10px] text-purple-300">Nostalgic FM Synthetic loop</div>
          </div>
        </div>
        <span className="text-[9px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-400/10 font-mono">
          90s Synth
        </span>
      </div>

      {/* Main player visualizer */}
      <div className="p-4 flex flex-col items-center justify-center gap-4 bg-slate-950/40 relative">
        {/* Cassette or Vinyl mockup */}
        <div className="relative w-36 h-36 rounded-full bg-slate-800 border-4 border-slate-700/60 shadow-xl flex items-center justify-center overflow-hidden">
          {/* Inner vinyl grooves style */}
          <div className="absolute inset-2 rounded-full border border-slate-650/40 opacity-40" />
          <div className="absolute inset-5 rounded-full border border-slate-650/40 opacity-40" />
          <div className="absolute inset-8 rounded-full border border-slate-650/40 opacity-40" />
          
          {/* Label */}
          <div className={`w-16 h-16 rounded-full bg-gradient-to-tr from-pink-400/90 to-purple-500/90 flex flex-col items-center justify-center transition-transform ${isPlayingGlobal ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }}>
            <span className="text-[10px] font-bold text-white tracking-widest leading-none drop-shadow-md">AIKO</span>
            <span className="text-[7px] text-pink-100 mt-1 font-mono">BEATS</span>
          </div>

          {/* Little center spindle */}
          <div className="absolute w-2 h-2 rounded-full bg-slate-950 border border-white shadow-inner" />
        </div>

        {/* Display Title */}
        <div className="text-center">
          <h2 className="font-bold text-base text-pink-300 tracking-tight leading-tight line-clamp-1">
            {activeSong.title}
          </h2>
          <span className="text-[11px] text-slate-400 font-mono tracking-wide uppercase mt-1 block">
            {activeSong.genre} • {activeSong.tempo} BPM
          </span>
        </div>

        {/* Dynamic canvas visualizer */}
        <canvas
          ref={canvasRef}
          width={280}
          height={64}
          className="w-full h-16 rounded-xl overflow-hidden border border-white/5 opacity-90 shadow-inner"
        />
      </div>

      {/* BPM / Sequencer Steps Monitor */}
      <div className="grid grid-cols-2 gap-2 px-4 py-2 bg-slate-950/20 text-[10px] border-y border-white/5 font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Melody Step: <span className="text-emerald-400 font-bold">{(currentStep % activeSong.notes.length) + 1} / {activeSong.notes.length}</span>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          BPM Speed: <span className="text-pink-400 font-bold">{activeSong.tempo} bpm</span>
        </div>
      </div>

      {/* Controls panel */}
      <div className="p-4 space-y-4">
        {/* Track Controllers */}
        <div className="flex items-center justify-center gap-6">
          <button
            id="audio-prev-btn"
            onClick={handleNext} // toggles next in sequence
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center text-slate-300"
          >
            <Music className="w-4 h-4 rotate-180" />
          </button>
          
          <button
            id="audio-play-trigger"
            onClick={handleTogglePlay}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg active:scale-95 transition-all flex items-center justify-center shadow-lg hover:shadow-pink-500/20"
          >
            {isPlayingGlobal ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            id="audio-next-btn"
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center text-slate-300"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume & Filter Sliders */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5" /> Volumen Synth</span>
            <span className="font-mono">{Math.round(settings.volume * 100)}%</span>
          </div>
          <input
            id="vol-synth-range"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(e) => setSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
            className="w-full accent-pink-500 bg-white/10 h-1 rounded-lg focus:outline-none"
          />
        </div>

        {/* Song Directory list */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block mb-1">
            Lista de Pistas
          </span>
          <div className="space-y-1 max-h-[105px] overflow-y-auto pr-1">
            {PRESET_SONGS.map((song, sidx) => (
              <button
                key={song.id}
                id={`track-${song.id}`}
                onClick={() => selectSong(sidx)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                  activeSongIndex === sidx
                    ? 'bg-pink-500/10 border-pink-500/40 text-pink-300 font-medium'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono opacity-40">0{sidx + 1}</span>
                  <span className="truncate">{song.title}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                  {song.tempo} bpm <ChevronRight className="w-3 h-3 text-slate-500" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
