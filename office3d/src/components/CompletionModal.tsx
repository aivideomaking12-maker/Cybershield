import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { GameStats, SecurityError } from '../types/game';
import { Award, CheckCircle2, RotateCcw, Clock, AlertCircle, ShieldCheck, ChevronRight, FileText } from 'lucide-react';

interface CompletionModalProps {
  stats: GameStats;
  errors: SecurityError[];
  onRestart: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  stats,
  errors,
  onRestart,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'audit'>('summary');

  useEffect(() => {
    // Fire celebratory confetti cannons
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ffffff'],
    });

    const timeout = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, []);

  const elapsedMin = Math.floor(stats.elapsedSeconds / 60);
  const elapsedSec = stats.elapsedSeconds % 60;
  const elapsedFormatted = `${elapsedMin > 0 ? `${elapsedMin} perc ` : ''}${elapsedSec} mp`;

  // Performance rating based on time and mistakes
  let rating = 'Kiváló Információbiztonsági Szakértő';
  let ratingColor = 'text-emerald-400';
  if (stats.mistakes > 8 || stats.elapsedSeconds > 240) {
    rating = 'Gyakorlott Biztonsági Ellenőr';
    ratingColor = 'text-sky-400';
  } else if (stats.mistakes > 14) {
    rating = 'Megfelelt — További felkészülés javasolt';
    ratingColor = 'text-amber-400';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-emerald-950/60 p-6 border-b border-slate-800 text-center relative">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase font-['Space_Grotesk']">
            Ellenőrzés Befejezve
          </h2>
          <p className="text-sm font-semibold text-emerald-400 mt-1">
            15 / 15 biztonsági hiba sikeresen azonosítva!
          </p>
          <div className={`text-xs font-medium mt-1 ${ratingColor}`}>
            Minősítés: {rating}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'summary' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Vizsgálati Eredmény</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Biztonsági Jelentés (15/15)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'summary' ? (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                    Megtalálva
                  </span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    15 / 15
                  </span>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                    Eltelt idő
                  </span>
                  <span className="text-lg font-bold text-sky-400 font-mono">
                    {elapsedFormatted}
                  </span>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                    Téves kattintás
                  </span>
                  <span className="text-lg font-bold text-amber-400 font-mono">
                    {stats.mistakes} db
                  </span>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                    Végső pontszám
                  </span>
                  <span className="text-lg font-bold text-amber-300 font-mono">
                    {stats.score.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Assessment Message */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-2">
                <h4 className="font-bold text-white text-sm">
                  Kiváló megfigyelőkészség és szabályzat-ismeret!
                </h4>
                <p>
                  Sikeresen felderítetted a rendőrségi iroda mind a 15 fizikai és információbiztonsági mulasztását. A való életben az ehhez hasonló rések teszik lehetővé a jogosulatlan belépést, adatlopást, zsarolóvírusos támadásokat és a hivatali titoksértést.
                </p>
                <p className="text-slate-400">
                  Mindig tartsd be a „Tiszta asztal” (Clean Desk) és „Tiszta képernyő” szabályzatokat, soha ne hagyj felügyelet nélkül szolgálati eszközt vagy bizalmas nyomtatványt!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                Az alábbiakban megtekintheted a feltárt 15 biztonsági rést és a kötelező elhárítási intézkedéseket:
              </p>
              <div className="space-y-2">
                {errors.map((error, idx) => (
                  <div
                    key={error.id}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-white">
                        <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-mono text-[11px]">
                          {idx + 1}
                        </span>
                        <span>{error.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {error.categoryLabel}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed pl-7">
                      {error.description}
                    </p>
                    <div className="pl-7 text-[11px] text-emerald-400/90 font-medium">
                      Intézkedés: {error.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTAs */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Információbiztonsági Tudatossági Tréning
          </span>

          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Újraindítás</span>
          </button>
        </div>
      </div>
    </div>
  );
};
