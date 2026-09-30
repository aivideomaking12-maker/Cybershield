import React from 'react';
import { Volume2, VolumeX, RotateCcw, ShieldAlert, Timer, CheckCircle2, HelpCircle } from 'lucide-react';
import { GameStats } from '../types/game';

interface HUDProps {
  stats: GameStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onReset: () => void;
  onOpenHelp: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  isMuted,
  onToggleMute,
  onReset,
  onOpenHelp,
}) => {
  // Format remaining time MM:SS
  const minutes = Math.floor(Math.max(0, stats.timeRemaining) / 60);
  const seconds = Math.max(0, stats.timeRemaining) % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = Math.round((stats.foundCount / stats.totalErrors) * 100);

  return (
    <header className="relative z-30 w-full bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand & Mission Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-white uppercase truncate font-['Space_Grotesk']">
              Információbiztonsági Ellenőrzés
            </h1>
            <p className="text-xs text-slate-400 truncate hidden sm:block">
              Rendőrségi Irodai Audit · Keresd meg mind a 15 biztonsági rést!
            </p>
          </div>
        </div>

        {/* Center: Key Metrics (Tabular HUD) */}
        <div className="flex items-center gap-4 sm:gap-8 shrink-0">
          {/* Found Count */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                Megtalált hibák
              </span>
              <span className="font-mono tabular-nums text-sm sm:text-base font-bold text-emerald-400">
                {stats.foundCount} <span className="text-slate-500 font-normal">/ {stats.totalErrors}</span>
              </span>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2">
            <Timer className={`w-4 h-4 shrink-0 ${stats.timeRemaining <= 60 ? 'text-rose-400 animate-pulse' : 'text-sky-400'}`} />
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                Idő
              </span>
              <span className={`font-mono tabular-nums text-sm sm:text-base font-bold ${stats.timeRemaining <= 60 ? 'text-rose-400' : 'text-sky-300'}`}>
                {timeFormatted}
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="hidden md:flex items-center gap-2">
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                Pontszám
              </span>
              <span className="font-mono tabular-nums text-sm sm:text-base font-bold text-amber-400">
                {stats.score.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenHelp}
            title="Útmutató és Szabályzat"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            title={isMuted ? 'Hang bekapcsolása' : 'Hang némítása'}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onReset}
            title="Újraindítás"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Újraindítás</span>
          </button>
        </div>
      </div>

      {/* Thin top progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-800/80">
        <div
          className="h-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
};
