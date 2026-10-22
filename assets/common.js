// Shared helpers for every page
const CFG = window.JACOBLEU_CONFIG || {};
const CONFIGURED = !!(CFG.SUPABASE_URL && CFG.SUPABASE_KEY && !/YOUR-/.test(CFG.SUPABASE_URL + CFG.SUPABASE_KEY));
const sb = CONFIGURED ? window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY) : null;

const DAY = 864e5, OPEN = 8;
let LANG = (() => { try { return localStorage.getItem("jacobleu-lang") || "fr"; } catch (e) { return "fr"; } })();
document.documentElement.lang = LANG;

const t = (k, v = {}) => { let s = (window.T[LANG][k] ?? k); for (const x in v) s = s.replace("{" + x + "}", v[x]); return s; };
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sod = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
const wd = ts => (new Date(ts).getDay() + 6) % 7; // Monday = 0
const hm = ts => { const d = new Date(ts); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const digits = p => String(p || "").replace(/\D/g, "");
const fmtPhone = p => { let d = digits(p); if (d.startsWith("225")) d = d.slice(3); return "+225 " + d.replace(/(\d{2})(?=\d)/g, "$1 ").trim(); };

function toast(m) {
  let el = $("#toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
  el.textContent = m; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2600);
}

// Page header. `links` = show the staff/manager navigation.
function header(active, links = true) {
  const nav = links ? `<nav class="topnav">
      <a href="staff.html" ${active === "staff" ? 'aria-current="page"' : ""}>${t("staff")}</a>
      <a href="bookings.html" ${active === "bookings" ? 'aria-current="page"' : ""}>${t("bookings")}</a>
      <a href="admin.html" ${active === "admin" ? 'aria-current="page"' : ""}>${t("manager")}</a>
      <a href="poster.html" ${active === "poster" ? 'aria-current="page"' : ""}>${t("poster")}</a></nav>` : "";
  // On phones the same links become a tab bar at the bottom of the screen
  const I = {
    staff: '<path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="9"/>',
    bookings: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    admin: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    poster: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z"/>'
  };
  const tab = (href, key, label) => `<a href="${href}" ${active === key ? 'aria-current="page"' : ""}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[key]}</svg><span>${label}</span></a>`;
  if (links && !document.getElementById("tabbar")) {
    const tb = document.createElement("nav"); tb.id = "tabbar"; tb.className = "tabbar"; document.body.appendChild(tb);
    document.body.classList.add("has-tabbar");
  }
  const tb = document.getElementById("tabbar");
  if (tb) tb.innerHTML = tab("staff.html", "staff", t("staff")) + tab("bookings.html", "bookings", t("bookings")) + tab("admin.html", "admin", t("manager")) + tab("poster.html", "poster", t("poster"));
  return `<header>
    <div class="brand"><div class="mark" aria-hidden="true"><span><i></i><i></i><i></i></span></div>
      <div><b>JACOBLEU</b><small>Art Gallery · Abidjan Plateau</small></div></div>
    <div class="hdr-right">${nav}<button class="lang" id="lang" type="button">${LANG === "fr" ? "EN" : "FR"}</button></div>
  </header>`;
}

document.addEventListener("click", e => {
  if (e.target.id === "lang") {
    LANG = LANG === "fr" ? "en" : "fr";
    try { localStorage.setItem("jacobleu-lang", LANG); } catch (x) {}
    document.documentElement.lang = LANG;
    window.render && window.render();
  }
});

// Sign-in form shared by staff and manager pages
function loginForm(subKey) {
  return `<div class="card locked"><div class="eyebrow">Jacobleu Art Gallery</div>
    <p class="sub" style="margin:0">${t(subKey)}</p>
    <form id="login" style="text-align:left">
      <label for="l-email">${t("email")}<input id="l-email" type="email" autocomplete="username" required></label>
      <label for="l-pass">${t("password")}<input id="l-pass" type="password" autocomplete="current-password" required></label>
      <div class="err" id="lerr" role="alert"></div>
      <button class="btn dark" type="submit">${t("signIn")}</button>
    </form></div>`;
}
async function doLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector("button"); btn.disabled = true;
  const { error } = await sb.auth.signInWithPassword({ email: $("#l-email").value.trim(), password: $("#l-pass").value });
  btn.disabled = false;
  if (error) { $("#lerr").textContent = error.status === 400 ? t("wrongLogin") : t("netErr"); return false; }
  return true;
}

// Logged-in person's staff profile (null if not registered)
async function myProfile() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return { session: null, me: null };
  const { data } = await sb.from("staff").select("*").eq("id", session.user.id).maybeSingle();
  return { session, me: data };
}

function setupNotice() { return `<div class="notice">${t("setup")}</div>`; }
