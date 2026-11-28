// Content Manager — Electron main process + local JSON data store.
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const drive = require('./drive');
const yt = require('./youtube');
const XLSX = require('xlsx');
const AdmZip = require('adm-zip');

// Parse a content package's metadata.txt: line 1 = title, "TAGS:" line = tags, rest = description
function parseMeta(text) {
  const lines = String(text).split(/\r?\n/);
  const title = (lines[0] || '').trim();
  const idx = lines.findIndex(l => /^\s*TAGS\s*:/i.test(l));
  const tags = idx >= 0 ? lines[idx].replace(/^\s*TAGS\s*:/i, '').trim() : '';
  const description = lines.slice(1, idx >= 0 ? idx : undefined).join('\n').trim();
  return { title, description, tags };
}
// If the downloaded file is a ZIP package, extract video/thumbnail/metadata next to it
function extractPackage(zipPath) {
  const out = { video: '', thumb: '', meta: null };
  try {
    const buf = fs.readFileSync(zipPath);
    const isZip = /\.zip$/i.test(zipPath) || (buf.length > 1 && buf[0] === 0x50 && buf[1] === 0x4b);
    if (!isZip) { out.video = zipPath; return out; }
    const folder = zipPath.replace(/\.zip$/i, '');
    fs.mkdirSync(folder, { recursive: true });
    new AdmZip(zipPath).extractAllTo(folder, true);
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
    const files = walk(folder);
    out.video = files.find(f => /\.(mp4|mov|mkv|webm|avi|m4v)$/i.test(f)) || '';
    out.thumb = files.find(f => /\.(jpg|jpeg|png|webp)$/i.test(f)) || '';
    const mt = files.find(f => /metadata\.txt$/i.test(f)) || files.find(f => /\.txt$/i.test(f));
    if (mt) out.meta = parseMeta(fs.readFileSync(mt, 'utf-8'));
  } catch (e) { out.error = e.message; }
  return out;
}

let mainWindow;
app.disableHardwareAcceleration();

// ---- config (stores the data folder so a team can point to a shared/synced folder) ----
function configPath() { return path.join(app.getPath('userData'), 'config.json'); }
function readConfig() { try { return JSON.parse(fs.readFileSync(configPath(), 'utf-8')); } catch { return {}; } }
function writeConfig(o) { fs.writeFileSync(configPath(), JSON.stringify(o, null, 2)); return true; }

function dataDir() {
  const c = readConfig();
  const dir = c.dataDir || path.join(app.getPath('documents'), 'ContentManager');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function dataFile(name) { return path.join(dataDir(), name); }
// Folder for a niche (and optional subfolder like 'videos'), created if missing
function projectDir(niche, sub) {
  const safe = String(niche || 'untitled').replace(/[<>:"/\\|?*]+/g, '').trim() || 'untitled';
  const dir = sub ? path.join(dataDir(), safe, sub) : path.join(dataDir(), safe);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function readJson(name, fallback) { try { return JSON.parse(fs.readFileSync(dataFile(name), 'utf-8')); } catch { return fallback; } }
function writeJson(name, data) { fs.writeFileSync(dataFile(name), JSON.stringify(data, null, 2)); return true; }

// create empty data files on first run (everything starts blank)
function ensureSeed() {
  if (!fs.existsSync(dataFile('channels.json'))) writeJson('channels.json', []);
  if (!fs.existsSync(dataFile('content.json'))) writeJson('content.json', []);
  if (!fs.existsSync(dataFile('team.json'))) writeJson('team.json', []);
  if (!fs.existsSync(dataFile('niches.json'))) writeJson('niches.json', []);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 820, minWidth: 980, minHeight: 640,
    center: true, show: false, backgroundColor: '#e4e9f1', title: 'Munshi',
    icon: path.join(__dirname, process.platform === 'win32' ? 'munshi-icon.ico' : 'munshi-icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.once('ready-to-show', () => { mainWindow.show(); mainWindow.focus(); mainWindow.moveTop(); });
  setTimeout(() => { if (mainWindow && !mainWindow.isVisible()) mainWindow.show(); }, 4000);
  // apply saved UI zoom (bigger default so everything reads well on large screens)
  mainWindow.webContents.on('did-finish-load', () => {
    try { mainWindow.webContents.setZoomFactor(Number(readConfig().uiZoom) || 1.15); } catch {}
  });
  // Ctrl/Cmd +/- to zoom the whole UI, Ctrl/Cmd 0 to reset — persisted
  mainWindow.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown' || !(input.control || input.meta)) return;
    let z = mainWindow.webContents.getZoomFactor();
    if (input.key === '=' || input.key === '+') z = Math.min(2.2, z + 0.1);
    else if (input.key === '-' || input.key === '_') z = Math.max(0.7, z - 0.1);
    else if (input.key === '0') z = 1.15;
    else return;
    e.preventDefault();
    mainWindow.webContents.setZoomFactor(z);
    try { writeConfig({ ...readConfig(), uiZoom: z }); } catch {}
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => { ensureSeed(); createWindow(); setupAutoUpdate(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ===== Auto-update (electron-updater → GitHub Releases) =====
let autoUpdater = null;
function uSend(channel, data) { try { BrowserWindow.getAllWindows().forEach(w => w.webContents.send(channel, data)); } catch {} }
function setupAutoUpdate() {
  if (!app.isPackaged) return; // only in the installed app, not dev
  try { autoUpdater = require('electron-updater').autoUpdater; } catch { return; }
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('update-available', (info) => uSend('update:status', { state: 'available', version: info && info.version }));
  autoUpdater.on('update-not-available', () => uSend('update:status', { state: 'none' }));
  autoUpdater.on('download-progress', (p) => uSend('update:status', { state: 'downloading', percent: Math.round(p && p.percent || 0) }));
  autoUpdater.on('update-downloaded', (info) => uSend('update:status', { state: 'ready', version: info && info.version }));
  autoUpdater.on('error', (e) => uSend('update:status', { state: 'error', error: String(e && e.message || e) }));
  setTimeout(() => { try { autoUpdater.checkForUpdates(); } catch {} }, 4000);
}
ipcMain.handle('update:check', async () => {
  if (!app.isPackaged) return { ok: false, dev: true };
  if (!autoUpdater) { try { autoUpdater = require('electron-updater').autoUpdater; } catch { return { ok: false, error: 'updater unavailable' }; } }
  try { const r = await autoUpdater.checkForUpdates(); return { ok: true, version: r && r.updateInfo && r.updateInfo.version }; }
  catch (e) { return { ok: false, error: String(e && e.message || e) }; }
});
ipcMain.handle('update:install', () => { try { if (autoUpdater) autoUpdater.quitAndInstall(); return { ok: true }; } catch (e) { return { ok: false, error: e.message }; } });

// ---- IPC: content CRUD ----
ipcMain.handle('content:all', () => readJson('content.json', []));
ipcMain.handle('content:save', (_e, item) => {
  const list = readJson('content.json', []);
  if (item.id) {
    const i = list.findIndex(x => x.id === item.id);
    if (i >= 0) list[i] = { ...list[i], ...item };
    else list.push(item);
  } else {
    item.id = 'C' + Date.now().toString(36);
    item.createdAt = new Date().toISOString();
    list.push(item);
  }
  writeJson('content.json', list);
  return item;
});
ipcMain.handle('content:delete', (_e, id) => {
  writeJson('content.json', readJson('content.json', []).filter(x => x.id !== id));
  return true;
});

// ---- IPC: channels ----
ipcMain.handle('channels:all', () => readJson('channels.json', []));
ipcMain.handle('channels:save', (_e, list) => writeJson('channels.json', list));

// ---- IPC: team members ----
ipcMain.handle('team:all', () => readJson('team.json', []));
ipcMain.handle('team:save', (_e, list) => writeJson('team.json', list));

// ---- IPC: niches ----
ipcMain.handle('niches:all', () => readJson('niches.json', []));
ipcMain.handle('niches:save', (_e, list) => writeJson('niches.json', list));

// ---- IPC: Google Drive integration ----
ipcMain.handle('drive:status', () => drive.status(readConfig()));
ipcMain.handle('drive:saveCreds', (_e, { id, secret }) => {
  const c = readConfig(); c.driveClientId = id; c.driveClientSecret = secret; writeConfig(c);
  return drive.status(c);
});
ipcMain.handle('drive:connect', async () => {
  try { const c = readConfig(); await drive.connect(c, writeConfig, shell); return { ok: true, status: drive.status(readConfig()) }; }
  catch (e) { return { ok: false, error: e.message }; }
});
ipcMain.handle('drive:disconnect', () => {
  const c = readConfig(); delete c.driveToken; writeConfig(c); return drive.status(c);
});
// Pick a local video and upload it to Drive, attach link/thumbnail/metadata to the content item.
ipcMain.handle('drive:uploadForContent', async (_e, contentId) => {
  try {
    const r = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Video', extensions: ['mp4', 'mov', 'mkv', 'webm', 'avi', 'm4v'] }]
    });
    if (r.canceled || !r.filePaths.length) return { canceled: true };
    const data = await drive.upload(readConfig(), writeConfig, r.filePaths[0]);
    const list = readJson('content.json', []);
    const i = list.findIndex(x => x.id === contentId);
    if (i >= 0) {
      list[i].driveId = data.id; list[i].driveLink = data.webViewLink;
      list[i].thumbnail = data.thumbnailLink || ''; list[i].url = data.webViewLink;
      list[i].fileName = data.name; list[i].size = data.size; list[i].mimeType = data.mimeType;
      writeJson('content.json', list);
      return { ok: true, item: list[i] };
    }
    return { ok: true, data };
  } catch (e) { return { ok: false, error: e.message }; }
});

// ---- IPC: import from Google Sheet / Excel / CSV ----
function rowsFromWorkbook(wb) {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  const headers = rows.length ? Object.keys(rows[0]) : [];
  // Recover hyperlink targets (xlsx keeps them; CSV loses them) per cell -> links[i][header] = url
  let links = rows.map(() => ({}));
  try {
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    const headerCol = {};
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r: range.s.r, c })];
      if (cell && cell.v != null) headerCol[String(cell.v)] = c;
    }
    for (let i = 0; i < rows.length; i++) {
      const r = range.s.r + 1 + i;
      for (const h of headers) {
        const c = headerCol[h]; if (c == null) continue;
        const cell = ws[XLSX.utils.encode_cell({ r, c })];
        if (cell && cell.l && cell.l.Target) links[i][h] = cell.l.Target;
      }
    }
  } catch { /* ignore */ }
  return { headers, rows, links };
}
ipcMain.handle('import:fromUrl', async (_e, url) => {
  try {
    const m = String(url).match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!m) return { ok: false, error: 'This does not look like a valid Google Sheet link.' };
    // XLSX export keeps hyperlink URLs (CSV loses them -> only title bachta hai)
    const xlsxUrl = `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=xlsx`;
    const res = await fetch(xlsxUrl);
    if (!res.ok) return { ok: false, error: `Could not fetch sheet (${res.status}). Share it as "Anyone with link — Viewer".` };
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('text/html')) return { ok: false, error: 'The sheet is private. Share it as "Anyone with link — Viewer" and try again.' };
    const buf = Buffer.from(await res.arrayBuffer());
    const wb = XLSX.read(buf, { type: 'buffer' });
    return { ok: true, ...rowsFromWorkbook(wb) };
  } catch (e) { return { ok: false, error: e.message }; }
});
ipcMain.handle('import:fromFile', async () => {
  try {
    const r = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'], filters: [{ name: 'Sheet', extensions: ['xlsx', 'xls', 'csv'] }] });
    if (r.canceled || !r.filePaths.length) return { canceled: true };
    const wb = XLSX.readFile(r.filePaths[0]);
    return { ok: true, ...rowsFromWorkbook(wb) };
  } catch (e) { return { ok: false, error: e.message }; }
});
ipcMain.handle('import:add', (_e, { items, replace }) => {
  const list = replace ? [] : readJson('content.json', []);
  let n = 0;
  items.forEach(it => {
    it.id = 'C' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    it.createdAt = new Date().toISOString();
    list.push(it); n++;
  });
  writeJson('content.json', list);
  return { ok: true, count: n };
});

// ---- IPC: pick the Google Drive (synced) videos folder ----
ipcMain.handle('dialog:pickVideosFolder', async () => {
  const r = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  if (r.canceled || !r.filePaths.length) return null;
  const cfg = readConfig(); cfg.videosDir = r.filePaths[0]; writeConfig(cfg);
  return r.filePaths[0];
});
// ---- Import a local folder of videos into a niche (for users who keep videos on their PC, not in Sheets) ----
const VIDEO_EXTS = ['.mp4', '.mov', '.mkv', '.avi', '.webm', '.m4v', '.wmv', '.flv', '.mpg', '.mpeg', '.ts'];
ipcMain.handle('folder:scan', async (_e, { dir, niche, spread }) => {
  const fs = require('fs'), path = require('path');
  dir = String(dir || '').trim();
  if (!dir) return { ok: false, error: 'Pick a folder first.' };
  let stat; try { stat = fs.statSync(dir); } catch { return { ok: false, error: 'Folder not found: ' + dir }; }
  if (!stat.isDirectory()) return { ok: false, error: 'That path is not a folder.' };
  let entries; try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return { ok: false, error: e.message }; }
  const vids = entries.filter(f => f.isFile() && VIDEO_EXTS.includes(path.extname(f.name).toLowerCase())).map(f => f.name).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!vids.length) return { ok: true, added: 0, total: 0, skipped: 0, note: 'No video files found in this folder.' };
  const list = readJson('content.json', []);
  const have = new Set(list.map(c => (c.localFile || '').toLowerCase()).filter(Boolean));
  const nicheChannels = readJson('channels.json', []).filter(ch => (ch.niche || '').toLowerCase() === String(niche || '').toLowerCase());
  let added = 0, skipped = 0, ci = 0;
  for (const name of vids) {
    const full = path.join(dir, name);
    if (have.has(full.toLowerCase())) { skipped++; continue; }
    const title = name.replace(/\.[^.]+$/, '').replace(/[._]+/g, ' ').trim();
    list.push({
      id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      title, category: niche || '', type: 'Long', status: 'Ready', assignee: '',
      channel: (spread && nicheChannels.length) ? (nicheChannels[ci++ % nicheChannels.length].number || '') : '',
      localFile: full, driveLink: '', thumbLink: '', metaLink: '', createdAt: new Date().toISOString()
    });
    added++;
  }
  writeJson('content.json', list);
  try { BrowserWindow.getAllWindows().forEach(w => w.webContents.send('content:changed')); } catch {}
  return { ok: true, added, skipped, total: vids.length, channels: nicheChannels.length };
});

// ---- IPC: open a link (video / drive) in the default browser ----
ipcMain.handle('shell:openExternal', (_e, url) => { if (url) shell.openExternal(url); return true; });
ipcMain.handle('shell:openPath', (_e, p) => { if (p) shell.openPath(p); return true; });

// ---- Download a public Google Drive file into the tool ----
const { Readable } = require('stream');
function driveId(url) { const m = String(url).match(/\/d\/([\w-]+)/) || String(url).match(/[?&]id=([\w-]+)/); return m ? m[1] : null; }
async function streamToFile(res, outPath) {
  if (!res.ok || !res.body) throw new Error('Download fail (' + res.status + ')');
  const ws = fs.createWriteStream(outPath);
  await new Promise((resolve, reject) => { Readable.fromWeb(res.body).pipe(ws); ws.on('finish', resolve); ws.on('error', reject); });
}
function extFrom(res, fallback) {
  const cd = res.headers.get('content-disposition') || '';
  const m = cd.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  if (m) { const e = path.extname(decodeURIComponent(m[1])); if (e) return e; }
  return fallback;
}
async function downloadDrive(url, outDir, baseName) {
  const id = driveId(url); if (!id) throw new Error('Could not find the file ID in the Drive link');
  let dl = `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;
  let res = await fetch(dl);
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('text/html')) {
    const html = await res.text();
    const tok = (html.match(/name="confirm"\s+value="([^"]+)"/) || html.match(/confirm=([\w-]+)/) || [])[1];
    const uuid = (html.match(/name="uuid"\s+value="([^"]+)"/) || [])[1];
    if (!tok) throw new Error('Video is private or not shared — set it to "Anyone with link".');
    dl = `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=${tok}${uuid ? `&uuid=${uuid}` : ''}`;
    res = await fetch(dl);
  }
  const ext = extFrom(res, '.mp4');
  const outPath = path.join(outDir, baseName + ext);
  await streamToFile(res, outPath);
  return outPath;
}
// Download a content item's video (and extract package) — mutates `it`
async function downloadItemFile(it, list) {
  const url = it.driveLink || it.url;
  if (!/^https?:\/\//.test(url || '')) throw new Error('This video has no Drive link');
  const dir = projectDir(it.category || 'untitled', 'videos');
  const sameNiche = list.filter(x => (x.category || '').toLowerCase() === (it.category || '').toLowerCase());
  const pos = sameNiche.findIndex(x => x.id === it.id);
  const baseName = 'Video ' + (pos >= 0 ? pos + 1 : sameNiche.length + 1);
  const file = await downloadDrive(url, dir, baseName);
  const pkg = extractPackage(file);
  it.localFile = pkg.video || file;
  if (pkg.thumb) it.localThumb = pkg.thumb;
  if (pkg.meta) { if (pkg.meta.description) it.description = pkg.meta.description; if (pkg.meta.tags) it.tags = pkg.meta.tags; if (!it.title && pkg.meta.title) it.title = pkg.meta.title; }
  it.downloadedDate = new Date().toISOString();
  return { file: it.localFile, thumb: it.localThumb || '', extracted: !!pkg.video && pkg.video !== file };
}
ipcMain.handle('video:download', async (_e, { id }) => {
  try {
    const list = readJson('content.json', []);
    const it = list.find(x => x.id === id);
    if (!it) return { ok: false, error: 'Content not found' };
    const r = await downloadItemFile(it, list);
    writeJson('content.json', list);
    return { ok: true, ...r };
  } catch (e) { return { ok: false, error: e.message }; }
});

// ---- IPC: YouTube browser-automation upload (A2) ----
function ytBase() { return path.join(app.getPath('userData')); }
// Upload a content item (downloads first if needed) — mutates `it`
async function uploadItem(it, list, visibility) {
  if (!it.localFile || !fs.existsSync(it.localFile)) await downloadItemFile(it, list);
  const tags = it.tags || [it.category, it.type].filter(Boolean).join(',');
  const thumb = (it.localThumb && fs.existsSync(it.localThumb)) ? it.localThumb : '';
  const res = await yt.upload(ytBase(), {
    file: it.localFile, title: it.title || 'Untitled', description: it.description || it.title || '',
    tags, thumb, visibility: visibility || 'public',
    onStep: (s) => { try { if (mainWindow) mainWindow.webContents.send('yt:step', { id: it.id, step: s }); } catch {} }
  });
  it.status = 'Uploaded'; it.uploadedDate = new Date().toISOString(); if (res.link) it.youtubeLink = res.link;
  return res;
}
ipcMain.handle('yt:connect', async () => { try { return await yt.connect(ytBase()); } catch (e) { return { ok: false, error: e.message }; } });
ipcMain.handle('yt:status', async () => { try { return await yt.status(ytBase()); } catch (e) { return { ok: false, signedIn: false, error: e.message }; } });
ipcMain.handle('yt:disconnect', async () => { try { return await yt.disconnect(ytBase()); } catch (e) { return { ok: false, error: e.message }; } });
ipcMain.handle('yt:upload', async (_e, { id, visibility }) => {
  try {
    const list = readJson('content.json', []);
    const it = list.find(x => x.id === id);
    if (!it) return { ok: false, error: 'Content not found' };
    const res = await uploadItem(it, list, visibility);
    writeJson('content.json', list);
    return { ok: true, ...res };
  } catch (e) { return { ok: false, error: e.message }; }
});

// ===== AUTO-UPLOAD SCHEDULER =====
// Each channel can have { schedule: { enabled, time:"HH:MM", days:[0-6], visibility } }.
// At the matching day+time, upload the next "Ready" video assigned to that channel.
let _schedBusy = false; const _schedFired = {};
async function runScheduler() {
  if (_schedBusy) return;
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const day = now.getDay();
  const stamp = now.toDateString() + ' ' + hhmm;
  let channels;
  try { channels = readJson('channels.json', []); } catch { return; }
  for (const ch of channels) {
    const s = ch.schedule;
    if (!s || !s.enabled || s.time !== hhmm) continue;
    if (Array.isArray(s.days) && s.days.length && !s.days.includes(day)) continue;
    const key = ch.number + '|' + stamp;
    if (_schedFired[key]) continue;
    _schedFired[key] = true;
    _schedBusy = true;
    try {
      const list = readJson('content.json', []);
      const it = list.find(c => c.channel === ch.number && c.status === 'Ready');
      if (it) {
        await uploadItem(it, list, s.visibility || 'public');
        writeJson('content.json', list);
        try { if (mainWindow) mainWindow.webContents.send('content:changed'); } catch {}
      }
    } catch (e) { /* ignore, try next cycle */ }
    finally { _schedBusy = false; }
  }
}
setInterval(runScheduler, 60000);

// ===== LICENSE / LOGIN (admin controls access via a Google Sheet) =====
// Admin: apni license Google Sheet ka ID yahan daal dein. Sheet ke columns:
//   email | key | active | expiry        (expiry = YYYY-MM-DD, khali = no expiry)
// Sheet ko "Anyone with link - Viewer" share karein.
// Ise khali chhodने par login band rehta hai (sab andar aa sakte) — testing ke liye.
const LICENSE_SHEET_ID = '19cwi14IvsHURI7u9sbpv77Bl7fz0VxH7Rc22LUrd3sM';

// Admin: paste your Login-Log Apps Script Web App URL here to track who signs in.
// Empty = login logging off (the Users tab will show setup steps).
const LOGIN_LOG_URL = '';
function deviceLabel() { try { const os = require('os'); return `${os.type()} ${os.release()}`.slice(0, 40); } catch { return 'unknown'; } }
async function logLogin(email) {
  if (!LOGIN_LOG_URL) return;
  try {
    let version = '0.1.0'; try { version = app.getVersion(); } catch {}
    await fetch(LOGIN_LOG_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: String(email || '').toLowerCase().trim(), at: new Date().toISOString(), device: deviceLabel(), version }) });
  } catch {}
}

// OPEN signup: anyone enters with just their email (no key). Admin still sees every email in the Users tab.
// Set to false while testing to use the license-key gate (checks the admin's Google Sheet).
const OPEN_SIGNUP = false;
// In OPEN mode the admin is whoever's email has role "admin" in the license sheet — so no email is hard-coded in the app.
async function checkAdmin(email) {
  if (!LICENSE_SHEET_ID) return false;
  const em = String(email || '').toLowerCase().trim(); if (!em) return false;
  try {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${LICENSE_SHEET_ID}/export?format=csv`);
    if (!res.ok) return false;
    const text = await res.text(); if (text.trim().startsWith('<')) return false;
    const rows = text.split(/\r?\n/).filter(r => r.trim()).map(r => r.split(',').map(c => c.replace(/^"|"$/g, '').trim()));
    if (!rows.length) return false;
    const h = rows[0].map(x => x.toLowerCase()); const ci = (n) => h.indexOf(n);
    const re = ci('email'), rr = ci('role'), ra = ci('admin');
    for (let i = 1; i < rows.length; i++) {
      if (re >= 0 && (rows[i][re] || '').toLowerCase().trim() === em) {
        if (rr >= 0 && /^(admin|owner)$/i.test((rows[i][rr] || '').trim())) return true;
        if (ra >= 0 && /^(yes|true|1|admin)$/i.test((rows[i][ra] || '').trim())) return true;
      }
    }
    return false;
  } catch { return false; }
}

async function checkLicense(email, key) {
  if (!LICENSE_SHEET_ID) return { ok: true, bypass: true, admin: true };
  try {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${LICENSE_SHEET_ID}/export?format=csv`);
    if (!res.ok) return { ok: false, reason: `License check failed (${res.status}). Check your internet / sheet sharing.` };
    const text = await res.text();
    if (text.trim().startsWith('<')) return { ok: false, reason: 'License sheet is private. Admin: share it as "Anyone with link - Viewer".' };
    const rows = text.split(/\r?\n/).filter(r => r.trim()).map(r => r.split(',').map(c => c.replace(/^"|"$/g, '').trim()));
    if (!rows.length) return { ok: false, reason: 'License sheet is empty.' };
    const h = rows[0].map(x => x.toLowerCase());
    const ci = (n) => h.indexOf(n);
    const em = String(email || '').toLowerCase().trim(), ky = String(key || '').trim();
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const e = (r[ci('email')] || '').toLowerCase(), k = (r[ci('key')] || '').trim();
      // Match on the KEY (case-insensitive). If a row also has an email, that key is locked to that email.
      if (k && k.toLowerCase() === ky.toLowerCase()) {
        if (e && e !== em) return { ok: false, reason: 'This key is registered to a different email.' };
        if (ci('active') >= 0) { const a = (r[ci('active')] || '').toLowerCase(); if (a && !/^(yes|true|1|active|on)$/.test(a)) return { ok: false, reason: 'Your account is inactive. Please contact your admin.' }; }
        if (ci('expiry') >= 0) { const exp = (r[ci('expiry')] || '').trim(); if (exp) { const d = new Date(exp); if (!isNaN(d.getTime()) && d < new Date(new Date().toDateString())) return { ok: false, reason: 'Your subscription has expired (' + exp + '). Please renew.' }; } }
        let admin = false;
        if (ci('role') >= 0) admin = /^(admin|owner)$/i.test((r[ci('role')] || '').trim());
        else if (ci('admin') >= 0) admin = /^(yes|true|1|admin)$/i.test((r[ci('admin')] || '').trim());
        return { ok: true, email: em || e, admin };
      }
    }
    return { ok: false, reason: 'Incorrect license key.' };
  } catch (e) { return { ok: false, reason: e.message }; }
}
ipcMain.handle('auth:check', async (_e, { email, key }) => {
  email = String(email || '').trim();
  if (OPEN_SIGNUP) {
    if (!/.+@.+\..+/.test(email)) return { ok: false, reason: 'Please enter a valid email.' };
    writeConfig({ ...readConfig(), licenseEmail: email });
    logLogin(email); // record every sign-in for the admin Users tab
    const admin = await checkAdmin(email);
    return { ok: true, email, admin };
  }
  const r = await checkLicense(email, key);
  if (r.ok && !r.bypass) writeConfig({ ...readConfig(), licenseEmail: email, licenseKey: key });
  if (r.ok) logLogin(email || r.email);
  return r;
});
// Admin: read the central login log (who signed in, how many use the tool)
ipcMain.handle('users:list', async () => {
  if (!LOGIN_LOG_URL) return { ok: false, error: 'not-configured' };
  try {
    const res = await fetch(LOGIN_LOG_URL);
    if (!res.ok) return { ok: false, error: 'HTTP ' + res.status };
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data.users || data.logins || []);
    return { ok: true, events: rows };
  } catch (e) { return { ok: false, error: e.message }; }
});
ipcMain.handle('auth:status', async () => {
  if (OPEN_SIGNUP) {
    const c = readConfig();
    if (!c.licenseEmail) return { ok: false, reason: 'login-needed' };
    logLogin(c.licenseEmail); // each app-open counts as activity
    return { ok: true, email: c.licenseEmail, admin: await checkAdmin(c.licenseEmail) };
  }
  if (!LICENSE_SHEET_ID) return { ok: true, bypass: true };
  const c = readConfig();
  if (!c.licenseEmail || !c.licenseKey) return { ok: false, reason: 'login-needed' };
  return await checkLicense(c.licenseEmail, c.licenseKey);
});
ipcMain.handle('auth:logout', () => { const c = readConfig(); delete c.licenseEmail; delete c.licenseKey; writeConfig(c); return { ok: true }; });

// ---- IPC: app version / API test / MCP config ----
ipcMain.handle('app:version', () => { try { return app.getVersion(); } catch { return '0.1.0'; } });
ipcMain.handle('api:test', async (_e, { provider, key, model }) => {
  if (!key) return { ok: false, error: 'Key is empty.' };
  // Real test: actually run a tiny generation with the chosen model, so "working" means the model works too (not just the key).
  const r = await aiGenerate('Reply with exactly: ok', 'You are a test. Reply with only the word ok.', null, { provider, key, model: (model || '').trim() });
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error === 'no-ai-key' ? 'Key is empty.' : r.error };
});
ipcMain.handle('mcp:config', () => {
  const serverPath = path.join(__dirname, 'mcp-server.js');
  const cfg = {
    mcpServers: {
      'content-manager': {
        command: 'node',
        args: [serverPath],
        env: { CM_DATA_DIR: dataDir() }
      }
    }
  };
  return JSON.stringify(cfg, null, 2);
});

ipcMain.handle('research:all', () => readJson('competitors.json', {}));

// ---- Live competitor research via the user's own YouTube Data API key ----
function ytApiError(status, text) {
  let reason = '';
  try { reason = (JSON.parse(text).error?.errors?.[0]?.reason) || ''; } catch {}
  if (status === 400 || reason === 'badRequest' || reason === 'keyInvalid') return 'Invalid YouTube API key. Check it in Settings → API keys.';
  if (status === 403 && /quota/i.test(reason)) return 'YouTube API daily quota is used up. Try again tomorrow.';
  if (status === 403 && /accessNotConfigured|forbidden/i.test(reason)) return 'Enable "YouTube Data API v3" for this key in Google Cloud.';
  if (status === 403) return 'YouTube API key rejected. Check the key and that YouTube Data API v3 is enabled.';
  return `YouTube API error (${status}).`;
}
// ---- YouTube API quota tracking (local estimate; Google doesn't expose remaining quota) ----
const YT_DAILY_QUOTA = 10000;
function ytToday() { try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }); } catch { return new Date().toISOString().slice(0, 10); } }
function ytQuota() { const c = readConfig(); const today = ytToday(); return (c.ytQuotaDate === today) ? { date: today, used: Number(c.ytQuotaUsed) || 0 } : { date: today, used: 0 }; }
function addYtQuota(units) { const today = ytToday(); const c = readConfig(); const base = (c.ytQuotaDate === today) ? (Number(c.ytQuotaUsed) || 0) : 0; writeConfig({ ...c, ytQuotaDate: today, ytQuotaUsed: base + units }); }

// Find channels by the VIDEOS they publish on a topic (far more on-topic than channel-name search).
async function ytResearchQuery(query, key) {
  const q = encodeURIComponent(query);
  const sUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=relevance&maxResults=25&q=${q}&key=${key}`;
  const sr = await fetch(sUrl);
  if (!sr.ok) throw new Error(ytApiError(sr.status, await sr.text()));
  const sj = await sr.json();
  // count how many matching videos each channel has (more = more focused on this niche)
  const freq = {};
  for (const it of (sj.items || [])) {
    const cid = it.snippet && it.snippet.channelId;
    if (cid) freq[cid] = (freq[cid] || 0) + 1;
  }
  const ids = Object.keys(freq);
  if (!ids.length) return [];
  const cUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${ids.join(',')}&key=${key}`;
  const cr = await fetch(cUrl);
  if (!cr.ok) throw new Error(ytApiError(cr.status, await cr.text()));
  const cj = await cr.json();
  addYtQuota(101); // 100 for the video search + 1 for channels.list
  return (cj.items || []).map(c => ({
    title: c.snippet?.title || '',
    url: `https://www.youtube.com/channel/${c.id}`,
    subs: Number(c.statistics?.subscriberCount || 0),
    views: Number(c.statistics?.viewCount || 0),
    videos: Number(c.statistics?.videoCount || 0),
    created: c.snippet?.publishedAt ? c.snippet.publishedAt.slice(0, 10) : '',
    thumb: c.snippet?.thumbnails?.default?.url || '',
    matches: freq[c.id] || 0
  })).sort((a, b) => (b.matches - a.matches) || (b.subs - a.subs)).slice(0, 15);
}
// each niche can carry its own exact search phrase (researchQuery); else fall back to its name
function nicheQueryOf(n) { return (n && (n.researchQuery || n.name)) || (typeof n === 'string' ? n : ''); }
ipcMain.handle('research:run', async () => {
  const key = readConfig().youtubeApiKey;
  if (!key) return { ok: false, error: 'no-key' };
  const niches = readJson('niches.json', []);
  const data = {}; let firstErr = null;
  for (const n of niches) {
    const name = typeof n === 'string' ? n : (n && n.name) || '';
    const query = nicheQueryOf(n) || name;
    if (!name) continue;
    try { data[name] = await ytResearchQuery(query, key); }
    catch (e) { data[name] = []; if (!firstErr) firstErr = e.message; }
  }
  return { ok: !firstErr, data, error: firstErr };
});
// search a single niche with a specific phrase (used by per-niche "Search" + saves the phrase)
ipcMain.handle('research:one', async (_e, { niche, query }) => {
  const key = readConfig().youtubeApiKey;
  if (!key) return { ok: false, error: 'no-key' };
  const phrase = String(query || niche || '').trim();
  if (!phrase) return { ok: false, error: 'Type some search words first.' };
  // save the phrase onto the niche
  try {
    const niches = readJson('niches.json', []);
    let changed = false;
    for (const n of niches) { if (n && typeof n === 'object' && (n.name || '').toLowerCase() === String(niche || '').toLowerCase()) { n.researchQuery = phrase; changed = true; } }
    if (changed) writeJson('niches.json', niches);
  } catch {}
  try { return { ok: true, data: await ytResearchQuery(phrase, key) }; }
  catch (e) { return { ok: false, error: e.message }; }
});
// ---- Niche Finder scan (NexLev-style outlier finder) via the user's own YouTube API key ----
function isoDurToSec(d) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(d || '');
  if (!m) return 0;
  return (Number(m[1] || 0) * 3600) + (Number(m[2] || 0) * 60) + Number(m[3] || 0);
}
function nfBadge(o) {
  if (o >= 50) return 'Extreme outlier';
  if (o >= 8) return 'Major outlier';
  if (o >= 3) return 'Consistent winner';
  if (o >= 1.5) return 'Steady performer';
  return '';
}
function daysSince(d) { try { return Math.round((Date.now() - new Date(d).getTime()) / 86400000); } catch { return 0; } }
function nfEmpty(opts) { const r = { ok: true, scan: { at: new Date().toISOString(), videos: 0, channels: 0, category: opts.categoryName || opts.query || '' }, smallBig: [], viral: [], nicheComp: null, filters: opts }; if (!opts.noPersist) { try { writeJson('niche-scan.json', r); } catch {} } return r; }

async function nicheScan(opts, key) {
  const q = encodeURIComponent(String(opts.query || '').trim());
  const maxSubs = Number(opts.maxSubs) || 5000;
  const minViews = Number(opts.minViews) || 5000;
  const region = opts.region || '';
  const lang = opts.lang || '';
  const dur = opts.duration || 'long';           // 'long' | 'short' | 'any'
  const days = Number(opts.days) || 1;
  const after = new Date(Date.now() - days * 86400000).toISOString();
  let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=viewCount&maxResults=50&publishedAfter=${after}&key=${key}`;
  if (q) url += `&q=${q}`;
  if (region) url += `&regionCode=${region}`;
  if (lang) url += `&relevanceLanguage=${lang}`;
  const sr = await fetch(url);
  if (!sr.ok) throw new Error(ytApiError(sr.status, await sr.text()));
  const sj = await sr.json();
  const vids = (sj.items || []).map(it => it.id && it.id.videoId).filter(Boolean);
  if (!vids.length) { addYtQuota(100); return nfEmpty(opts); }
  const vr = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${vids.join(',')}&key=${key}`);
  if (!vr.ok) throw new Error(ytApiError(vr.status, await vr.text()));
  const videos = (await vr.json()).items || [];
  const chIds = [...new Set(videos.map(v => v.snippet && v.snippet.channelId).filter(Boolean))];
  const cr = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${chIds.slice(0, 50).join(',')}&key=${key}`);
  if (!cr.ok) throw new Error(ytApiError(cr.status, await cr.text()));
  const cj = await cr.json();
  addYtQuota(102); // 100 search + 1 videos + 1 channels
  const chMap = {};
  for (const c of (cj.items || [])) {
    const views = Number(c.statistics?.viewCount || 0), vcount = Number(c.statistics?.videoCount || 0);
    chMap[c.id] = {
      title: c.snippet?.title || '', url: `https://www.youtube.com/channel/${c.id}`,
      subs: Number(c.statistics?.subscriberCount || 0), usual: vcount ? Math.round(views / vcount) : 0,
      videos: vcount, created: c.snippet?.publishedAt ? c.snippet.publishedAt.slice(0, 10) : '',
      thumb: c.snippet?.thumbnails?.default?.url || ''
    };
  }
  const now = Date.now(), rows = [];
  for (const v of videos) {
    const ch = chMap[v.snippet?.channelId]; if (!ch) continue;
    const sec = isoDurToSec(v.contentDetails?.duration);
    if (dur === 'long' && sec < 180) continue;
    if (dur === 'short' && sec > 180) continue;
    if (ch.subs > maxSubs) continue;
    const views = Number(v.statistics?.viewCount || 0);
    if (views < minViews) continue;
    const hrs = Math.max(1, (now - new Date(v.snippet?.publishedAt || now).getTime()) / 3600000);
    const outlier = ch.usual ? views / ch.usual : 0;
    rows.push({
      title: v.snippet?.title || '', videoUrl: `https://www.youtube.com/watch?v=${v.id}`,
      thumb: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url || '',
      views, vph: Math.round(views / hrs), hoursAgo: Math.round(hrs), outlier: Math.round(outlier * 10) / 10, badge: nfBadge(outlier), ch
    });
  }
  const byCh = {};
  for (const r of rows) { const k = r.ch.url; if (!byCh[k] || r.views > byCh[k].views) byCh[k] = r; }
  const smallBig = Object.values(byCh).sort((a, b) => b.views - a.views).slice(0, 20).map(r => ({
    title: r.ch.title, url: r.ch.url, subs: r.ch.subs, vph: r.vph, hoursAgo: r.hoursAgo, views: r.views,
    outlier: r.outlier, badge: r.badge, thumb: r.ch.thumb || r.thumb, usual: r.ch.usual, videos: r.ch.videos, daysSinceStart: daysSince(r.ch.created)
  }));
  const viral = rows.slice().sort((a, b) => b.outlier - a.outlier).slice(0, 12).map(r => ({
    title: r.title, videoUrl: r.videoUrl, thumb: r.thumb, views: r.views, outlier: r.outlier, channelTitle: r.ch.title
  }));
  const breakouts = smallBig.filter(c => c.outlier >= 3);
  const young = breakouts.filter(c => c.daysSinceStart && c.daysSinceStart <= 120);
  const score = Math.min(100, breakouts.length * 12 + young.length * 8);
  const level = score >= 60 ? 'High' : score >= 35 ? 'Medium' : 'Low';
  const sampled = videos.length;
  const trend = sampled < 15 ? 'Insufficient historical data · low confidence' : (breakouts.length >= 3 ? 'Rising competition · medium confidence' : 'Stable · medium confidence');
  const nicheComp = { name: opts.categoryName || opts.query || 'Niche', score, level, youngBreakouts: young.length, breakoutChannels: breakouts.length, sampled, trend, channels: breakouts.slice(0, 6) };
  const result = { ok: true, scan: { at: new Date().toISOString(), videos: videos.length, channels: chIds.length, category: opts.categoryName || opts.query || '' }, smallBig, viral, nicheComp, filters: opts };
  if (!opts.noPersist) { try { writeJson('niche-scan.json', result); } catch {} }
  return result;
}
async function resolveChannelSeed(raw, key) {
  let title = '';
  const hm = raw.match(/@([A-Za-z0-9._-]+)/);
  if (hm) { const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=@${hm[1]}&key=${key}`); if (r.ok) { const j = await r.json(); title = j.items?.[0]?.snippet?.title || ''; addYtQuota(1); } }
  if (!title) { const cm = raw.match(/channel\/([A-Za-z0-9_-]{10,})/); if (cm) { const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${cm[1]}&key=${key}`); if (r.ok) { const j = await r.json(); title = j.items?.[0]?.snippet?.title || ''; addYtQuota(1); } } }
  if (!title) { const r = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(raw)}&key=${key}`); if (r.ok) { const j = await r.json(); title = j.items?.[0]?.snippet?.title || ''; addYtQuota(100); } }
  return title;
}
ipcMain.handle('niche:scan', async (_e, opts) => {
  const key = readConfig().youtubeApiKey;
  if (!key) return { ok: false, error: 'no-key' };
  if (!opts || (!opts.all && !String(opts.query || '').trim())) return { ok: false, error: 'Pick a niche/category or type keywords, then Scan.' };
  try { return await nicheScan(opts, key); } catch (e) { return { ok: false, error: e.message }; }
});
ipcMain.handle('niche:lastScan', () => readJson('niche-scan.json', null));
ipcMain.handle('niche:clearScan', () => { try { writeJson('niche-scan.json', null); return { ok: true }; } catch (e) { return { ok: false, error: e.message }; } });
// ---- Daily picks: for each niche the user added, surface fresh/viral small-channel breakouts (cached per day) ----
function ytTodayKey() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
ipcMain.handle('niche:daily', async (_e, { force } = {}) => {
  const key = readConfig().youtubeApiKey;
  if (!key) return { ok: false, error: 'no-key' };
  const cached = readJson('daily-picks.json', null);
  if (!force && cached && cached.date === ytTodayKey()) return { ok: true, cached: true, date: cached.date, at: cached.at, groups: cached.groups || [] };
  const cfg = readConfig();
  const niches = readJson('niches.json', []);
  const list = niches.filter(Boolean).slice(0, 6);
  if (!list.length) return { ok: true, date: ytTodayKey(), at: new Date().toISOString(), groups: [], noNiches: true };
  const groups = [];
  for (const n of list) {
    const name = typeof n === 'string' ? n : (n && n.name) || '';
    const query = (n && typeof n === 'object' && n.researchQuery) || name;
    if (!query) continue;
    try {
      const r = await nicheScan({ query, categoryName: name, maxSubs: 50000, minViews: 3000, region: cfg.ytRegion || '', lang: cfg.ytLang || '', duration: 'any', days: 3, noPersist: true }, key);
      groups.push({ niche: name, query, items: (r.smallBig || []).slice(0, 5) });
    } catch (e) { groups.push({ niche: name, query, items: [], error: e.message }); }
  }
  const out = { date: ytTodayKey(), at: new Date().toISOString(), groups };
  try { writeJson('daily-picks.json', out); } catch {}
  return { ok: true, ...out };
});

// ===== AI helper (BYOK: user's own provider + key from Settings) =====
function aiDefaultModel(p) { return p === 'gemini' ? 'gemini-2.0-flash' : p === 'anthropic' ? 'claude-3-5-haiku-latest' : p === 'openai' ? 'gpt-4o-mini' : 'openai/gpt-4o-mini'; }
function parseDataUrl(d) { const m = /^data:([^;]+);base64,(.*)$/.exec(String(d || '')); return m ? { mime: m[1], b64: m[2] } : null; }
// Turn a provider's raw error body into a clear, actionable message
function aiErr(status, text, provider, model) {
  let msg = '';
  try { const j = JSON.parse(text); msg = (j.error && (j.error.message || j.error)) || j.message || ''; if (typeof msg === 'object') msg = JSON.stringify(msg); } catch { msg = (text || '').slice(0, 200); }
  const low = (msg || '').toLowerCase();
  if (status === 404 || /not found|not supported|unknown name|is not found|does not exist|no such model|unsupported/.test(low)) return `Model "${model}" was rejected by ${provider}: ${msg || 'not found'}. Pick a valid model for this provider in Settings → API keys.`;
  if (status === 401 || status === 403 || /unauthoriz|invalid api key|permission|api key not valid/.test(low)) return `AI key not authorized (${status})${msg ? ': ' + msg : ''}. Check the key in Settings.`;
  if (status === 400) return `AI rejected the request (400)${msg ? ': ' + msg : ''}. Most often the model id is wrong for this provider (e.g. a "google/..." OpenRouter name used with Google Gemini) or the model has no vision — check Settings → API keys.`;
  if (status === 429) return `AI rate limit / quota hit (429)${msg ? ': ' + msg : ''}. Try again shortly.`;
  return `AI error ${status}${msg ? ': ' + msg : ''}`;
}
async function aiGenerate(prompt, system, imageDataUrl, override) {
  const c = readConfig();
  const provider = (override && override.provider) || c.aiProvider || 'openrouter';
  const key = (override && override.key) || c.aiKey; if (!key) return { ok: false, error: 'no-ai-key' };
  let model = ((override && override.model) || c.aiModel || '').trim() || aiDefaultModel(provider);
  // common fix: a "google/..." or "models/..." id only works on OpenRouter, not the direct Gemini API
  if (provider === 'gemini') model = model.replace(/^models\//i, '').replace(/^google\//i, '');
  const img = imageDataUrl ? parseDataUrl(imageDataUrl) : null;
  try {
    if (provider === 'gemini') {
      const parts = [{ text: (system ? system + '\n\n' : '') + prompt }];
      if (img) parts.push({ inline_data: { mime_type: img.mime, data: img.b64 } });
      const body = { contents: [{ parts }], generationConfig: { temperature: 0.6 } };
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) return { ok: false, error: aiErr(r.status, await r.text(), 'Google Gemini', model) };
      const j = await r.json();
      return { ok: true, text: (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('') };
    }
    if (provider === 'anthropic') {
      const content = img ? [{ type: 'text', text: prompt }, { type: 'image', source: { type: 'base64', media_type: img.mime, data: img.b64 } }] : prompt;
      const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }, body: JSON.stringify({ model, max_tokens: 1200, system: system || '', messages: [{ role: 'user', content }] }) });
      if (!r.ok) return { ok: false, error: aiErr(r.status, await r.text(), 'Anthropic', model) };
      const j = await r.json();
      return { ok: true, text: (j.content || []).map(b => b.text || '').join('') };
    }
    // openai / openrouter (OpenAI-compatible chat)
    const base = provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
    const msgs = []; if (system) msgs.push({ role: 'system', content: system });
    msgs.push({ role: 'user', content: img ? [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: imageDataUrl } }] : prompt });
    const r = await fetch(base, { method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages: msgs, temperature: 0.6 }) });
    if (!r.ok) return { ok: false, error: aiErr(r.status, await r.text(), provider === 'openai' ? 'OpenAI' : 'OpenRouter', model) };
    const j = await r.json();
    return { ok: true, text: j.choices?.[0]?.message?.content || '' };
  } catch (e) { return { ok: false, error: e.message }; }
}
function aiParseJson(text) {
  if (!text) return null;
  let t = String(text).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const s = t.indexOf('{'), e = t.lastIndexOf('}');
  if (s >= 0 && e > s) t = t.slice(s, e + 1);
  try { return JSON.parse(t); } catch { return null; }
}
// Pull the real top-performing titles in a niche (YouTube) so the AI judges against what actually works
async function titleNicheData(niche, key) {
  const q = encodeURIComponent(String(niche || '').trim());
  if (!q) return { titles: [] };
  const sr = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=viewCount&maxResults=20&publishedAfter=${new Date(Date.now() - 60 * 86400000).toISOString()}&q=${q}&key=${key}`);
  if (!sr.ok) throw new Error(ytApiError(sr.status, await sr.text()));
  const ids = ((await sr.json()).items || []).map(it => it.id && it.id.videoId).filter(Boolean);
  if (!ids.length) { addYtQuota(100); return { titles: [] }; }
  const vr = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${ids.join(',')}&key=${key}`);
  if (!vr.ok) throw new Error(ytApiError(vr.status, await vr.text()));
  addYtQuota(101);
  const rows = ((await vr.json()).items || []).map(v => ({ title: v.snippet?.title || '', views: Number(v.statistics?.viewCount || 0), channel: v.snippet?.channelTitle || '', thumb: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.high?.url || v.snippet?.thumbnails?.default?.url || '' })).filter(x => x.title).sort((a, b) => b.views - a.views);
  return { titles: rows.slice(0, 15) };
}
ipcMain.handle('title:optimize', async (_e, { title, niche }) => {
  const key = readConfig().youtubeApiKey;
  title = String(title || '').trim(); niche = String(niche || '').trim();
  if (!title) return { ok: false, error: 'Type a title first.' };
  if (!readConfig().aiKey) return { ok: false, error: 'no-ai-key' };
  let top = [];
  if (key && niche) { try { top = (await titleNicheData(niche, key)).titles; } catch (e) { /* research optional */ } }
  const topBlock = top.length ? top.map((t, i) => `${i + 1}. [${t.views.toLocaleString()} views] ${t.title}`).join('\n') : '(no live data available)';
  const system = `You are a precise YouTube title strategist for faceless channels. You judge titles HONESTLY and fairly. A genuinely strong, clickable, well-targeted title should score high (80-95). Only give low scores (below 50) when a title is truly weak (vague, no hook, wrong for the niche, keyword-stuffed, or misleading). Never deflate a good title just to suggest changes. If the user's title is already strong, say so and return few or no variants. Base your judgement on the REAL top-performing titles provided. Reply with ONLY valid JSON, no prose, no markdown.`;
  const prompt = `NICHE: ${niche || '(not given)'}\n\nUSER'S TITLE:\n"${title}"\n\nREAL TOP-PERFORMING TITLES IN THIS NICHE RIGHT NOW (your benchmark):\n${topBlock}\n\nReturn JSON exactly in this shape:\n{"score": <integer 0-100, honest>, "verdict": "<one short sentence>", "reasons": ["<2-4 short points on why this score>"], "keep": <true if the title is already good enough to publish as-is>, "variants": [{"title": "<improved title>", "why": "<short reason it may perform better>"}]}\nRules: give 0 variants if "keep" is true; otherwise 3-5 variants that would realistically beat the user's title for THIS niche. Keep titles under ~70 characters. Do not invent fake stats.`;
  const r = await aiGenerate(prompt, system);
  if (!r.ok) return { ok: false, error: r.error === 'no-ai-key' ? 'no-ai-key' : r.error };
  const parsed = aiParseJson(r.text);
  if (!parsed) return { ok: false, error: 'AI reply could not be read. Try again.' };
  return { ok: true, result: parsed, top };
});
ipcMain.handle('thumb:optimize', async (_e, { image, niche, title }) => {
  niche = String(niche || '').trim(); title = String(title || '').trim();
  if (!image || !parseDataUrl(image)) return { ok: false, error: 'Upload a thumbnail image first.' };
  if (!readConfig().aiKey) return { ok: false, error: 'no-ai-key' };
  const key = readConfig().youtubeApiKey;
  let top = [];
  if (key && niche) { try { top = (await titleNicheData(niche, key)).titles.filter(t => t.thumb).slice(0, 8); } catch {} }
  const topBlock = top.length ? top.map((t, i) => `${i + 1}. [${t.views.toLocaleString()} views] ${t.title}`).join('\n') : '(no live data available)';
  const system = `You are a precise YouTube thumbnail critic for faceless channels. You see the user's thumbnail image. Judge it HONESTLY and fairly against what actually performs in this niche. A genuinely strong, high-contrast, readable, emotion-driven thumbnail should score high (80-95). Only score low (below 50) when it is truly weak: cluttered, low-contrast, tiny/unreadable text, no clear subject, boring, or off-niche. Never deflate a good thumbnail just to suggest changes. Reply with ONLY valid JSON, no markdown.`;
  const prompt = `NICHE: ${niche || '(not given)'}${title ? `\nVIDEO TITLE: "${title}"` : ''}\n\nTOP-PERFORMING VIDEO TITLES IN THIS NICHE (context for what wins):\n${topBlock}\n\nThe attached image is the user's thumbnail. Return JSON exactly:\n{"score": <integer 0-100, honest>, "verdict": "<one short sentence>", "reasons": ["<2-4 short points on why this score — mention subject, contrast, text, emotion, clutter>"], "keep": <true if it is already good enough to publish>, "fixes": ["<3-5 concrete, specific improvements; empty if keep is true>"]}\nDo not invent text that isn't in the image. Be specific to THIS thumbnail.`;
  const r = await aiGenerate(prompt, system, image);
  if (!r.ok) return { ok: false, error: r.error };
  const parsed = aiParseJson(r.text);
  if (!parsed) return { ok: false, error: 'AI reply could not be read. Your model may not support images — try a vision model (e.g. gemini-2.0-flash, gpt-4o-mini).' };
  return { ok: true, result: parsed, top };
});
ipcMain.handle('title:audit', async (_e, { niche }) => {
  niche = String(niche || '').trim();
  if (!readConfig().aiKey) return { ok: false, error: 'no-ai-key' };
  const content = readJson('content.json', []);
  const titles = content.filter(c => (c.category || '').trim().toLowerCase() === niche.toLowerCase() && (c.title || '').trim()).map(c => c.title.trim());
  const uniq = [...new Set(titles)].slice(0, 25);
  if (!uniq.length) return { ok: true, weak: [], total: 0 };
  const key = readConfig().youtubeApiKey;
  let top = [];
  if (key) { try { top = (await titleNicheData(niche, key)).titles; } catch {} }
  const topBlock = top.length ? top.map((t, i) => `${i + 1}. ${t.title}`).join('\n') : '(no live data)';
  const system = `You are a YouTube title auditor for faceless channels. Be honest and conservative: flag ONLY titles that genuinely have a ranking or click-through problem for their niche. Do NOT flag titles that are already fine. Reply with ONLY valid JSON.`;
  const prompt = `NICHE: ${niche}\n\nTOP-PERFORMING TITLES IN THIS NICHE (benchmark):\n${topBlock}\n\nUSER'S TITLES TO AUDIT:\n${uniq.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nReturn JSON: {"weak": [{"title": "<the exact user title>", "issue": "<short reason it may not rank/click well>", "score": <integer 0-100>}]}\nInclude a title in "weak" ONLY if it realistically needs changing. If all titles are fine, return {"weak": []}.`;
  const r = await aiGenerate(prompt, system);
  if (!r.ok) return { ok: false, error: r.error };
  const parsed = aiParseJson(r.text) || { weak: [] };
  return { ok: true, weak: Array.isArray(parsed.weak) ? parsed.weak : [], total: uniq.length };
});

const SIM_STOP = new Set('the a an and or of to in on for with your you this that is are how why what when where who will can would should could video videos channel official shorts short full new best top vs ep part official'.split(' '));
async function similarSeed(raw, key) {
  const id = await resolveChannelId(raw, key); if (!id) return { seed: '', name: '' };
  const cr = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${id}&key=${key}`);
  let name = '', uploads = '';
  if (cr.ok) { const c = (await cr.json()).items?.[0]; addYtQuota(1); name = c?.snippet?.title || ''; uploads = c?.contentDetails?.relatedPlaylists?.uploads || ''; }
  let titles = [];
  if (uploads) { const pr = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=15&playlistId=${uploads}&key=${key}`); if (pr.ok) { addYtQuota(1); titles = ((await pr.json()).items || []).map(i => i.snippet?.title || ''); } }
  const freq = {};
  titles.join(' ').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).forEach(w => { if (w.length >= 4 && !SIM_STOP.has(w)) freq[w] = (freq[w] || 0) + 1; });
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
  return { seed: top.length ? top.join(' ') : name, name };
}
ipcMain.handle('niche:findSimilar', async (_e, opts) => {
  const key = readConfig().youtubeApiKey;
  if (!key) return { ok: false, error: 'no-key' };
  const raw = String(opts && opts.channel || '').trim();
  if (!raw) return { ok: false, error: 'Paste a channel link or @handle first.' };
  try {
    const { seed, name } = await similarSeed(raw, key);
    if (!seed) return { ok: false, error: 'Could not read that channel. Paste the channel URL or @handle.' };
    return await nicheScan({ ...opts, query: seed, all: false, categoryName: 'Similar to ' + (name || raw.replace(/^https?:\/\/[^/]+\//, '')) }, key);
  } catch (e) { return { ok: false, error: e.message }; }
});
ipcMain.handle('niche:save', (_e, item) => { try { const s = readJson('saved.json', []); if (s.some(x => x.url === item.url)) return { ok: true, count: s.length, dup: true }; s.unshift({ ...item, savedAt: Date.now() }); writeJson('saved.json', s.slice(0, 500)); return { ok: true, count: s.length }; } catch (e) { return { ok: false, error: e.message }; } });
ipcMain.handle('niche:saved', () => readJson('saved.json', []));

// ---- My Library (saved channels) ----
function fmtDur(sec) { const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0'); }
function libScore(recent, usual) {
  if (!recent || !recent.length) return null;
  const avgO = recent.reduce((a, v) => a + (v.outlier || 0), 0) / recent.length;
  const best = Math.max(...recent.map(v => v.outlier || 0));
  return Math.max(1, Math.min(99, Math.round(35 + avgO * 6 + best * 2)));
}
async function libFetch(url, key) {
  const m = /channel\/([A-Za-z0-9_-]{10,})/.exec(url || ''); if (!m) throw new Error('No channel id in this item.');
  const cr = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${m[1]}&key=${key}`);
  if (!cr.ok) throw new Error(ytApiError(cr.status, await cr.text()));
  const c = (await cr.json()).items?.[0]; if (!c) throw new Error('Channel not found.');
  const stats = c.statistics || {}, sn = c.snippet || {};
  const usual = Number(stats.videoCount) ? Math.round(Number(stats.viewCount) / Number(stats.videoCount)) : 0;
  const uploads = c.contentDetails?.relatedPlaylists?.uploads;
  let recent = [], units = 1;
  if (uploads) {
    const pr = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=6&playlistId=${uploads}&key=${key}`); units++;
    if (pr.ok) {
      const vids = ((await pr.json()).items || []).map(i => i.contentDetails?.videoId).filter(Boolean);
      if (vids.length) {
        const vr = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${vids.join(',')}&key=${key}`); units++;
        if (vr.ok) recent = ((await vr.json()).items || []).map(v => {
          const views = Number(v.statistics?.viewCount || 0), sec = isoDurToSec(v.contentDetails?.duration);
          return { title: v.snippet?.title || '', url: `https://www.youtube.com/watch?v=${v.id}`, views, outlier: usual ? Math.round(views / usual * 10) / 10 : 0, dur: fmtDur(sec), publishedAt: v.snippet?.publishedAt || '', thumb: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url || '' };
        }).slice(0, 3);
      }
    }
  }
  addYtQuota(units);
  return { handle: sn.customUrl || '', title: sn.title || '', avatar: sn.thumbnails?.default?.url || '', subs: Number(stats.subscriberCount || 0), videos: Number(stats.videoCount || 0), usual, created: sn.publishedAt ? sn.publishedAt.slice(0, 10) : '', daysSinceStart: sn.publishedAt ? daysSince(sn.publishedAt) : 0, recent, outlier: recent.length ? Math.max(...recent.map(v => v.outlier || 0)) : 0, score: libScore(recent, usual) };
}
async function resolveChannelId(raw, key) {
  raw = String(raw || '').trim();
  let m = /channel\/([A-Za-z0-9_-]{10,})/.exec(raw); if (m) return m[1];
  const hm = raw.match(/@([A-Za-z0-9._-]+)/);
  if (hm) { const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@${hm[1]}&key=${key}`); if (r.ok) { const j = await r.json(); addYtQuota(1); if (j.items?.[0]?.id) return j.items[0].id; } }
  const um = /\/user\/([^/?#]+)/.exec(raw); if (um) { const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${encodeURIComponent(um[1])}&key=${key}`); if (r.ok) { const j = await r.json(); addYtQuota(1); if (j.items?.[0]?.id) return j.items[0].id; } }
  const q = raw.replace(/^https?:\/\/[^/]+\//, '').replace(/[@/]/g, ' ').trim() || raw;
  const r = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(q)}&key=${key}`);
  if (r.ok) { const j = await r.json(); addYtQuota(100); if (j.items?.[0]?.id?.channelId) return j.items[0].id.channelId; }
  return '';
}
ipcMain.handle('lib:add', async (_e, { input }) => {
  const key = readConfig().youtubeApiKey; if (!key) return { ok: false, error: 'no-key' };
  const raw = String(input || '').trim(); if (!raw) return { ok: false, error: 'Paste a channel link, @handle, or name.' };
  try {
    const id = await resolveChannelId(raw, key); if (!id) return { ok: false, error: 'Could not find that channel. Paste the channel URL or @handle.' };
    const url = `https://www.youtube.com/channel/${id}`;
    const data = await libFetch(url, key);
    const s = readJson('saved.json', []);
    if (s.some(x => x.url === url)) { for (const x of s) if (x.url === url) Object.assign(x, data, { refreshedAt: Date.now() }); writeJson('saved.json', s); return { ok: true, dup: true, item: s.find(x => x.url === url) }; }
    const item = { url, kind: 'channel', category: '', format: '', savedAt: Date.now(), refreshedAt: Date.now(), ...data };
    s.unshift(item); writeJson('saved.json', s.slice(0, 500));
    return { ok: true, item };
  } catch (e) { return { ok: false, error: e.message }; }
});
ipcMain.handle('lib:all', () => readJson('saved.json', []));
ipcMain.handle('lib:remove', (_e, { url }) => { try { writeJson('saved.json', readJson('saved.json', []).filter(x => x.url !== url)); return { ok: true }; } catch (e) { return { ok: false, error: e.message }; } });
ipcMain.handle('lib:note', (_e, { url, note }) => { try { const s = readJson('saved.json', []); for (const x of s) if (x.url === url) x.note = note; writeJson('saved.json', s); return { ok: true }; } catch (e) { return { ok: false, error: e.message }; } });
ipcMain.handle('lib:refresh', async (_e, { url }) => { const key = readConfig().youtubeApiKey; if (!key) return { ok: false, error: 'no-key' }; try { const data = await libFetch(url, key); const s = readJson('saved.json', []); for (const x of s) if (x.url === url) Object.assign(x, data, { refreshedAt: Date.now() }); writeJson('saved.json', s); return { ok: true, data }; } catch (e) { return { ok: false, error: e.message }; } });
ipcMain.handle('lib:update', (_e, { url, patch }) => { try { const s = readJson('saved.json', []); for (const x of s) if (x.url === url) Object.assign(x, patch || {}); writeJson('saved.json', s); return { ok: true }; } catch (e) { return { ok: false, error: e.message }; } });

// ---- Full channel detail (deep stats for the slide-over panel) ----
function regionName(code) { if (!code) return ''; try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code; } catch { return code; } }
function agoStr(ts) { const d = (Date.now() - ts) / 86400000; if (d < 1) return Math.max(1, Math.round(d * 24)) + 'h ago'; if (d < 30) return Math.round(d) + 'd ago'; if (d < 365) return Math.round(d / 30) + 'mo ago'; return Math.round(d / 365) + 'y ago'; }
function median(arr) { if (!arr.length) return 0; const s = arr.slice().sort((a, b) => a - b), m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); }
async function libDetail(url, key) {
  const m = /channel\/([A-Za-z0-9_-]{10,})/.exec(url || ''); if (!m) throw new Error('No channel id in this item.');
  const cr = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,brandingSettings&id=${m[1]}&key=${key}`);
  if (!cr.ok) throw new Error(ytApiError(cr.status, await cr.text()));
  const c = (await cr.json()).items?.[0]; if (!c) throw new Error('Channel not found.');
  const stats = c.statistics || {}, sn = c.snippet || {}, branding = c.brandingSettings || {};
  const uploads = c.contentDetails?.relatedPlaylists?.uploads;
  let vstats = [], units = 1;
  if (uploads) {
    const pr = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=30&playlistId=${uploads}&key=${key}`); units++;
    if (pr.ok) {
      const ids = ((await pr.json()).items || []).map(i => i.contentDetails?.videoId).filter(Boolean).slice(0, 50);
      if (ids.length) {
        const vr = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${ids.join(',')}&key=${key}`); units++;
        if (vr.ok) vstats = ((await vr.json()).items || []).map(v => ({ id: v.id, title: v.snippet?.title || '', views: Number(v.statistics?.viewCount || 0), sec: isoDurToSec(v.contentDetails?.duration), pub: v.snippet?.publishedAt || '', thumb: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url || '' }));
      }
    }
  }
  addYtQuota(units);
  const subs = Number(stats.subscriberCount || 0), totalViews = Number(stats.viewCount || 0), videoCount = Number(stats.videoCount || 0);
  const longs = vstats.filter(v => v.sec >= 180), base = longs.length ? longs : vstats;
  const medianViews = median(base.map(v => v.views)), medLen = median(base.map(v => v.sec));
  const now = Date.now();
  const last30 = vstats.filter(v => v.pub && (now - new Date(v.pub).getTime()) <= 30 * 86400000);
  const viewsPerMonth = last30.reduce((a, v) => a + v.views, 0);
  const dates = vstats.map(v => new Date(v.pub).getTime()).filter(Boolean).sort((a, b) => a - b);
  let uploadsPerWeek = 0, lastUploadAgo = '';
  if (dates.length >= 2) { const weeks = Math.max(1, (dates[dates.length - 1] - dates[0]) / (7 * 86400000)); uploadsPerWeek = Math.round(vstats.length / weeks * 10) / 10; }
  if (dates.length) lastUploadAgo = agoStr(dates[dates.length - 1]);
  const viewsPerSub = subs ? Math.round(medianViews / subs * 100) / 100 : 0;
  const mkVid = v => ({ title: v.title, url: `https://www.youtube.com/watch?v=${v.id}`, views: v.views, outlier: medianViews ? Math.round(v.views / medianViews * 10) / 10 : 0, dur: fmtDur(v.sec), thumb: v.thumb, publishedAt: v.pub });
  const outliers = vstats.filter(v => medianViews && v.views >= 3 * medianViews).sort((a, b) => b.views - a.views).map(mkVid);
  const recent = vstats.slice(0, 12).map(mkVid);
  const created = sn.publishedAt || '';
  const ageMonths = created ? Math.max(1, Math.round((now - new Date(created).getTime()) / (30 * 86400000))) : 0;
  const score = libScore(recent, medianViews);
  return {
    title: sn.title || '', handle: sn.customUrl || '', avatar: sn.thumbnails?.high?.url || sn.thumbnails?.default?.url || '',
    banner: branding.image?.bannerExternalUrl || '', country: sn.country || '', countryName: regionName(sn.country || ''),
    subs, videos: videoCount, totalViews, created, createdStr: created ? new Date(created).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    ageMonths, daysSinceStart: created ? daysSince(created) : 0, typicalLengthStr: fmtDur(medLen), typicalLong: medLen >= 180,
    viewsPerMonth, uploadsPerWeek, lastUploadAgo, medianViews, viewsPerSub, monetised: subs >= 1000, score,
    recent, outliers
  };
}
ipcMain.handle('lib:detail', async (_e, { url }) => {
  const key = readConfig().youtubeApiKey; if (!key) return { ok: false, error: 'no-key' };
  try {
    const d = await libDetail(url, key);
    const s = readJson('saved.json', []); const it = s.find(x => x.url === url) || {};
    d.rpm = it.rpm || ''; d.mark = it.mark || ''; d.competitor = it.competitor !== false; d.category = it.category || ''; d.note = it.note || '';
    for (const x of s) if (x.url === url) Object.assign(x, { subs: d.subs, videos: d.videos, avatar: d.avatar, handle: d.handle, score: d.score, daysSinceStart: d.daysSinceStart, created: d.created, outlier: d.outliers[0] ? d.outliers[0].outlier : (x.outlier || 0), refreshedAt: Date.now(), recent: d.recent.slice(0, 3) });
    writeJson('saved.json', s);
    return { ok: true, data: d };
  } catch (e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('yt:quota', () => { const q = ytQuota(); return { used: q.used, limit: YT_DAILY_QUOTA, date: q.date }; });
ipcMain.handle('yt:testKey', async () => {
  const key = readConfig().youtubeApiKey;
  if (!key) return { ok: false, error: 'Add your YouTube API key first.' };
  try {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/i18nLanguages?part=snippet&key=${key}`);
    if (!r.ok) return { ok: false, error: ytApiError(r.status, await r.text()) };
    addYtQuota(1);
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
});
ipcMain.handle('data:reset', () => {
  try { writeJson('content.json', []); writeJson('niches.json', []); writeJson('channels.json', []); writeJson('team.json', []); return { ok: true }; }
  catch (e) { return { ok: false, error: e.message }; }
});

// ---- IPC: settings / data folder ----
ipcMain.handle('settings:get', () => ({ ...readConfig(), dataDir: dataDir() }));
ipcMain.handle('settings:set', (_e, o) => writeConfig({ ...readConfig(), ...o }));
ipcMain.handle('ui:zoom', (_e, { delta, reset } = {}) => {
  if (!mainWindow) return 1.15;
  let z = mainWindow.webContents.getZoomFactor();
  if (reset) z = 1.15; else if (delta) z = Math.min(2.2, Math.max(0.7, z + delta));
  mainWindow.webContents.setZoomFactor(z);
  try { writeConfig({ ...readConfig(), uiZoom: z }); } catch {}
  return z;
});
ipcMain.handle('dialog:pickDataFolder', async () => {
  const { dialog } = require('electron');
  const r = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  if (r.canceled || !r.filePaths.length) return null;
  const cfg = readConfig(); cfg.dataDir = r.filePaths[0]; writeConfig(cfg); ensureSeed();
  return r.filePaths[0];
});
