export type ErrorCategory = 
  | 'fizikai' 
  | 'hozzaferes' 
  | 'adatvedelem' 
  | 'eszkozkezeles' 
  | 'halozat';

export interface SecurityError {
  id: string;
  title: string;
  description: string;
  category: ErrorCategory;
  categoryLabel: string;
  severity: 'Kritikus' | 'Magas' | 'Közepes';
  mitigation: string;
  // 3D position in the office scene
  position: [number, number, number];
  // Target focus position for the camera when inspecting
  focusPosition?: [number, number, number];
  // Hitbox radius / size for raycasting
  hitRadius: number;
  discovered: boolean;
}

export type GameStatus = 'INTRO' | 'PLAYING' | 'COMPLETED' | 'PAUSED';

export interface GameStats {
  foundCount: number;
  totalErrors: number;
  mistakes: number;
  elapsedSeconds: number;
  score: number;
  timeRemaining: number;
}
