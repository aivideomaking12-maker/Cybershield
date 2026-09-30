/**
 * CyberShield Main Application Bundle Entry Point
 */
import '../css/style.css';
import '../js/supabase.js';
import '../js/progress.js';
import '../js/gamification.js';
import '../js/quiz.js';
import '../js/navigation.js';
import '../js/app.js';

// Native React/Three.js office audit (no iframe / no second document).
import React from 'react';
import { createRoot } from 'react-dom/client';
import OfficeAuditApp from '../office3d/src/App.tsx';
import '../office3d/src/index.css';

const officeRoot = document.getElementById('office-3d-root');
if (officeRoot) {
    createRoot(officeRoot).render(React.createElement(OfficeAuditApp));
}
