/* =========================================================
   TERRAFIT CONFIG
   Put Jaymin's FINAL Supabase project credentials here.
========================================================= */

const SUPABASE_URL =
     "https://bfkedcihkgkqlqedybkk.supabase.co";

const SUPABASE_KEY =
   "sb_publishable_N2xvqLd_mj9M5npcHGoIPg_zABk4NQt";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

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