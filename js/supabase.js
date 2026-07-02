/**
 * CyberShield - supabase.js
 * Supabase Cloud Client Configuration & Initialization.
 * Replace placeholders with your own Supabase project details.
 */

// Replace these values with your Supabase Project URL and Anon Key
const SUPABASE_URL = "YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";

let supabaseClient = null;

try {
    if (typeof supabase !== "undefined" && SUPABASE_URL !== "YOUR_SUPABASE_URL_HERE" && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY_HERE") {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase kliens sikeresen inicializálva.");
    } else {
        console.warn("Supabase nincs konfigurálva vagy a CDN nem töltődött be. Offline mód aktív.");
    }
} catch (error) {
    console.error("Hiba a Supabase kliens inicializálása során:", error);
}

// Global Supabase helper export
window.SupabaseConnection = {
    client: supabaseClient,
    isConfigured: function() {
        return (
            supabaseClient !== null &&
            SUPABASE_URL !== "" &&
            SUPABASE_URL !== "YOUR_SUPABASE_URL_HERE" &&
            SUPABASE_ANON_KEY !== "" &&
            SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY_HERE"
        );
    }
};
