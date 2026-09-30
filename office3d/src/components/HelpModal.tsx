import React from 'react';
import { X, ShieldAlert, MousePointer, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-900/60 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase font-['Space_Grotesk']">
              Hogyan kell játszani?
            </h3>
            <p className="text-xs text-slate-400">
              Információbiztonsági és Fizikai Ellenőrzés
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <MousePointer className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">1. Keresd meg a hibákat</span>
              Nézz körül a modern rendőrségi irodában az egér bal gombjával forgatva és a görgővel zoomolva. Kattints bármilyen gyanús tárgyra vagy biztonsági mulasztásra!
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">2. Helyes találat (+1000 Pont)</span>
              Ha valódi hibára kattintasz, az objektum zöld aura fénnyel jelölve marad, a jobb oldali jelentésben megjelenik a szakmai leírás és a megelőzési javaslat.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">3. Kerüld a téves kattintásokat</span>
              A céltalan vagy téves kattintásokért levonás jár és rontja a végső minősítést. Figyeld meg alaposan a környezetet!
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <Eye className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">4. Kamera nézetek és közelítés</span>
              Használd a képernyő bal alsó sarkában található előre beállított kameranézeteket vagy az ellenőrző listán a „Közelítés” gombot a részletes vizsgálathoz.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-950"
        >
          Értettem, folytatom az ellenőrzést!
        </button>
      </div>
    </div>
  );
};
