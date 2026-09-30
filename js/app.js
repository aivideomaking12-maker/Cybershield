/**
 * CyberShield - app.js
 * Main entry point of the CyberShield digital curriculum.
 * Bootstraps the application, handles profile creation and logout events,
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

    let keyboardNavSetup = false;
    /**
     * Spatial keyboard navigation for accessibility compliance
     */
    function setupKeyboardNavigation() {
        if (keyboardNavSetup) return;
        keyboardNavSetup = true;
        
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

                await window.Progress.loadFromSupabase(data.user.id);
                const uState = window.Progress.getState();

                if (!uState.user) {
                    await window.SupabaseConnection.client.auth.signOut();
                    window.Gamification.showToast(
                        "Profil betöltési hiba",
                        "A fiókhoz tartozó profil nem tölthető be. Ellenőrizze a Supabase trigger és adatbázis beállításait.",
                        "error"
                    );
                    return;
                }

                window.Progress.updateHeaderUI();
                window.Gamification.showToast("Sikeres belépés", "Üdvözöljük a CyberShield rendszerben!", "success");

                if (uState.user.role === 'admin') {
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
        const unitInput = document.getElementById('reg-unit');

        if (!emailInput || !passwordInput || !nameInput || !rankSelect || !unitInput) return;

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const fullName = nameInput.value.trim();
        const rank = rankSelect.value;
        const unit = unitInput.value.trim();

        window.Gamification.showToast("Regisztráció...", "Felhasználói fiók létrehozása...", "info");

        if (window.SupabaseConnection && window.SupabaseConnection.isConfigured()) {
            try {
                // A szerepkört SOHA nem a kliens határozza meg.
                // Minden új regisztráló alapértelmezés szerint 'user' lesz.
                // Az admin jogosultságot kizárólag adatbázisban lehet megadni.
                const { data, error } = await window.SupabaseConnection.client.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            rank: rank,
                            unit: unit
                        }
                    }
                });

                if (error) {
                    window.Gamification.showToast("Sikertelen regisztráció", error.message, "error");
                    return;
                }

                // A profiles rekordot az auth.users trigger hozza létre.
                // Email-confirmation esetén nincs aktív session, ezért itt nem léptetjük be a felhasználót.
                if (data.user && !data.session) {
                    window.Gamification.showToast(
                        "Regisztráció sikeres",
                        "Ellenőrizze a megadott e-mail-címét, majd a megerősítés után jelentkezzen be.",
                        "success"
                    );
                } else if (data.user && data.session) {
                    // Olyan Auth-konfiguráció esetén, ahol nincs email-megerősítés,
                    // a létrehozott sessionből azonnal betöltjük a profilt.
                    await window.Progress.loadFromSupabase(data.user.id);
                    window.Progress.updateHeaderUI();

                    window.Gamification.showToast(
                        "Fiók létrehozva",
                        "Profil sikeresen létrehozva a felhőben!",
                        "success"
                    );

                    const uState = window.Progress.getState();
                    if (uState.user && uState.user.role === 'admin') {
                        window.Navigation.showScreen('screen-teacher');
                    } else {
                        window.Navigation.showScreen('screen-diagnostic');
                        window.Quiz.startDiagnostic();
                    }
                    return;
                }

                // Regisztráció után a bejelentkezési űrlapra váltunk.
                switchAuthTab('login');
                const loginEmail = document.getElementById('login-email');
                const loginPass = document.getElementById('login-password');
                if (loginEmail) loginEmail.value = email;
                if (loginPass) loginPass.value = '';
            } catch (err) {
                console.error("Regisztrációs hiba:", err);
                window.Gamification.showToast(
                    "Kapcsolódási hiba",
                    "Nem sikerült elérni a regisztrációs kiszolgálót.",
                    "error"
                );
            }
        } else {
            // Offline fallback: admin szerepkör itt sem választható.
            const userData = {
                name: fullName,
                rank: rank,
                unit: unit,
                role: 'user',
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
     * Sign out without deleting cloud data.
     * The local cache is cleared only to prevent the next user on the same
     * browser from seeing the previous user's cached information.
     */
    async function logout() {
        try {
            // Finish all pending profile/progress writes before destroying the
            // authenticated Supabase session. Without this, a wrong answer
            // recorded immediately before logout could be lost.
            if (window.Progress && typeof window.Progress.flush === 'function') {
                await window.Progress.flush();
            }
            if (window.SupabaseConnection && window.SupabaseConnection.isConfigured()) {
                const { error } = await window.SupabaseConnection.client.auth.signOut();
                if (error) throw error;
            }
        } catch (err) {
            console.error("SignOut hiba:", err);
            window.Gamification.showToast("Kijelentkezési hiba", "A kijelentkezés nem sikerült teljesen. Próbálja újra.", "error");
            return;
        }

        // Csak a böngészőben tárolt gyorsítótárat töröljük.
        // A Supabase-ben lévő profil és eredmények NEM törlődnek.
        window.Progress.reset();
        window.Progress.updateHeaderUI();

        const overlayContainer = document.getElementById('office-success-overlays');
        if (overlayContainer) overlayContainer.innerHTML = '';

        window.Gamification.showToast("Kijelentkezés sikeres", "A fiókból biztonságosan kijelentkezett. Az adatai megmaradtak.", "success");
        window.Navigation.showScreen('screen-landing');
    }

    /**
     * Legacy compatibility function. This now means only logout and never
     * deletes the user's cloud data.
     */
    async function resetData() {
        await logout();
    }

    /**
     * Legacy compatibility function retained for old markup/calls.
     * It also performs only a normal logout; no cloud data is deleted.
     */
    async function confirmResetData() {
        const modal = document.getElementById('logout-confirm-modal');
        if (modal) modal.classList.add('hidden');
        await logout();
    }

    /**
     * Export complete student progress report to local printable HTML file download
     * designed to automatically open the print dialog when opened.
     */
    function printReport() {
        const reportState = window.Navigation?.getTeacherReportData
            ? window.Navigation.getTeacherReportData()
            : window.Progress.getState();
        if (!reportState?.user) {
            window.Gamification.showToast("Nincs profil", "Nincs betöltött tanulói profil a riport elkészítéséhez!", "warning");
            return;
        }

        const esc = (value) => String(value ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        const pct = (score, total) => total ? Math.round((Number(score) / Number(total)) * 100) : 0;
        const formatDuration = (seconds) => {
            if (seconds === null || seconds === undefined || seconds === '') return '—';
            const safe = Math.max(0, Number(seconds) || 0);
            return `${Math.floor(safe / 60).toString().padStart(2, '0')}:${Math.floor(safe % 60).toString().padStart(2, '0')}`;
        };
        const state = reportState;
        const completedModules = state.completedModules || {};
        const completedCount = Object.keys(completedModules).length;
        const officeErrors = Array.isArray(state.officeErrors) ? state.officeErrors : [];
        const officeStats = state.officeAuditStats || state.diagnosticScore?.officeAuditStats || {};
        const escaperoomCount = Array.isArray(state.escaperoomLocks) ? state.escaperoomLocks.filter(Boolean).length : 0;
        const cyberRank = state.user.badge || 'Újonc';
        const generatedAt = new Date().toLocaleString('hu-HU');

        const moduleRows = Object.keys(completedModules).sort((a,b) => Number(a)-Number(b)).map(id => {
            const mod = completedModules[id];
            const data = window.QuizData.modules[id];
            const scorePct = pct(mod.score, mod.total);
            return `<tr>
                <td><strong>${esc(data ? data.category : `Modul ${id}`)}</strong><br><span class="muted">${esc(data ? data.title : '')}</span></td>
                <td><span class="status ${scorePct === 100 ? 'perfect' : 'done'}">${scorePct === 100 ? 'KIVÁLÓ' : 'TELJESÍTVE'}</span></td>
                <td class="num">${esc(mod.score)} / ${esc(mod.total)}<br><span class="muted">${scorePct}%</span></td>
                <td class="num xp">+${esc(mod.xp)} XP</td>
                <td class="num">${esc(mod.date || '—')}</td>
            </tr>`;
        }).join('') || `<tr><td colspan="5" class="empty">Nincs még teljesített elméleti modul.</td></tr>`;

        const weaknessRows = (state.weaknesses || []).map((w, i) => `<li><span class="bullet">${i + 1}</span><span>${esc(w)}</span></li>`).join('') || '<li class="none"><span class="bullet">✓</span><span>Nem rögzítettünk tévesztett kérdést.</span></li>';

        const officeDefinitions = window.QuizData.officeErrors || {};
        const officeRows = officeErrors.map(id => {
            const item = officeDefinitions[id];
            return `<tr><td><span class="found-dot">✓</span></td><td><strong>${esc(item?.title || id)}</strong><br><span class="muted">${esc(item?.desc || '')}</span></td></tr>`;
        }).join('') || '<tr><td colspan="2" class="empty">Még nem azonosított irodai biztonsági hiba.</td></tr>';

        const printHtml = `<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CyberShield – Minősítő riport – ${esc(state.user.name)}</title>
<style>
@page{size:A4;margin:15mm 14mm 16mm}
*{box-sizing:border-box}
body{margin:0;font-family:Arial,"Segoe UI",sans-serif;color:#172033;background:#fff;font-size:10.5pt;line-height:1.45}
.header{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #0f3b66;padding-bottom:13px;margin-bottom:18px}
.brand{display:flex;align-items:center;gap:12px}.shield{width:46px;height:52px;border:3px solid #0f3b66;clip-path:polygon(50% 0,94% 14%,88% 66%,50% 100%,12% 66%,6% 14%);display:flex;align-items:center;justify-content:center;font-weight:900;color:#0f3b66;font-size:18px}
.brand h1{margin:0;color:#0b3155;font-size:23px;letter-spacing:1.5px}.brand p{margin:2px 0 0;color:#64748b;font-size:9px;letter-spacing:1.7px;font-weight:700}
.badge{padding:6px 9px;border:1px solid #cbd5e1;background:#f8fafc;color:#334155;font-size:8px;font-weight:800;letter-spacing:1px}
.meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px}.meta-card{border:1px solid #d9e1ea;background:#f8fafc;padding:9px 10px}.label{display:block;color:#64748b;font-size:7.5pt;text-transform:uppercase;letter-spacing:.8px;font-weight:700}.value{display:block;color:#0f172a;font-weight:800;font-size:11pt;margin-top:3px}
.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0 18px}.metric{border:1px solid #d9e1ea;padding:10px;background:#fff}.metric .n{font-size:18px;font-weight:900;color:#0b3155}.metric .l{font-size:7.5pt;color:#64748b;text-transform:uppercase;font-weight:700;margin-top:2px}
.section{margin-top:20px;page-break-inside:avoid}.section h2{font-size:11pt;color:#0b3155;border-bottom:2px solid #0b3155;padding-bottom:5px;margin:0 0 9px;text-transform:uppercase;letter-spacing:.7px}
table{width:100%;border-collapse:collapse}th{background:#0b3155;color:#fff;text-align:left;padding:7px;font-size:8pt;text-transform:uppercase;letter-spacing:.4px}td{border-bottom:1px solid #e2e8f0;padding:7px;vertical-align:top;font-size:8.5pt}.num{text-align:right;white-space:nowrap}.muted{color:#64748b;font-size:8pt}.xp{color:#9a6700;font-weight:800}.status{display:inline-block;padding:3px 6px;font-size:7pt;font-weight:800;border-radius:3px}.status.perfect{background:#fff4cf;color:#8a5b00}.status.done{background:#dcfce7;color:#166534}.empty{text-align:center;color:#64748b;padding:15px}.summary-box{border:1px solid #d9e1ea;background:#f8fafc;padding:10px}.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.summary-item strong{display:block;font-size:12pt;color:#0b3155}.summary-item span{font-size:7.5pt;color:#64748b;text-transform:uppercase;font-weight:700}
ul.weak{list-style:none;padding:0;margin:0}ul.weak li{display:flex;gap:8px;padding:7px 8px;border:1px solid #fee2e2;background:#fff7f7;margin-bottom:5px;border-radius:4px;font-size:8.5pt}.bullet{min-width:19px;height:19px;border-radius:50%;background:#dc2626;color:#fff;text-align:center;font-weight:800;font-size:8pt;padding-top:2px}.none{background:#f0fdf4!important;border-color:#bbf7d0!important}.none .bullet{background:#16a34a}
.found-dot{display:inline-flex;width:19px;height:19px;border-radius:50%;align-items:center;justify-content:center;background:#dcfce7;color:#15803d;font-weight:900}.office-table td:first-child{width:28px}.footer{margin-top:24px;border-top:1px solid #cbd5e1;padding-top:10px;display:flex;justify-content:space-between;color:#64748b;font-size:7.5pt}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:35px;page-break-inside:avoid}.sig{border-top:1px solid #64748b;padding-top:6px;color:#475569;font-size:8pt}.page-break{page-break-before:always}
@media print{.page-break{page-break-before:always}a{color:inherit;text-decoration:none}}
</style>
</head>
<body>
<header class="header"><div class="brand"><div class="shield">CS</div><div><h1>CYBERSHIELD</h1><p>INFORMÁCIÓBIZTONSÁGI MINŐSÍTŐ RIPORT</p></div></div><div class="badge">SZOLGÁLATI HASZNÁLATRA</div></header>
<div class="meta">
<div class="meta-card"><span class="label">Tanuló</span><span class="value">${esc(state.user.rank)} ${esc(state.user.name)}</span></div>
<div class="meta-card"><span class="label">Szervezeti egység</span><span class="value">${esc(state.user.unit || '—')}</span></div>
<div class="meta-card"><span class="label">CyberShield rang</span><span class="value">${esc(cyberRank)}</span></div>
</div>
<div class="metrics">
<div class="metric"><div class="n">${Number(state.user.xp)||0} XP</div><div class="l">Összes XP</div></div>
<div class="metric"><div class="n">${completedCount} / 5</div><div class="l">Elméleti modul</div></div>
<div class="metric"><div class="n">${officeErrors.length} / 15</div><div class="l">Irodai hiba</div></div>
<div class="metric"><div class="n">${esc(officeStats.wrongClicks ?? 0)}</div><div class="l">Téves kattintás</div></div>
</div>
<section class="section"><h2>1. Besorolás és belépési felmérés</h2><div class="summary-box"><div class="summary-grid">
<div class="summary-item"><span>Eredmény</span><strong>${state.diagnosticScore ? `${esc(state.diagnosticScore.score)} / 15 (${esc(state.diagnosticScore.percentage)}%)` : 'Nem kitöltött'}</strong></div>
<div class="summary-item"><span>Képzési út</span><strong>${esc(state.diagnosticScore?.path || state.user.path || 'Kezdő')}</strong></div>
<div class="summary-item"><span>CyberShield rang</span><strong>${esc(cyberRank)}</strong></div>
<div class="summary-item"><span>Szint / státusz</span><strong>${esc(state.user.rank || '—')}</strong></div>
</div></div></section>
<section class="section"><h2>2. Modulok részletes teljesítménye</h2><table><thead><tr><th>Modul</th><th>Állapot</th><th class="num">Eredmény</th><th class="num">XP</th><th class="num">Teljesítés</th></tr></thead><tbody>${moduleRows}</tbody></table></section>
<section class="section"><h2>3. Irodai információbiztonsági audit</h2><div class="summary-box"><div class="summary-grid">
<div class="summary-item"><span>Felfedezett hibák</span><strong>${officeErrors.length} / 15</strong></div>
<div class="summary-item"><span>Téves kattintások</span><strong>${Number(officeStats.wrongClicks)||0}</strong></div>
<div class="summary-item"><span>Audit pontszám</span><strong>${officeStats.score == null ? '—' : Number(officeStats.score)}</strong></div>
<div class="summary-item"><span>Eltelt idő</span><strong>${formatDuration(officeStats.elapsedSeconds)}</strong></div>
</div></div>
<div style="height:8px"></div><table class="office-table"><thead><tr><th></th><th>Azonosított biztonsági hiba</th></tr></thead><tbody>${officeRows}</tbody></table></section>
<section class="section"><h2>4. Tévesztett kérdések és fejlesztendő területek</h2><ul class="weak">${weaknessRows}</ul></section>
<section class="section"><h2>5. Szabadulószoba és összesített állapot</h2><div class="summary-box"><div class="summary-grid">
<div class="summary-item"><span>Szabadulószoba</span><strong>${esc(escaperoomCount)} / 8 zár</strong></div>
<div class="summary-item"><span>Elméleti modulok</span><strong>${completedCount} / 5</strong></div>
<div class="summary-item"><span>Összes XP</span><strong>${Number(state.user.xp)||0} XP</strong></div>
<div class="summary-item"><span>Minősítés</span><strong>${esc(cyberRank)}</strong></div>
</div></div></section>
<div class="signatures"><div class="sig">Kiállító / oktató aláírása</div><div class="sig">${esc(state.user.name)} aláírása</div></div>
<footer class="footer"><span>CyberShield – Információbiztonsági képzési rendszer</span><span>Generálva: ${esc(generatedAt)}</span></footer>
<script>window.onload=function(){setTimeout(function(){window.print()},250)};</script>
</body></html>`;

        const printWindow = window.open('', '_blank', 'noopener,noreferrer');
        if (!printWindow) {
            window.Gamification.showToast("Nyomtatási ablak blokkolva", "Engedélyezze az új ablakokat a riport nyomtatásához.", "warning");
            return;
        }
        printWindow.document.open();
        printWindow.document.write(printHtml);
        printWindow.document.close();
        window.Gamification.showToast("Riport elkészült", "A tanuló kiválasztott teljesítményéről elkészült a nyomtatásra optimalizált riport.", "success");
    }

    /**
     * Export complete student progress report to local JSON file download
     */
    function exportTeacherData() {
        const state = window.Navigation?.getTeacherReportData
            ? window.Navigation.getTeacherReportData()
            : window.Progress.getState();
        if (!state?.user) {
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
        logout: logout,
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
