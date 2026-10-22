// Shared booking helpers: labels, money, status, amount in words.
const BILL = (window.JACOBLEU_CONFIG || {}).BILLING || {};

const SLOTS = {
  am:  { fr: "Matin",       en: "Morning",   hours: "09h30 – 13h30" },
  pm:  { fr: "Après-midi",  en: "Afternoon", hours: "14h00 – 18h00" },
  day: { fr: "Journée",     en: "Full day",  hours: "09h30 – 18h00" }
};
const METHODS = {
  om: "Orange Money", wave: "Wave", cheque: "Chèque", tpe: "TPE (carte)", especes: "Espèces", virement: "Virement"
};
const slotLabel = s => (SLOTS[s] || {})[typeof LANG !== "undefined" ? LANG : "fr"] || s;

// 400000 → "400 000 FCFA"
const fcfa = n => Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
const num = n => Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Dates are kept as "YYYY-MM-DD" strings (local, no time zone shifts)
const isoDate = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const parseD = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return isoDate(d); };
const dmy = s => { const [y, m, d] = s.split("-"); return d + "/" + m + "/" + y; };
const daysBetween = (a, b) => Math.round((parseD(b) - parseD(a)) / 864e5);

function dateRange(b) {
  return b.start_date === b.end_date ? dmy(b.start_date) : (LANG === "en" ? "from " : "du ") + dmy(b.start_date) + (LANG === "en" ? " to " : " au ") + dmy(b.end_date);
}

// Payment status of a booking
function bookingState(b, payments) {
  const paid = payments.filter(p => p.booking_id === b.id && !p.voided_at).reduce((a, p) => a + Number(p.amount), 0);
  const total = Number(b.total);
  const deposit = Math.ceil(total * (BILL.DEPOSIT_PERCENT ?? 50) / 100);
  let key;
  if (b.cancelled_at) key = "cancelled";
  else if (total > 0 && paid >= total) key = "paid";
  else if (paid >= deposit && total > 0) key = "confirmed";
  else if (paid > 0) key = "partial";
  else key = "pending";
  return { key, paid, total, deposit, balance: Math.max(total - paid, 0), depositDue: Math.max(deposit - paid, 0) };
}

// Room price, mirrors save_booking() in supabase/bookings.sql (the database has the final say)
function quote(room, slot, start, end, persons, extras, discount) {
  if (!room || !start || !end || end < start) return null;
  const days = daysBetween(start, end) + 1;
  const unit = slot === "day" ? room.price_day : room.price_half;
  if (unit == null) return { error: "dayOnly", days };
  const per = room.per_person ? Math.max(1, persons || 1) : 1;
  const roomAmount = unit * days * per;
  const ext = (extras || []).filter(e => e.label && e.label.trim() && Number(e.amount) >= 0).reduce((a, e) => a + Number(e.amount || 0), 0);
  const disc = Math.max(0, Number(discount) || 0);
  return { days, unit, per, roomAmount, extras: ext, discount: disc, total: Math.max(roomAmount + ext - disc, 0) };
}

// Does booking b use room row `rowId` on date d, half h ('am'|'pm')?
function covers(b, rooms, rowId, d, h) {
  if (b.cancelled_at || d < b.start_date || d > b.end_date) return false;
  if (!(b.slot === "day" || b.slot === h)) return false;
  const r = rooms.find(x => x.id === b.room_id);
  return !!r && r.occupies.includes(rowId);
}

// French amount in words, for invoices: 450000 → "quatre cent cinquante mille"
function enLettres(n) {
  n = Math.floor(Math.abs(Number(n) || 0));
  const U = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const T = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"];
  const b100 = x => {
    if (x < 20) return U[x];
    const t = Math.floor(x / 10), r = x % 10;
    if (t === 7) return "soixante" + (r === 1 ? " et " : "-") + U[10 + r];
    if (t === 8) return r === 0 ? "quatre-vingts" : "quatre-vingt-" + U[r];
    if (t === 9) return "quatre-vingt-" + U[10 + r];
    return T[t] + (r === 0 ? "" : r === 1 ? " et un" : "-" + U[r]);
  };
  const b1000 = x => {
    const h = Math.floor(x / 100), r = x % 100;
    let s = h === 0 ? "" : h === 1 ? "cent" : U[h] + " cent" + (r === 0 ? "s" : "");
    if (r) s += (s ? " " : "") + b100(r);
    return s;
  };
  if (n === 0) return "zéro";
  const out = [];
  const bn = Math.floor(n / 1e9), m = Math.floor(n / 1e6) % 1000, k = Math.floor(n / 1000) % 1000, r = n % 1000;
  if (bn) out.push(b1000(bn) + " milliard" + (bn > 1 ? "s" : ""));
  if (m) out.push(b1000(m) + " million" + (m > 1 ? "s" : ""));
  if (k) out.push(k === 1 ? "mille" : b1000(k).replace(/(cent|vingt)s$/, "$1") + " mille");
  if (r) out.push(b1000(r));
  return out.join(" ");
}
const capFirst = s => s.charAt(0).toUpperCase() + s.slice(1);

// Supabase returns at most 1000 rows per request
async function fetchAllRows(build) {
  let out = [], from = 0;
  for (;;) {
    const { data, error } = await build().range(from, from + 999);
    if (error) throw error;
    out = out.concat(data);
    if (data.length < 1000) return out;
    from += 1000;
  }
}

// Clean a database error message for staff ("Déjà réservé : …")
const dbError = e => (e && e.message ? e.message.replace(/^.*?ERROR:\s*/, "") : t("netErr"));
