// =====================================================================
// THE ONLY FILE YOU NEED TO EDIT
// Find the two Supabase values in Supabase → Project Settings → API Keys
// (or the "Connect" button at the top of your project).
//
// Use the PUBLISHABLE key (starts with sb_publishable_) or the legacy
// "anon public" key. It is safe to have it in a website: the security
// rules in supabase/schema.sql decide what it can do.
// NEVER put the "secret" or "service_role" key here.
// =====================================================================
window.JACOBLEU_CONFIG = {
  SUPABASE_URL: "https://rynfqxcchfsoemuiyurk.supabase.co",
  SUPABASE_KEY: "sb_publishable_AjRvfaUoxgBHHmH-Wn9Lrw_9DhOrPwz",

  // The address of the visitor sign-in page (the QR code points here).
  // Leave empty to use the address the site is opened from.
  CHECKIN_URL: "",

  // Shown on the thank-you screen after a visitor signs in.
  // Leave a value empty ("") to hide that button.
  GALLERY_NAME: "Jacobleu Art Gallery",
  WHATSAPP_NUMBER: "2250798286450",          // digits only, with 225
  WHATSAPP_CHANNEL_URL: "",                  // e.g. "https://whatsapp.com/channel/XXXX" once the channel exists
  INSTAGRAM_URL: "https://www.instagram.com/jacobleuartgallery/",
  YOUTUBE_URL: "",                           // e.g. "https://www.youtube.com/@jacobleuartgallery"
  EMAIL: "jacobleu@jacobleu.art",
  ADDRESS: "Abidjan, 2 Plateaux Aghien, carrefour pharmacie Las Palmas",

  // ------------------------------------------------------------------
  // INVOICES AND RECEIPTS (room bookings)
  // Room prices are NOT here: they are in Supabase → Table Editor → rooms.
  // ------------------------------------------------------------------
  BILLING: {
    COMPANY: "Jacobleu Art Gallery",
    PHONE: "+225 07 98 28 64 50",
    RCCM: "CI-ABI-03-2025-B12-01792",          // check against the official document
    DEPOSIT_PERCENT: 50,                        // paid at booking; the rest before the event
    CONDITIONS: "Moitié de la somme versée à la réservation, le reste avant l'occupation de la salle.",
    PAYMENT_METHODS: [
      "Orange Money : 07 47 83 70 00",
      "Wave : +225 07 68 09 50 65 / 07 98 28 64 50",
      "Chèque à l'ordre de : Jacobleu Art Gallery",
      "TPE (carte bancaire) : à la galerie"
    ],
    // Listed on invoices for the event rooms only
    EVENT_ROOMS: ["conference", "exposition", "both"],
    INCLUDED: ["Wifi", "Chaises", "Tables", "Sono avec micros", "Pupitre", "Eau (maximum 50 bouteilles)"],
    NOTE: "Agents de sécurité et cocktail (canapés et boissons) possibles, à la charge du client.",
    // Signature at the bottom of invoices and receipts.
    // Upload a scan of the signature as assets/signature.png (transparent background is best).
    SIGNATORY_TITLE: "La Gérante",
    SIGNATORY_NAME: "",
    SIGNATURE_IMAGE: "assets/signature.png"
  }
};
