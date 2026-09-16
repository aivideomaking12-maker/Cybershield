/**
 * CyberShield - progress.js
 * Handles local caching and Supabase Cloud database state management,
 * saving/loading student metrics, and synchronizing status between sessions.
 */

window.Progress = (function() {
    const STORAGE_KEY = 'cybershield_progress_v1';

    // Default structure for a clean state
    const defaultState = {
        user: null, // { name, rank, unit, role: 'user'|'admin', xp, badge, path }
        diagnosticScore: null, // { score, percentage, path, pathDesc }
        completedModules: {}, // { "1": { xp: 100, score: 5, total: 5, date: "2026..." }, ... }
        officeErrors: [], // ["open-window", "board-pass", ...]
        escaperoomLocks: [false, false, false, false, false, false, false, false], // 8 locks
        escaperoomActiveRiddle: 0,
        weaknesses: [] // ["Q3", "Q7"] questions they missed in quizzes
    };

    let state = JSON.parse(JSON.stringify(defaultState));

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
                name: profile.full_name || '',
                rank: profile.rank || '',
                unit: profile.unit || '',
                role: profile.role || 'user',
                xp: Number(profile.xp) || 0,
                badge: profile.badge || 'Újonc',
                path: profile.path || 'Kezdő'
            };
            state.diagnosticScore = profile.diagnostic_score || null;
            state.officeErrors = Array.isArray(profile.office_errors) ? profile.office_errors : [];
            state.escaperoomLocks = Array.isArray(profile.escaperoom_locks) ? profile.escaperoom_locks : Array(8).fill(false);
            state.weaknesses = Array.isArray(profile.weaknesses) ? profile.weaknesses : [];

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

            // LocalStorage is cache only; Supabase remains the source of truth.
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
        // 1. Optimistic write to localStorage for speed and robustness
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error("Hiba a helyi gyorsítótár mentése közben:", e);
        }

        // 2. Persist to Supabase if available
        if (window.SupabaseConnection && window.SupabaseConnection.isConfigured() && state.user) {
            try {
                const { data: { user } } = await window.SupabaseConnection.client.auth.getUser();
                if (user) {
                    const { error } = await window.SupabaseConnection.client
                        .from('profiles')
                        .update({
                            full_name: state.user.name,
                            rank: state.user.rank,
                            unit: state.user.unit,
                            xp: state.user.xp,
                            badge: state.user.badge,
                            path: state.user.path,
                            diagnostic_score: state.diagnosticScore,
                            office_errors: state.officeErrors,
                            escaperoom_locks: state.escaperoomLocks,
                            weaknesses: state.weaknesses
                        })
                        .eq('id', user.id);

                    if (error) {
                        console.error("Hiba a profil Supabase szinkronizációja során:", error);
                    }
                }
            } catch (err) {
                console.error("Hálózati hiba a Supabase mentés közben:", err);
            }
        }
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
        
        // Recalculate badge based on XP
        const xp = state.user.xp;
        let badge = 'Újonc';
        if (xp >= 1500) {
            badge = 'Főkapitány-Helyettes';
        } else if (xp >= 1000) {
            badge = 'Cyber Detektív';
        } else if (xp >= 600) {
            badge = 'Információbiztonsági Vizsgáló';
        } else if (xp >= 300) {
            badge = 'Biztonsági Járőr';
        } else if (xp >= 100) {
            badge = 'Kiképzett Járőrtárs';
        }
        state.user.badge = badge;
        
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
        addXP: addXP,
        completeModule: completeModule,
        isModuleCompleted: isModuleCompleted,
        addOfficeError: addOfficeError,
        setEscaperoomLock: setEscaperoomLock,
        addWeakness: addWeakness,
        updateHeaderUI: updateHeaderUI
    };
})();
