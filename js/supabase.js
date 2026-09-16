/**
 * CyberShield - supabase.js
 * Supabase Cloud Client Configuration & Initialization via NPM module.
 */

import { createClient } from '@supabase/supabase-js';

// Supabase Project Credentials
const SUPABASE_URL = "https://zgixkqwqhwnmhonolbws.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SQSVqbTjwRNYPgB0VQZvfQ_QZhuKGiL";

let supabaseClient = null;

function getSupabaseClient() {
    if (!supabaseClient) {
        if (SUPABASE_URL && SUPABASE_URL !== "YOUR_SUPABASE_URL_HERE" && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY_HERE") {
            try {
                supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true
                    }
                });
                console.log("Supabase kliens sikeresen inicializálva az npm modulból.");
            } catch (error) {
                console.error("Hiba a Supabase kliens inicializálása során:", error);
            }
        } else {
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

// Initialize immediately on module load
getSupabaseClient();

// Global Supabase helper export for CyberShield
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
