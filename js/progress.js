/**
 * CyberShield - progress.js
 * Handles local caching and Supabase Cloud database state management,
 * saving/loading student metrics, and synchronizing status between sessions.
 */

window.Progress = (function() {
    const STORAGE_KEY = 'cybershield_progress_v1';

    // Default structure for a clean state
    const defaultState = {
        user: null, // { id, name, rank, unit, role: 'user'|'admin', xp, badge, path }
        diagnosticScore: null, // { score, percentage, path, pathDesc }
        completedModules: {}, // { "1": { xp: 100, score: 5, total: 5, date: "2026..." }, ... }
        officeErrors: [], // ["open-window", "board-pass", ...]
        officeAuditStats: { elapsedSeconds: null, wrongClicks: 0, score: null, completedAt: null },
        escaperoomLocks: [false, false, false, false, false, false, false, false], // 8 locks
        escaperoomActiveRiddle: 0,
        weaknesses: [] // ["Q3", "Q7"] questions they missed in quizzes
    };

    let state = JSON.parse(JSON.stringify(defaultState));
    let saveQueue = Promise.resolve();

    function calculateBadge(xp) {
        const value = Number(xp) || 0;
        if (value >= 1500) return 'Főkapitány-Helyettes';
        if (value >= 1000) return 'Cyber Detektív';
        if (value >= 600) return 'Információbiztonsági Vizsgáló';
        if (value >= 300) return 'Biztonsági Járőr';
        if (value >= 100) return 'Kiképzett Járőrtárs';
        return 'Újonc';
    }

    function getDiagnosticPayload() {
        return {
            ...(state.diagnosticScore || {}),
            officeAuditStats: state.officeAuditStats,
            officeErrors: Array.isArray(state.officeErrors) ? state.officeErrors : [],
            weaknesses: Array.isArray(state.weaknesses) ? state.weaknesses : [],
            xpSnapshot: Number(state.user?.xp) || 0,
            escaperoomLocks: Array.isArray(state.escaperoomLocks) ? state.escaperoomLocks : []
        };
    }

    /**
     * Load the progress cache from LocalStorage (synchronous fallback)
     */
    function load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                state = JSON.parse(data);
                // Ensure backward compatibility or structure safety
                if (!state.completedModules) state.completedModules = {};
                if (!state.officeErrors) state.officeErrors = [];
                if (!state.officeAuditStats) state.officeAuditStats = { elapsedSeconds: null, wrongClicks: 0, score: null, completedAt: null };
                if (!state.escaperoomLocks) state.escaperoomLocks = Array(8).fill(false);
                if (!state.weaknesses) state.weaknesses = [];
            } else {
                state = JSON.parse(JSON.stringify(defaultState));
            }
        } catch (e) {
            console.error("Hiba a mentett adatok betöltése közben:", e);
            state = JSON.parse(JSON.stringify(defaultState));
        }
        return state;
    }

    /**
     * Load progress asynchronously from Supabase
     * @param {string} userId Supabase Auth User ID
     */
    async function loadFromSupabase(userId) {
        if (!window.SupabaseConnection || !window.SupabaseConnection.isConfigured()) {
            return load();
        }

        // Supabase módban minden belépésnél tiszta memóriából indulunk.
        // Így egy korábbi felhasználó LocalStorage-cache-e nem keveredhet az aktuális fiókkal.
        state = JSON.parse(JSON.stringify(defaultState));

        try {
            // 1. Fetch the authenticated user's profile from Supabase.
            const { data: profile, error: profileError } = await window.SupabaseConnection.client
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError || !profile) {
                console.error("A bejelentkezett felhasználóhoz nem található profiles rekord:", profileError);
                return state;
            }

            state.user = {
                id: profile.id || userId,
                name: profile.full_name || '',
                rank: profile.rank || '',
                unit: profile.unit || '',
                role: profile.role || 'user',
                xp: Number(profile.xp) || 0,
                badge: profile.badge || 'Újonc',
                path: profile.path || 'Kezdő'
            };
            state.diagnosticScore = profile.diagnostic_score || null;
            // Office audit statistics are stored inside the existing JSON diagnostic_score field
            // so the admin panel can see them across users without requiring a new DB column.
            state.officeAuditStats = state.diagnosticScore?.officeAuditStats || { elapsedSeconds: null, wrongClicks: 0, score: null, completedAt: null };
            const diagnosticOfficeErrors = Array.isArray(state.diagnosticScore?.officeErrors) ? state.diagnosticScore.officeErrors : [];
            state.officeErrors = Array.isArray(profile.office_errors) ? profile.office_errors : diagnosticOfficeErrors;
            state.escaperoomLocks = Array.isArray(profile.escaperoom_locks) ? profile.escaperoom_locks : (Array.isArray(state.diagnosticScore?.escaperoomLocks) ? state.diagnosticScore.escaperoomLocks : Array(8).fill(false));
            state.weaknesses = Array.isArray(profile.weaknesses) ? profile.weaknesses : (Array.isArray(state.diagnosticScore?.weaknesses) ? state.diagnosticScore.weaknesses : []);

            // 2. Fetch completed modules from results table.
            const { data: results, error: resultsError } = await window.SupabaseConnection.client
                .from('results')
                .select('*')
                .eq('user_id', userId);

            if (resultsError) {
                console.error("Hiba az eredmények betöltésekor:", resultsError);
                return state;
            }

            state.completedModules = {};
            (results || []).forEach(row => {
                state.completedModules[row.module_id] = {
                    xp: Number(row.xp_awarded) || 0,
                    score: Number(row.score) || 0,
                    total: Number(row.total) || 0,
                    date: row.completed_at ? row.completed_at.slice(0, 16).replace('T', ' ') : ''
                };
            });

            // If the profile XP is stale (for example because an older build tried to
            // write optional profile columns that do not exist), reconstruct at least
            // the durable XP from the results and the persisted audit/escape-room state.
            const resultXP = (results || []).reduce((sum, row) => sum + (Number(row.xp_awarded) || 0), 0);
            const officeXP = (state.officeErrors || []).length * 20;
            const escapeXP = (state.escaperoomLocks || []).filter(Boolean).length * 50;
            const diagnosticXP = Number(state.diagnosticScore?.initialXP) || (state.diagnosticScore?.percentage != null ? (Number(state.diagnosticScore.percentage) >= 85 ? 150 : Number(state.diagnosticScore.percentage) >= 50 ? 100 : 50) : 0);
            const reconstructedXP = resultXP + officeXP + escapeXP + diagnosticXP;
            state.user.xp = Math.max(Number(profile.xp) || 0, reconstructedXP);
            state.user.badge = calculateBadge(state.user.xp);

            // Keep the recovered values in the JSON field too, so subsequent sessions
            // remain usable even if legacy optional columns are absent.
            state.diagnosticScore = {
                ...(state.diagnosticScore || {}),
                officeAuditStats: state.officeAuditStats,
                officeErrors: state.officeErrors,
                weaknesses: state.weaknesses,
                xpSnapshot: state.user.xp
            };

            // LocalStorage is cache only; Supabase remains the source of truth.
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

            // Repair legacy profiles whose XP/diagnostic data was kept only in the
            // browser because an older save attempted to update optional columns.
            await save();
        } catch (err) {
            console.error("Hiba történt a felhőbeli adatok betöltése közben:", err);
            // Intentionally do NOT fall back to the previous user's local cache in
            // authenticated Supabase mode. This prevents cross-user data leakage.
        }

        return state;
    }

    /**
     * Save progress state both locally and into Supabase (if connected)
     */
    async function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error("Hiba a helyi gyorsítótár mentése közben:", e);
        }

        if (!window.SupabaseConnection || !window.SupabaseConnection.isConfigured() || !state.user) {
            return saveQueue;
        }

        // Serialize writes. XP, weaknesses and audit data can be changed by several
        // UI actions in quick succession; parallel UPDATE requests could otherwise
        // overwrite a newer state with an older snapshot.
        saveQueue = saveQueue.then(async () => {
            try {
                const { data: { user }, error: authError } = await window.SupabaseConnection.client.auth.getUser();
                if (authError || !user) return;

                const corePayload = {
                    full_name: state.user.name,
                    rank: state.user.rank,
                    unit: state.user.unit,
                    xp: Number(state.user.xp) || 0,
                    badge: state.user.badge || calculateBadge(state.user.xp),
                    path: state.user.path,
                    diagnostic_score: getDiagnosticPayload()
                };

                const { error: coreError } = await window.SupabaseConnection.client
                    .from('profiles')
                    .update(corePayload)
                    .eq('id', user.id);

                if (coreError) {
                    console.error("Hiba a profil alapadatainak Supabase szinkronizációja során:", coreError);
                    return;
                }

                // Legacy column kept as a best-effort compatibility path. The JSON
                // diagnostic_score above is the canonical storage for new data, so
                // these optional fields can no longer make the XP update fail.
                const { error: legacyError } = await window.SupabaseConnection.client
                    .from('profiles')
                    .update({ escaperoom_locks: state.escaperoomLocks })
                    .eq('id', user.id);

                if (legacyError) {
                    console.warn("Az escaperoom_locks mező nem frissíthető; az alkalmazás a JSON progress-adatot használja.", legacyError);
                }
            } catch (err) {
                console.error("Hálózati hiba a Supabase mentés közben:", err);
            }
        });

        return saveQueue;
    }

    /**
     * Reset state
     */
    function reset() {
        state = JSON.parse(JSON.stringify(defaultState));
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error(e);
        }
    }

    function getState() {
        return state;
    }

    function setUser(userData) {
        state.user = {
            id: userData.id || null,
            name: userData.name || '',
            rank: userData.rank || '',
            unit: userData.unit || '',
            role: userData.role === 'admin' ? 'admin' : 'user',
            xp: userData.xp || 0,
            badge: userData.badge || 'Újonc',
            path: userData.path || 'Kezdő'
        };
        save();
    }

    function addXP(amount) {
        if (!state.user) return;
        state.user.xp = (state.user.xp || 0) + amount;
        
        state.user.badge = calculateBadge(state.user.xp);
        
        // Trigger non-blocking async save
        save();
        
        // Update header elements if they exist
        updateHeaderUI();
    }

    function updateHeaderUI() {
        const hName = document.getElementById('header-user-name');
        const hRank = document.getElementById('header-user-rank');
        const hXp = document.getElementById('header-user-xp');
        const hBadge = document.getElementById('header-user-badge');
        const hStatus = document.getElementById('header-user-status');

        if (state.user) {
            if (hName) hName.innerText = state.user.name;
            if (hRank) hRank.innerText = `${state.user.rank} • ${state.user.unit}`;
            if (hXp) hXp.innerText = `${state.user.xp} XP`;
            if (hBadge) hBadge.innerText = state.user.badge;
            if (hStatus) hStatus.classList.remove('hidden');
        } else {
            if (hStatus) hStatus.classList.add('hidden');
        }
    }

    async function completeModule(moduleId, score, total, xpAwarded) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 16).replace('T', ' ');
        state.completedModules[moduleId] = {
            xp: xpAwarded,
            score: score,
            total: total,
            date: dateStr
        };
        addXP(xpAwarded);

        // Sync individual module score to 'results' table
        if (window.SupabaseConnection && window.SupabaseConnection.isConfigured()) {
            try {
                const { data: { user } } = await window.SupabaseConnection.client.auth.getUser();
                if (user) {
                    const { error } = await window.SupabaseConnection.client
                        .from('results')
                        .upsert({
                            user_id: user.id,
                            module_id: moduleId.toString(),
                            score: score,
                            total: total,
                            xp_awarded: xpAwarded,
                            completed_at: now.toISOString()
                        }, { onConflict: 'user_id,module_id' });

                    if (error) {
                        console.error("Hiba a modul eredmény Supabase szinkronizálása során:", error);
                    }
                }
            } catch (err) {
                console.error("Kapcsolódási hiba az eredmény mentésekor:", err);
            }
        }
    }

    function isModuleCompleted(moduleId) {
        return !!state.completedModules[moduleId];
    }

    function addOfficeError(errorId) {
        if (!state.officeErrors.includes(errorId)) {
            state.officeErrors.push(errorId);
            addXP(20); // 20 XP for every error found
            return true;
        }
        return false;
    }

    function setOfficeAuditStats(stats) {
        state.officeAuditStats = {
            elapsedSeconds: Number(stats?.elapsedSeconds) || 0,
            wrongClicks: Number(stats?.wrongClicks) || 0,
            score: Number(stats?.score) || 0,
            completedAt: stats?.completedAt || new Date().toISOString()
        };
        state.diagnosticScore = {
            ...(state.diagnosticScore || {}),
            officeAuditStats: state.officeAuditStats
        };
        try {
            const userId = window.SupabaseConnection?.isConfigured?.()
                ? null
                : null;
            const key = state.user?.id ? `cybershield_office_audit_${state.user.id}` : 'cybershield_office_audit_offline';
            localStorage.setItem(key, JSON.stringify(state.officeAuditStats));
        } catch (e) {
            console.warn('Iroda audit statisztika mentése nem sikerült:', e);
        }
        save();
    }

    function setEscaperoomLock(index, status) {
        if (index >= 0 && index < 8) {
            state.escaperoomLocks[index] = status;
            if (status) {
                addXP(50); // 50 XP per lock opened
            } else {
                save();
            }
        }
    }

    function addWeakness(questionText) {
        if (!state.weaknesses.includes(questionText)) {
            state.weaknesses.push(questionText);
            save();
        }
    }

    return {
        load: load,
        loadFromSupabase: loadFromSupabase,
        save: save,
        reset: reset,
        getState: getState,
        setUser: setUser,
        setOfficeAuditStats: setOfficeAuditStats,
        addXP: addXP,
        completeModule: completeModule,
        isModuleCompleted: isModuleCompleted,
        addOfficeError: addOfficeError,
        setEscaperoomLock: setEscaperoomLock,
        addWeakness: addWeakness,
        updateHeaderUI: updateHeaderUI
    };
})();
