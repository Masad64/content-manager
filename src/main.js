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
    center: true, show: false, backgroundColor: '#e4e9f1', title: 'Content Manager',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.once('ready-to-show', () => { mainWindow.show(); mainWindow.focus(); mainWindow.moveTop(); });
  setTimeout(() => { if (mainWindow && !mainWindow.isVisible()) mainWindow.show(); }, 4000);
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => { ensureSeed(); createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

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

async function checkLicense(email, key) {
  if (!LICENSE_SHEET_ID) return { ok: true, bypass: true };
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
        return { ok: true, email: em || e };
      }
    }
    return { ok: false, reason: 'Incorrect license key.' };
  } catch (e) { return { ok: false, reason: e.message }; }
}
ipcMain.handle('auth:check', async (_e, { email, key }) => {
  const r = await checkLicense(email, key);
  if (r.ok && !r.bypass) writeConfig({ ...readConfig(), licenseEmail: email, licenseKey: key });
  return r;
});
ipcMain.handle('auth:status', async () => {
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
  try {
    let url, headers = {};
    if (provider === 'openrouter') { url = 'https://openrouter.ai/api/v1/models'; headers = { Authorization: 'Bearer ' + key }; }
    else if (provider === 'openai') { url = 'https://api.openai.com/v1/models'; headers = { Authorization: 'Bearer ' + key }; }
    else if (provider === 'anthropic') { url = 'https://api.anthropic.com/v1/models'; headers = { 'x-api-key': key, 'anthropic-version': '2023-06-01' }; }
    else if (provider === 'gemini') { url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key); }
    else return { ok: false, error: 'Unknown provider' };
    const res = await fetch(url, { headers });
    if (res.ok) return { ok: true };
    if (res.status === 401 || res.status === 403) return { ok: false, error: 'Invalid / unauthorized key.' };
    return { ok: false, error: 'HTTP ' + res.status };
  } catch (e) { return { ok: false, error: e.message }; }
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
ipcMain.handle('data:reset', () => {
  try { writeJson('content.json', []); writeJson('niches.json', []); writeJson('channels.json', []); writeJson('team.json', []); return { ok: true }; }
  catch (e) { return { ok: false, error: e.message }; }
});

// ---- IPC: settings / data folder ----
ipcMain.handle('settings:get', () => ({ ...readConfig(), dataDir: dataDir() }));
ipcMain.handle('settings:set', (_e, o) => writeConfig({ ...readConfig(), ...o }));
ipcMain.handle('dialog:pickDataFolder', async () => {
  const { dialog } = require('electron');
  const r = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  if (r.canceled || !r.filePaths.length) return null;
  const cfg = readConfig(); cfg.dataDir = r.filePaths[0]; writeConfig(cfg); ensureSeed();
  return r.filePaths[0];
});
