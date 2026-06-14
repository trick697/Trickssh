/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ShoppingBag, Joystick, RotateCcw, Award, Heart, Shield, Check } from 'lucide-react';
import { LauncherSettings, NekoPetState } from '../../types';
import { playCuteSound } from '../../utils/audio';

interface MiniGameProps {
  settings: LauncherSettings;
  petState: NekoPetState;
  setPetState: React.Dispatch<React.SetStateAction<NekoPetState>>;
  unlockFeature: (type: 'wallpaper' | 'icon', id: string, cost: number) => boolean;
  unlockedWallpapers: string[];
  unlockedIcons: string[];
}

interface FallingItem {
  id: number;
  x: number; // percentage (0 to 90)
  y: number; // coordinate
  speed: number;
  type: 'star' | 'heart' | 'skull';
}

export default function MiniGame({
  settings,
  petState,
  setPetState,
  unlockFeature,
  unlockedWallpapers,
  unlockedIcons
}: MiniGameProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'shop'>('menu');
  const [basketX, setBasketX] = useState<number>(45); // percentage centered
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [highScore, setHighScore] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<any>(null);
  const nextItemIdRef = useRef(0);

  // Shop state list
  const SHOP_ITEMS = [
    {
      id: 'sunset_glow',
      type: 'wallpaper' as const,
      name: 'Atardecer Lofi Retro 🌆',
      cost: 150,
      description: 'Hermoso paisaje lofi de atardecer rosado para tu pantalla.'
    },
    {
      id: 'ghibli_coffee',
      type: 'wallpaper' as const,
      name: 'Cafetería de Fantasía ☕',
      cost: 250,
      description: 'Estilo acogedor Ghibli con tazas humeantes y plantas.'
    },
    {
      id: 'icon_neon_hex',
      type: 'icon' as const,
      name: 'Iconos Neón Glitch ⚡',
      cost: 200,
      description: 'Estilo de iconos con bordes neón vibrantes de alta tecnología.'
    },
    {
      id: 'icon_cat_paw',
      type: 'icon' as const,
      name: 'Iconos Patas de Gato 🐾',
      cost: 300,
      description: 'Convierte tus iconos principales en cojines de huellas.'
    }
  ];

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') {
        setBasketX(prev => Math.max(prev - 8, 0));
      } else if (e.key === 'ArrowRight') {
        setBasketX(prev => Math.min(prev + 8, 90));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Click / Touch helpers
  const handleMoveLeft = () => {
    if (gameState === 'playing') {
      setBasketX(prev => Math.max(prev - 10, 0));
      if (settings.soundEnabled) playCuteSound('tap', settings.volume);
    }
  };

  const handleMoveRight = () => {
    if (gameState === 'playing') {
      setBasketX(prev => Math.min(prev + 10, 90));
      if (settings.soundEnabled) playCuteSound('tap', settings.volume);
    }
  };

  const handleStartGame = () => {
    if (settings.soundEnabled) playCuteSound('success', settings.volume);
    setScore(0);
    setLives(3);
    setItems([]);
    setGameState('playing');
    setBasketX(45);
  };

  // Main game core loop running at uniform frame speed
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    // Spawn items counter
    let spawnTicker = 0;

    gameLoopRef.current = setInterval(() => {
      // 1. Move active elements downwards
      setItems(prevItems => {
        const moved = prevItems.map(item => ({
          ...item,
          y: item.y + item.speed
        }));

        const kept: FallingItem[] = [];

        for (const item of moved) {
          // Bottom collision
          if (item.y >= 90) {
            // Basket checks
            const isColliding = Math.abs(item.x - basketX) < 15;
            if (isColliding) {
              if (item.type === 'star') {
                setScore(s => s + 10);
                setPetState(prev => ({
                  ...prev,
                  coins: prev.coins + 5,
                  affection: Math.min(prev.affection + 1, 100)
                }));
                if (settings.soundEnabled) playCuteSound('bubble', settings.volume);
              } else if (item.type === 'heart') {
                setScore(s => s + 25);
                setPetState(prev => ({
                  ...prev,
                  coins: prev.coins + 15,
                  affection: Math.min(prev.affection + 5, 100)
                }));
                if (settings.soundEnabled) playCuteSound('success', settings.volume);
              } else if (item.type === 'skull') {
                setLives(l => {
                  const val = l - 1;
                  if (val <= 0) {
                    setGameState('gameover');
                    setHighScore(h => Math.max(h, score));
                    if (settings.soundEnabled) playCuteSound('laser', settings.volume);
                  }
                  return val;
                });
                if (settings.soundEnabled) playCuteSound('laser', settings.volume);
              }
            } else {
              // Missed stars or hearts don't punish, only skulls bypass
              if (item.type === 'star') {
                // optional penalty or nothing
              }
            }
          } else {
            kept.push(item);
          }
        }
        return kept;
      });

      // 2. Spawn fresh items as needed
      spawnTicker++;
      if (spawnTicker % 20 === 0) {
        const randX = Math.floor(Math.random() * 85);
        const randFloat = Math.random();
        let type: 'star' | 'heart' | 'skull' = 'star';
        
        if (randFloat > 0.85) {
          type = 'heart';
        } else if (randFloat > 0.65) {
          type = 'skull';
        }

        const speed = Math.random() * 3 + 2.5 + (score / 150); // scales difficulty
        
        const newItem: FallingItem = {
          id: nextItemIdRef.current++,
          x: randX,
          y: 0,
          speed,
          type
        };

        setItems(prev => [...prev, newItem]);
      }
    }, 50);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, basketX, score, settings.soundEnabled, settings.volume]);

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (petState.coins >= item.cost) {
      const unlocked = unlockFeature(item.type, item.id, item.cost);
      if (unlocked) {
        setPetState(prev => ({ ...prev, coins: prev.coins - item.cost }));
        if (settings.soundEnabled) playCuteSound('level', settings.volume);
      }
    }
  };

  return (
    <div id="game-app" className="flex flex-col h-full bg-slate-950 text-white font-sans rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Header bar */}
      <div className="p-4 bg-gradient-to-r from-violet-500/20 to-pink-500/20 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Joystick className="w-5 h-5 text-pink-400" />
          <div>
            <span className="font-semibold text-xs tracking-tight">Estrella Neko Catcher</span>
            <div className="text-[9px] text-pink-300 font-mono">Monedas: <span className="text-yellow-400 font-bold">{petState.coins} 🌟</span></div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            id="gmenu-play"
            onClick={() => {
              setGameState(gameState === 'shop' ? 'menu' : 'shop');
              if (settings.soundEnabled) playCuteSound('tap', settings.volume);
            }}
            className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1 text-slate-300"
          >
            <ShoppingBag className="w-3 h-3 text-pink-400" />
            {gameState === 'shop' ? 'Jugar' : 'Tienda'}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 border-b border-white/5 select-none min-h-[300px]">
        
        {/* MENU STATE */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center shadow-lg animate-bounce duration-1000">
              🐾
            </div>
            <div>
              <h2 className="font-bold text-base text-pink-300 leading-tight">Estrella Neko Catcher</h2>
              <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto mt-1 leading-normal">
                Atrapa estrellas y corazones mágicos para ganar puntos y monedas. ¡Evita los agujeros negros!
              </p>
            </div>
            <div className="pt-2">
              <button
                id="gstart-playing"
                onClick={handleStartGame}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 font-bold text-xs px-6 py-2.5 rounded-2xl active:scale-95 transition-all shadow-md flex items-center gap-1.5"
              >
                🎮 JUGAR AHORA
              </button>
              {highScore > 0 && (
                <div className="mt-2 text-[9px] text-slate-500 font-mono">
                  HISTÓRICO MÁXIMO: {highScore} PTS
                </div>
              )}
            </div>
          </div>
        )}

        {/* PLAYING STATE */}
        {gameState === 'playing' && (
          <div className="absolute inset-0">
            {/* Status grid */}
            <div className="absolute top-2 left-3 right-3 flex justify-between text-[11px] font-mono text-slate-300 z-10 bg-slate-950/40 p-1.5 rounded-lg border border-white/5">
              <div className="flex items-center gap-1 text-yellow-300">
                <span>PTS:</span>
                <span className="font-bold text-white">{score}</span>
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(3)].map((_, idx) => (
                  <Heart
                    key={idx}
                    className={`w-3.5 h-3.5 ${idx < lives ? 'text-pink-500 fill-pink-500' : 'text-slate-700'}`}
                  />
                ))}
              </div>
            </div>

            {/* Falling items renderer */}
            {items.map(item => (
              <div
                key={item.id}
                id={`fall-item-${item.id}`}
                className="absolute text-xl pointer-events-none transition-all duration-75 select-none"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {item.type === 'star' && <span className="drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]">⭐</span>}
                {item.type === 'heart' && <span className="drop-shadow-[0_0_6px_rgba(236,72,153,0.8)]">💖</span>}
                {item.type === 'skull' && <span className="drop-shadow-[0_0_6px_rgba(0,0,0,0.8)] text-slate-400">⚡</span>}
              </div>
            ))}

            {/* Cat Basket */}
            <div
              id="basket-avatar"
              className="absolute bottom-6 w-16 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl border-2 border-white/20 shadow-lg flex items-center justify-center text-xs transition-all pointer-events-none"
              style={{
                left: `${basketX}%`,
              }}
            >
              🐾 PAW
            </div>
          </div>
        )}

        {/* GAMEOVER STATE */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div>
              <span className="text-3xl">🥀</span>
              <h2 className="font-extrabold text-base text-rose-500 mt-2">Fin del Juego</h2>
              <p className="text-[11px] text-slate-400 font-mono mt-1">Conseguiste {score} Puntos</p>
            </div>
            <div className="pt-2 space-y-2">
              <button
                id="grestart-btn"
                onClick={handleStartGame}
                className="bg-white/10 hover:bg-white/15 border border-white/20 font-bold text-xs px-5 py-2 rounded-xl active:scale-95 transition-all text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Volver a Intentar
              </button>
              <button
                id="gmenu-leave"
                onClick={() => setGameState('menu')}
                className="text-[10px] text-slate-500 underline py-1 block w-full"
              >
                Volver al Menú
              </button>
            </div>
          </div>
        )}

        {/* SHOP STATE */}
        {gameState === 'shop' && (
          <div className="absolute inset-0 flex flex-col p-4 bg-slate-900 overflow-y-auto">
            <h2 className="font-bold text-xs text-pink-300 tracking-wider uppercase mb-2 flex items-center gap-1.5 border-b border-white/5 pb-1">
              <Award className="w-4 h-4 text-yellow-400" /> Tienda Neko Shop
            </h2>
            <div className="space-y-2 flex-1">
              {SHOP_ITEMS.map(item => {
                const isItemUnlocked = item.type === 'wallpaper' 
                  ? unlockedWallpapers.includes(item.id)
                  : unlockedIcons.includes(item.id);

                return (
                  <div
                    key={item.id}
                    id={`shop-item-${item.id}`}
                    className="bg-slate-950/50 rounded-xl p-2.5 border border-white/5 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[11px] flex items-center gap-1 text-slate-200">
                        {item.name}
                      </div>
                      <p className="text-[9px] text-slate-400 truncate leading-normal">
                        {item.description}
                      </p>
                    </div>

                    <button
                      id={`buy-btn-${item.id}`}
                      disabled={isItemUnlocked || petState.coins < item.cost}
                      onClick={() => handleBuy(item)}
                      className={`text-[9px] font-mono px-3 py-1.5 rounded-lg active:scale-95 transition-all flex items-center gap-1 ${
                        isItemUnlocked
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : petState.coins >= item.cost
                          ? 'bg-pink-500 hover:bg-pink-600 text-white shadow'
                          : 'bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isItemUnlocked ? (
                        <>
                          <Check className="w-2.5 h-2.5" /> Comprado
                        </>
                      ) : (
                        `-$${item.cost}`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Touch D-Pad panel for mobile */}
      {gameState === 'playing' && (
        <div className="p-3 bg-slate-950 border-t border-white/5 grid grid-cols-2 gap-3">
          <button
            id="gpad-left-btn"
            onClick={handleMoveLeft}
            className="bg-white/5 hover:bg-white/10 active:bg-pink-500/20 border border-white/10 p-3 rounded-2xl md:py-2 flex items-center justify-center text-xs text-slate-300 border-r-4 border-b-4 border-slate-700 font-sans"
          >
            ◀ Izquierda
          </button>
          <button
            id="gpad-right-btn"
            onClick={handleMoveRight}
            className="bg-white/5 hover:bg-white/10 active:bg-pink-500/20 border border-white/10 p-3 rounded-2xl md:py-2 flex items-center justify-center text-xs text-slate-300 border-r-4 border-b-4 border-slate-700 font-sans"
          >
            Derecha ▶
          </button>
        </div>
      )}
    </div>
  );
}
