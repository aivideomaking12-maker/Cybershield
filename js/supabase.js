/**
 * CyberShield - supabase.js
 * Supabase Cloud Client Configuration & Initialization.
 * Replace placeholders with your own Supabase project details.
 */

// Replace these values with your Supabase Project URL and Anon Key
const SUPABASE_URL = "https://hzrisdqqebwhtmzwkveg.supabase.co/";
const SUPABASE_ANON_KEY = "sb_publishable_CnplnhMVVJYDwMfTBbVp4A_kmPEW1SJ";

let supabaseClient = null;

function getSupabaseClient() {
    if (!supabaseClient) {
        const globalSupabase = window.supabase || (typeof supabase !== "undefined" ? supabase : null);
        console.log("getSupabaseClient ellenőrzése. Globális supabase elérhető:", !!globalSupabase);
        if (globalSupabase && SUPABASE_URL && SUPABASE_URL !== "YOUR_SUPABASE_URL_HERE" && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY_HERE") {
            try {
                supabaseClient = globalSupabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log("Supabase kliens sikeresen inicializálva.");
            } catch (error) {
                console.error("Hiba a Supabase kliens inicializálása során:", error);
            }
        } else {
            if (!globalSupabase) {
                console.warn("getSupabaseClient: window.supabase még nincs definiálva (lehet, hogy a CDN még töltődik).");
            }
            if (!SUPABASE_URL || SUPABASE_URL === "YOUR_SUPABASE_URL_HERE") {
                console.error("getSupabaseClient: SUPABASE_URL hiányzik vagy hibás.");
            }
            if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY_HERE") {
                console.error("getSupabaseClient: SUPABASE_ANON_KEY hiányzik vagy hibás.");
            }
        }
    }
    return supabaseClient;
}

// Try to initialize immediately if available
getSupabaseClient();

// Global Supabase helper export
window.SupabaseConnection = {
    get client() {
        return getSupabaseClient();
    },
    isConfigured: function() {
        const c = getSupabaseClient();
        return (
            c !== null &&
            SUPABASE_URL !== "" &&
            SUPABASE_URL !== "YOUR_SUPABASE_URL_HERE" &&
            SUPABASE_ANON_KEY !== "" &&
            SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY_HERE"
        );
    }
};

