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
import React from 'react';
import { createRoot } from 'react-dom/client';
import Office3DApp from '../office3d/src/App.tsx';
import '../office3d/src/index.css';

const officeRootElement = document.getElementById('office-3d-root');
if (officeRootElement) {
    const officeRoot = createRoot(officeRootElement);
    officeRoot.render(React.createElement(Office3DApp, {
        onErrorFound: (errorId) => window.Quiz?.recordOffice3DError?.(errorId),
        onCompleted: (stats) => window.Quiz?.completeOfficeAuditFrom3D?.(stats),
    }));

    window.Office3D = {
        init(foundIds = []) {
            window.dispatchEvent(new CustomEvent('cybershield:office-init', {
                detail: { foundIds, auditStats: window.Progress?.getState?.().officeAuditStats || null }
            }));
        }
    };
}
