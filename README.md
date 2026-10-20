# Jacobleu Art Gallery · Visitor sign-in & staff attendance

Replaces the paper "Liste des présences visiteurs" with a QR code at the entrance,
gives each staff member a clock-in / clock-out page, and gives the manager a
dashboard of visits, peak hours, busiest days, regular visitors and a WhatsApp list.

| Page | Who uses it | What it does |
|---|---|---|
| `index.html` | Visitors (no account) | Opened by the QR code. Name, occupation, phone, email, reason, WhatsApp consent. |
| `staff.html` | Each staff member | Sign in, clock in / clock out, see own last 7 days. |
| `admin.html` | Jacob (manager) | Full dashboard, visitor list, staff attendance, WhatsApp export, CSV download. |
| `poster.html` | Manager | Printable A4/A3 poster with the QR code. |

**How it fits together:** the pages are plain HTML files (no build step) hosted for free
on Vercel from a GitHub repository. The data and the logins live in Supabase.
Security is enforced inside the database (`supabase/schema.sql`):

- Visitors can only **add** a check-in. They cannot read anything.
- Staff can only see **their own** shifts. Clock times are set by the server.
- Only an account marked `manager` can read visitor data.
- The same phone scanned twice within 30 minutes counts as one visit.

```
jacobleu-gallery/
├── index.html          visitor sign-in (QR target)
├── staff.html          staff clock-in / out
├── admin.html          manager dashboard
├── poster.html         printable QR poster
├── assets/
│   ├── config.js       ← the only file you edit (Supabase address + key)
│   ├── common.js       shared code
│   ├── i18n.js         French / English text
│   └── style.css       design
└── supabase/
    ├── schema.sql      database tables + security rules (run once)
    └── add-staff.sql   register the manager and staff accounts
```

---

## What you need (all free)

- A **GitHub** account: https://github.com
- A **Supabase** account: https://supabase.com
- A **Vercel** account (sign up *with GitHub*): https://vercel.com
- Optional: access to the DNS settings of `jacobleu.art` for a nice address like `visite.jacobleu.art`

Allow about one hour the first time.

---

## Step 1 · Create the Supabase project

1. Log in to Supabase → **New project**.
2. Name: `jacobleu-gallery`.
3. **Database password**: generate a strong one and save it somewhere safe (password manager).
4. **Region**: Supabase has no African region. Pick **West EU (London)** or **Central EU (Frankfurt)**, the closest to Abidjan.
5. Click **Create new project** and wait 1–2 minutes.

## Step 2 · Create the database

1. In the left menu open **SQL Editor** → **New query**.
2. Open `supabase/schema.sql`, copy everything, paste it in, click **Run**.
3. You should see "Success. No rows returned".
4. Check: **Table Editor** now shows `visits`, `staff` and `shifts`, each marked as protected by RLS.

## Step 3 · Lock down logins

Only people you create should be able to sign in.

1. **Authentication → Sign In / Providers**: make sure **Email** is enabled.
2. On the same page, turn **off** "Allow new users to sign up".
3. **Authentication → URL Configuration**: set **Site URL** to your final address
   (you can come back after Step 7 to fill this in).

## Step 4 · Create the manager and staff accounts

1. **Authentication → Users → Add user → Create new user**.
2. Enter Jacob's email and a password, tick **Auto Confirm User**, click **Create user**.
3. Repeat for each staff member (each person gets their own email + password).
4. Open **SQL Editor → New query**, paste `supabase/add-staff.sql`,
   replace the example emails and names with the real ones, and **Run**.
   - `role = 'manager'` → sees the dashboard
   - `role = 'staff'` → sees only their own clock-in / out
5. Check with the last query at the bottom of that file: everyone should be listed.

> Staff without an email can use one you create for them, e.g. `aminata.jacobleu@gmail.com`.

## Step 5 · Connect the website to Supabase

1. In Supabase click **Connect** (top of the project) or go to **Project Settings → API Keys**.
2. Copy:
   - the **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - the **Publishable key** (starts with `sb_publishable_…`), or on older projects the **anon public** key
3. Open `assets/config.js` and paste them:

```js
window.JACOBLEU_CONFIG = {
  SUPABASE_URL: "https://abcdefgh.supabase.co",
  SUPABASE_KEY: "sb_publishable_xxxxxxxxxxxxxxxx",
  CHECKIN_URL: ""
};
```

> ⚠️ Never paste the **secret** / **service_role** key anywhere in this project.
> The publishable key is designed to be public; the database rules protect the data.

## Step 6 · Put the code on GitHub

**Easiest way (no command line):**

1. GitHub → **New repository** → name `jacobleu-gallery` → **Private** → **Create repository**.
2. Click **uploading an existing file**.
3. Drag in **the contents** of the `jacobleu-gallery` folder (the `.html` files and the
   `assets` and `supabase` folders, not the folder itself).
4. Click **Commit changes**.

**With git (if you prefer):**

```bash
cd jacobleu-gallery
git init
git add .
git commit -m "Jacobleu visitor sign-in"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/jacobleu-gallery.git
git push -u origin main
```

## Step 7 · Host it on Vercel

1. Vercel → **Add New… → Project** → **Import** the `jacobleu-gallery` repository.
2. **Framework Preset: Other**. Leave Build Command and Output Directory empty.
3. Click **Deploy**. After ~30 seconds you get an address like `https://jacobleu-gallery.vercel.app`.
4. Open it on your phone: you should see the sign-in form. Fill it in once to test.
5. Open `…/admin.html`, sign in as Jacob: the test visit appears.
6. Open `…/staff.html`, sign in as a staff member, clock in and out.

From now on, every change you commit to GitHub goes live automatically within a minute.

## Step 8 · Use the gallery's own address (recommended)

So the QR code shows `visite.jacobleu.art` instead of a Vercel address:

1. Vercel → your project → **Settings → Domains** → add `visite.jacobleu.art`.
2. Vercel shows a **CNAME** record. Add it where `jacobleu.art` is managed (domain registrar / DNS).
3. Wait until Vercel shows the domain as valid (minutes to a few hours).
4. In `assets/config.js` set `CHECKIN_URL: "https://visite.jacobleu.art/"` and commit.
5. In Supabase → **Authentication → URL Configuration**, set Site URL to `https://visite.jacobleu.art`.

> Do this **before** printing the poster: the QR code contains the address.

## Step 9 · Print the poster

1. Open `https://visite.jacobleu.art/poster.html` on a computer.
2. Click **Imprimer l'affiche**, print in A4 or A3 (colour not needed).
3. Test it with two or three phones (Android and iPhone) before putting it up.
4. Place it at the entrance at eye level, with good light. A second copy near the
   performance area helps on show nights.

## Step 10 · Daily use

| Who | Bookmark | When |
|---|---|---|
| Visitors | QR poster | On arrival |
| Staff | `…/staff.html` on their phone | Clock in on arrival, clock out when leaving |
| Jacob | `…/admin.html` | Any time; it refreshes every 2 minutes |

**WhatsApp:** in the dashboard click **Copier les numéros** and paste them into a
**WhatsApp Business broadcast list**. People only receive broadcasts if they have saved
the gallery's number, so add "Enregistrez notre numéro" to the poster or to your first message.
A WhatsApp **Channel** cannot be filled from a list of numbers: people must follow it
themselves, so share the Channel link in your broadcast.

---

## Looking after it

- **Free plan pauses** a project after 7 days with no activity. Daily check-ins keep it awake.
  If it does pause, open Supabase and click **Restore**.
- **Backups:** the free plan has no backups you can download. Once a month, click
  **Télécharger le CSV** in the dashboard and keep the file. When the gallery depends on it,
  consider the Supabase Pro plan (daily backups).
- **Someone leaves:** run `update public.staff set active = false where full_name = '…';`
  and delete their user in **Authentication → Users**.
- **A visitor asks to be deleted:** use **Supprimer** next to their name in the dashboard.
- **Forgotten staff password:** **Authentication → Users** → the user → reset / set a new password.
- **Privacy:** visitor data falls under Côte d'Ivoire's personal data law (Loi n° 2013-450),
  supervised by ARTCI. Keep the WhatsApp consent box, only message people who ticked it,
  and check with ARTCI whether the gallery needs to declare this processing.

## Troubleshooting

| Problem | Fix |
|---|---|
| Yellow box "not connected to Supabase" | `assets/config.js` still has the placeholder values. |
| Visitor sees "Connexion impossible" | Wrong key in `config.js`, or the project is paused. |
| Staff sees "not registered as staff" | Their email was not added with `add-staff.sql`. |
| Jacob sees "réservé au gérant" | His row in `staff` must have `role = 'manager'`. |
| "Wrong email or password" | Check the user exists and was **Auto Confirmed**. |
| QR code opens the wrong address | Fix `CHECKIN_URL`, commit, reprint the poster. |

## Changing things later

- Opening hours shown on the charts: `OPEN` in `assets/common.js` (8 = 8am; the chart covers 16 hours).
- Texts in French and English: `assets/i18n.js`.
- Colours and fonts: the top of `assets/style.css`.
- Reasons for visit: `index.html` (the list `["expo","show","cowork","event"]`), the labels in
  `i18n.js` (`p_…`), and the `check (purpose in (...))` line in `schema.sql`.
