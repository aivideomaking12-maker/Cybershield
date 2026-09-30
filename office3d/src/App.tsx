import React, { useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_OFFICE_ERRORS } from './data/errors';
import { SecurityError, GameStats, GameStatus } from './types/game';
import { sound } from './utils/audio';
import { HUD } from './components/HUD';
import { SidePanel } from './components/SidePanel';
import { OfficeScene } from './components/OfficeScene';
import { CompletionModal } from './components/CompletionModal';
import { HelpModal } from './components/HelpModal';

interface MissRipple {
  id: number;
  x: number;
  y: number;
}

export default function App() {
  const [errors, setErrors] = useState<SecurityError[]>(() =>
    INITIAL_OFFICE_ERRORS.map((e) => ({ ...e, discovered: false }))
  );

  const [stats, setStats] = useState<GameStats>({
    foundCount: 0,
    totalErrors: 15,
    mistakes: 0,
    elapsedSeconds: 0,
    score: 0,
    timeRemaining: 300, // 05:00 minutes
  });

  const [status, setStatus] = useState<GameStatus>('PLAYING');
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>(null);
  const [focusedErrorId, setFocusedErrorId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);
  const [resetCounter, setResetCounter] = useState<number>(0);

  // Integráció a CyberShield szülőalkalmazással: a legacy audit képernyő
  // ezen az üzenetcsatornán adja át a korábban megtalált hibákat, és ugyanitt
  // jelezzük vissza a teljes audit eredményét.
  useEffect(() => {
    const handleParentMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      if (!event.data || event.data.type !== 'CYBERSHIELD_OFFICE_AUDIT_INIT') return;

      const foundIds = new Set<string>(Array.isArray(event.data.foundIds) ? event.data.foundIds : []);
      setErrors((prev) => prev.map((error) => ({ ...error, discovered: foundIds.has(error.id) })));
      setStats((prev) => ({
        ...prev,
        foundCount: Math.min(foundIds.size, prev.totalErrors),
      }));
      if (foundIds.size >= 15) setStatus('COMPLETED');
    };

    window.addEventListener('message', handleParentMessage);
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'CYBERSHIELD_OFFICE_AUDIT_READY' }, '*');
    }
    return () => window.removeEventListener('message', handleParentMessage);
  }, []);

  // Miss-click visual ripple coordinates
  const [missRipples, setMissRipples] = useState<MissRipple[]>([]);
  const rippleCounter = useRef<number>(0);

  // Sound mute sync
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  // Timer interval
  useEffect(() => {
    if (status !== 'PLAYING') return;

    const timer = setInterval(() => {
      setStats((prev) => {
        const nextElapsed = prev.elapsedSeconds + 1;
        const nextRemaining = Math.max(0, prev.timeRemaining - 1);
        return {
          ...prev,
          elapsedSeconds: nextElapsed,
          timeRemaining: nextRemaining,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Küldjük vissza az eredményt csak akkor, amikor a React állapot ténylegesen
  // COMPLETED állapotba került; így StrictMode mellett sem duplázódik az esemény.
  useEffect(() => {
    if (status !== 'COMPLETED' || window.parent === window) return;
    window.parent.postMessage({
      type: 'CYBERSHIELD_OFFICE_AUDIT_COMPLETED',
      stats: {
        elapsedSeconds: stats.elapsedSeconds,
        wrongClicks: stats.mistakes,
        score: stats.score,
      },
    }, '*');
  }, [status]);

  // Handler: Player discovered a valid error
  const handleFoundError = useCallback((targetError: SecurityError) => {
    sound.playSuccess();

    setErrors((prev) =>
      prev.map((e) => (e.id === targetError.id ? { ...e, discovered: true } : e))
    );

    setSelectedErrorId(targetError.id);

    setStats((prev) => {
      const nextFound = prev.foundCount + 1;
      const nextScore = prev.score + 1000 + Math.max(0, Math.floor(prev.timeRemaining * 2));

      if (nextFound >= prev.totalErrors) {
        // Complete the audit!
        setTimeout(() => {
          setStatus('COMPLETED');
          sound.playCompletion();
        }, 600);
      }

      return {
        ...prev,
        foundCount: nextFound,
        score: nextScore,
      };
    });
  }, []);

  // Handler: Player clicked empty/safe area in office (Mistake)
  const handleMissClick = useCallback((x: number, y: number) => {
    sound.playError();

    // Spawn red ripple effect
    const newRippleId = ++rippleCounter.current;
    setMissRipples((prev) => [...prev, { id: newRippleId, x, y }]);
    setTimeout(() => {
      setMissRipples((prev) => prev.filter((r) => r.id !== newRippleId));
    }, 600);

    setStats((prev) => ({
      ...prev,
      mistakes: prev.mistakes + 1,
      score: Math.max(0, prev.score - 30),
    }));
  }, []);

  // Handler: Select an error in the side panel or 3D
  const handleSelectError = useCallback((id: string) => {
    setSelectedErrorId(id);
  }, []);

  // Handler: Focus camera on error
  const handleFocusError = useCallback((id: string) => {
    setFocusedErrorId(id);
    setSelectedErrorId(id);
  }, []);

  const handleClearFocus = useCallback(() => {
    setFocusedErrorId(null);
  }, []);

  // Reset Game
  const handleReset = () => {
    setErrors(INITIAL_OFFICE_ERRORS.map((e) => ({ ...e, discovered: false })));
    setStats({
      foundCount: 0,
      totalErrors: 15,
      mistakes: 0,
      elapsedSeconds: 0,
      score: 0,
      timeRemaining: 300,
    });
    setSelectedErrorId(null);
    setFocusedErrorId(null);
    setStatus('PLAYING');
    setResetCounter((prev) => prev + 1);
    sound.playClick();
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-['Plus_Jakarta_Sans']">
      {/* Top HUD */}
      <HUD
        stats={stats}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onReset={handleReset}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Game Surface */}
      <div className="relative flex-1 w-full h-[calc(100vh-53px)] overflow-hidden">
        {/* Three.js 3D Scene */}
        <OfficeScene
          errors={errors}
          onFoundError={handleFoundError}
          onMissClick={handleMissClick}
          selectedErrorId={selectedErrorId}
          onSelectError={handleSelectError}
          focusedErrorId={focusedErrorId}
          onClearFocus={handleClearFocus}
          resetCounter={resetCounter}
        />

        {/* Miss-Click Ripple Animations */}
        {missRipples.map((ripple) => (
          <div
            key={ripple.id}
            style={{ left: ripple.x, top: ripple.y }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="w-8 h-8 rounded-full border-2 border-rose-500/80 animate-ping" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono text-rose-400 whitespace-nowrap opacity-80">
              -30
            </div>
          </div>
        ))}

        {/* Right Side Investigation Panel */}
        <SidePanel
          errors={errors}
          selectedErrorId={selectedErrorId}
          onSelectError={handleSelectError}
          onFocusError={handleFocusError}
          isOpen={isSidePanelOpen}
          onToggleOpen={() => setIsSidePanelOpen((prev) => !prev)}
        />
      </div>

      {/* Completion Modal */}
      {status === 'COMPLETED' && (
        <CompletionModal
          stats={stats}
          errors={errors}
          onRestart={handleReset}
        />
      )}

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
