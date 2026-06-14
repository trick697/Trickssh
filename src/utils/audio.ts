/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Song } from '../types';

let audioCtx: AudioContext | null = null;
let currentOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
let sequencerInterval: any = null;
let currentStep = 0;
let isPlayingSong = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Map note names to frequencies
const NOTE_FREQS: Record<string, number> = {
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98, 'A6': 1760.00, 'B6': 1975.53,
  '-': 0 // Rest
};

// Pastel ambient pre-configured synth loops
export const PRESET_SONGS: Song[] = [
  {
    id: 'lofi_clouds',
    title: 'Lofi Starry Clouds 🌌',
    genre: 'Chilled Lofi',
    tempo: 80,
    notes: [
      { note: 'C4', duration: 1 }, { note: 'E4', duration: 1 }, { note: 'G4', duration: 1 }, { note: 'B4', duration: 1 },
      { note: 'A4', duration: 1 }, { note: 'G4', duration: 1 }, { note: 'E4', duration: 1 }, { note: 'D4', duration: 1 },
      { note: 'F4', duration: 1 }, { note: 'A4', duration: 1 }, { note: 'C5', duration: 1 }, { note: 'E5', duration: 1 },
      { note: 'D5', duration: 1 }, { note: 'C5', duration: 1 }, { note: 'A4', duration: 1 }, { note: 'G4', duration: 1 },
    ]
  },
  {
    id: 'neko_dance',
    title: 'Neko Paw Beats 🐾',
    genre: 'Happy Kawaii',
    tempo: 120,
    notes: [
      { note: 'E5', duration: 0.5 }, { note: 'G5', duration: 0.5 }, { note: 'A5', duration: 0.5 }, { note: 'B5', duration: 0.5 },
      { note: 'A5', duration: 0.5 }, { note: 'G5', duration: 0.5 }, { note: 'E5', duration: 0.5 }, { note: 'D5', duration: 0.5 },
      { note: 'E5', duration: 0.5 }, { note: 'G5', duration: 0.5 }, { note: 'C6', duration: 0.5 }, { note: 'B5', duration: 0.5 },
      { note: 'A5', duration: 0.5 }, { note: 'B5', duration: 0.5 }, { note: 'G5', duration: 0.5 }, { note: 'E5', duration: 0.5 },
    ]
  },
  {
    id: 'cyber_night',
    title: 'Cyberpunk Ramen 🍜',
    genre: 'Synthwave Neon',
    tempo: 100,
    notes: [
      { note: 'A3', duration: 0.5 }, { note: 'A3', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'A3', duration: 0.5 },
      { note: 'G3', duration: 0.5 }, { note: 'G3', duration: 0.5 }, { note: 'D4', duration: 0.5 }, { note: 'G3', duration: 0.5 },
      { note: 'F3', duration: 0.5 }, { note: 'F3', duration: 0.5 }, { note: 'C4', duration: 0.5 }, { note: 'F3', duration: 0.5 },
      { note: 'E3', duration: 0.5 }, { note: 'G3', duration: 0.5 }, { note: 'B3', duration: 0.5 }, { note: 'E4', duration: 0.5 },
    ]
  }
];

// Play cute localized UI sound effects
export function playCuteSound(type: 'tap' | 'bubble' | 'success' | 'level' | 'gacha' | 'laser', sliderVolume: number = 0.5) {
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    
    // Create nodes
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Scaling overall volume
    gainNode.gain.setValueAtTime(0, time);

    if (type === 'tap') {
      // Short high click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, time);
      osc.frequency.exponentialRampToValueAtTime(300, time + 0.08);
      gainNode.gain.linearRampToValueAtTime(sliderVolume * 0.3, time + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
      osc.start(time);
      osc.stop(time + 0.09);
    } else if (type === 'bubble') {
      // Cute bubble pop
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, time);
      osc.frequency.exponentialRampToValueAtTime(1200, time + 0.12);
      gainNode.gain.linearRampToValueAtTime(sliderVolume * 0.4, time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
      osc.start(time);
      osc.stop(time + 0.13);
    } else if (type === 'success') {
      // Double bright notes
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, time); // C5
      osc.frequency.setValueAtTime(659.25, time + 0.08); // E5
      gainNode.gain.linearRampToValueAtTime(sliderVolume * 0.3, time + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.25);
      osc.start(time);
      osc.stop(time + 0.28);
    } else if (type === 'level') {
      // Arpeggio
      osc.type = 'triangle';
      const notesArp = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notesArp.forEach((freq, idx) => {
        osc.frequency.setValueAtTime(freq, time + (idx * 0.07));
      });
      gainNode.gain.linearRampToValueAtTime(sliderVolume * 0.4, time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.35);
      osc.start(time);
      osc.stop(time + 0.4);
    } else if (type === 'gacha') {
      // Upward sparkle
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, time);
      osc.frequency.exponentialRampToValueAtTime(1500, time + 0.5);
      gainNode.gain.linearRampToValueAtTime(sliderVolume * 0.3, time + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.55);
      osc.start(time);
      osc.stop(time + 0.6);
    } else if (type === 'laser') {
      // Retro laser beam for game
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, time);
      osc.frequency.exponentialRampToValueAtTime(200, time + 0.15);
      gainNode.gain.linearRampToValueAtTime(sliderVolume * 0.15, time + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
      osc.start(time);
      osc.stop(time + 0.2);
    }
  } catch (err) {
    console.warn('Web Audio error:', err);
  }
}

// Low level tone generator for sequencing chords/melodies
export function playNote(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.5) {
  if (freq === 0) return null;
  
  try {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    // Smooth envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.25, startTime + 0.02);
    // Release
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration - 0.02);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
    
    const token = { osc, gain: gainNode };
    currentOscillators.push(token);
    
    // Auto cleanup from track list
    setTimeout(() => {
      currentOscillators = currentOscillators.filter(o => o !== token);
    }, duration * 1000 + 100);
    
    return token;
  } catch (err) {
    console.warn('PlayNote failed:', err);
    return null;
  }
}

// Play synthesizer song sequence
export function startSequencedSong(song: Song, volume: number = 0.5, onStepCallback?: (step: number) => void) {
  stopSequencedSong();
  isPlayingSong = true;
  currentStep = 0;
  
  const stepDuration = 60 / song.tempo; // time of matching note beat
  
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const runStep = () => {
    if (!isPlayingSong) return;
    
    const noteObj = song.notes[currentStep % song.notes.length];
    const freq = NOTE_FREQS[noteObj.note] || 0;
    
    if (freq > 0) {
      // 1. Play melody note (sine wave)
      playNote(freq, noteObj.duration * stepDuration, 'sine', volume * 0.8);
      
      // 2. Play subtle warm bass chord note (triangle wave, 1 octave down)
      const octaveDownNote = noteObj.note.replace(/[0-9]/, (match) => String(Number(match) - 1));
      const targetBassFreq = NOTE_FREQS[octaveDownNote] || (freq / 2);
      if (targetBassFreq > 0) {
        playNote(targetBassFreq, noteObj.duration * stepDuration * 0.9, 'triangle', volume * 0.35);
      }

      // 3. Add a soft lo-fi brush rattle / hihat on every beat
      if (currentStep % 2 === 0) {
        playFilterNoise(volume * 0.08, 0.05);
      }
    }
    
    if (onStepCallback) {
      onStepCallback(currentStep % song.notes.length);
    }
    
    currentStep++;
  };
  
  // Kick off first step immediately
  runStep();
  
  sequencerInterval = setInterval(runStep, stepDuration * 1000);
}

// Generate vintage, low-gain warm noise snap for lofi drums
function playFilterNoise(volume: number, duration: number) {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.setValueAtTime(8000, ctx.currentTime);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseNode.start();
  } catch (err) {
    // Fail silently
  }
}

export function stopSequencedSong() {
  isPlayingSong = false;
  if (sequencerInterval) {
    clearInterval(sequencerInterval);
    sequencerInterval = null;
  }
  
  // Stop any active oscillators
  currentOscillators.forEach(item => {
    try {
      item.osc.stop();
    } catch (e) {}
  });
  currentOscillators = [];
}
