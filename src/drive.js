// Google Drive integration (OAuth2 desktop flow + upload).
// Needs a Google Cloud OAuth "Desktop app" client (Client ID + Secret).
const { google } = require('googleapis');
const http = require('http');
const fs = require('fs');
const path = require('path');

const REDIRECT_PORT = 42813;
const REDIRECT = `http://127.0.0.1:${REDIRECT_PORT}`;
const SCOPE = ['https://www.googleapis.com/auth/drive.file'];

function makeClient(cfg) {
  return new google.auth.OAuth2(cfg.driveClientId, cfg.driveClientSecret, REDIRECT);
}

function status(cfg) {
  return {
    hasCreds: !!(cfg.driveClientId && cfg.driveClientSecret),
    connected: !!(cfg.driveToken && cfg.driveToken.refresh_token || (cfg.driveToken && cfg.driveToken.access_token))
  };
}

// Opens the Google consent page (via shell.openExternal) and catches the redirect.
function connect(cfg, saveCfg, shell) {
  if (!cfg.driveClientId || !cfg.driveClientSecret) return Promise.reject(new Error('Pehle Client ID aur Secret daalein'));
  const client = makeClient(cfg);
  const url = client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: SCOPE });
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const u = new URL(req.url, REDIRECT);
        const code = u.searchParams.get('code');
        const err = u.searchParams.get('error');
        if (err) { res.end('Error: ' + err); server.close(); return reject(new Error(err)); }
        if (!code) { res.end('Waiting...'); return; }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end('<h2 style="font-family:sans-serif">Google Drive connected ✓</h2><p style="font-family:sans-serif">Ye tab band kar dein aur Content Manager par wapas aayein.</p>');
        server.close();
        const { tokens } = await client.getToken(code);
        const merged = { ...(cfg.driveToken || {}), ...tokens };
        cfg.driveToken = merged; saveCfg(cfg);
        resolve(true);
      } catch (e) { try { server.close(); } catch {} reject(e); }
    });
    server.on('error', reject);
    server.listen(REDIRECT_PORT, () => shell.openExternal(url));
    setTimeout(() => { try { server.close(); } catch {} reject(new Error('Timeout — dobara try karein')); }, 180000);
  });
}

// Uploads a local video file to Drive, makes it shareable, returns link + thumbnail + metadata.
async function upload(cfg, saveCfg, filePath, onProgress) {
  if (!status(cfg).connected) throw new Error('Pehle Google Drive connect karein');
  const client = makeClient(cfg);
  client.setCredentials(cfg.driveToken);
  client.on('tokens', t => { cfg.driveToken = { ...cfg.driveToken, ...t }; saveCfg(cfg); });
  const drive = google.drive({ version: 'v3', auth: client });

  const size = fs.statSync(filePath).size;
  const res = await drive.files.create({
    requestBody: { name: path.basename(filePath) },
    media: { body: fs.createReadStream(filePath) },
    fields: 'id,name,webViewLink,thumbnailLink,size,mimeType,createdTime'
  }, {
    onUploadProgress: e => { if (onProgress && size) onProgress(Math.round(e.bytesRead / size * 100)); }
  });
  const id = res.data.id;
  await drive.permissions.create({ fileId: id, requestBody: { role: 'reader', type: 'anyone' } });
  const info = await drive.files.get({ fileId: id, fields: 'id,name,webViewLink,webContentLink,thumbnailLink,size,mimeType,createdTime' });
  return info.data;
}

module.exports = { status, connect, upload };
