# Content Manager — Mac Setup Guide

This is a desktop app (built with Electron). To run it on a Mac you only need **Node.js** — no Apple account and no installer required. It runs straight from the source.

---

## One-time setup

**1. Install Node.js** (if you don't have it)
- Go to https://nodejs.org and download the **LTS** version, then install it.
- To check it worked: open the **Terminal** app and type:
  ```bash
  node -v
  ```
  If you see a version number (e.g. `v20.x.x`), you're good.

**2. Put this folder somewhere**, for example on your Desktop:
`~/Desktop/content-manager`

**3. Open Terminal and go into the folder:**
```bash
cd ~/Desktop/content-manager
```

**4. Install everything** (dependencies + the automation browser):
```bash
npm install
```
> This takes 1–2 minutes the first time (it downloads Chromium, ~130 MB).

---

## Run the app

```bash
npm start
```
The app window will open.

---

## First login

The app opens on a **login screen**.
- Enter the **email** and **license key** you were given.
- Click **Sign in**.

(The owner/admin controls which emails and keys are allowed.)

---

## How to use it

1. **Settings → General → Your name** — enter your name.
2. **Niches** tab → **＋ Add niche** — create a niche.
3. Open a niche → **Attach sheet** — paste a Google Sheet link
   (share the sheet as *"Anyone with link – Viewer"*). The content imports automatically.
4. On any video row → **⬇ Download** — the video is saved into the app's own folder.
5. **Channels** tab → **▶ Connect YouTube** — log in to your channel once.
6. On a video row → **⬆ Upload** — the app uploads it to YouTube for you
   (title, description, tags and thumbnail are set automatically).

### Auto-upload schedule (optional)
In the **Channels** tab, open a channel and turn on **Auto-upload schedule**.
Pick a time, the days, and the visibility. The app will automatically upload the
next **Ready** video for that channel at the scheduled time (the computer must be on).

---

## Troubleshooting

- **No window after `npm start`** → copy the error from Terminal and send it to the owner.
- **"command not found: npm"** → Node.js isn't installed. Redo step 1.
- **Browser asks you to log in / verify during upload** → just complete it once; it's saved after that.
- **macOS blocks the app** → the automation uses the normal Chrome/Chromium browser; allow it if macOS asks for permission.

---

*A proper `.dmg` installer can be built later — that requires running `npm run dist:mac` on a Mac.*
