import React from 'react';
import { SecurityError } from '../types/game';
import { Check, HelpCircle, Eye, AlertTriangle, ChevronRight, ShieldCheck, ChevronLeft } from 'lucide-react';

interface SidePanelProps {
  errors: SecurityError[];
  selectedErrorId: string | null;
  onSelectError: (id: string) => void;
  onFocusError: (id: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  errors,
  selectedErrorId,
  onSelectError,
  onFocusError,
  isOpen,
  onToggleOpen,
}) => {
  const discoveredErrors = errors.filter((e) => e.discovered);
  const selectedError = errors.find((e) => e.id === selectedErrorId);
  const remainingCount = errors.length - discoveredErrors.length;

  return (
    <>
      {/* Mobile / Compact Toggle Handle */}
      <button
        onClick={onToggleOpen}
        className="fixed top-20 right-0 z-40 lg:hidden flex items-center gap-1.5 px-2.5 py-2 bg-slate-900/90 border-l border-y border-slate-700/80 rounded-l-xl text-xs font-semibold text-slate-200 shadow-xl backdrop-blur-md"
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        <span>{discoveredErrors.length}/15</span>
      </button>

      {/* Main Side Panel Container */}
      <aside
        className={`fixed top-[53px] bottom-0 right-0 z-30 w-full sm:w-[400px] lg:w-[440px] bg-slate-950/85 backdrop-blur-xl border-l border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Vizsgálati jelentés
            </span>
            <span className="font-mono text-xs text-emerald-400 font-semibold">
              {discoveredErrors.length} / {errors.length} azonosítva
            </span>
          </div>

          <h2 className="text-base font-bold text-white font-sans tracking-tight">
            Információbiztonsági Ellenőrzés
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {discoveredErrors.length === 0
              ? 'Vizsgáld át az irodát, és találd meg mind a 15 biztonsági hibát az egérrel való kattintással.'
              : `Még ${remainingCount} kritikus biztonsági rés vár feltárásra az iroda területén.`}
          </p>
        </div>

        {/* Selected or Most Recent Error Card */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
          {selectedError ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">{selectedError.categoryLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-medium ${
                        selectedError.severity === 'Kritikus'
                          ? 'text-rose-400'
                          : selectedError.severity === 'Magas'
                          ? 'text-amber-400'
                          : 'text-sky-400'
                      }`}
                    >
                      {selectedError.severity} kockázat
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {selectedError.title}
                  </h3>
                </div>

                <button
                  onClick={() => onFocusError(selectedError.id)}
                  title="Kamera fókuszálása a hibára"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-950/80 hover:bg-blue-900 border border-blue-500/30 text-blue-300 hover:text-white text-xs font-medium transition-colors shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Közelítés</span>
                </button>
              </div>

              {/* Description */}
              <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 leading-relaxed">
                {selectedError.description}
              </div>

              {/* Mitigation Advice */}
              <div className="text-xs bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg text-emerald-200/90 leading-relaxed">
                <span className="font-semibold text-emerald-400 block mb-0.5">
                  🛡 Megoldási javaslat:
                </span>
                {selectedError.mitigation}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-950/40 border border-dashed border-slate-800 text-slate-400 text-xs">
              <HelpCircle className="w-5 h-5 text-slate-500 shrink-0" />
              <span>
                Kattints az irodai térben egy gyanús objektumra a vizsgálat megkezdéséhez!
              </span>
            </div>
          )}
        </div>

        {/* Discovery Checklist (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Ellenőrző lista ({discoveredErrors.length}/15)
            </span>
            <span className="text-[11px] text-slate-500">Kattints a megtekintéshez</span>
          </div>

          <div className="space-y-1.5">
            {errors.map((error, idx) => {
              const isSelected = selectedErrorId === error.id;

              if (error.discovered) {
                return (
                  <button
                    key={error.id}
                    onClick={() => {
                      onSelectError(error.id);
                      onFocusError(error.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500/60 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{error.title}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {error.categoryLabel} · {error.severity}
                      </div>
                    </div>
                    <Eye className="w-3.5 h-3.5 text-slate-500 hover:text-white shrink-0 mt-0.5" />
                  </button>
                );
              }

              // Undiscovered item slot
              return (
                <div
                  key={error.id}
                  className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-900 text-slate-500 text-xs flex items-center gap-2.5"
                >
                  <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-800 text-slate-600 flex items-center justify-center font-mono text-[10px] shrink-0">
                    ?
                  </div>
                  <span className="italic truncate text-slate-500">
                    Még nem azonosított biztonsági hiba #{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950 text-center">
          <p className="text-[11px] text-slate-500">
            Magyar Rendőrség · Információbiztonsági és Adatvédelmi Oktatómodul
          </p>
        </div>
      </aside>
    </>
  );
};
