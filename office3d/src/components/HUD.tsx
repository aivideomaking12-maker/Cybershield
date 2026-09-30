import React from 'react';
import { Volume2, VolumeX, RotateCcw, Timer, CheckCircle2, HelpCircle } from 'lucide-react';
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
  const minutes = Math.floor(Math.max(0, stats.timeRemaining) / 60);
  const seconds = Math.max(0, stats.timeRemaining) % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.round((stats.foundCount / stats.totalErrors) * 100);

  return (
    <header className="relative z-30 w-full shrink-0 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 py-2.5 font-sans">
      <div className="w-full flex items-center justify-center gap-4 sm:gap-10">
        {/* Metrics only: the CyberShield branding is already in the parent page header. */}
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Megtalált hibák</span>
              <span className="font-mono tabular-nums text-sm sm:text-base font-bold text-emerald-400">
                {stats.foundCount} <span className="text-slate-500 font-normal">/ {stats.totalErrors}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Timer className={`w-4 h-4 shrink-0 ${stats.timeRemaining <= 60 ? 'text-rose-400 animate-pulse' : 'text-sky-400'}`} />
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Idő</span>
              <span className={`font-mono tabular-nums text-sm sm:text-base font-bold ${stats.timeRemaining <= 60 ? 'text-rose-400' : 'text-sky-300'}`}>
                {timeFormatted}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Pontszám</span>
              <span className="font-mono tabular-nums text-sm sm:text-base font-bold text-amber-400">
                {stats.score.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2">
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

      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-800/80">
        <div
          className="h-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
};
