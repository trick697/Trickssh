/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, HelpCircle, Heart, Star, Cloud } from 'lucide-react';
import { ChatMessage, LauncherSettings } from '../../types';
import { playCuteSound } from '../../utils/audio';

interface ChatCompanionProps {
  settings: LauncherSettings;
  setSettings: React.Dispatch<React.SetStateAction<LauncherSettings>>;
  changeWallpaper: (id: string) => void;
  gainCoins: (amount: number) => void;
}

const INTERACTIVE_COMMANDS = [
  { cmd: 'cyber', desc: 'Cambia al tema Cyberpunk Neón Tokyo 🌃' },
  { cmd: 'pastel', desc: 'Cambia al tema Kawaii Pastel Violeta 🐾' },
  { cmd: 'sketch', desc: 'Cambia al tema Dibujo de Tiza Escolar ✏️' },
  { cmd: 'lofi', desc: 'Pone música Lo-fi relajante en el widget 🎵' },
  { cmd: 'blur', desc: 'Aumenta el desenfoque de fondo 🌫️' },
  { cmd: 'clear', desc: 'Quita el desenfoque del fondo ✨' },
  { cmd: 'joke', desc: 'Cuéntame un chiste tonto de anime' },
  { cmd: 'quote', desc: 'Dame una frase inspiradora de tu anime favorito 🌸' },
];

export default function ChatCompanion({ settings, setSettings, changeWallpaper, gainCoins }: ChatCompanionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: '¡Hola Sempai! ✨ Soy Aiko, tu asistente anime de confianza. ¡Puedes personalizar este launcher chateando conmigo! Dime cosas como "pon tema cyber", "difumina el fondo" o simplemente charlemos. (*^▽^*)',
      timestamp: new Date(),
      reaction: 'o(〃＾▽＾〃)o'
    }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text: string, reaction?: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'bot',
        text,
        timestamp: new Date(),
        reaction
      }
    ]);
    if (settings.soundEnabled) {
      playCuteSound('bubble', settings.volume);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'user',
        text: userText,
        timestamp: new Date()
      }
    ]);
    setInput('');
    if (settings.soundEnabled) {
      playCuteSound('tap', settings.volume);
    }

    // Process reply after brief typing delay
    setTimeout(() => {
      processResponse(userText.toLowerCase());
    }, 600);
  };

  const processResponse = (txt: string) => {
    // 1. Theme transitions
    if (txt.includes('cyber') || txt.includes('tokyo') || txt.includes('neón') || txt.includes('neon')) {
      setSettings(prev => ({ ...prev, theme: 'cyberpunk', iconStyle: 'tech-neon' }));
      changeWallpaper('cyberpunk_tokyo');
      addBotMessage(
        '¡Entendido, Sempai! Iniciando protocolo de Neón Cyberpunk. ¡El fondo de Tokyo luce increíble con los iconos de neón! 🌃✨',
        '(*▼_▼)'
      );
      gainCoins(15);
      return;
    }

    if (txt.includes('pastel') || txt.includes('catgirl') || txt.includes('rosa') || txt.includes('blush')) {
      setSettings(prev => ({ ...prev, theme: 'pastel', iconStyle: 'kawaii' }));
      changeWallpaper('catgirl_starry');
      addBotMessage(
        '¡Aww, de vuelta a las nubes de algodón! Volviendo al tema Pastel Kawaii de gatitos. ¡Qué acogedor! 🐾🌸',
        'o(〃＾▽＾〃)o'
      );
      gainCoins(15);
      return;
    }

    if (txt.includes('sketch') || txt.includes('tiza') || txt.includes('dibujo') || txt.includes('pencil') || txt.includes('retro')) {
      setSettings(prev => ({ ...prev, theme: 'retro-scribble', iconStyle: 'cartoon-sketch' }));
      addBotMessage(
        '¡Wah! Estilo escolar retro activado. Dibujaré los iconos como si estuviéramos escribiendo en una pizarra de tiza. ✏️🎒',
        '(^_-)db(-_#)'
      );
      gainCoins(15);
      return;
    }

    // 2. Wallpaper effects
    if (txt.includes('blur') || txt.includes('difumin') || txt.includes('borros')) {
      setSettings(prev => ({ ...prev, blurIntensity: Math.min(prev.blurIntensity + 10, 24) }));
      addBotMessage(
        '¡Hecho! Desenfoqué tu fondo de pantalla para que puedas ver los iconos mucho mejor. ¿Parece un sueño, verdad? 🌫️',
        'U_U'
      );
      return;
    }

    if (txt.includes('clear') || txt.includes('limp') || txt.includes('quitar blur') || txt.includes('enfoc')) {
      setSettings(prev => ({ ...prev, blurIntensity: 0 }));
      addBotMessage(
        '¡Entendido! Quitando filtros de desenfoque. ¡Guau, el fondo se ve super nítido de nuevo! ✨',
        '(✧ω✧)'
      );
      return;
    }

    // 3. Audio & Music
    if (txt.includes('lofi') || txt.includes('lo-fi') || txt.includes('música') || txt.includes('music') || txt.includes('sonar')) {
      addBotMessage(
        '¡Excelente elección! Puedes controlar las pistas de Lo-Fi directamente desde el widget de música de la pantalla de inicio o el reproductor. ¡Relaja tu mente, Sempai! 🎵💤',
        '🎧(˘⌣˘)🎧'
      );
      return;
    }

    // 4. Jokes & Quotes
    if (txt.includes('chiste') || txt.includes('joke')) {
      const jokes = [
        '¿Qué hace Luffy cuando tiene frío? ¡Se estira hacia la chimenea! 🍖',
        '¿Por qué los ninjas de Naruto no usan redes sociales? ¡Porque prefieren mantener su perfil bajo el Sharingan! 👁️',
        '¿Cuál es el colmo de un alquimista estatal? ¡Tener que pagar impuestos por transmutar su café en leche! ☕🧪',
        '¿Qué dice una taza cuando ve a Son Goku? ¡"Hola, súper tazón-jin!" 💥',
      ];
      const selected = jokes[Math.floor(Math.random() * jokes.length)];
      addBotMessage(selected, '(≧▽≦)');
      gainCoins(10);
      return;
    }

    if (txt.includes('frase') || txt.includes('quote') || txt.includes('anime')) {
      const quotes = [
        '"Si no arriesgas tu vida, no puedes crear un futuro." — Monkey D. Luffy (One Piece) 🏴‍☠️',
        '"Acepta el dolor, piensa sobre el dolor y conoce el dolor." — Pain (Naruto) 🍥',
        '"No mueras por tus amigos, vive por ellos." — Erza Scarlet (Fairy Tail) ⚔️',
        '"Cualquiera que sea lo que pierdas, lo volverás a encontrar. Pero lo que tires, nunca volverá a ti." — Kenshin Himura 🌸',
        '"La gente necesita que le digan que es valiosa para poder seguir adelante." — Kaworu Nagisa (Evangelion) 🌌',
      ];
      const selected = quotes[Math.floor(Math.random() * quotes.length)];
      addBotMessage(`Aquí tienes una frase con mucha determinación: \n\n${selected}`, '(′▽`〃)');
      gainCoins(10);
      return;
    }

    // 5. Conversational fallback
    const replies = [
      '¡Me encanta hablar contigo Sempai! ¿Quieres cambiar el fondo o jugar al minijuego para ganar monedas mágicas? ✨🐾',
      '¡Wow, qué profundo! Sabías que puedes arrastrar y soltar los iconos de la pantalla de inicio para acomodarlos? 📱',
      '¡Nyaa! Entiendo a la perfección. Recuerda que puedes alimentar a mi avatar o acariciarla tocándole la cabeza en la pantalla principal. 💕',
      '¡Eso suena súper divertido! Definitivamente somos los mejores compañeros de interfaz. (*>﹏<*)',
      'Sí, sí. Oye Sempai, ¿has probado a buscar "Netflix" o con la barra de búsqueda en el Cajón de Aplicaciones?',
      '¡Increíble! Si quieres cambiar el volumen de las burbujas, abre los Ajustes del Launcher. 🔊'
    ];
    const selected = replies[Math.floor(Math.random() * replies.length)];
    addBotMessage(selected, '(=^·^=)');
  };

  return (
    <div id="chat-app" className="flex flex-col h-full bg-slate-900/90 text-white font-sans rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-pink-400 border border-white/30 flex items-center justify-center text-xl overflow-hidden shadow-inner">
              🐾
            </div>
            <div className="absolute right-0 bottom-0 w-3 h-3 bg-emerald-400 border border-slate-900 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-1.5 text-sm md:text-base">
              Aiko Companion
              <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-bounce" />
            </div>
            <div className="text-[10px] text-pink-200">En línea • Neko Engine</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-white/10 text-pink-300 border border-pink-400/20 px-2 py-0.5 rounded-full font-mono">
            v2.4
          </span>
        </div>
      </div>

      {/* Suggestion list */}
      <div className="px-3 py-2 bg-slate-950/45 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-none">
        {INTERACTIVE_COMMANDS.map((item, idx) => (
          <button
            key={idx}
            id={`cmd-sugg-${idx}`}
            onClick={() => {
              setInput(item.cmd);
              playCuteSound('tap', settings.volume);
            }}
            className="whitespace-nowrap bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-xs text-slate-300 active:scale-95 transition-all"
          >
            {item.cmd}
          </button>
        ))}
      </div>

      {/* Messages Board */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[250px] bg-gradient-to-b from-slate-950/60 to-slate-900/30">
        {messages.map((m) => (
          <div
            key={m.id}
            id={`msg-${m.id}`}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3.5 rounded-2xl text-xs md:text-sm shadow-md transition-all ${
                m.sender === 'user'
                  ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-tr-none'
                  : 'bg-white/10 text-slate-100 border border-white/5 rounded-tl-none line-clamp-none'
              }`}
            >
              {m.text.split('\n').map((line, lidx) => (
                <p key={lidx} className="mb-0.5 leading-relaxed">{line}</p>
              ))}
              {m.reaction && (
                <div className="mt-2 text-[10px] font-mono bg-black/30 text-pink-300 px-2 py-0.5 rounded border border-pink-500/20 fits-content inline-block">
                  Aiko: {m.reaction}
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 select-none">
              {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950/60 border-t border-white/10 flex items-center gap-2">
        <input
          id="chat-input-box"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe algo o usa un comando..."
          className="flex-1 bg-white/5 border border-white/10 focus:border-pink-500 focus:outline-none rounded-2xl px-4 py-2 text-sm text-white placeholder-slate-500 transition-all font-sans"
        />
        <button
          id="cmd-send-btn"
          type="submit"
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white p-2.5 rounded-2xl active:scale-95 transition-all shadow-md font-sans"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
