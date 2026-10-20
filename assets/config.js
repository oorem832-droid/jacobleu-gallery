// =====================================================================
// THE ONLY FILE YOU NEED TO EDIT
// Find these two values in Supabase → Project Settings → API Keys
// (or the "Connect" button at the top of your project).
//
// Use the PUBLISHABLE key (starts with sb_publishable_) or the legacy
// "anon public" key. It is safe to have it in a website: the security
// rules in supabase/schema.sql decide what it can do.
// NEVER put the "secret" or "service_role" key here.
// =====================================================================
window.JACOBLEU_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT-ID.supabase.co",
  SUPABASE_KEY: "YOUR-PUBLISHABLE-OR-ANON-KEY",

  // The address of the visitor sign-in page (the QR code points here).
  // Leave empty to use the address the site is opened from.
  CHECKIN_URL: ""
};
