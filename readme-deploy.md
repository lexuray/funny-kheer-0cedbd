# Birdie Blitz — Deploy Checklist

You have 3 files:
- `index.html` — the game (already named correctly for hosting)
- `birdie-party-server.js` — the multiplayer server code
- this README

Do the jobs in order. Tick each box as you go. Stop after Job 1 and confirm it works before moving on.

---

## JOB 1 — Get the game online (free, no terminal)  ~5 min

- [ ] Go to **netlify.com** and sign up (free).
- [ ] On the Sites page, find the **drag-and-drop** box ("Deploy manually" / "deploy without Git").
- [ ] Drag **index.html** onto it.
- [ ] It gives you a URL like `something-1234.netlify.app`. Open it.
- [ ] Game loads? ✅ Continue. If not, stop and check the file.

At this point single-player + local "Play Online" test mode work. Online-with-a-friend is Job 3–4.

---

## JOB 2 — Point your GoDaddy domain at Netlify  ~15 min + wait

- [ ] In Netlify: your site → **Domain management** → add your domain (e.g. `yourgame.com`).
- [ ] Netlify shows you **nameservers** (4 lines like `dns1.p01.nsone.net`). Write them down.
- [ ] Log into **GoDaddy** → My Products → your domain → **Manage DNS** → **Nameservers** → **Change** → "I'll use my own / Custom" → paste Netlify's 4 nameservers → Save.
- [ ] Wait 15 min–few hours (DNS propagation — normal). Netlify auto-adds HTTPS (the padlock).
- [ ] Visit your domain. Game loads on your own URL? ✅

---

## JOB 3 — Put the multiplayer server online  ~10 min, one-time (terminal)

- [ ] Install **Node.js**: nodejs.org → big green **LTS** button → run installer → click through.
- [ ] Open a terminal (Mac: Terminal app · Windows: search "Command Prompt").
- [ ] Type each line, press Enter, wait for it to finish:
  - `npm create partykit@latest`  → name it `birdie-blitz`, accept defaults
  - `cd birdie-blitz`
- [ ] Open the `birdie-blitz` folder in your file explorer. Find `src/server.ts` (or `server.js`).
- [ ] Open it in a text editor, delete everything, paste in all of **birdie-party-server.js**, Save.
- [ ] Back in the terminal: `npx partykit deploy`
  - It may pop a browser to log in — do it.
  - When done it prints a host like `birdie-blitz.YOURNAME.partykit.dev`. **Copy that.**

---

## JOB 4 — Connect game to server  ~3 min

- [ ] Open **index.html** in a text editor.
- [ ] Find `const PARTY_HOST = 'REPLACE_WITH_YOUR_PARTYKIT_HOST';`
      → put your host inside the quotes (e.g. `'birdie-blitz.YOURNAME.partykit.dev'`).
- [ ] Find `const PARTY_CONFIGURED = false;` → change to `true`.
- [ ] Save. Drag the updated **index.html** back onto Netlify to re-deploy.

Done. PLAY ONLINE now works between real computers.

---

## Test with a friend
1. You: open your domain → PLAY ONLINE → CREATE LOBBY → get a 4-digit code.
2. Text your friend the domain + the code.
3. Friend: open domain → PLAY ONLINE → type code → JOIN.
4. They appear in your lobby → they ready up → you press START.

## If something looks different than described
Services rename buttons sometimes. Tell me exactly what you see on screen and I'll adjust the step.
