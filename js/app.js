/**
 * CyberShield - app.js
 * Main entry point of the CyberShield digital curriculum.
 * Bootstraps the application, handles profile creation, reset events,
 * keyboard-based spatial navigation, and teacher JSON report generation.
 */

window.App = (function() {

    /**
     * Initializes the app on page load
     */
    async function init() {
        console.log("CyberShield program inicializálása...");
        
        // Update UI status banner based on Supabase Connection
        const statusDot = document.getElementById('supabase-status-dot');
        const statusText = document.getElementById('supabase-status-text');

        if (window.SupabaseConnection && window.SupabaseConnection.isConfigured()) {
            if (statusDot) {
                statusDot.className = "w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1 animate-pulse";
            }
            if (statusText) {
                statusText.innerText = "Supabase felhő-szinkronizált mód aktív.";
            }

            try {
                const { data: { session } } = await window.SupabaseConnection.client.auth.getSession();
                if (session) {
                    await window.Progress.loadFromSupabase(session.user.id);
                    window.Progress.updateHeaderUI();
                    
                    const activeScreen = document.querySelector('.active-screen');
                    if (!activeScreen || activeScreen.id === 'screen-landing' || activeScreen.id === 'screen-profile') {
                        const uState = window.Progress.getState();
                        if (uState.user && uState.user.role === 'admin') {
                            window.Navigation.showScreen('screen-teacher');
                        } else {
                            window.Navigation.showScreen('screen-map');
                        }
                    }
                } else {
                    window.Navigation.showScreen('screen-landing');
                }
            } catch (err) {
                console.error("Session ellenőrzési hiba:", err);
                window.Navigation.showScreen('screen-landing');
            }
        } else {
            if (statusDot) {
                statusDot.className = "w-2 h-2 rounded-full bg-amber-500 inline-block mr-1";
            }
            if (statusText) {
                statusText.innerText = "Supabase nincs konfigurálva. Helyi LocalStorage üzemmód (Offline) aktív.";
            }

            const state = window.Progress.load();
            window.Progress.updateHeaderUI();

            if (state.user) {
                if (state.user.role === 'admin') {
                    window.Navigation.showScreen('screen-teacher');
                } else {
                    window.Navigation.showScreen('screen-map');
                }
            } else {
                window.Navigation.showScreen('screen-landing');
            }
        }

        setupKeyboardNavigation();
    }

    /**
     * Spatial keyboard navigation for accessibility compliance
     */
    function setupKeyboardNavigation() {
        window.addEventListener('keydown', (e) => {
            // General "Escape" key goes back to Map HQ
            if (e.key === 'Escape') {
                const activeScreen = document.querySelector('.active-screen');
                if (activeScreen) {
                    const id = activeScreen.id;
                    if (id !== 'screen-landing' && id !== 'screen-profile' && id !== 'screen-diagnostic') {
                        window.Navigation.goToHome();
                    }
                }
            }

            // Keyboard shortcut info panel inside study module or map (Alt + H for help / home)
            if (e.altKey && e.key === 'h') {
                window.Navigation.goToHome();
                window.Gamification.showToast("Parancsikon Aktiválva", "Alt+H: Vissza a térképre irányítva.", "info");
            }
        });

        // Add ARIA landmark roles and accessibility instructions to body for screen readers
        const helperDiv = document.createElement('div');
        helperDiv.className = 'sr-only';
        helperDiv.innerText = 'CyberShield Információbiztonsági Digitális Tananyag. Használja a Tab és Enter billentyűket a navigáláshoz, az Alt + H kombinációt a főhadiszálláshoz való visszatéréshez, az Escape billentyűt a modulok bezárásához.';
        document.body.appendChild(helperDiv);
    }

    /**
     * Switch between Login and Register tabs on Landing screen
     */
    function switchAuthTab(tab) {
        const tabLogin = document.getElementById('auth-tab-login');
        const tabRegister = document.getElementById('auth-tab-register');
        const formLogin = document.getElementById('login-form');
        const formRegister = document.getElementById('register-form');

        if (tab === 'login') {
            if (tabLogin) tabLogin.className = "flex-1 pb-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 border-cyan-500 text-cyan-400 transition-all cursor-pointer focus:outline-none";
            if (tabRegister) tabRegister.className = "flex-1 pb-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-slate-400 hover:text-slate-300 transition-all cursor-pointer focus:outline-none";
            if (formLogin) formLogin.classList.remove('hidden');
            if (formRegister) formRegister.classList.add('hidden');
        } else {
            if (tabLogin) tabLogin.className = "flex-1 pb-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-slate-400 hover:text-slate-300 transition-all cursor-pointer focus:outline-none";
            if (tabRegister) tabRegister.className = "flex-1 pb-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 border-emerald-500 text-emerald-400 transition-all cursor-pointer focus:outline-none";
            if (formLogin) formLogin.classList.add('hidden');
            if (formRegister) formRegister.classList.remove('hidden');
        }
    }

    /**
     * Handle login form submit with Supabase Auth or offline fallback
     */
    async function handleLogin(e) {
        e.preventDefault();
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        if (!emailInput || !passwordInput) return;
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        window.Gamification.showToast("Bejelentkezés...", "Kapcsolódás a biztonságos kiszolgálóhoz...", "info");

        if (window.SupabaseConnection && window.SupabaseConnection.isConfigured()) {
            try {
                const { data, error } = await window.SupabaseConnection.client.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    window.Gamification.showToast("Sikertelen belépés", error.message, "error");
                    return;
                }

                window.Gamification.showToast("Sikeres belépés", "Üdvözöljük a CyberShield rendszerben!", "success");
                await window.Progress.loadFromSupabase(data.user.id);
                window.Progress.updateHeaderUI();

                const uState = window.Progress.getState();
                if (uState.user && uState.user.role === 'admin') {
                    window.Navigation.showScreen('screen-teacher');
                } else {
                    window.Navigation.showScreen('screen-map');
                }
            } catch (err) {
                console.error(err);
                window.Gamification.showToast("Kapcsolódási hiba", "Nem sikerült elérni a hitelesítő szervert.", "error");
            }
        } else {
            // Offline fallback
            const state = window.Progress.load();
            if (state.user) {
                window.Gamification.showToast("Offline belépés", `Üdvözöljük újra, ${state.user.name}!`, "success");
                if (state.user.role === 'admin') {
                    window.Navigation.showScreen('screen-teacher');
                } else {
                    window.Navigation.showScreen('screen-map');
                }
            } else {
                window.Gamification.showToast("Nincs helyi profil", "Kérjük, először regisztráljon a Regisztráció fülön!", "warning");
            }
        }
    }

    /**
     * Handle registration form submit with Supabase Auth or offline fallback
     */
    async function handleRegister(e) {
        e.preventDefault();
        const emailInput = document.getElementById('reg-email');
        const passwordInput = document.getElementById('reg-password');
        const nameInput = document.getElementById('reg-name');
        const rankSelect = document.getElementById('reg-rank');
        const roleSelect = document.getElementById('reg-role');
        const unitInput = document.getElementById('reg-unit');

        if (!emailInput || !passwordInput || !nameInput || !rankSelect || !roleSelect || !unitInput) return;

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const fullName = nameInput.value.trim();
        const rank = rankSelect.value;
        const role = roleSelect.value;
        const unit = unitInput.value.trim();

        window.Gamification.showToast("Regisztráció...", "Felhasználói fiók létrehozása...", "info");

        if (window.SupabaseConnection && window.SupabaseConnection.isConfigured()) {
            try {
                const { data, error } = await window.SupabaseConnection.client.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            rank: rank,
                            unit: unit,
                            role: role
                        }
                    }
                });

                if (error) {
                    window.Gamification.showToast("Sikertelen regisztráció", error.message, "error");
                    return;
                }

                if (data.user) {
                    // Manual profile insert to guarantee profile sync
                    const { error: profileError } = await window.SupabaseConnection.client
                        .from('profiles')
                        .upsert({
                            id: data.user.id,
                            email: email,
                            full_name: fullName,
                            rank: rank,
                            unit: unit,
                            role: role,
                            xp: 0,
                            badge: 'Újonc',
                            path: 'Kezdő'
                        });

                    if (profileError) {
                        console.error(profileError);
                    }

                    // Save local state copy
                    const userData = {
                        name: fullName,
                        rank: rank,
                        unit: unit,
                        role: role,
                        xp: 0,
                        badge: 'Újonc',
                        path: 'Kezdő'
                    };
                    window.Progress.setUser(userData);

                    window.Gamification.showToast("Fiók létrehozva", "Profil sikeresen létrehozva a felhőben!", "success");
                    
                    // Switch to login automatically
                    switchAuthTab('login');
                    const loginEmail = document.getElementById('login-email');
                    const loginPass = document.getElementById('login-password');
                    if (loginEmail) loginEmail.value = email;
                    if (loginPass) loginPass.value = password;

                    // Immediately show diagnostic test
                    window.Navigation.showScreen('screen-diagnostic');
                    window.Quiz.startDiagnostic();
                }
            } catch (err) {
                console.error(err);
                window.Gamification.showToast("Kapcsolódási hiba", "Nem sikerült elérni a regisztrációs kiszolgálót.", "error");
            }
        } else {
            // Offline fallback registration
            const userData = {
                name: fullName,
                rank: rank,
                unit: unit,
                role: role,
                xp: 0,
                badge: 'Újonc',
                path: 'Kezdő'
            };
            window.Progress.setUser(userData);
            window.Gamification.showToast("Offline Regisztráció", "Profil elmentve helyben. Jó tanulást!", "success");

            window.Navigation.showScreen('screen-diagnostic');
            window.Quiz.startDiagnostic();
        }
    }

    /**
     * Select user mode from Landing Screen (compatibility mode for old triggers)
     * @param {'student' | 'teacher'} role Selected path
     */
    function selectRole(role) {
        const state = window.Progress.getState();

        if (role === 'student') {
            if (state.user) {
                window.Navigation.showScreen('screen-map');
            } else {
                window.Navigation.showScreen('screen-landing');
            }
        } else if (role === 'teacher') {
            window.Navigation.showScreen('screen-teacher');
            window.Gamification.showToast("Oktatói Mód", "Sikeresen belépett a távfelügyeleti ellenőrző panelre.", "info");
        }
    }

    /**
     * Handle student profile registration form submit (unused)
     * @param {Event} e 
     */
    function saveProfile(e) {
        e.preventDefault();
    }

    /**
     * Reset student's entire progress and return to Landing Screen
     */
    function resetData() {
        const modal = document.getElementById('logout-confirm-modal');
        if (modal) {
            modal.classList.remove('hidden');
        } else {
            if (confirm("Biztosan törölni szeretné a teljes előrehaladását és ki szeretne jelentkezni?")) {
                confirmResetData();
            }
        }
    }

    /**
     * Confirms the reset from the custom modal
     */
    async function confirmResetData() {
        const modal = document.getElementById('logout-confirm-modal');
        if (modal) modal.classList.add('hidden');

        // Sign out from Supabase if configured
        if (window.SupabaseConnection && window.SupabaseConnection.isConfigured()) {
            try {
                await window.SupabaseConnection.client.auth.signOut();
            } catch (err) {
                console.error("SignOut hiba:", err);
            }
        }

        window.Progress.reset();
        window.Progress.updateHeaderUI();
        
        const overlayContainer = document.getElementById('office-success-overlays');
        if (overlayContainer) overlayContainer.innerHTML = '';
        
        window.Gamification.showToast("Kijelentkezés sikeres", "Sikeresen kijelentkezett és törölte a helyi gyorsítótárat.", "warning");
        window.Navigation.showScreen('screen-landing');
    }

    /**
     * Export complete student progress report to local printable HTML file download
     * designed to automatically open the print dialog when opened.
     */
    function printReport() {
        const state = window.Progress.getState();
        if (!state.user) {
            window.Gamification.showToast("Nincs profil", "Nincs betöltött hivatali profil a riport elkészítéséhez!", "warning");
            return;
        }

        const completedCount = Object.keys(state.completedModules).length;
        const totalModules = 5;
        const officeCount = state.officeErrors ? state.officeErrors.length : 0;
        const escaperoomCount = state.escaperoomLocks ? state.escaperoomLocks.filter(l => l).length : 0;

        let modulesHtml = '';
        if (completedCount === 0) {
            modulesHtml = '<tr><td colspan="5" style="text-align:center; padding:15px; color:#64748b;">Nincs befejezett tanulmányi modul.</td></tr>';
        } else {
            for (let id in state.completedModules) {
                const mod = state.completedModules[id];
                const modName = window.QuizData.modules[id] ? window.QuizData.modules[id].title : `Modul ${id}`;
                modulesHtml += `
                    <tr>
                        <td style="padding:10px; border-bottom:1px solid #e2e8f0; font-weight:bold; color:#1e293b;">${id}. ${modName}</td>
                        <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:center;"><span style="background-color:#def7ec; color:#03543f; padding:3px 8px; border-radius:4px; font-size:10px; font-weight:bold;">SIKERES</span></td>
                        <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:right; font-family:monospace; font-weight:bold; color:#0f766e;">+${mod.xp} XP</td>
                        <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:right; font-family:monospace;">${mod.score} / ${mod.total} (${Math.round(mod.score/mod.total*100)}%)</td>
                        <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:right; font-family:monospace; color:#64748b;">${mod.date}</td>
                    </tr>
                `;
            }
        }

        let weaknessesHtml = '';
        if (!state.weaknesses || state.weaknesses.length === 0) {
            weaknessesHtml = '<p style="color:#0f766e; font-weight:bold; font-size:11px; background-color:#f0fdf4; padding:10px; border-radius:8px; border:1.5px solid #bbf7d0; margin:0;">✓ Nem rögzítettünk fejlesztendő területet. Minden vizsgakérdésre helyes válasz született.</p>';
        } else {
            weaknessesHtml = '<ul style="margin: 0; padding-left: 20px; font-size:11px; line-height:1.6; color:#1e293b;">';
            state.weaknesses.forEach(w => {
                weaknessesHtml += `<li style="margin-bottom:6px;"><strong>\${w}</strong></li>`;
            });
            weaknessesHtml += '</ul>';
        }

        const diagScoreStr = state.diagnosticScore ? `${state.diagnosticScore.score} / 15 (${state.diagnosticScore.percentage}%)` : 'Nem kitöltött';
        const diagPathStr = state.diagnosticScore ? `${state.diagnosticScore.path}` : 'Nincs besorolás';

        const printHtml = `<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <title>CyberShield Minősítő Riport - \${state.user.name}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #334155;
            background-color: #ffffff;
            margin: 0;
            padding: 40px;
            font-size: 13px;
            line-height: 1.5;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .logo-cell {
            width: 80px;
            vertical-align: middle;
        }
        .title-cell {
            padding-left: 20px;
            vertical-align: middle;
        }
        .title-cell h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 800;
            color: #1e3a8a;
            letter-spacing: 1px;
        }
        .title-cell p {
            margin: 4px 0 0 0;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 700;
            color: #4b5563;
            letter-spacing: 2px;
        }
        .doc-badge {
            background-color: #1e3a8a;
            color: #ffffff;
            font-weight: bold;
            padding: 5px 12px;
            border-radius: 4px;
            font-size: 10px;
            letter-spacing: 1px;
            display: inline-block;
        }
        .section-title {
            font-size: 14px;
            font-weight: 800;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 6px;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .profile-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            background-color: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .profile-grid td {
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
        }
        .profile-label {
            font-weight: bold;
            color: #475569;
            width: 25%;
            font-size: 11px;
            text-transform: uppercase;
        }
        .profile-value {
            color: #0f172a;
            font-weight: 600;
        }
        .metric-cards {
            display: flex;
            gap: 15px;
            margin-bottom: 25px;
        }
        .metric-card {
            flex: 1;
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .metric-value {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin: 5px 0;
        }
        .metric-label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 1px;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        table.data-table th {
            background-color: #1e3a8a;
            color: #ffffff;
            padding: 10px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        table.data-table td {
            font-size: 12px;
            padding: 10px;
        }
        .weakness-box {
            background-color: #fef2f2;
            border: 1.5px solid #fee2e2;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .signature-section {
            margin-top: 50px;
            width: 100%;
            border-collapse: collapse;
            page-break-inside: avoid;
        }
        .signature-line {
            border-top: 1px solid #94a3b8;
            width: 220px;
            text-align: center;
            padding-top: 8px;
            font-size: 11px;
            color: #475569;
        }
        @media print {
            body {
                padding: 0;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td class="logo-cell">
                <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                    <path d="M50 10 L85 22 V55 C85 75 50 90 50 90 C50 90 15 75 15 55 V22 Z" stroke="#1e3a8a" stroke-width="4" fill="#f8fafc"/>
                    <path d="M50 30 V70" stroke="#1e3a8a" stroke-width="3"/>
                    <path d="M35 45 H65" stroke="#1e3a8a" stroke-width="2"/>
                    <polygon points="50,22 53,28 60,28 55,32 57,38 50,34 43,38 45,32 40,28 47,28" fill="#1e3a8a"/>
                </svg>
            </td>
            <td class="title-cell">
                <h1>CYBERSHIELD</h1>
                <p>INFORMÁCIÓBIZTONSÁGI MINŐSÍTŐ RIPORT</p>
            </td>
            <td style="text-align: right; vertical-align: middle;">
                <span class="doc-badge">SZOLGÁLATI HASZNÁLATRA</span>
            </td>
        </tr>
    </table>

    <div class="section-title">Tanulói Profil & Besorolás</div>
    <table class="profile-grid">
        <tr>
            <td class="profile-label">Név és Rendfokozat:</td>
            <td class="profile-value" colspan="3">\${state.user.rank} \${state.user.name}</td>
        </tr>
        <tr>
            <td class="profile-label">Szervezeti Egység:</td>
            <td class="profile-value">\${state.user.unit}</td>
            <td class="profile-label">Kiadott Minősítés:</td>
            <td class="profile-value" style="color:#0f766e;">\${state.user.badge}</td>
        </tr>
        <tr>
            <td class="profile-label">Belépési Kompetencia:</td>
            <td class="profile-value">\${diagScoreStr}</td>
            <td class="profile-label">Ajánlott Képzési Csoport:</td>
            <td class="profile-value">\${diagPathStr}</td>
        </tr>
    </table>

    <div class="section-title">Teljesítmény Összesítés</div>
    <div class="metric-cards">
        <div class="metric-card">
            <div class="metric-value" style="color:#1e3a8a;">\${state.user.xp} XP</div>
            <div class="metric-label">Megszerzett Pontszám</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" style="color:#0f766e;">\${completedCount} / \${totalModules}</div>
            <div class="metric-label">Elvégzett Modul</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" style="color:#7c3aed;">\${officeCount} / 15</div>
            <div class="metric-label">Irodai Biztonsági Rés Javítva</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" style="color:#dc2626;">\${escaperoomCount} / 8</div>
            <div class="metric-label">Szabadulószoba Zárak</div>
        </div>
    </div>

    <div class="section-title">Részletes Tanulmányi Értékelés</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="text-align: left; border-radius: 4px 0 0 0;">Modul Megnevezése</th>
                <th>Állapot</th>
                <th style="text-align: right;">Szerzett Pont</th>
                <th style="text-align: right;">Helyes Válaszok</th>
                <th style="text-align: right; border-radius: 0 4px 0 0;">Teljesítés Ideje</th>
            </tr>
        </thead>
        <tbody>
            \${modulesHtml}
        </tbody>
    </table>

    <div class="section-title">Fejlesztendő Kompetencia Területek</div>
    <div class="weakness-box">
        <p style="margin-top:0; font-weight:bold; color:#991b1b; font-size:12px;">Tanulmányi Kérdések, Amelyekre Hibás Válasz Született:</p>
        \${weaknessesHtml}
    </div>

    <table class="signature-section">
        <tr>
            <td style="width: 50%;">
                <p style="margin-bottom: 40px; color:#475569;">Dátum: ............................................</p>
                <div class="signature-line">Kiállító Szervezet / IBT Képviselő</div>
            </td>
            <td style="width: 50%; text-align: right;">
                <p style="margin-bottom: 40px; color:#475569; text-align: right;">P.H.</p>
                <div class="signature-line" style="margin-left: auto;">\${state.user.name} r. állománytag</div>
            </td>
        </tr>
    </table>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 300);
        };
    </script>
</body>
</html>`;

        const blob = new Blob([printHtml], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const safeName = state.user.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cybershield_minosito_riport_${safeName}.html`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        window.Gamification.showToast("Riport Generálva", "A print-kész HTML riport sikeresen letöltődött. Nyissa meg a nyomtatáshoz!", "success");
    }

    /**
     * Export complete student progress report to local JSON file download
     */
    function exportTeacherData() {
        const state = window.Progress.getState();
        if (!state.user) {
            alert("Nincs letölthető tanulói profil jelenleg!");
            return;
        }

        const jsonStr = JSON.stringify(state, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const safeName = state.user.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cybershield_riport_${safeName}.json`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        window.Gamification.showToast("Riport Exportálva", "A tanulói teljesítményadatok sikeresen mentésre kerültek letöltésként.", "success");
    }

    return {
        init: init,
        selectRole: selectRole,
        saveProfile: saveProfile,
        resetData: resetData,
        confirmResetData: confirmResetData,
        printReport: printReport,
        exportTeacherData: exportTeacherData,
        switchAuthTab: switchAuthTab,
        handleLogin: handleLogin,
        handleRegister: handleRegister
    };
})();

// Initialize the app when the DOM content has loaded
document.addEventListener('DOMContentLoaded', () => {
    window.App.init();
});
