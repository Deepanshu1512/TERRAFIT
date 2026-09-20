/* =========================================================
   TERRAFIT CONFIG
   Put Jaymin's FINAL Supabase project credentials here.
========================================================= */

const SUPABASE_URL =
    "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";

const SUPABASE_KEY =
    "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE";

let supabaseClient = null;

if (
    window.supabase &&
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("PASTE_YOUR") &&
    !SUPABASE_KEY.includes("PASTE_YOUR")
) {
    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    console.log(
        "TERRAFIT: Supabase client initialized."
    );
} else {
    console.warn(
        "TERRAFIT: Supabase credentials are not configured yet."
    );
}