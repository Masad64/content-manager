// ---- Browser-preview fallback: Electron ke bahar (plain browser) sample data se chalao ----
if (!window.api) {
  let _c = [
    { id:'c1', title:"The Gatehouse Keeper's Firelit Room | A Soft British Sleep Story", category:'Sleep', type:'Long', status:'Uploaded', assignee:'Ali', channel:'CH-01', driveLink:'https://drive.google.com/file/d/1aAA/view', thumbLink:'https://drive.google.com/file/d/1bBB/view', metaLink:'https://drive.google.com/file/d/1cCC/view' },
    { id:'c2', title:"The Withy Cutter's Quiet Boat | A Cozy Old-World Sleep Story", category:'Sleep', type:'Long', status:'Uploaded', assignee:'Maya', channel:'CH-01', driveLink:'https://drive.google.com/file/d/2aAA/view', thumbLink:'https://drive.google.com/file/d/2bBB/view', metaLink:'https://drive.google.com/file/d/2cCC/view' },
    { id:'c3', title:"The Butler's Pantry at Nethermoor | A Gentle Bedtime Story", category:'Sleep', type:'Long', status:'Ready', assignee:'Ali', channel:'', driveLink:'https://drive.google.com/file/d/3aAA/view', thumbLink:'https://drive.google.com/file/d/3bBB/view', metaLink:'' },
    { id:'c4', title:"The Fletcher of Greenhollow Lane | A Soft Turn-of-Century Story", category:'History', type:'Short', status:'Visuals', assignee:'Maya', channel:'', driveLink:'', thumbLink:'', metaLink:'' },
    { id:'c5', title:"The Slow Launch to Dittisham | A Cozy Old-World Sleep Story", category:'Sleep', type:'Long', status:'Uploaded', assignee:'Ali', channel:'CH-02', driveLink:'https://drive.google.com/file/d/5aAA/view', thumbLink:'https://drive.google.com/file/d/5bBB/view', metaLink:'https://drive.google.com/file/d/5cCC/view' }
  ];
  let _ch = [ { number:'CH-01', name:'Sleepy Tales', niche:'Sleep' }, { number:'CH-02', name:'History Hub', niche:'History' } ];
  let _tm = [ { name:'Ali' }, { name:'Maya' } ];
  let _ni = [ { name:'Sleep' }, { name:'History' } ];
  let _cfg = { dataDir:'Documents\\ContentManager (preview)' };
  const ok = (x) => Promise.resolve(x);
  window.api = {
    contentAll: () => ok(_c), channelsAll: () => ok(_ch), teamAll: () => ok(_tm), nichesAll: () => ok(_ni),
    nichesSave: (l) => { _ni=l; return ok(true); },
    contentSave: (it) => { if (it.id) { const i=_c.findIndex(x=>x.id===it.id); if(i>=0)_c[i]={..._c[i],...it}; else _c.push(it);} else { it.id='c'+Date.now(); _c.push(it);} return ok(it); },
    contentDelete: (id) => { _c=_c.filter(x=>x.id!==id); return ok(true); },
    channelsSave: (l) => { _ch=l; return ok(true); }, teamSave: (l) => { _tm=l; return ok(true); },
    settingsGet: () => ok(_cfg), settingsSet: (o) => { Object.assign(_cfg,o); return ok(true); },
    pickDataFolder: () => ok(null), pickVideosFolder: () => ok('D:\\Videos\\Horror (preview)'),
    folderScan: () => ok({ ok: true, added: 8, skipped: 2, total: 10, channels: 3 }),
    driveStatus: () => ok({ hasCreds:false, connected:false }),
    driveSaveCreds: () => ok({ hasCreds:true, connected:false }),
    driveConnect: () => ok({ ok:false, error:'Preview mode — asli app mein chalega' }),
    driveDisconnect: () => ok({ hasCreds:true, connected:false }),
    driveUploadForContent: () => ok({ ok:false, error:'Preview mode' }),
    importFromUrl: () => ok({ ok:false, error:'Preview mode — asli desktop app mein chalega' }),
    importFromFile: () => ok({ ok:false, error:'Preview mode' }),
    importAdd: () => ok({ ok:false, error:'Preview mode' }),
    openLink: (url) => { try { window.open(url, '_blank'); } catch {} return ok(true); },
    openPath: () => ok(true),
    videoDownload: () => ok({ ok: false, error: 'Preview mode — asli app mein download hoga.' }),
    nicheDaily: () => ok({ ok: true, cached: true, date: new Date().toISOString().slice(0, 10), groups: [
      { niche: 'Sleep', items: Array.from({ length: 4 }, (_, i) => ({ title: 'Rainy Village Sleep Story #' + (i + 1), url: '#', subs: 4200 + i * 900, vph: 1800 - i * 120, hoursAgo: 8 + i * 5, views: 52000 - i * 6000, outlier: (5.2 - i * 0.7).toFixed(1), badge: i === 0 ? 'Major outlier' : 'Consistent winner', thumb: `https://picsum.photos/seed/sl${i}/120/68` })) },
      { niche: 'History', items: Array.from({ length: 3 }, (_, i) => ({ title: 'The Forgotten Empire of ' + ['Nubia', 'Carthage', 'Khwarazm'][i], url: '#', subs: 8800 + i * 1500, vph: 2600 - i * 300, hoursAgo: 12 + i * 7, views: 98000 - i * 15000, outlier: (7.1 - i * 1.2).toFixed(1), badge: 'Major outlier', thumb: `https://picsum.photos/seed/hi${i}/120/68` })) }
    ] }),
    titleOptimize: (title) => ok({ ok: true, top: [{ title: 'The Dark Truth Nobody Talks About', views: 1200000 }, { title: 'He Opened the Door… Big Mistake', views: 880000 }], result: { score: 62, verdict: 'Decent hook, but a bit generic for this niche.', reasons: ['Opens with a weak keyword', 'No curiosity gap', 'Could be shorter for mobile'], keep: false, variants: [{ title: 'The ' + (title || 'Mystery') + ' Nobody Warned You About', why: 'Adds a curiosity gap + stronger emotion' }, { title: 'What Really Happened to ' + (title || 'Them'), why: 'Question format pulls search + clicks' }, { title: 'I Investigated ' + (title || 'This') + ' — Here\'s the Truth', why: 'First-person + payoff promise' }] } }),
    titleAudit: () => ok({ ok: true, total: 6, weak: [{ title: 'My new video about aliens', issue: 'Vague, no hook or keyword', score: 28 }, { title: 'Scary story compilation 2024', issue: 'Dated year + generic, low search intent', score: 41 }] }),
    thumbOptimize: () => ok({ ok: true, top: Array.from({ length: 6 }, (_, i) => ({ thumb: `https://picsum.photos/seed/th${i}/320/180`, title: 'Top ' + (i + 1), views: (6 - i) * 180000 })), result: { score: 58, verdict: 'Clear subject, but the text is hard to read at small size.', reasons: ['Main subject is good and centered', 'Text too thin and low contrast', 'Background is a bit busy'], keep: false, fixes: ['Make the text 2× bigger and bolder', 'Add a dark stroke/shadow behind the text', 'Blur or darken the background so the subject pops', 'Boost saturation on the main subject', 'Add one strong emotion (face or reaction)'] } }),
    usersList: () => ok({ ok: true, events: [
      { email: 'ali@gmail.com', at: new Date(Date.now() - 12 * 864e5).toISOString(), device: 'Windows 10' },
      { email: 'ali@gmail.com', at: new Date(Date.now() - 2 * 3600e3).toISOString(), device: 'Windows 10' },
      { email: 'sara.khan@gmail.com', at: new Date(Date.now() - 9 * 864e5).toISOString(), device: 'macOS 14' },
      { email: 'sara.khan@gmail.com', at: new Date(Date.now() - 3 * 864e5).toISOString(), device: 'macOS 14' },
      { email: 'bilal@studio.com', at: new Date(Date.now() - 1 * 3600e3).toISOString(), device: 'Windows 11' },
      { email: 'new.user@x.com', at: new Date(Date.now() - 20 * 60e3).toISOString(), device: 'Windows 10' }
    ] })
  };
}

const STATUSES = ['Idea', 'Script', 'Visuals', 'Voiceover', 'Rendering', 'Ready', 'Uploaded'];
const CAT_COLORS = { history:'var(--amber)', nature:'var(--green)', sports:'var(--pink)', tech:'var(--blue)', aviation:'var(--accent)' };
const PALETTE = ['var(--amber)','var(--green)','var(--pink)','var(--blue)','var(--accent)','var(--red)'];

let content = [], channels = [], team = [], niches = [], query = '', nicheQuery = '', currentMember = null, currentNiche = null, appCfg = {}, isAdmin = false;
function applyAdminUi() { const n = $('navUsers'); if (n) n.hidden = !isAdmin; }
function notify(title, body) {
  if (!appCfg.notifications) return;
  try { if (Notification.permission === 'granted') new Notification(title, { body }); else if (Notification.permission !== 'denied') Notification.requestPermission().then(p => { if (p === 'granted') new Notification(title, { body }); }); } catch {}
}

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;' }[c]));
const initials = (n) => (n || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
function catColor(cat) {
  const k = (cat || '').toLowerCase();
  if (CAT_COLORS[k]) return CAT_COLORS[k];
  let h = 0; for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

async function load() {
  content = await window.api.contentAll();
  channels = await window.api.channelsAll();
  team = await window.api.teamAll();
  niches = await window.api.nichesAll();
  try { const s = await window.api.settingsGet(); appCfg = s || {}; if ($('userName')) $('userName').textContent = s.userName || 'Admin'; applyDp(s.userDp || '', s.userName || ''); } catch {}
  renderNicheNav(); renderMemberNav();
  renderDashboardNiches(); renderTeam();
  renderPerf(); renderChannels();
  if (currentNiche) renderNiche();
  if (currentMember) renderMember();
  renderOverview(); startOverviewRotator();
}

// ---- Overview: animated "what you can do" line ----
const OVERVIEW_LINES = [
  'Manage all your niches in one place.',
  'Attach a content sheet and import in one click.',
  'Download videos straight into the tool.',
  'Mark which video went to which channel.',
  'See what\'s uploaded and what\'s still left.',
  'Give every team member their own tab.'
];
let _rotTimer = null, _rotIdx = 0;
function startOverviewRotator() {
  const el = $('rotLine'); if (!el) return;
  if (_rotTimer) clearInterval(_rotTimer);
  const show = () => {
    el.textContent = OVERVIEW_LINES[_rotIdx % OVERVIEW_LINES.length];
    el.classList.remove('rot-in'); void el.offsetWidth; el.classList.add('rot-in');
    _rotIdx++;
  };
  show();
  _rotTimer = setInterval(show, 2800);
}
function replayOverview() {
  document.querySelectorAll('#view-dashboard .fade, #view-dashboard .feat').forEach(el => {
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  });
}

// ---- Overview: stat pills + today's activity feed ----
function isToday(iso) { if (!iso) return false; const d = new Date(iso), n = new Date(); return d.toDateString() === n.toDateString(); }
function fmtTime(iso) { try { return new Date(iso).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(' ', ''); } catch { return ''; } }
function pillHtml(ic, n, label) { return `<div class="pill"><div class="pic">${ic}</div><div><div class="pn">${n}</div><div class="pl">${label}</div></div></div>`; }
function renderOverview() {
  const pills = $('ovPills');
  if (pills) {
    const up = content.filter(c => c.status === 'Uploaded').length;
    pills.innerHTML = pillHtml('🎬', content.length, 'total videos') + pillHtml('📺', channels.length, 'channels') + pillHtml('⬆', up, 'uploaded');
  }
  if ($('todayDate')) $('todayDate').textContent = '· ' + new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'short' });
  const feed = $('todayFeed'); if (!feed) return;
  const ev = [];
  // uploads & downloads: one row each
  content.forEach(c => {
    if (isToday(c.uploadedDate)) ev.push({ t: c.uploadedDate, ic: '⬆', tx: `Uploaded <b>${esc(c.title)}</b>`, sub: c.channel ? ('to ' + esc(c.channel)) : '' });
    if (isToday(c.downloadedDate)) ev.push({ t: c.downloadedDate, ic: '⬇', tx: `Downloaded <b>${esc(c.title)}</b>`, sub: '' });
  });
  // added (imported): grouped per niche so it doesn't flood
  const added = content.filter(c => isToday(c.createdAt));
  const byCat = {};
  added.forEach(c => { const k = c.category || '—'; (byCat[k] = byCat[k] || []).push(c); });
  Object.entries(byCat).forEach(([cat, list]) => {
    const latest = list.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b);
    ev.push({ t: latest.createdAt, ic: '＋', tx: `Added <b>${list.length}</b> video${list.length > 1 ? 's' : ''}`, sub: cat !== '—' ? ('in ' + esc(cat)) : '' });
  });
  ev.sort((a, b) => new Date(b.t) - new Date(a.t));
  if (!ev.length) { feed.innerHTML = '<div class="empty" style="padding:18px">No activity yet today — import, download or upload something.</div>'; return; }
  feed.innerHTML = ev.slice(0, 12).map(e => `<div class="feed-row"><span class="feed-ic">${e.ic}</span><div class="feed-tx">${e.tx}${e.sub ? ` <span class="feed-sub">· ${e.sub}</span>` : ''}</div><span class="feed-tm">${fmtTime(e.t)}</span></div>`).join('');
}

// ---- nav ----
const titles = { dashboard:'Overview', niches:'Niches', perf:'Performance', channels:'Channels', research:'Research', team:'Team', users:'Users', community:'Community', mcp:'MCP', guide:'Guide', help:'Help', settings:'Settings' };
function setActive(el) { document.querySelectorAll('#nav button, .nav-bottom button').forEach(x => x.classList.toggle('on', x === el)); }
function showView(id) { document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.id === id)); }
document.querySelectorAll('#nav > button[data-view], .nav-bottom > button[data-view]').forEach(b => b.addEventListener('click', () => {
  setActive(b); showView('view-' + b.dataset.view); currentMember = null; currentNiche = null;
  $('pageTitle').textContent = titles[b.dataset.view];
  const v = b.dataset.view;
  if (v === 'settings') loadSettings();
  else if (v === 'dashboard') { renderOverview(); renderPerf(); replayOverview(); startOverviewRotator(); }
  else if (v === 'niches') renderDashboardNiches();
  else if (v === 'channels') renderChannels();
  else if (v === 'research') renderResearch();
  else if (v === 'users') renderUsers();
  else if (v === 'community') renderCommunity();
  else if (v === 'mcp') loadMcp();
}));

// ---- Community: WhatsApp / Facebook group / Emerge AI (links set here) ----
const COMMUNITY = [
  { icon: '💬', name: 'WhatsApp group', desc: 'Daily tips, quick help and updates — join the chat.', btn: 'Join WhatsApp', url: '', cls: 'wa' },
  { icon: '📘', name: 'Facebook group', desc: 'Share wins, ask questions and connect with other creators.', btn: 'Join Facebook group', url: '', cls: 'fb' },
  { icon: '🚀', name: 'Emerge AI community', desc: 'Our official hub — free faceless YouTube training & more.', btn: 'Visit Emerge AI', url: '', cls: 'em' }
];
function renderCommunity() {
  const box = $('comm-grid'); if (!box) return;
  box.innerHTML = COMMUNITY.map((c, i) => `
    <div class="comm-card ${c.cls}">
      <div class="comm-ic">${c.icon}</div>
      <div class="comm-name">${esc(c.name)}</div>
      <div class="comm-desc">${esc(c.desc)}</div>
      ${c.url ? `<button class="btn lime comm-join" data-i="${i}">${esc(c.btn)}</button>` : `<button class="btn comm-join" data-i="${i}" disabled>Link coming soon</button>`}
    </div>`).join('');
  box.querySelectorAll('.comm-join').forEach(b => b.addEventListener('click', () => { const c = COMMUNITY[Number(b.dataset.i)]; if (c && c.url) window.api.openLink(c.url); }));
}

// ---- "Built By MAsad" credit → open Facebook profile in default browser ----
if ($('builtByLink')) $('builtByLink').addEventListener('click', e => { e.preventDefault(); window.api.openLink('https://www.facebook.com/asad.elahi.509'); });

// ---- Auto-update: bottom banner + Settings "Check for updates" ----
(function () {
  const setUStatus = (t) => { const el = $('updateStatus'); if (el) el.textContent = t || ''; };
  const showBar = (txt) => { const bar = $('updateBar'), t = $('updateBarText'); if (t && txt) t.textContent = txt; if (bar) bar.hidden = false; };
  if (window.api && window.api.onUpdateStatus) window.api.onUpdateStatus((d) => {
    if (!d) return;
    if (d.state === 'available') setUStatus('New version ' + (d.version ? 'v' + d.version + ' ' : '') + 'found — downloading…');
    else if (d.state === 'downloading') setUStatus('Downloading update… ' + (d.percent || 0) + '%');
    else if (d.state === 'ready') { setUStatus('✓ Update ready — click “Update now”.'); showBar('🔔 Munshi ' + (d.version ? 'v' + d.version + ' ' : '') + 'is ready to install.'); }
    else if (d.state === 'none') setUStatus('✓ You already have the latest version.');
    else if (d.state === 'error') setUStatus('Update check failed: ' + (d.error || ''));
  });
  const now = $('updateNowBtn'); if (now) now.addEventListener('click', async () => { now.disabled = true; now.textContent = 'Updating…'; try { await window.api.updateInstall(); } catch {} });
  const dis = $('updateDismiss'); if (dis) dis.addEventListener('click', () => { const bar = $('updateBar'); if (bar) bar.hidden = true; });
  const chk = $('updateCheckBtn'); if (chk) chk.addEventListener('click', async () => {
    setUStatus('Checking for updates…');
    let r; try { r = await window.api.updateCheck(); } catch (e) { r = { ok: false, error: e.message }; }
    if (r && r.dev) setUStatus('Updates run in the installed app (not here in dev).');
    else if (r && r.ok) setUStatus('Checked — a new version, if any, downloads automatically.');
    else setUStatus('Could not check: ' + ((r && r.error) || 'error'));
  });
})();

// ---- Users (admin-only): central login history ----
let usersData = null, usersQuery = '';
function usersAgg(events) {
  const map = {};
  (events || []).forEach(e => {
    const email = String(e.email || e.Email || '').toLowerCase().trim(); if (!email) return;
    const t = new Date(e.at || e.At || e.time || e.timestamp || '').getTime() || 0;
    const m = map[email] || (map[email] = { email, first: Infinity, last: 0, count: 0, device: e.device || e.Device || '' });
    m.count++; if (t) { if (t < m.first) m.first = t; if (t > m.last) { m.last = t; if (e.device || e.Device) m.device = e.device || e.Device; } }
  });
  return Object.values(map).map(m => ({ ...m, first: m.first === Infinity ? 0 : m.first })).sort((a, b) => b.last - a.last);
}
function uAgo(t) { if (!t) return '—'; const d = (Date.now() - t) / 86400000; if (d < 1) return Math.max(1, Math.round(d * 24)) + 'h ago'; if (d < 30) return Math.round(d) + 'd ago'; return Math.round(d / 30) + 'mo ago'; }
function uDate(t) { if (!t) return '—'; try { return dayKey(new Date(t)); } catch { return '—'; } }
async function renderUsers() {
  const stats = $('users-stats'), body = $('users-body'); if (!body) return;
  if (!usersData) {
    body.innerHTML = '<div class="empty" style="padding:22px">Loading login history…</div>'; if (stats) stats.innerHTML = '';
    let r; try { r = await window.api.usersList(); } catch (e) { r = { ok: false, error: e.message }; }
    if (!r || !r.ok) {
      if (r && r.error === 'not-configured') { body.innerHTML = '<div class="empty" style="padding:22px;line-height:1.7">Login logging isn\'t set up yet.<br><span class="mini">Deploy the Google Apps Script logger and paste its URL into <b>LOGIN_LOG_URL</b> in <code>src/main.js</code>. Then every sign-in shows up here.</span></div>'; return; }
      body.innerHTML = `<div class="empty" style="padding:22px;color:var(--red)">Couldn't load: ${esc((r && r.error) || 'error')}</div>`; return;
    }
    usersData = usersAgg(r.events);
  }
  const now = Date.now();
  const total = usersData.length, logins = usersData.reduce((a, u) => a + u.count, 0);
  const active7 = usersData.filter(u => u.last && (now - u.last) < 7 * 86400000).length;
  const new7 = usersData.filter(u => u.first && (now - u.first) < 7 * 86400000).length;
  if (stats) stats.innerHTML =
    `<div class="tile"><div class="t-l">TOTAL USERS</div><div class="t-n">${total}</div><div class="t-s">unique sign-ins</div></div>` +
    `<div class="tile"><div class="t-l">TOTAL LOGINS</div><div class="t-n">${logins}</div><div class="t-s">all time</div></div>` +
    `<div class="tile"><div class="t-l">ACTIVE</div><div class="t-n">${active7}</div><div class="t-s">last 7 days</div></div>` +
    `<div class="tile"><div class="t-l">NEW</div><div class="t-n">${new7}</div><div class="t-s">joined this week</div></div>`;
  const q = usersQuery.toLowerCase();
  const rows = usersData.filter(u => !q || u.email.includes(q));
  if (!rows.length) body.innerHTML = '<div class="empty" style="padding:18px">No users yet.</div>';
  else body.innerHTML = `<div class="u-table"><div class="u-row u-head"><span>Email</span><span>Logins</span><span>First seen</span><span>Last seen</span><span>Device</span></div>` +
    rows.map(u => `<div class="u-row"><span class="u-em">${esc(u.email)}</span><span>${u.count}</span><span>${uDate(u.first)}</span><span title="${uDate(u.last)}">${uAgo(u.last)}</span><span class="u-dev">${esc(u.device || '—')}</span></div>`).join('') + `</div>`;
  const s = $('usersSearch'); if (s && !s._wired) { s._wired = true; s.addEventListener('input', e => { usersQuery = e.target.value; renderUsers(); }); }
  const rf = $('usersRefresh'); if (rf && !rf._wired) { rf._wired = true; rf.addEventListener('click', () => { usersData = null; renderUsers(); }); }
}

// ---- Green-card voice-wave: cycle through what you can do here ----
const CAP_ROTATE = [
  { ic: '📤', label: 'Upload videos', sub: 'Download & upload every video from here' },
  { ic: '📄', label: 'Content sheets', sub: 'Attach a Google Sheet — content imports straight in' },
  { ic: '🏷', label: 'Add niches', sub: 'Keep all your niches in one place' },
  { ic: '📺', label: 'Add channels', sub: '100+ channels inside each niche' },
  { ic: '⚙', label: 'Auto uploading', sub: 'Channels upload on their own schedule' },
  { ic: '🧭', label: 'Niche research', sub: 'Find niches & similar channels, live' },
  { ic: '📚', label: 'Build a library', sub: 'Save the winning channels you find' }
];
let capTimer = null;
function startCapRotator() {
  const wrap = $('fbWave'), icE = $('fwIc'), lbE = $('fwLabel'), sbE = $('fwSub');
  if (!wrap || !icE || !lbE || !sbE) return;
  if (capTimer) clearInterval(capTimer);
  let i = 0;
  const paint = () => { const c = CAP_ROTATE[i]; icE.textContent = c.ic; lbE.textContent = c.label; sbE.textContent = c.sub; };
  paint();
  capTimer = setInterval(() => {
    wrap.classList.add('swap');
    setTimeout(() => { i = (i + 1) % CAP_ROTATE.length; paint(); wrap.classList.remove('swap'); }, 350);
  }, 2600);
}
startCapRotator();

// ---- Research: live competitor channels via the user's own YouTube API key ----
function fmtNum(n) { n = Number(n) || 0; if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'; if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'; return String(n); }
function isNewChannel(created) { try { const d = new Date(created); return (Date.now() - d.getTime()) / 86400000 <= 400; } catch { return false; } }
let researchData = null; // cached last search so switching tabs doesn't re-spend quota

function openSettingsApi() {
  const sb = [...document.querySelectorAll('[data-view]')].find(b => b.dataset.view === 'settings'); if (sb) sb.click();
  const ab = [...document.querySelectorAll('#setNav button[data-set]')].find(b => b.dataset.set === 'api'); if (ab) ab.click();
}
async function updateQuota() {
  let txt = '';
  try {
    const q = await window.api.ytQuota();
    const left = Math.max(0, q.limit - q.used);
    const searches = Math.floor(left / 101);
    txt = `📊 API used today: ${q.used.toLocaleString()} / ${q.limit.toLocaleString()} units · about ${searches} searches left · resets at midnight (US Pacific)`;
  } catch { txt = ''; }
  ['researchQuota', 'ytQuotaLine', 'rsQuota'].forEach(id => { const el = $(id); if (el) el.textContent = txt; });
}

// Each card uses the student's own YouTube API key. ready:true = built & working; others open a "coming soon" panel until we wire them.
const RESEARCH_TOOLS = [
  { key: 'niche', icon: '🧭', name: 'Niche Finder', desc: 'Competitor & similar channels for each of your niches — live from YouTube.', ready: true },
  { key: 'library', icon: '📚', name: 'My Library', desc: 'Your saved channels and niches: growth, outliers, notes, RPM.' },
  { key: 'title', icon: '✍️', name: 'Title Optimizer', desc: 'Score any title against what is really ranking in your niche, and get honest better variants.', ready: true },
  { key: 'thumb', icon: '🖼️', name: 'Thumbnail Optimizer', desc: 'Score your thumbnail against your niche with AI vision, and get honest fixes.', ready: true }
];

function rsStat(label, n, sub) {
  return `<div class="rs-stat"><div class="rs-sl">${esc(label)}</div><div class="rs-sn">${n}</div><div class="rs-ss">${esc(sub)}</div></div>`;
}

// Research HUB landing — stat cards + tool grid
function renderResearch() {
  const home = $('research-home'), tool = $('research-tool');
  if (tool) tool.hidden = true;
  if (home) home.hidden = false;
  const st = $('research-stats');
  if (st) {
    const savedCh = (researchData && researchData.data) ? Object.values(researchData.data).reduce((a, l) => a + (l ? l.length : 0), 0) : 0;
    st.innerHTML =
      rsStat('Niches', niches.length, `your content niches`) +
      rsStat('Channels found', savedCh, 'from YouTube research') +
      rsStat('My channels', channels.length, 'connected to upload') +
      rsStat('Videos', content.length, 'across all sheets');
  }
  const grid = $('research-tools');
  if (grid) {
    grid.innerHTML = RESEARCH_TOOLS.map(t =>
      `<button class="rs-tool" data-tool="${t.key}"><span class="rs-ic">${t.icon}</span>` +
      `<div class="rs-tname">${esc(t.name)}${t.ready ? '' : ' <span class="rs-soon">soon</span>'}</div>` +
      `<p class="rs-desc">${esc(t.desc)}</p><span class="rs-open">Open →</span></button>`
    ).join('') + `<div class="rs-tool more">More tools coming soon</div>`;
    grid.querySelectorAll('.rs-tool[data-tool]').forEach(b => b.addEventListener('click', () => openResearchTool(b.dataset.tool)));
  }
  const back = $('rsBack'); if (back && !back._wired) { back._wired = 1; back.addEventListener('click', renderResearch); }
  updateQuota();
}

// Open one tool into the sub-view
function openResearchTool(key) {
  const home = $('research-home'), tool = $('research-tool'), body = $('research-tool-body'), ttl = $('research-tool-title');
  const t = RESEARCH_TOOLS.find(x => x.key === key) || {};
  if (home) home.hidden = true;
  if (tool) tool.hidden = false;
  if (ttl) ttl.textContent = `${t.icon || ''} ${t.name || 'Tool'}`;
  if (!body) return;
  if (key === 'niche') { renderNicheFinder(body); return; }
  if (key === 'library') { renderLibrary(body); return; }
  if (key === 'title') { renderTitleOptimizer(body); return; }
  if (key === 'thumb') { renderThumbOptimizer(body); return; }
  body.innerHTML = `<div class="card"><div class="empty" style="padding:28px;text-align:center">🚧 <b>${esc(t.name)}</b> — ye tool abhi set karna baaki hai.<br><span class="mini">Batao ye kya kaam kare, main bana deta hoon.</span></div></div>`;
}

// ===== Title Optimizer — honest title scoring + variants (YouTube research + user's own AI key) =====
let toState = { title: '', niche: '', running: false };
function toScoreColor(n) { return n >= 70 ? 'var(--green)' : n >= 45 ? 'var(--amber)' : 'var(--red)'; }
function renderTitleOptimizer(box) {
  const mine = niches.map(n => nicheName(n)).filter(Boolean);
  if (!toState.niche && mine.length) toState.niche = mine[0];
  box.innerHTML =
    `<p class="to-intro">Checks your title against what's <b>really ranking in your niche right now</b> (YouTube) and scores it honestly with your own AI — a strong title keeps its high score; weak ones get better variants.</p>` +
    // A) niche audit boxes
    `<div class="card to-audit"><h3>Titles that may need changing <span class="mini">— from your content sheets</span></h3>` +
      (mine.length ? `<div class="to-niches" id="toNiches">${mine.map(n => `<button class="to-nb" data-niche="${esc(n)}">🏷 ${esc(n)}</button>`).join('')}</div><div id="toAuditOut" class="to-auditout"><div class="empty" style="padding:10px">Pick a niche above to check which of your titles may not rank well.</div></div>` : `<div class="empty" style="padding:12px">Add niches (and content titles) first — then weak titles show up here per niche.</div>`) +
    `</div>` +
    // B) manual optimizer
    `<div class="card to-manual"><h3>Optimize a title</h3>` +
      `<div class="to-form">` +
        `<input id="toTitle" class="search" placeholder="Paste your video title" value="${esc(toState.title)}" />` +
        `<select id="toNiche" class="search">${(mine.length ? mine : ['(no niches yet)']).map(n => `<option${toState.niche === n ? ' selected' : ''}>${esc(n)}</option>`).join('')}<option value="__type">Other / type below…</option></select>` +
        `<button class="btn lime" id="toRun">Analyze</button>` +
      `</div>` +
      `<input id="toNicheType" class="search" placeholder="Type the niche name" hidden style="margin-top:8px;max-width:260px" />` +
      `<div id="toOut"></div>` +
    `</div>`;
  // audit wiring
  const nb = $('toNiches');
  if (nb) nb.querySelectorAll('.to-nb').forEach(b => b.addEventListener('click', () => { nb.querySelectorAll('.to-nb').forEach(x => x.classList.toggle('on', x === b)); runTitleAudit(b.dataset.niche); }));
  // manual wiring
  $('toTitle').addEventListener('input', e => toState.title = e.target.value);
  $('toNiche').addEventListener('change', e => { const v = e.target.value; const tw = $('toNicheType'); if (v === '__type') { tw.hidden = false; tw.focus(); toState.niche = tw.value.trim(); } else { tw.hidden = true; toState.niche = v; } });
  $('toNicheType').addEventListener('input', e => toState.niche = e.target.value.trim());
  $('toRun').addEventListener('click', runTitleOptimize);
}
async function runTitleOptimize() {
  const title = ($('toTitle') || {}).value || toState.title;
  const out = $('toOut'), btn = $('toRun');
  if (!title.trim()) { out.innerHTML = '<div class="empty" style="padding:10px;color:var(--red)">Type a title first.</div>'; return; }
  toState.title = title;
  if (btn) { btn.disabled = true; btn.textContent = 'Analyzing…'; }
  out.innerHTML = '<div class="empty" style="padding:18px">🔎 Researching your niche + scoring with AI… a few seconds.</div>';
  let res; try { res = await window.api.titleOptimize(title.trim(), toState.niche || ''); } catch (e) { res = { ok: false, error: e.message }; }
  if (btn) { btn.disabled = false; btn.textContent = 'Analyze'; }
  if (!res || !res.ok) { out.innerHTML = toErrHtml(res && res.error); const g = $('toApiBtn'); if (g) g.addEventListener('click', openSettingsApi); return; }
  out.innerHTML = toResultHtml(res.result, res.top);
  out.querySelectorAll('.to-var').forEach(v => v.addEventListener('click', () => { const t = v.dataset.t; $('toTitle').value = t; toState.title = t; navigator.clipboard && navigator.clipboard.writeText(t).catch(() => {}); v.classList.add('copied'); setTimeout(() => v.classList.remove('copied'), 1000); }));
}
function toErrHtml(err) {
  if (err === 'no-ai-key') return '<div class="empty" style="padding:14px">This tool needs your <b>AI key</b> (Gemini / OpenAI / etc). Add it in <b>Settings → API keys</b>. <button class="btn sm" id="toApiBtn" style="margin-left:8px">Go to Settings</button></div>';
  return `<div class="empty" style="padding:14px;color:var(--red)">${esc(err || 'Something went wrong. Try again.')}</div>`;
}
function toResultHtml(r, top) {
  if (!r) return '';
  const score = Math.max(0, Math.min(100, Number(r.score) || 0));
  const col = toScoreColor(score);
  let h = `<div class="to-result">` +
    `<div class="to-score"><div class="to-ring" style="--c:${col};--p:${score}"><span>${score}</span><small>/100</small></div>` +
    `<div class="to-sv"><b>${esc(r.verdict || (r.keep ? 'Strong title — keep it.' : 'Here\'s how it scores.'))}</b>` +
    (Array.isArray(r.reasons) && r.reasons.length ? `<ul class="to-reasons">${r.reasons.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '') + `</div></div>`;
  if (r.keep && !(r.variants || []).length) h += `<div class="to-keep">✓ This title is already good enough to publish — no change needed.</div>`;
  if ((r.variants || []).length) {
    h += `<div class="to-varh">Better variants <span class="mini">— click to copy into the box</span></div><div class="to-vars">`;
    r.variants.forEach(v => { h += `<div class="to-var" data-t="${esc(v.title || '')}"><div class="to-vt">${esc(v.title || '')}</div>${v.why ? `<div class="to-vw">${esc(v.why)}</div>` : ''}<span class="to-copy">Copy</span></div>`; });
    h += `</div>`;
  }
  if (top && top.length) h += `<details class="to-top"><summary>What's ranking in this niche (${top.length})</summary><div>${top.map(t => `<div class="to-tr"><span>${esc(t.title)}</span><b>${fmtNum(t.views)}</b></div>`).join('')}</div></details>`;
  h += `</div>`;
  return h;
}
async function runTitleAudit(niche) {
  const out = $('toAuditOut'); if (!out) return;
  out.innerHTML = `<div class="empty" style="padding:12px">🔎 Checking your <b>${esc(niche)}</b> titles with AI…</div>`;
  let res; try { res = await window.api.titleAudit(niche); } catch (e) { res = { ok: false, error: e.message }; }
  if (!res || !res.ok) { out.innerHTML = toErrHtml(res && res.error); const g = $('toApiBtn'); if (g) g.addEventListener('click', openSettingsApi); return; }
  if (!res.total) { out.innerHTML = `<div class="empty" style="padding:12px">No saved titles in <b>${esc(niche)}</b> yet. Add content for this niche first.</div>`; return; }
  if (!res.weak.length) { out.innerHTML = `<div class="to-allgood">✓ All ${res.total} titles in <b>${esc(niche)}</b> look fine — nothing to change.</div>`; return; }
  out.innerHTML = `<div class="to-weakhint">${res.weak.length} of ${res.total} titles may need changing — click one to optimize it:</div>` +
    res.weak.map(w => `<div class="to-weak" data-t="${esc(w.title || '')}"><div class="to-wmain"><div class="to-wt">${esc(w.title || '')}</div><div class="to-wi">${esc(w.issue || '')}</div></div><div class="to-wscore" style="color:${toScoreColor(Number(w.score) || 0)}">${Number(w.score) || 0}</div></div>`).join('');
  out.querySelectorAll('.to-weak').forEach(el => el.addEventListener('click', () => {
    const t = el.dataset.t; toState.title = t; toState.niche = niche;
    if ($('toTitle')) $('toTitle').value = t;
    const sel = $('toNiche'); if (sel) { const opt = [...sel.options].find(o => o.value === niche || o.text === niche); if (opt) sel.value = opt.value; }
    document.querySelector('.to-manual').scrollIntoView({ behavior: 'smooth', block: 'start' });
    runTitleOptimize();
  }));
}

// ===== Thumbnail Optimizer — AI-vision scoring vs your niche (user's own AI + YouTube keys) =====
let thState = { variants: [{ id: 'A', img: null }], niche: '', title: '' };
function renderThumbOptimizer(box) {
  const mine = niches.map(n => nicheName(n)).filter(Boolean);
  if (!thState.niche && mine.length) thState.niche = mine[0];
  box.innerHTML =
    `<p class="to-intro">Upload up to 3 thumbnail variants — each is scored <b>honestly with AI vision</b> against what really gets clicks in your niche (live from YouTube), so you can pick the best one. <span class="mini">Needs a vision AI model (e.g. gemini-2.0-flash, gpt-4o-mini).</span></p>` +
    `<div class="card th-card">` +
      `<div class="th-variants" id="thVariants"></div>` +
      `<div class="th-form2">` +
        `<label class="ctr-f"><span>Niche</span><select id="thNiche" class="search">${(mine.length ? mine : ['(no niches yet)']).map(n => `<option${thState.niche === n ? ' selected' : ''}>${esc(n)}</option>`).join('')}<option value="__type">Other / type below…</option></select></label>` +
        `<input id="thNicheType" class="search" placeholder="Type the niche name" hidden />` +
        `<label class="ctr-f"><span>Video title <span class="mini">(optional)</span></span><input id="thTitle" class="search" placeholder="Helps the AI judge fit" value="${esc(thState.title)}"></label>` +
        `<button class="btn lime" id="thRun">Analyze thumbnails</button>` +
        `<button class="btn sm" id="thClear">✕ Clear</button>` +
      `</div>` +
      `<div id="thOut"></div>` +
    `</div>`;
  renderThumbVariants();
  $('thNiche').addEventListener('change', e => { const v = e.target.value, tw = $('thNicheType'); if (v === '__type') { tw.hidden = false; tw.focus(); thState.niche = tw.value.trim(); } else { tw.hidden = true; thState.niche = v; } });
  $('thNicheType').addEventListener('input', e => thState.niche = e.target.value.trim());
  $('thTitle').addEventListener('input', e => thState.title = e.target.value);
  $('thRun').addEventListener('click', runThumbOptimize);
  $('thClear').addEventListener('click', () => { thState.variants = [{ id: 'A', img: null }]; renderThumbVariants(); const o = $('thOut'); if (o) o.innerHTML = ''; });
}
function renderThumbVariants() {
  const wrap = $('thVariants'); if (!wrap) return;
  const S = thState;
  wrap.innerHTML = S.variants.map(v => `
    <div class="th-var">
      <div class="th-vh">Variant ${v.id}${S.variants.length > 1 ? `<button class="cv-del" data-delvar="${v.id}" title="Remove this variant">✕</button>` : ''}</div>
      <label class="th-drop${v.img ? ' has' : ''}"><span class="th-prev">${v.img ? `<img src="${v.img}" alt="">` : `<span class="th-plus">＋ Upload thumbnail<br><span class="mini">JPG/PNG · 16:9</span></span>`}</span><input type="file" accept="image/*" data-up="${v.id}" hidden></label>
      ${v.img ? `<button class="btn sm th-remove" data-rm="${v.id}">✕ Remove / change</button>` : `<div class="th-vhint">Click the box to upload</div>`}
    </div>`).join('') +
    (S.variants.length < 3 ? `<button class="th-addvar" id="thAddVar">＋ Add variant</button>` : '');
  const clearOut = () => { const o = $('thOut'); if (o) o.innerHTML = ''; };
  wrap.querySelectorAll('input[data-up]').forEach(inp => inp.addEventListener('change', e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => { const v = S.variants.find(x => x.id === e.target.dataset.up); if (v) { v.img = r.result; clearOut(); renderThumbVariants(); } }; r.readAsDataURL(f);
  }));
  wrap.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { const v = S.variants.find(x => x.id === b.dataset.rm); if (v) { v.img = null; clearOut(); renderThumbVariants(); } }));
  wrap.querySelectorAll('[data-delvar]').forEach(b => b.addEventListener('click', () => { S.variants = S.variants.filter(x => x.id !== b.dataset.delvar); renderThumbVariants(); }));
  const add = $('thAddVar'); if (add) add.addEventListener('click', () => { const used = S.variants.map(v => v.id); const nid = ['A', 'B', 'C'].find(x => !used.includes(x)); if (nid) { S.variants.push({ id: nid, img: null }); renderThumbVariants(); } });
}
async function runThumbOptimize() {
  const out = $('thOut'), btn = $('thRun');
  const imgs = thState.variants.filter(v => v.img);
  if (!imgs.length) { out.innerHTML = '<div class="empty" style="padding:12px;color:var(--red)">Upload at least one thumbnail first.</div>'; return; }
  if (btn) { btn.disabled = true; btn.textContent = 'Analyzing…'; }
  out.innerHTML = `<div class="empty" style="padding:18px">🔎 Reading your niche + scoring ${imgs.length > 1 ? 'the variants' : 'the image'} with AI… a few seconds.</div>`;
  const results = []; let top = [];
  for (const v of imgs) {
    let res; try { res = await window.api.thumbOptimize(v.img, thState.niche || '', thState.title || ''); } catch (e) { res = { ok: false, error: e.message }; }
    results.push({ id: v.id, img: v.img, res });
    if (res && res.ok && res.top && res.top.length && !top.length) top = res.top;
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Analyze thumbnails'; }
  if (results.every(r => !r.res.ok)) { const fe = results[0].res.error; out.innerHTML = toErrHtml(fe); const g = $('toApiBtn'); if (g) g.addEventListener('click', openSettingsApi); return; }
  // best variant highlight
  let best = null; results.forEach(r => { if (r.res.ok) { const s = Number(r.res.result.score) || 0; if (!best || s > best.s) best = { id: r.id, s }; } });
  out.innerHTML = `<div class="th-results">${results.map(r => thResultCard(r, best)).join('')}</div>` +
    (top.length ? `<div class="to-varh">What's winning in this niche <span class="mini">— aim to stand out from these</span></div><div class="th-strip">${top.map(t => `<div class="th-ref"><img src="${esc(t.thumb)}" loading="lazy" alt=""><div class="th-rv">${fmtNum(t.views)} views</div></div>`).join('')}</div>` : '');
}
function thResultCard(r, best) {
  const multi = thState.variants.filter(v => v.img).length > 1;
  const head = `<div class="th-rhead">Variant ${r.id}${best && best.id === r.id && multi ? ' <span class="th-best">★ Best</span>' : ''}</div>`;
  if (!r.res.ok) return `<div class="th-rcard">${head}<div class="empty" style="padding:12px;color:var(--red)">${esc(r.res.error || 'failed')}</div></div>`;
  const res = r.res.result;
  const score = Math.max(0, Math.min(100, Number(res.score) || 0)), col = toScoreColor(score);
  let h = `<div class="th-rcard">${head}<img class="th-rimg" src="${r.img}" alt="">` +
    `<div class="to-score"><div class="to-ring" style="--c:${col};--p:${score}"><span>${score}</span><small>/100</small></div>` +
    `<div class="to-sv"><b>${esc(res.verdict || (res.keep ? 'Strong — keep it.' : ''))}</b>` +
    (Array.isArray(res.reasons) && res.reasons.length ? `<ul class="to-reasons">${res.reasons.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '') + `</div></div>`;
  if (res.keep && !(res.fixes || []).length) h += `<div class="to-keep">✓ Already strong — no change needed.</div>`;
  if ((res.fixes || []).length) h += `<div class="to-varh">How to improve it</div><ul class="th-fixes">${res.fixes.map(f => `<li>${esc(f)}</li>`).join('')}</ul>`;
  h += `</div>`;
  return h;
}

// ===== Niche Finder — live NexLev-style outlier scanner (user's own YouTube key) =====
let nfScan = null;
const nfFilters = { maxSubs: 50000, minViews: 5000, region: 'US', lang: 'en', duration: 'long', days: 30, query: '', categoryName: 'All categories', all: true };
// Built-in faceless-YouTube niche categories (name → search query)
const NF_CATEGORIES = [
  'True crime', 'Drama', 'Celeb news', 'History', 'Tech reviews', 'Cooking', 'Gaming', 'Finance', 'Motivation', 'AI tools',
  'Horror stories', 'Science facts', 'Health', 'Seniors', 'Ancient civilizations', 'Wildlife', 'Space', 'Psychology', 'Survival', 'Luxury lifestyle',
  'Cars', 'Travel', 'Fitness', 'Sleep & meditation', 'Mystery', 'Conspiracy', 'Military', 'Geography', 'Mythology', 'Philosophy',
  'Business', 'Crypto', 'Real estate', 'Parenting', 'Relationships', 'Self improvement', 'Facts & trivia', 'Scary stories', 'Reddit stories', 'Nature relaxation'
].map(n => ({ name: n, q: n }));
const NF_SUBS = [[5000, 'Under 5K subs'], [10000, 'Under 10K subs'], [50000, 'Under 50K subs'], [100000, 'Under 100K subs']];
const NF_VIEWS = [[1000, 'Min 1K views'], [5000, 'Min 5K views'], [10000, 'Min 10K views'], [50000, 'Min 50K views'], [100000, 'Min 100K views']];
const NF_REGIONS = [['US', 'en', 'United States · English'], ['GB', 'en', 'United Kingdom · English'], ['IN', 'en', 'India · English'], ['IN', 'hi', 'India · Hindi'], ['PK', 'ur', 'Pakistan · Urdu'], ['', 'en', 'Worldwide · English'], ['', '', 'Worldwide · Any']];
const NF_DUR = [['long', 'Long-form videos'], ['short', 'Shorts'], ['any', 'Any length']];
const NF_DAYS = [[1, 'Last 24 hours'], [3, '3 days'], [7, '7 days'], [30, '30 days'], [90, '90 days']];
function nfCustomCats() { try { return JSON.parse(localStorage.getItem('nfCustomCats') || '[]'); } catch { return []; } }
function nfSaveCustom(list) { try { localStorage.setItem('nfCustomCats', JSON.stringify(list)); } catch {} }

function nfAgo(iso) {
  try { const h = (Date.now() - new Date(iso).getTime()) / 3600000; if (h < 1) return Math.max(1, Math.round(h * 60)) + ' min ago'; if (h < 48) return Math.round(h) + ' h ago'; return Math.round(h / 24) + ' d ago'; } catch { return '—'; }
}

function renderNicheFinder(box) {
  // category list = your own niches first, then the built-in library
  const mine = niches.map(n => ({ name: nicheName(n), q: (n && typeof n === 'object' && n.researchQuery) || nicheName(n), mine: true })).filter(n => n.name);
  const cats = [...mine, ...NF_CATEGORIES];
  const opt = (sel, val, label) => `<option value="${esc(String(val))}"${sel ? ' selected' : ''}>${esc(label)}</option>`;
  const custom = nfCustomCats();
  const catOpts = `<option value="__all__"${nfFilters.all ? ' selected' : ''}>All categories (${cats.length + custom.length})</option>` +
    (custom.length ? `<optgroup label="My niches">${custom.map(c => opt(!nfFilters.all && nfFilters.categoryName === c, c + '||' + c, c)).join('')}</optgroup>` : '') +
    (mine.length ? `<optgroup label="Your content niches">${mine.map(c => opt(!nfFilters.all && nfFilters.categoryName === c.name, c.q + '||' + c.name, c.name)).join('')}</optgroup>` : '') +
    `<optgroup label="Popular niches">${NF_CATEGORIES.map(c => opt(!nfFilters.all && nfFilters.categoryName === c.name, c.q + '||' + c.name, c.name)).join('')}</optgroup>` +
    `<option value="__custom__">＋ Add my own niche…</option>`;
  const regVal = nfFilters.region + '|' + nfFilters.lang;
  box.innerHTML =
    `<div class="nf-daily" id="nfDaily"></div>` +
    `<div class="nf-search"><input id="nfChannel" class="search" placeholder="Search by channel — paste a link or @handle" style="flex:1" /><button class="btn lime" id="nfFindSimilar">🔍 Find similar</button></div>` +
    `<div class="nf-scanline" id="nfScanLine"></div>` +
    `<div class="nf-filters">` +
      `<select id="nfSubs">${NF_SUBS.map(([v, l]) => opt(nfFilters.maxSubs == v, v, l)).join('')}</select>` +
      `<select id="nfViews">${NF_VIEWS.map(([v, l]) => opt(nfFilters.minViews == v, v, l)).join('')}</select>` +
      `<select id="nfRegion">${NF_REGIONS.map(([r, lg, l]) => opt(regVal === r + '|' + lg, r + '|' + lg, l)).join('')}</select>` +
      `<select id="nfDur">${NF_DUR.map(([v, l]) => opt(nfFilters.duration === v, v, l)).join('')}</select>` +
      `<select id="nfCat">${catOpts}</select>` +
      `<span class="nf-custom" id="nfCustomWrap" hidden><input id="nfCustomInput" class="search" placeholder="Type a niche name…" style="width:170px" /><button class="btn sm lime" id="nfCustomAdd">Add</button></span>` +
      `<div class="nf-tabs" id="nfDays">${NF_DAYS.map(([d, l]) => `<button data-d="${d}"${nfFilters.days == d ? ' class="on"' : ''}>${l}</button>`).join('')}</div>` +
      `<button class="btn lime" id="nfScanNow">⟳ Scan now</button>` +
    `</div>` +
    `<div id="rsQuota" class="mini" style="color:var(--muted);margin:0 0 16px"></div>` +
    `<div id="nfResults"></div>`;

  box.querySelector('#nfSubs').addEventListener('change', e => nfFilters.maxSubs = Number(e.target.value));
  box.querySelector('#nfViews').addEventListener('change', e => nfFilters.minViews = Number(e.target.value));
  box.querySelector('#nfRegion').addEventListener('change', e => { const [r, lg] = e.target.value.split('|'); nfFilters.region = r; nfFilters.lang = lg; });
  box.querySelector('#nfDur').addEventListener('change', e => nfFilters.duration = e.target.value);
  box.querySelector('#nfCat').addEventListener('change', e => {
    const val = e.target.value, wrap = $('nfCustomWrap');
    if (val === '__custom__') { if (wrap) { wrap.hidden = false; const i = $('nfCustomInput'); if (i) i.focus(); } return; }
    if (wrap) wrap.hidden = true;
    if (val === '__all__') { nfFilters.all = true; nfFilters.query = ''; nfFilters.categoryName = 'All categories'; }
    else { nfFilters.all = false; const [q, name] = val.split('||'); nfFilters.query = q; nfFilters.categoryName = name || q; }
  });
  const nfAddCustom = () => {
    const i = $('nfCustomInput'); const v = (i && i.value || '').trim(); if (!v) return;
    const list = nfCustomCats(); if (!list.some(x => x.toLowerCase() === v.toLowerCase())) list.unshift(v); nfSaveCustom(list.slice(0, 40));
    nfFilters.all = false; nfFilters.categoryName = v; nfFilters.query = v;
    renderNicheFinder($('research-tool-body'));
  };
  const cAdd = $('nfCustomAdd'), cInp = $('nfCustomInput');
  if (cAdd) cAdd.addEventListener('click', nfAddCustom);
  if (cInp) cInp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); nfAddCustom(); } });
  box.querySelectorAll('#nfDays button').forEach(b => b.addEventListener('click', () => { nfFilters.days = Number(b.dataset.d); box.querySelectorAll('#nfDays button').forEach(x => x.classList.toggle('on', x === b)); }));
  box.querySelector('#nfScanNow').addEventListener('click', () => doNicheScan(false));
  box.querySelector('#nfFindSimilar').addEventListener('click', () => doNicheScan(true));

  if (nfScan) { renderNfScanLine(); renderNfResults(); }
  else { window.api.nicheLastScan().then(s => { if (s && !nfScan) { nfScan = s; renderNfScanLine(); renderNfResults(); } }); }
  renderNfDaily(false);
  updateQuota();
}

// ---- Daily picks: fresh/viral small-channel breakouts in the user's own niches (auto, once per day) ----
function nfSaveDailyBtn(item, nicheName) {
  const b = document.createElement('button'); b.className = 'btn sm lime'; b.textContent = '+ Save';
  b.addEventListener('click', async () => { b.disabled = true; await window.api.nicheSave({ ...item, kind: 'channel', category: nicheName, format: 'any' }); b.textContent = '✓ Saved'; });
  return b;
}
async function renderNfDaily(force) {
  const box = $('nfDaily'); if (!box) return;
  box.innerHTML = `<div class="nfd-head"><h3>🔥 Today's picks <span class="mini">— fresh breakouts in your niches</span></h3><button class="btn sm" id="nfdRefresh">${force ? 'Refreshing…' : '⟳ Refresh'}</button></div><div class="nfd-body"><div class="empty" style="padding:16px">Loading today's breakouts…</div></div>`;
  const rf = $('nfdRefresh'); if (rf) rf.addEventListener('click', () => { if (!rf.disabled) renderNfDaily(true); });
  if (rf) rf.disabled = true;
  let res; try { res = await window.api.nicheDaily(!!force); } catch (e) { res = { ok: false, error: e.message }; }
  const bodyEl = box.querySelector('.nfd-body'), h3 = box.querySelector('.nfd-head h3');
  if (rf) { rf.disabled = false; rf.textContent = '⟳ Refresh'; }
  if (!res || !res.ok) {
    if (res && res.error === 'no-key') { bodyEl.innerHTML = '<div class="empty" style="padding:16px">Add your <b>YouTube API key</b> in <b>Settings → API keys</b> to get daily picks.</div>'; return; }
    bodyEl.innerHTML = `<div class="empty" style="padding:16px;color:var(--red)">${esc((res && res.error) || 'Could not load picks')}</div>`; return;
  }
  if (res.noNiches || !(res.groups || []).length) { bodyEl.innerHTML = '<div class="empty" style="padding:16px">Add some niches in the <b>Niches</b> tab — then your daily breakouts show up here automatically, 4–5 per niche.</div>'; return; }
  if (h3) h3.innerHTML = `🔥 Today's picks <span class="mini">— fresh breakouts in your niches · ${esc(res.date || '')}${res.cached ? ' · auto' : ''}</span>`;
  bodyEl.innerHTML = '';
  (res.groups || []).forEach(g => {
    const gel = document.createElement('div'); gel.className = 'nfd-grp';
    gel.innerHTML = `<div class="nfd-gh">🏷 ${esc(g.niche)} <span class="mini">· ${(g.items || []).length}</span></div>`;
    if (!(g.items || []).length) { const e = document.createElement('div'); e.className = 'empty'; e.style.padding = '8px 2px'; e.textContent = 'No fresh breakouts in the last 3 days.'; gel.appendChild(e); }
    (g.items || []).forEach(c => {
      const row = document.createElement('div'); row.className = 'nf-row';
      row.innerHTML = `${c.thumb ? `<img class="nf-thumb" src="${esc(c.thumb)}" />` : '<div class="nf-thumb"></div>'}` +
        `<div class="nf-info"><div class="nf-name">${esc(c.title)}</div>` +
        `<div class="nf-meta">${fmtNum(c.subs)} subscribers · ${fmtNum(c.vph)} VPH · uploaded ${c.hoursAgo}h ago</div>` +
        `${c.badge ? `<div class="nf-badges"><span class="nf-badge">${esc(c.badge)}</span></div>` : ''}</div>` +
        `<div class="nf-views"><div class="nf-vn">${fmtNum(c.views)} views</div><div class="nf-vu">${c.outlier}× usual</div></div>`;
      row.appendChild(nfSaveDailyBtn(c, g.niche)); row.appendChild(nfOpenBtn(c.url)); gel.appendChild(row);
    });
    bodyEl.appendChild(gel);
  });
}

async function doNicheScan(similar) {
  const results = $('nfResults'), btn = similar ? $('nfFindSimilar') : $('nfScanNow');
  const label = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = 'Scanning…'; }
  if (results) results.innerHTML = '<div class="card"><div class="empty" style="padding:26px">🔎 Scanning YouTube live… this takes a few seconds.</div></div>';
  try {
    let res;
    if (similar) { const ch = ($('nfChannel') || {}).value || ''; res = await window.api.nicheFindSimilar({ ...nfFilters, channel: ch.trim() }); }
    else res = await window.api.nicheScan({ ...nfFilters });
    if (res && res.error === 'no-key') {
      if (results) results.innerHTML = '<div class="card"><div class="empty">Add your <b>YouTube Data API key</b> in <b>Settings → API keys</b> first.</div><div class="rowflex" style="margin-top:10px"><button class="btn" id="goApiKeyBtn">Go to Settings</button></div></div>';
      const g = $('goApiKeyBtn'); if (g) g.addEventListener('click', openSettingsApi); return;
    }
    if (res && res.error) { if (results) results.innerHTML = `<div class="card"><div class="empty" style="color:var(--red)">⚠ ${esc(res.error)}</div></div>`; return; }
    nfScan = res; renderNfScanLine(); renderNfResults();
  } catch (e) {
    if (results) results.innerHTML = `<div class="card"><div class="empty" style="color:var(--red)">Scan failed: ${esc(e.message || 'error')}</div></div>`;
  } finally { if (btn) { btn.disabled = false; btn.textContent = label; } updateQuota(); }
}

function renderNfScanLine() {
  const el = $('nfScanLine'); if (!el) return;
  const s = nfScan && nfScan.scan;
  if (!s) { el.innerHTML = ''; return; }
  el.innerHTML = `<span>This scan <b>${s.videos} videos · ${s.channels} channels</b> &nbsp;·&nbsp; Category <b>${esc(s.category || '—')}</b> &nbsp;·&nbsp; Last scan <b>${nfAgo(s.at)}</b></span><button class="nf-clear" id="nfClear">✕ Clear results</button>`;
  const cb = $('nfClear'); if (cb) cb.addEventListener('click', clearNicheScan);
}
async function clearNicheScan() {
  nfScan = null;
  try { await window.api.nicheClearScan(); } catch {}
  renderNfScanLine(); renderNfResults();
}

function nfSaveBtn(item, kind) {
  const b = document.createElement('button'); b.className = 'btn sm lime'; b.textContent = '+ Save';
  b.addEventListener('click', async () => { b.disabled = true; await window.api.nicheSave({ ...item, kind, category: (nfScan && nfScan.scan && nfScan.scan.category) || nfFilters.categoryName, format: nfFilters.duration }); b.textContent = '✓ Saved'; });
  return b;
}
function nfOpenBtn(url) { const b = document.createElement('button'); b.className = 'nf-icon'; b.textContent = '🔍'; b.title = 'Open on YouTube'; b.addEventListener('click', () => window.api.openLink(url)); return b; }

function renderNfResults() {
  const box = $('nfResults'); if (!box) return;
  if (!nfScan) { box.innerHTML = '<div class="card"><div class="empty" style="padding:26px">Pick your filters above and press <b>⟳ Scan now</b> — small channels blowing up in your niche will show here.</div></div>'; return; }
  const sb = nfScan.smallBig || [], viral = nfScan.viral || [], nc = nfScan.nicheComp;
  if (!sb.length && !viral.length) { box.innerHTML = '<div class="card"><div class="empty" style="padding:26px">No outliers matched these filters. Try more days, higher subs cap, or lower min views.</div></div>'; return; }
  box.innerHTML = '';
  const grid = document.createElement('div'); grid.className = 'nf-grid'; box.appendChild(grid);

  // --- Small channels with big views ---
  const c1 = document.createElement('div'); c1.className = 'card';
  c1.innerHTML = `<h3>Small channels with big views <span class="mini">· ${sb.length}</span></h3>`;
  if (!sb.length) c1.innerHTML += '<div class="empty" style="padding:12px">None this scan.</div>';
  sb.forEach(c => {
    const row = document.createElement('div'); row.className = 'nf-row';
    row.innerHTML = `${c.thumb ? `<img class="nf-thumb" src="${esc(c.thumb)}" />` : '<div class="nf-thumb"></div>'}` +
      `<div class="nf-info"><div class="nf-name">${esc(c.title)}</div>` +
      `<div class="nf-meta">${fmtNum(c.subs)} subscribers · ${fmtNum(c.vph)} VPH · uploaded ${c.hoursAgo}h ago</div>` +
      `${c.badge ? `<div class="nf-badges"><span class="nf-badge">${esc(c.badge)}</span></div>` : ''}</div>` +
      `<div class="nf-views"><div class="nf-vn">${fmtNum(c.views)} views</div><div class="nf-vu">${c.outlier}× usual</div></div>`;
    row.appendChild(nfSaveBtn(c, 'channel')); row.appendChild(nfOpenBtn(c.url)); c1.appendChild(row);
  });
  grid.appendChild(c1);

  // --- Niches with high future competition ---
  const c2 = document.createElement('div'); c2.className = 'card';
  c2.innerHTML = `<h3>Niches with high future competition</h3>`;
  if (nc) {
    const head = document.createElement('div'); head.className = 'nf-ncard';
    head.innerHTML = `<div class="nf-nhead"><span class="nf-nname">${esc(nc.name)}</span><span class="nf-score ${nc.level.toLowerCase()}">${nc.score} · ${nc.level}</span></div>` +
      `<div class="nf-bar"><i style="width:${nc.score}%"></i></div>` +
      `<div class="nf-nmeta">${nc.youngBreakouts} young breakout · ${nc.breakoutChannels} breakout channels · ${nc.sampled} videos sampled</div>` +
      `<div class="nf-nmeta">Trend: ${esc(nc.trend)}</div>`;
    c2.appendChild(head);
    (nc.channels || []).forEach(c => {
      const row = document.createElement('div'); row.className = 'nf-row';
      row.innerHTML = `${c.thumb ? `<img class="nf-thumb" src="${esc(c.thumb)}" />` : '<div class="nf-thumb"></div>'}` +
        `<div class="nf-info"><div class="nf-name">${esc(c.title)}</div>` +
        `<div class="nf-meta">${fmtNum(c.subs)} subs · ${fmtNum(c.vph)} VPH</div>` +
        `${c.badge ? `<div class="nf-badges"><span class="nf-badge">${esc(c.badge)}</span></div>` : ''}` +
        `<div class="nf-stats">Usual views <b>${fmtNum(c.usual)}</b> · Videos <b>${c.videos}</b> · Days since start <b>${c.daysSinceStart || '—'}</b> · Outlier <b>${c.outlier}×</b></div></div>`;
      row.appendChild(nfSaveBtn(c, 'channel')); row.appendChild(nfOpenBtn(c.url)); c2.appendChild(row);
    });
    if (!(nc.channels || []).length) c2.innerHTML += '<div class="empty" style="padding:12px">No breakout channels yet in this niche.</div>';
  } else c2.innerHTML += '<div class="empty" style="padding:12px">Not enough data this scan.</div>';
  grid.appendChild(c2);

  // --- Viral videos on small channels (full width) ---
  const c3 = document.createElement('div'); c3.className = 'card nf-wide';
  c3.innerHTML = `<h3>Viral videos on small channels <span class="mini">· ${viral.length}</span></h3>`;
  const vg = document.createElement('div'); vg.className = 'nf-vgrid';
  viral.forEach(v => {
    const cell = document.createElement('div'); cell.className = 'nf-vcell';
    cell.innerHTML = `<div class="nf-vthumb">${v.thumb ? `<img src="${esc(v.thumb)}" />` : ''}<span class="nf-vbadge">${v.outlier}×</span></div>` +
      `<div class="nf-vtitle">${esc(v.title)}</div><div class="nf-vmeta">${esc(v.channelTitle)} · ${fmtNum(v.views)} views</div>`;
    cell.addEventListener('click', () => window.api.openLink(v.videoUrl));
    vg.appendChild(cell);
  });
  if (!viral.length) vg.innerHTML = '<div class="empty" style="padding:12px">No viral videos this scan.</div>';
  c3.appendChild(vg); grid.appendChild(c3);
}

// ===== My Library — saved channels (cards + table) =====
let libItems = null;
const libState = { view: 'cards', sort: 'added', format: 'all', age: 'any', q: '' };
const LIB_SORT = [['added', 'Recently added'], ['subs', 'Subscribers'], ['videos', 'Videos'], ['outlier', 'Best outlier'], ['score', 'Score']];
const LIB_FMT = [['all', 'All'], ['long', 'Long video'], ['short', 'Short video']];
const LIB_AGE = [['any', 'Any'], ['1m', 'Under 1 month'], ['3m', 'Under 3 months'], ['6m', 'Under 6 months']];

function libDayGroup(ts) {
  if (!ts) return 'Earlier';
  const d = new Date(ts), now = new Date(), y = new Date(now); y.setDate(now.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(d, now)) return 'Today';
  if (same(d, y)) return 'Yesterday';
  const days = (now - d) / 86400000;
  if (days <= 7) return 'This week';
  if (days <= 31) return 'This month';
  return 'Earlier';
}
function libAgo(iso) { try { const m = (Date.now() - new Date(iso).getTime()) / 60000; if (m < 1) return 'just now'; if (m < 60) return Math.round(m) + 'm ago'; const h = m / 60; if (h < 24) return Math.round(h) + 'h ago'; const dd = h / 24; if (dd < 7) return Math.round(dd) + 'd ago'; if (dd < 30) return Math.round(dd / 7) + 'w ago'; return Math.round(dd / 30) + 'mo ago'; } catch { return ''; } }

function renderLibrary(box) {
  const opt = (sel, v, l) => `<option value="${esc(v)}"${sel ? ' selected' : ''}>${esc(l)}</option>`;
  box.innerHTML =
    `<div class="lib-top"><div class="lib-count">All channels <span class="mini" id="libCount"></span></div>` +
    `<input id="libSearch" class="search" placeholder="Search your library, or paste a channel link / @handle to add..." value="${esc(libState.q)}" style="max-width:420px;margin-left:auto" />` +
    `<button class="btn sm lime" id="libAddBtn">＋ Add</button></div>` +
    `<div id="libAddStatus" class="mini" style="color:var(--muted);margin:-6px 0 14px;text-align:right"></div>` +
    `<div class="lib-controls">` +
      `<div class="nf-tabs" id="libView"><button data-v="cards"${libState.view === 'cards' ? ' class="on"' : ''}>Cards</button><button data-v="table"${libState.view === 'table' ? ' class="on"' : ''}>Table</button></div>` +
      `<label class="lib-f">Sort <select id="libSort">${LIB_SORT.map(([v, l]) => opt(libState.sort === v, v, l)).join('')}</select></label>` +
      `<label class="lib-f">Format <select id="libFmt">${LIB_FMT.map(([v, l]) => opt(libState.format === v, v, l)).join('')}</select></label>` +
      `<label class="lib-f">Age <select id="libAge">${LIB_AGE.map(([v, l]) => opt(libState.age === v, v, l)).join('')}</select></label>` +
    `</div><div id="libBody"></div>`;
  box.querySelector('#libSearch').addEventListener('input', e => { libState.q = e.target.value; renderLibBody(); });
  box.querySelector('#libSearch').addEventListener('keydown', e => { if (e.key === 'Enter') { const v = (e.target.value || '').trim(); if (/youtube\.com|youtu\.be|^@/.test(v)) libAddFromInput(); } });
  box.querySelector('#libAddBtn').addEventListener('click', libAddFromInput);
  box.querySelectorAll('#libView button').forEach(b => b.addEventListener('click', () => { libState.view = b.dataset.v; box.querySelectorAll('#libView button').forEach(x => x.classList.toggle('on', x === b)); renderLibBody(); }));
  box.querySelector('#libSort').addEventListener('change', e => { libState.sort = e.target.value; renderLibBody(); });
  box.querySelector('#libFmt').addEventListener('change', e => { libState.format = e.target.value; renderLibBody(); });
  box.querySelector('#libAge').addEventListener('change', e => { libState.age = e.target.value; renderLibBody(); });
  if (!window._libMenuClose) { window._libMenuClose = 1; document.addEventListener('click', e => { if (!e.target.closest('.lib-menu') && !e.target.closest('.lib-ic')) document.querySelectorAll('.lib-menu').forEach(x => { x.hidden = true; }); }); }
  renderLibBody();
  window.api.libAll().then(x => { libItems = x || []; renderLibBody(); });
}

async function libAddFromInput() {
  const inp = $('libSearch'), st = $('libAddStatus'), btn = $('libAddBtn');
  const v = (inp && inp.value || '').trim();
  if (!v) { if (st) st.textContent = 'Paste a channel link, @handle or name, then Add.'; return; }
  if (btn) { btn.disabled = true; btn.textContent = 'Adding…'; }
  if (st) st.textContent = 'Looking up channel…';
  let r; try { r = await window.api.libAdd(v); } catch (e) { r = { error: e.message }; }
  if (btn) { btn.disabled = false; btn.textContent = '＋ Add'; }
  if (r && r.error === 'no-key') { if (st) st.textContent = 'Add your YouTube API key in Settings → API keys first.'; return; }
  if (r && r.error) { if (st) st.textContent = '⚠ ' + r.error; return; }
  if (r && r.ok && r.item) {
    if (!libItems) libItems = [];
    const ex = libItems.findIndex(x => x.url === r.item.url);
    if (ex >= 0) libItems[ex] = r.item; else libItems.unshift(r.item);
    if (inp) inp.value = ''; libState.q = '';
    if (st) st.textContent = r.dup ? '✓ Already in library — refreshed.' : '✓ Added to library.';
    renderLibBody(); updateQuota();
  }
}

function libFiltered() {
  let arr = (libItems || []).slice();
  const q = libState.q.trim().toLowerCase();
  if (q) arr = arr.filter(c => [c.title, c.handle, c.note, c.category].some(s => (s || '').toLowerCase().includes(q)));
  if (libState.format !== 'all') arr = arr.filter(c => !c.format || c.format === libState.format || c.format === 'any');
  if (libState.age !== 'any') { const cap = { '1m': 30, '3m': 90, '6m': 180 }[libState.age]; arr = arr.filter(c => c.daysSinceStart && c.daysSinceStart <= cap); }
  const s = libState.sort;
  arr.sort((a, b) => s === 'subs' ? (b.subs || 0) - (a.subs || 0) : s === 'videos' ? (b.videos || 0) - (a.videos || 0) : s === 'outlier' ? (b.outlier || 0) - (a.outlier || 0) : s === 'score' ? (b.score || 0) - (a.score || 0) : (b.savedAt || 0) - (a.savedAt || 0));
  return arr;
}

function renderLibBody() {
  const box = $('libBody'); if (!box) return;
  const cnt = $('libCount'); if (cnt) cnt.textContent = (libItems ? libItems.length : '');
  if (!libItems || !libItems.length) { box.innerHTML = '<div class="card"><div class="empty" style="padding:30px;text-align:center">No saved channels yet.<br><span class="mini">Open <b>Niche Finder</b>, scan, and press <b>+ Save</b> on channels to build your library.</span></div></div>'; return; }
  const arr = libFiltered();
  if (!arr.length) { box.innerHTML = '<div class="card"><div class="empty" style="padding:24px">Nothing matches these filters.</div></div>'; return; }
  if (libState.view === 'table') { renderLibTable(box, arr); return; }
  const groups = {}, order = ['Today', 'Yesterday', 'This week', 'This month', 'Earlier'];
  arr.forEach(c => { const g = libDayGroup(c.savedAt); (groups[g] = groups[g] || []).push(c); });
  box.innerHTML = '';
  order.filter(g => groups[g]).forEach(g => {
    const h = document.createElement('p'); h.className = 'lib-group'; h.innerHTML = `${g} <span class="mini">${groups[g].length}</span>`; box.appendChild(h);
    const grid = document.createElement('div'); grid.className = 'lib-grid';
    groups[g].forEach(c => grid.appendChild(libCard(c)));
    box.appendChild(grid);
  });
}

function libCard(c) {
  const card = document.createElement('div'); card.className = 'lib-card';
  const isNew = c.daysSinceStart && c.daysSinceStart <= 60;
  const tags = [c.category ? `<span class="lib-tag niche">${esc(c.category)}</span>` : '',
    c.format && c.format !== 'any' ? `<span class="lib-tag">${c.format === 'short' ? 'Short' : 'Long'}</span>` : '',
    `<span class="lib-tag">Competitor</span>`,
    isNew ? `<span class="lib-tag new">New · ${c.daysSinceStart} days</span>` : ''].filter(Boolean).join('');
  const recent = (c.recent || []).map(v => `<div class="lib-vid" data-u="${esc(v.url)}"><div class="lib-vt"><span class="lib-vo">${v.outlier}x</span><span class="lib-vd">${esc(v.dur || '')}</span>${v.thumb ? `<img src="${esc(v.thumb)}"/>` : ''}</div><div class="lib-vtitle">${esc(v.title)}</div><div class="lib-vmeta">${fmtNum(v.views)} views · ${libAgo(v.publishedAt)}</div></div>`).join('');
  card.innerHTML =
    `<div class="lib-cardhead">${c.avatar || c.thumb ? `<img class="lib-av" src="${esc(c.avatar || c.thumb)}"/>` : '<div class="lib-av"></div>'}${c.score ? `<span class="lib-score">${c.score}<small>SCORE</small></span>` : ''}</div>` +
    `<div class="lib-name">${esc(c.title)}</div>` +
    `<div class="lib-sub">${c.handle ? esc(c.handle.startsWith('@') ? c.handle : '@' + c.handle) + ' · ' : ''}${fmtNum(c.subs)} subs · ${fmtNum(c.videos)} videos</div>` +
    `<div class="lib-tags">${tags}</div>` +
    (recent ? `<div class="lib-vids">${recent}</div>` : `<div class="lib-norefresh mini">↻ Press refresh to load recent videos</div>`) +
    `<input class="lib-note" placeholder="Add a note..." value="${esc(c.note || '')}" />` +
    `<div class="lib-foot"><span class="mini" title="When this channel's data (subs, videos, recent uploads) was last pulled from YouTube">${c.refreshedAt ? 'Data updated ' + libAgo(new Date(c.refreshedAt).toISOString()) : 'Not refreshed yet'}</span>` +
    `<span class="lib-acts"><button class="lib-ic" data-a="refresh" title="Refresh data">↻</button><button class="lib-ic" data-a="open" title="Open in YouTube">↗</button><button class="lib-ic" data-a="menu" title="More">⋯</button></span></div>` +
    `<div class="lib-menu" hidden><button data-a="detail">Channel detail</button><button data-a="similar">Find similar channels</button><button data-a="refresh">Refresh data</button><button data-a="copy">Copy link</button><button data-a="remove" class="danger">Remove from library</button></div>`;
  card.querySelector('.lib-note').addEventListener('change', e => { c.note = e.target.value; window.api.libNote(c.url, c.note); });
  card.querySelectorAll('.lib-vid').forEach(v => v.addEventListener('click', () => window.api.openLink(v.dataset.u)));
  const act = async (a) => {
    if (a === 'open') window.api.openLink(c.url);
    else if (a === 'detail') openLibDetail(c);
    else if (a === 'copy') { try { await navigator.clipboard.writeText(c.url); } catch {} }
    else if (a === 'remove') { await window.api.libRemove(c.url); libItems = libItems.filter(x => x.url !== c.url); renderLibBody(); }
    else if (a === 'similar') { openResearchTool('niche'); setTimeout(() => { const inp = $('nfChannel'); if (inp) inp.value = c.url; doNicheScan(true); }, 60); }
    else if (a === 'refresh') { const b = card.querySelector('.lib-ic[data-a="refresh"]'); if (b) { b.textContent = '…'; b.disabled = true; } const r = await window.api.libRefresh(c.url); if (r && r.ok) { Object.assign(c, r.data, { refreshedAt: Date.now() }); const nc = libCard(c); card.replaceWith(nc); } else { if (b) { b.textContent = '↻'; b.disabled = false; } if (r && r.error === 'no-key') alert('Add your YouTube API key in Settings → API keys first.'); else if (r && r.error) alert(r.error); } }
  };
  card.querySelectorAll('.lib-ic').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const a = b.dataset.a; if (a === 'menu') { const m = card.querySelector('.lib-menu'); const willOpen = m.hidden; document.querySelectorAll('.lib-menu').forEach(x => { x.hidden = true; }); m.hidden = !willOpen; } else act(a); }));
  card.querySelectorAll('.lib-menu button').forEach(b => b.addEventListener('click', () => { card.querySelector('.lib-menu').hidden = true; act(b.dataset.a); }));
  return card;
}

// ----- Channel detail slide-over -----
function closeLibDetail() { const dr = document.getElementById('libDrawer'); if (dr) dr.classList.remove('on'); }
async function openLibDetail(c) {
  let dr = document.getElementById('libDrawer');
  if (!dr) {
    dr = document.createElement('div'); dr.id = 'libDrawer';
    dr.innerHTML = '<div class="dr-ov"></div><div class="dr-panel"></div>';
    document.body.appendChild(dr);
    dr.querySelector('.dr-ov').addEventListener('click', closeLibDetail);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLibDetail(); });
  }
  dr.classList.add('on');
  const panel = dr.querySelector('.dr-panel');
  panel.innerHTML = '<button class="dr-close">✕</button><div class="dr-body"><div class="empty" style="padding:50px">Loading channel detail…</div></div>';
  panel.querySelector('.dr-close').addEventListener('click', closeLibDetail);
  let r; try { r = await window.api.libDetail(c.url); } catch (e) { r = { error: e.message }; }
  updateQuota();
  if (!dr.classList.contains('on')) return;
  if (r && r.error) { panel.querySelector('.dr-body').innerHTML = `<div class="empty" style="padding:30px;color:var(--red)">⚠ ${esc(r.error === 'no-key' ? 'Add your YouTube API key in Settings → API keys first.' : r.error)}</div>`; return; }
  const d = r.data;
  const idx = libItems ? libItems.findIndex(x => x.url === c.url) : -1;
  if (idx >= 0) Object.assign(libItems[idx], { subs: d.subs, videos: d.videos, avatar: d.avatar, handle: d.handle, score: d.score, daysSinceStart: d.daysSinceStart, refreshedAt: Date.now() });
  renderLibDrawer(panel, c, d);
}
function dtile(label, big, sub) { return `<div class="dr-tile"><div class="dr-tl">${esc(label)}</div><div class="dr-tn">${big}</div><div class="dr-ts">${esc(sub)}</div></div>`; }
function renderLibDrawer(panel, c, d) {
  const hdl = d.handle ? (d.handle.startsWith('@') ? d.handle : '@' + d.handle) : '';
  const isNew = d.daysSinceStart && d.daysSinceStart <= 180;
  const tags = [d.typicalLong ? 'Long' : 'Short', isNew ? `New · ${d.ageMonths} months` : '', d.countryName || ''].filter(Boolean)
    .map((t, i) => `<span class="lib-tag${i === 1 && isNew ? ' new' : ''}">${esc(t)}</span>`).join('');
  const vids = (list, empty) => list.length ? list.map(v => `<div class="dr-vid" data-u="${esc(v.url)}"><div class="dr-vt">${v.thumb ? `<img src="${esc(v.thumb)}"/>` : ''}<span class="dr-vo">${v.outlier}x</span><span class="dr-vd">${esc(v.dur || '')}</span></div><div class="dr-vtitle">${esc(v.title)}</div><div class="dr-vmeta">${fmtNum(v.views)} views · ${libAgo(v.publishedAt)}</div></div>`).join('') : `<div class="empty" style="padding:14px">${empty}</div>`;
  panel.innerHTML = `<button class="dr-close">✕</button>
    <div class="dr-banner">${d.banner ? `<img src="${esc(d.banner)}"/>` : ''}</div>
    <div class="dr-body">
      <div class="dr-head">${d.avatar ? `<img class="dr-av" src="${esc(d.avatar)}"/>` : '<div class="dr-av"></div>'}${d.score ? `<span class="lib-score">${d.score}<small>SCORE</small></span>` : ''}</div>
      <div class="dr-name">${esc(d.title)}</div>
      <div class="dr-sub">${hdl ? esc(hdl) + ' · ' : ''}${fmtNum(d.subs)} subscribers · ${fmtNum(d.videos)} videos · ${fmtNum(d.totalViews)} total views</div>
      <div class="lib-tags" style="margin:10px 0 14px">${tags}${d.mark ? `<span class="lib-tag new">★ ${esc(d.mark)}</span>` : ''}</div>
      <div class="dr-acts">
        <button class="btn sm lime" data-a="open">Open on YouTube ↗</button>
        <button class="btn sm" data-a="refresh">↻ Refresh</button>
        <button class="btn sm" data-a="mark">⚑ Mark: need to look</button>
        <button class="btn sm" data-a="compet">✚ Add to competitors</button>
        <button class="btn sm" data-a="similar">🔍 Similar channels</button>
        <button class="btn sm danger" data-a="del">Delete</button>
      </div>
      <div class="dr-ai"><div class="dr-ai-h">🧠 AI NICHE ANALYSIS</div><p>Reads this channel's videos and explains the format, which topics work, content gaps and 10 video ideas.</p><button class="btn sm" data-a="ai">✨ Analyse with AI</button></div>
      <div class="dr-sec">VIEWS &amp; RPM</div>
      <div class="dr-tiles">
        ${dtile('RPM', d.rpm ? '$' + esc(d.rpm) : '<span class="dim">Not set</span>', d.rpm ? 'per 1,000 views' : 'set it from the niche ⋯ menu')}
        ${dtile('Views per month', fmtNum(d.viewsPerMonth), 'views on last-30-day uploads')}
        ${dtile('Monetisation', d.monetised ? '1K+ subs' : '<span class="dim">&lt;1K subs</span>', d.monetised ? 'meets the subscriber rule' : 'needs 1,000 subscribers')}
      </div>
      <div class="dr-sec">GROWTH</div>
      <div class="dr-tiles">
        ${dtile('Subscribers / day', '<span class="dim">—</span>', 'needs 2+ days of data')}
        ${dtile('Channel age', d.ageMonths + (d.ageMonths === 1 ? ' month' : ' months'), d.createdStr ? 'joined ' + d.createdStr : '')}
        ${dtile('Uploads / week', d.uploadsPerWeek || '—', d.lastUploadAgo ? 'last upload ' + d.lastUploadAgo : '')}
        ${dtile('Median views', fmtNum(d.medianViews), 'per recent ' + (d.typicalLong ? 'long ' : '') + 'video')}
        ${dtile('Views per sub', d.viewsPerSub || '—', 'above 0.5 = audience hungry')}
        ${dtile('Typical length', d.typicalLengthStr, d.typicalLong ? 'Long' : 'Short')}
      </div>
      <div class="dr-sec">OUTLIER VIDEOS (${d.outliers.length}) — 3X+ the channel's median</div>
      <div class="dr-vgrid">${vids(d.outliers, 'No outlier videos found in recent uploads.')}</div>
      <div class="dr-sec">RECENT UPLOADS</div>
      <div class="dr-vgrid">${vids(d.recent, 'No recent uploads.')}</div>
    </div>`;
  panel.querySelector('.dr-close').addEventListener('click', closeLibDetail);
  panel.querySelectorAll('.dr-vid').forEach(v => v.addEventListener('click', () => window.api.openLink(v.dataset.u)));
  const re = () => openLibDetail(c);
  panel.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', async () => {
    const a = b.dataset.a;
    if (a === 'open') window.api.openLink(c.url);
    else if (a === 'refresh') re();
    else if (a === 'mark') { const nv = d.mark ? '' : 'need to look'; await window.api.libUpdate(c.url, { mark: nv }); d.mark = nv; re(); }
    else if (a === 'compet') { await window.api.libUpdate(c.url, { competitor: true, category: d.category || 'Competitor' }); b.textContent = '✓ Competitor'; }
    else if (a === 'similar') { closeLibDetail(); openResearchTool('niche'); setTimeout(() => { const inp = $('nfChannel'); if (inp) inp.value = c.url; doNicheScan(true); }, 60); }
    else if (a === 'ai') { alert('AI niche analysis abhi set karna baaki hai — ye aapki AI key (Settings → API keys) se channel ke videos parh ke format, topics aur 10 ideas dega. Bata do to bana doon.'); }
    else if (a === 'del') { if (confirm('Remove this channel from your library?')) { await window.api.libRemove(c.url); if (libItems) libItems = libItems.filter(x => x.url !== c.url); renderLibBody(); closeLibDetail(); } }
  }));
}

function renderLibTable(box, arr) {
  box.innerHTML = `<div class="card" style="padding:6px"><div class="sheet-wrap"><table class="sheet lib-table"><thead><tr><th>Channel</th><th>Subs</th><th>Videos</th><th>Outlier</th><th>Score</th><th>Niche</th><th>Saved</th><th></th></tr></thead><tbody></tbody></table></div></div>`;
  const tb = box.querySelector('tbody');
  arr.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><b>${esc(c.title)}</b>${c.handle ? ` <span class="mini">${esc(c.handle.startsWith('@') ? c.handle : '@' + c.handle)}</span>` : ''}</td><td>${fmtNum(c.subs)}</td><td>${fmtNum(c.videos)}</td><td>${c.outlier ? c.outlier + 'x' : '—'}</td><td>${c.score || '—'}</td><td>${esc(c.category || '—')}</td><td>${libAgo(new Date(c.savedAt || Date.now()).toISOString())}</td><td><button class="btn sm" data-a="open">Open</button> <button class="btn sm" data-a="rm">✕</button></td>`;
    tr.querySelector('[data-a="open"]').addEventListener('click', () => window.api.openLink(c.url));
    tr.querySelector('[data-a="rm"]').addEventListener('click', async () => { await window.api.libRemove(c.url); libItems = libItems.filter(x => x.url !== c.url); renderLibBody(); });
    tb.appendChild(tr);
  });
}

// per-niche competitor list (re-rendered after each search)
function renderNicheList() {
  const box = $('rs-niche-list'); if (!box) return;
  const myNiches = niches.map(nicheName);
  box.innerHTML = '';
  if (!myNiches.length) { box.innerHTML = '<div class="card"><div class="empty">Add a niche first — competitor channels will show up here.</div></div>'; return; }
  const data = (researchData && researchData.data) || {};
  if (researchData && researchData.error) {
    const w = document.createElement('div'); w.className = 'card';
    w.innerHTML = `<div class="empty" style="color:var(--red)">⚠ ${esc(researchData.error)}</div>`;
    box.appendChild(w);
  }
  myNiches.forEach(nn => {
    const list = data[nn] || [];
    const card = document.createElement('div'); card.className = 'card';
    const head = document.createElement('h3');
    head.innerHTML = `<span>${esc(nn)} <span class="mini">· ${list.length} channel${list.length === 1 ? '' : 's'}</span></span>`;
    card.appendChild(head);
    // per-niche exact search words
    const nObj = niches.find(n => nicheName(n).toLowerCase() === nn.toLowerCase());
    const savedQ = (nObj && typeof nObj === 'object' && nObj.researchQuery) || '';
    const qrow = document.createElement('div'); qrow.className = 'rowflex'; qrow.style.cssText = 'gap:6px;margin:4px 0 10px';
    qrow.innerHTML = `<input class="rq-input" value="${esc(savedQ)}" placeholder="exact search words for this niche (e.g. alien abduction story animated)" style="flex:1" />`;
    const go = document.createElement('button'); go.className = 'btn sm'; go.textContent = 'Search';
    go.addEventListener('click', async () => {
      const input = qrow.querySelector('.rq-input'); const phrase = input.value.trim();
      go.disabled = true; go.textContent = '…';
      const res = await window.api.researchOne(nn, phrase);
      go.disabled = false; go.textContent = 'Search';
      if (res && res.error) { if (res.error === 'no-key') { alert('Add your YouTube API key in Settings → API keys first.'); } else alert(res.error); return; }
      if (nObj && typeof nObj === 'object') nObj.researchQuery = phrase; // keep local copy fresh
      if (!researchData) researchData = { data: {}, error: null };
      researchData.data[nn] = res.data || [];
      renderNicheList();
    });
    qrow.appendChild(go);
    card.appendChild(qrow);
    if (!list.length) {
      const e = document.createElement('div'); e.className = 'empty'; e.style.padding = '12px';
      e.textContent = 'No channels yet — type your exact niche words above and press Search.';
      card.appendChild(e);
    } else {
      list.forEach(c => {
        const row = document.createElement('div'); row.className = 'comp-row';
        const badge = isNewChannel(c.created) ? '<span class="comp-badge new">🆕 New</span>' : '';
        row.innerHTML =
          `<div class="comp-info"><div class="comp-name">${esc(c.title)} ${badge}</div>` +
          `<div class="comp-meta">${fmtNum(c.subs)} subs · ${fmtNum(c.views)} views · ${fmtNum(c.videos)} videos${c.created ? ' · started ' + c.created : ''}</div></div>`;
        const open = document.createElement('button'); open.className = 'btn sm'; open.textContent = 'Open';
        open.addEventListener('click', () => window.api.openLink(c.url));
        row.appendChild(open);
        card.appendChild(row);
      });
    }
    box.appendChild(card);
  });
  updateQuota();
}

async function doResearch() {
  const box = $('rs-niche-list'); if (!box) return;
  const myNiches = niches.map(nicheName);
  if (!myNiches.length) { renderNicheList(); return; }
  const btn = $('rsNicheSearch');
  box.innerHTML = '<div class="card"><div class="empty">Searching YouTube for competitor channels… this can take a few seconds.</div></div>';
  if (btn) { btn.disabled = true; btn.textContent = 'Searching…'; }
  try {
    const res = await window.api.researchRun();
    if (res && res.error === 'no-key') {
      researchData = null;
      box.innerHTML = '<div class="card"><div class="empty">Add your <b>YouTube Data API key</b> in <b>Settings → API keys</b> first, then press Search.</div><div class="rowflex" style="margin-top:10px"><button class="btn" id="goApiKeyBtn">Go to Settings</button></div></div>';
      const g = $('goApiKeyBtn'); if (g) g.addEventListener('click', openSettingsApi);
      return;
    }
    researchData = res || { data: {}, error: 'No response.' };
    renderNicheList();
  } catch (e) {
    box.innerHTML = '<div class="card"><div class="empty" style="color:var(--red)">Research failed: ' + esc(e.message || 'error') + '</div></div>';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🔄 Search all'; }
  }
}

// settings sub-nav
document.querySelectorAll('#setNav > button[data-set]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('#setNav button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('.set-pane').forEach(p => p.classList.toggle('on', p.id === 'set-' + b.dataset.set));
}));

// ---- Niches (sidebar + view) ----
const nicheName = (n) => typeof n === 'string' ? n : (n && n.name) || '';

// Generic input modal — Electron does NOT support window.prompt()
function askInput(title, l1, l2, l3, d) {
  d = d || [];
  return new Promise(resolve => {
    $('miniTitle').textContent = title;
    $('miniL1').textContent = l1; $('miniF1').value = d[0] || '';
    if (l2) { $('miniL2').textContent = l2; $('miniF2').value = d[1] || ''; $('miniF2wrap').style.display = 'block'; } else $('miniF2wrap').style.display = 'none';
    if (l3) { $('miniL3').textContent = l3; $('miniF3').value = d[2] || ''; $('miniF3wrap').style.display = 'block'; } else $('miniF3wrap').style.display = 'none';
    $('miniBg').classList.add('on');
    setTimeout(() => $('miniF1').focus(), 40);
    const done = (v) => { $('miniBg').classList.remove('on'); $('miniOk').onclick = null; $('miniCancel').onclick = null; $('miniF1').onkeydown = null; resolve(v); };
    const submit = () => { const v1 = $('miniF1').value.trim(); if (!v1) { $('miniF1').focus(); return; } const out = [v1]; if (l2) out.push($('miniF2').value.trim()); if (l3) out.push($('miniF3').value.trim()); done(out); };
    $('miniOk').onclick = submit;
    $('miniF1').onkeydown = (e) => { if (e.key === 'Enter') submit(); };
    $('miniCancel').onclick = () => done(null);
  });
}
async function renameNiche(oldName) {
  const r = await askInput('Rename niche', 'New name (e.g. Mysteries)'); if (!r) return;
  const nn = r[0];
  const list = niches.map(n => typeof n === 'string' ? { name: n } : { ...n });
  const obj = list.find(n => n.name === oldName); if (obj) obj.name = nn;
  niches = list; await window.api.nichesSave(list);
  for (const it of content) if ((it.category || '').toLowerCase() === oldName.toLowerCase()) { it.category = nn; await window.api.contentSave(it); }
  let chChanged = false; channels.forEach(c => { if ((c.niche || '').toLowerCase() === oldName.toLowerCase()) { c.niche = nn; chChanged = true; } });
  if (chChanged) await window.api.channelsSave(channels);
  if (currentNiche === oldName) currentNiche = nn;
  await load();
}
$('miniBg').addEventListener('click', e => { if (e.target === $('miniBg')) $('miniBg').classList.remove('on'); });

function openNiche(name) {
  currentNiche = name; currentMember = null;
  document.querySelectorAll('#nav button').forEach(x => x.classList.remove('on'));
  const nb = [...document.querySelectorAll('#nicheNav button')].find(b => b.dataset.niche === name);
  if (nb) nb.classList.add('on');
  $('pageTitle').textContent = name; showView('view-niche'); renderNiche();
}
function renderNicheNav() {
  const box = $('nicheNav'); if (!box) return;
  box.innerHTML = '';
  niches.forEach(n => {
    const name = nicheName(n);
    const b = document.createElement('button'); b.textContent = '🏷 ' + name; b.dataset.niche = name;
    b.addEventListener('click', () => openNiche(name));
    box.appendChild(b);
  });
}
function renderDashStats() {
  const el = $('dashStats'); if (!el) return;
  const week = content.filter(c => c.status === 'Uploaded' && isThisWeek(c.uploadedDate)).length;
  el.innerHTML =
    `<div class="stat"><div class="l">Niches</div><div class="n">${niches.length}</div></div>` +
    `<div class="stat"><div class="l">Channels</div><div class="n">${channels.length}</div></div>` +
    `<div class="stat"><div class="l">Total videos</div><div class="n">${content.length}</div></div>` +
    `<div class="stat"><div class="l">This week uploaded</div><div class="n" style="color:var(--green)">${week}</div></div>`;
}
// ---- Performance dashboard ----
let perfFrom = null, perfTo = null;   // Date (midnight) or null = all time
let perfDays = 30;                    // chart window when no date filter
function dayKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function uploadsByDay() {
  const m = {};
  content.forEach(c => {
    if (c.status === 'Uploaded' && c.uploadedDate) {
      const d = new Date(c.uploadedDate);
      if (!isNaN(d)) { const k = dayKey(d); m[k] = (m[k] || 0) + 1; }
    }
  });
  return m;
}
function perfInRange(dateStr) {
  if (!perfFrom && !perfTo) return true;
  const d = new Date(dateStr); if (isNaN(d)) return false;
  const k = dayKey(d);
  if (perfFrom && k < dayKey(perfFrom)) return false;
  if (perfTo && k > dayKey(perfTo)) return false;
  return true;
}
let activeTile = 'total';
function renderPerf() {
  if ($('perfFrom')) $('perfFrom').value = perfFrom ? dayKey(perfFrom) : '';
  if ($('perfTo')) $('perfTo').value = perfTo ? dayKey(perfTo) : '';
  const filtered = !!(perfFrom || perfTo);
  const uploaded = content.filter(c => c.status === 'Uploaded');
  const uploadedInRange = uploaded.filter(c => perfInRange(c.uploadedDate));
  const total = content.length;
  const ready = content.filter(c => c.status === 'Ready').length;
  const rem = total - uploaded.length;
  const week = uploaded.filter(c => isThisWeek(c.uploadedDate)).length;
  const sched = channels.filter(c => c.schedule && c.schedule.enabled).length;

  const el = $('perf-stats');
  if (el) {
    const tile = (key, l, n, color, sub) => `<div class="tile${activeTile === key ? ' on' : ''}" data-tile="${key}"><div class="t-l">${l}</div><div class="t-n"${color ? ` style="color:${color}"` : ''}>${n}</div>${sub ? `<div class="t-s">${sub}</div>` : ''}</div>`;
    el.innerHTML =
      tile('total', 'TOTAL VIDEOS', total, '', `${niches.length} niches · ${channels.length} channels`) +
      tile('uploaded', filtered ? 'UPLOADED · RANGE' : 'UPLOADED', filtered ? uploadedInRange.length : uploaded.length, '', filtered ? 'in selected dates' : `${week} this week`) +
      tile('ready', 'READY', ready, '', 'waiting to upload') +
      tile('remaining', 'REMAINING', rem, '', 'not uploaded yet') +
      tile('week', 'THIS WEEK', week, '', 'uploaded in 7 days') +
      tile('scheduled', 'AUTO-SCHEDULED', sched, '', 'channels on schedule');
    el.querySelectorAll('.tile[data-tile]').forEach(t => t.addEventListener('click', () => {
      activeTile = t.dataset.tile;
      el.querySelectorAll('.tile').forEach(x => x.classList.toggle('on', x === t));
      renderDetail(activeTile);
    }));
  }
  renderPerfChart();
  renderDetail(activeTile);
  renderIssues();
}
// ---- Needs attention: two minimal chips — Errors + Delayed uploads, both clickable ----
function renderIssues() {
  const box = $('perf-issues'); if (!box) return;
  const errGroups = [], dueGroups = [];

  // A) Per-niche content-sheet errors — things that actually block an upload
  const byNiche = {};
  content.forEach(c => { const n = (c.category || '').trim() || '(no niche)'; (byNiche[n] = byNiche[n] || []).push(c); });
  Object.keys(byNiche).forEach(nn => {
    const list = byNiche[nn];
    const ready = list.filter(c => c.status === 'Ready');
    const noLink = ready.filter(c => !(c.driveLink || c.url || c.localFile));
    const noCh = ready.filter(c => !c.channel);
    const noTitle = list.filter(c => (c.status === 'Ready' || c.status === 'Uploaded') && !(c.title || '').trim());
    if (noLink.length) errGroups.push({ msg: `"${nn}" — ${noLink.length} video(s) have no download/video link`, items: noLink.map(c => c.title || '(untitled)') });
    if (noCh.length) errGroups.push({ msg: `"${nn}" — ${noCh.length} video(s) not assigned to a channel`, items: noCh.map(c => c.title || '(untitled)') });
    if (noTitle.length) errGroups.push({ msg: `"${nn}" — ${noTitle.length} row(s) missing a title`, items: noTitle.map((c, i) => `Row ${i + 1} · ${c.status || ''}`) });
  });

  // B) Per-channel upload delays — scheduled time passed today but videos still Ready (not uploaded)
  const now = new Date(), day = now.getDay();
  channels.filter(c => c.schedule && c.schedule.enabled).forEach(ch => {
    const ready = content.filter(c => c.channel === ch.number && c.status === 'Ready');
    if (!ready.length) return;
    const s = ch.schedule; const parts = (s.time || '00:00').split(':'); const hh = Number(parts[0]) || 0, mm = Number(parts[1]) || 0;
    const dayActive = !(Array.isArray(s.days) && s.days.length) || s.days.includes(day);
    const slot = new Date(now); slot.setHours(hh, mm, 0, 0);
    if (dayActive && now > slot) dueGroups.push({ msg: `${ch.name || ch.number} — ${ready.length} video(s) delayed (scheduled ${s.time} passed)`, items: ready.map(c => `${c.title || '(untitled)'}${c.category ? ' · ' + c.category : ''}`) });
  });

  const errLabel = errGroups.length ? `${errGroups.length} error${errGroups.length > 1 ? 's' : ''}` : 'No errors';
  const dueLabel = dueGroups.length ? `${dueGroups.length} delayed` : 'On time';
  const panelHtml = groups => groups.length
    ? groups.map(g => `<div class="iss-grp"><div class="iss-gh">${esc(g.msg)}</div>${g.items.slice(0, 25).map(x => `<div class="iss-item">• ${esc(x)}</div>`).join('')}${g.items.length > 25 ? `<div class="iss-item muted">…and ${g.items.length - 25} more</div>` : ''}</div>`).join('')
    : `<div class="iss-item muted">Nothing here — all good ✓</div>`;

  box.innerHTML = `<div class="iss-bar">` +
    `<button class="iss-chip ${errGroups.length ? 'err' : 'ok'}" data-kind="err"><span class="cdot"></span>${errLabel}</button>` +
    `<button class="iss-chip ${dueGroups.length ? 'due' : 'ok'}" data-kind="due"><span class="cdot"></span>⏰ ${dueLabel}</button>` +
    `</div><div class="iss-panel" id="issPanel" hidden></div>`;

  const panelEl = box.querySelector('#issPanel');
  let openKind = null;
  box.querySelectorAll('.iss-chip').forEach(ch => ch.addEventListener('click', () => {
    const kind = ch.dataset.kind;
    if (openKind === kind) { openKind = null; panelEl.hidden = true; box.querySelectorAll('.iss-chip').forEach(x => x.classList.remove('on')); return; }
    openKind = kind;
    box.querySelectorAll('.iss-chip').forEach(x => x.classList.toggle('on', x === ch));
    panelEl.innerHTML = panelHtml(kind === 'err' ? errGroups : dueGroups);
    panelEl.hidden = false;
  }));
}
function rankBarsHtml(rows, color) {
  if (!rows.length) return '<div class="empty" style="padding:10px">No data yet.</div>';
  const max = Math.max(1, ...rows.map(r => r.v));
  return rows.map(r => `<div class="rb-row"><div class="rb-bar" style="width:${Math.round(r.v / max * 100)}%;background:${r.color || color || 'var(--green)'}"></div><span class="rb-label">${esc(r.label)}</span><span class="rb-val">${r.v}</span></div>`).join('');
}
function listHtml(rows) {
  if (!rows.length) return '<div class="empty" style="padding:12px">Nothing here yet.</div>';
  return rows.map(r => `<div class="dl-row"><div class="dl-main">${esc(r.main)}</div><div class="dl-meta">${esc(r.meta || '')}${r.pill ? ` <span class="dl-pill ${r.pillCls || ''}">${esc(r.pill)}</span>` : ''}</div></div>`).join('');
}
function renderDetail(key) {
  const box = $('perf-detail'), ttl = $('perf-detail-title'); if (!box) return;
  const filtered = !!(perfFrom || perfTo);
  const uploaded = content.filter(c => c.status === 'Uploaded');
  const fmtD = s => { try { const d = new Date(s); return isNaN(d) ? '' : dayKey(d); } catch { return ''; } };
  if (key === 'total') {
    if (ttl) ttl.textContent = 'Overview — by niche, channel & status';
    const src = filtered ? uploaded.filter(c => perfInRange(c.uploadedDate)) : uploaded;
    const nicheRows = niches.map(nicheName).map(name => ({ label: name, v: src.filter(c => (c.category || '').toLowerCase() === name.toLowerCase()).length })).sort((a, b) => b.v - a.v);
    const chMap = {}; src.forEach(c => { const k = c.channel || '— none —'; chMap[k] = (chMap[k] || 0) + 1; });
    const chRows = Object.keys(chMap).map(k => ({ label: k, v: chMap[k] })).sort((a, b) => b.v - a.v);
    const stMap = {}; content.forEach(c => { const k = c.status || 'Idea'; stMap[k] = (stMap[k] || 0) + 1; });
    const stColors = { Uploaded: 'var(--green)', Ready: 'var(--blue)', Downloaded: 'var(--amber)', Idea: 'var(--muted)' };
    const stRows = Object.keys(stMap).map(k => ({ label: k, v: stMap[k], color: stColors[k] || 'var(--pink)' })).sort((a, b) => b.v - a.v);
    box.innerHTML = `<div class="detail-cols">
      <div><div class="dl-h">Uploads by niche</div><div class="rankbars">${rankBarsHtml(nicheRows, 'var(--green)')}</div></div>
      <div><div class="dl-h">Uploads by channel</div><div class="rankbars">${rankBarsHtml(chRows, 'var(--accent)')}</div></div>
      <div><div class="dl-h">All videos by status</div><div class="rankbars">${rankBarsHtml(stRows, 'var(--accent)')}</div></div>
    </div>`;
    return;
  }
  if (key === 'ready') {
    if (ttl) ttl.textContent = 'Ready to upload — by niche';
    const ready = content.filter(c => c.status === 'Ready');
    if (!ready.length) { box.innerHTML = '<div class="empty" style="padding:12px">No videos ready to upload.</div>'; return; }
    const groups = {};
    ready.forEach(c => { const n = (c.category || '').trim() || '(no niche)'; (groups[n] = groups[n] || []).push(c); });
    const order = niches.map(nicheName);
    const keys = [...order.filter(n => groups[n]), ...Object.keys(groups).filter(n => !order.some(o => o.toLowerCase() === n.toLowerCase()))];
    box.innerHTML = keys.map(n => {
      const list = groups[n] || groups[Object.keys(groups).find(k => k.toLowerCase() === n.toLowerCase())] || [];
      return `<div class="rd-grp"><div class="rd-gh">🏷 ${esc(n)} <span class="rd-gc">${list.length}</span></div>` +
        list.map(c => `<div class="dl-row"><div class="dl-main">${esc(c.title || 'Untitled')}</div><div class="dl-meta">${esc(c.channel || '— no channel —')}${c.type ? ' · ' + esc(c.type) : ''} <span class="dl-pill blue">Ready</span></div></div>`).join('') +
        `</div>`;
    }).join('');
    return;
  }
  let items = [], title = '';
  if (key === 'uploaded') { title = 'Uploaded videos'; items = (filtered ? uploaded.filter(c => perfInRange(c.uploadedDate)) : uploaded).slice().sort((a, b) => new Date(b.uploadedDate) - new Date(a.uploadedDate)).map(c => ({ main: c.title || 'Untitled', meta: (c.channel || '—') + (c.uploadedDate ? ' · ' + fmtD(c.uploadedDate) : ''), pill: 'Uploaded', pillCls: 'green' })); }
  else if (key === 'remaining') { title = 'Remaining — not uploaded'; items = content.filter(c => c.status !== 'Uploaded').map(c => ({ main: c.title || 'Untitled', meta: c.channel || '—', pill: c.status || 'Idea' })); }
  else if (key === 'week') { title = 'Uploaded this week'; items = uploaded.filter(c => isThisWeek(c.uploadedDate)).map(c => ({ main: c.title || 'Untitled', meta: (c.channel || '—') + ' · ' + fmtD(c.uploadedDate), pill: 'Uploaded', pillCls: 'green' })); }
  else if (key === 'scheduled') {
    title = 'Auto-scheduled channels';
    const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    items = channels.filter(c => c.schedule && c.schedule.enabled).map(c => { const s = c.schedule; const days = (s.days && s.days.length) ? s.days.map(d => WD[d]).join(' ') : 'every day'; return { main: (c.name || c.number) + (c.niche ? ' · ' + c.niche : ''), meta: `🕒 ${s.time || ''} · ${days} · ${s.visibility || 'public'}`, pill: 'ON', pillCls: 'green' }; });
  }
  if (ttl) ttl.textContent = title;
  box.innerHTML = listHtml(items);
}
// bar chart: uploads per day (date range if set, else last N days)
function renderPerfChart() {
  const box = $('perf-chart'); if (!box) return;
  const counts = uploadsByDay();
  const H = 150;
  let data = [], rangeText = '';
  if (perfFrom || perfTo) {
    const start = perfFrom ? new Date(perfFrom) : new Date(Date.now() - 29 * 864e5);
    const end = perfTo ? new Date(perfTo) : new Date();
    start.setHours(0, 0, 0, 0); end.setHours(0, 0, 0, 0);
    let cur = new Date(start), guard = 0;
    while (cur <= end && guard < 400) { data.push({ d: new Date(cur), v: counts[dayKey(cur)] || 0 }); cur.setDate(cur.getDate() + 1); guard++; }
    rangeText = `· ${dayKey(start)} → ${dayKey(end)}`;
  } else {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = perfDays - 1; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); data.push({ d, v: counts[dayKey(d)] || 0 }); }
    rangeText = `· last ${perfDays} days`;
  }
  const n = data.length, step = Math.max(1, Math.ceil(n / 8));
  const max = Math.max(1, ...data.map(x => x.v));
  let bars = '';
  data.forEach((x, i) => {
    const h = x.v ? Math.max(8, Math.round(x.v / max * H)) : 3;
    const showL = n <= 14 || i === 0 || i === n - 1 || i % step === 0;
    const label = showL ? `${x.d.getDate()}/${x.d.getMonth() + 1}` : '';
    bars += `<div class="pf-bar" title="${x.d.toDateString()}: ${x.v} uploaded"><div class="pf-fill${x.v ? '' : ' zero'}" style="height:${h}px"></div><div class="pf-xl">${label}</div></div>`;
  });
  box.innerHTML = `<div class="pf-chart" style="height:${H + 22}px">${bars}</div>`;
  const totalUp = data.reduce((a, b) => a + b.v, 0);
  const busy = data.reduce((a, b) => (b.v > (a ? a.v : -1) ? b : a), null);
  const busyTxt = busy && busy.v > 0 ? ` · busiest ${busy.d.getDate()}/${busy.d.getMonth() + 1} (${busy.v})` : '';
  if ($('perf-chart-sub')) $('perf-chart-sub').textContent = `${rangeText} · ${totalUp} uploaded${busyTxt}`;
}
// chart range tabs
document.querySelectorAll('#perfRange button').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('#perfRange button').forEach(x => x.classList.toggle('on', x === b));
  perfDays = Number(b.dataset.days) || 30; perfFrom = null; perfTo = null; renderPerf();
}));
// date filter
if ($('perfApply')) $('perfApply').addEventListener('click', () => {
  const f = $('perfFrom').value, t = $('perfTo').value;
  perfFrom = f ? new Date(f + 'T00:00:00') : null;
  perfTo = t ? new Date(t + 'T00:00:00') : (f ? new Date(f + 'T00:00:00') : null);
  renderPerf();
});
if ($('perfAll')) $('perfAll').addEventListener('click', () => { perfFrom = null; perfTo = null; renderPerf(); });
let allQuery = '';
function renderAllTemplate(t) {
  const cols = ['Title', 'Video', 'Thumbnail', 'Metadata', 'Status', 'Channel'];
  const sample = [
    ['Your video title appears here', '▶ Open', '🖼 Thumbnail', '📄 Metadata', 'Ready', 'Channel 1'],
    ['Pulled straight from your Google Sheet', '▶ Open', '🖼 Thumbnail', '📄 Metadata', 'Uploaded', 'Channel 2'],
    ['Each row = one video, ready to upload', '▶ Open', '🖼 Thumbnail', '📄 Metadata', 'Idea', '— none —']
  ];
  let html = '<thead><tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
  html += sample.map(r => '<tr class="ghost">' + r.map((cell, i) => {
    if (i === 0) return `<td class="ttl">${cell}</td>`;
    if (i >= 1 && i <= 3) return `<td><span class="lnk">${cell}</span></td>`;
    return `<td><span class="ntag">${cell}</span></td>`;
  }).join('') + '</tr>').join('');
  html += '</tbody>';
  t.innerHTML = html;
}
function renderAll() {
  const t = $('all-sheet'); if (!t) return;
  const hint = $('allHint');
  if (!allQuery) {
    if (hint) hint.innerHTML = 'This is just a <b>sample</b>. Search a niche or video name above — that niche\'s full sheet opens here.';
    renderAllTemplate(t);
    return;
  }
  const items = content.slice().reverse().filter(c => (c.title + ' ' + (c.category || '') + ' ' + (c.assignee || '')).toLowerCase().includes(allQuery));
  if (hint) hint.textContent = `${items.length} result${items.length === 1 ? '' : 's'} for "${allQuery}"`;
  buildSheet(t, items);
}
if ($('allSearch')) $('allSearch').addEventListener('input', e => { allQuery = e.target.value.toLowerCase().trim(); renderAll(); });

function renderDashboardNiches() {
  const grid = $('nicheGrid'); if (!grid) return; grid.innerHTML = '';
  niches.map(nicheName).filter(n => !query || n.toLowerCase().includes(query)).forEach((name, i) => {
    const inN = content.filter(c => (c.category || '').toLowerCase() === name.toLowerCase());
    const up = inN.filter(c => c.status === 'Uploaded').length;
    const chs = channels.filter(c => (c.niche || '').toLowerCase() === name.toLowerCase()).length;
    const box = document.createElement('div'); box.className = 'niche-box fade'; box.style.position = 'relative'; box.style.animationDelay = (0.14 + i * 0.05) + 's';
    box.innerHTML = `<div class="nb-name">${esc(name)}</div><div class="nb-meta">${chs} channels · ${inN.length} videos</div><div class="nb-stat"><span style="color:var(--green)">${up} uploaded</span> · <span style="color:var(--amber)">${inN.length - up} remaining</span></div>`;
    box.addEventListener('click', () => openNiche(name));
    const edit = document.createElement('span'); edit.textContent = '✏️'; edit.title = 'Rename';
    edit.style.cssText = 'position:absolute;top:12px;right:14px;font-size:13px;opacity:.55;cursor:pointer';
    edit.addEventListener('click', (e) => { e.stopPropagation(); renameNiche(name); });
    box.appendChild(edit);
    grid.appendChild(box);
  });
  const add = document.createElement('div'); add.className = 'niche-box add fade';
  add.innerHTML = '<div class="nb-plus">＋</div><div>Add niche</div>';
  add.addEventListener('click', addNicheFlow);
  grid.appendChild(add);
}
async function addNicheFlow() {
  const r = await askInput('New niche', 'Niche name (e.g. Celebrity, Horror, Documentary)'); if (!r) return;
  const name = r[0];
  const list = niches.map(n => typeof n === 'string' ? { name: n } : n);
  if (!list.some(n => n.name.toLowerCase() === name.toLowerCase())) { list.push({ name }); niches = list; await window.api.nichesSave(list); await load(); }
}
if ($('addNicheBtn')) $('addNicheBtn').addEventListener('click', addNicheFlow);
function currentNicheObj() { return niches.map(n => typeof n === 'string' ? { name: n } : n).find(n => n.name === currentNiche) || { name: currentNiche }; }

function renderNiche() {
  $('niche-name').textContent = currentNiche;
  const inNiche = content.filter(c => (c.category || '').toLowerCase() === (currentNiche || '').toLowerCase());
  // performance
  const up = inNiche.filter(c => c.status === 'Uploaded');
  $('np-up').textContent = up.length;
  $('np-rem').textContent = inNiche.length - up.length;
  $('np-week').textContent = up.filter(c => isThisWeek(c.uploadedDate)).length;
  // channels of this niche
  const chs = channels.filter(c => (c.niche || '').toLowerCase() === (currentNiche || '').toLowerCase());
  $('np-ch').textContent = chs.length;
  const box = $('niche-channels');
  box.innerHTML = chs.length ? '' : '<div class="empty" style="padding:14px">No channels in this niche yet — "＋ Add channel".</div>';
  chs.forEach(c => {
    const d = document.createElement('div'); d.className = 'row'; d.style.cursor = 'pointer'; d.title = 'Edit channel';
    const n = content.filter(x => x.channel === c.number && x.status === 'Uploaded').length;
    d.innerHTML = `<span class="cnum">${esc(c.number)}</span><div class="rt"><div class="ti">${esc(c.name)}</div><div class="ts">${n} uploaded${c.link ? ' · link set' : ' · no link — click to add'}</div></div>`;
    d.addEventListener('click', () => editChannel(c));
    if (c.link && /^https?:\/\//i.test(c.link)) { const a = document.createElement('span'); a.className = 'lnk'; a.textContent = '🔗 Open'; a.addEventListener('click', (e) => { e.stopPropagation(); window.api.openLink(c.link); }); d.appendChild(a); }
    const del = document.createElement('button'); del.className = 'btn danger sm'; del.textContent = 'Remove';
    del.addEventListener('click', async (e) => { e.stopPropagation(); const gi = channels.indexOf(c); if (gi >= 0) channels.splice(gi, 1); await window.api.channelsSave(channels); await load(); });
    d.appendChild(del); box.appendChild(d);
  });
  // attached sheet
  $('nicheSheetUrl').value = currentNicheObj().sheetUrl || '';
  $('nicheSheetStatus').textContent = '';
  // local folder
  if ($('nicheFolderPath')) $('nicheFolderPath').value = currentNicheObj().folderPath || '';
  if ($('nicheFolderStatus')) $('nicheFolderStatus').textContent = '';
  // content sheet
  let items = inNiche.slice().reverse();
  if (nicheQuery) items = items.filter(c => (c.title + ' ' + (c.assignee || '')).toLowerCase().includes(nicheQuery));
  buildSheet($('niche-sheet'), items);
}
$('nicheNewBtn').addEventListener('click', () => openModal({ category: currentNiche }));
$('nicheSearch').addEventListener('input', e => { nicheQuery = e.target.value.toLowerCase().trim(); if (currentNiche) renderNiche(); });
$('nicheSheetSync').addEventListener('click', async () => {
  const url = $('nicheSheetUrl').value.trim(); if (!url) return;
  // save sheet url on the niche
  const list = niches.map(n => typeof n === 'string' ? { name: n } : { ...n });
  const n = list.find(x => x.name === currentNiche); if (n) n.sheetUrl = url;
  niches = list; await window.api.nichesSave(list);
  $('nicheSheetStatus').textContent = '⏳ Importing from sheet…';
  const res = await window.api.importFromUrl(url);
  if (!res.ok) { $('nicheSheetStatus').textContent = '❌ ' + res.error; return; }
  impHeaders = res.headers; impRows = res.rows; impLinks = res.links || [];
  const map = autoMap();
  if (!map.title) { $('nicheSheetStatus').textContent = '❌ Could not auto-detect columns.'; return; }
  const items = buildItems(map).map(it => ({ ...it, category: currentNiche }));
  // replace only this niche's content
  const others = content.filter(c => (c.category || '').toLowerCase() !== (currentNiche || '').toLowerCase());
  await window.api.importAdd({ items: [], replace: true });
  for (const it of others) await window.api.contentSave(it);
  for (const it of items) await window.api.contentSave(it);
  $('nicheSheetStatus').textContent = `✓ Imported ${items.length} videos.`;
  await load();
});
// ---- Local folder import (videos on this PC → content in this niche) ----
async function saveNicheFolderPath(p) {
  const list = niches.map(n => typeof n === 'string' ? { name: n } : { ...n });
  const n = list.find(x => x.name === currentNiche); if (n) n.folderPath = p;
  niches = list; try { await window.api.nichesSave(list); } catch {}
}
if ($('nicheFolderPick')) $('nicheFolderPick').addEventListener('click', async () => {
  const p = await window.api.pickVideosFolder();
  if (p) { $('nicheFolderPath').value = p; await saveNicheFolderPath(p); }
});
if ($('nicheFolderImport')) $('nicheFolderImport').addEventListener('click', async () => {
  const dir = $('nicheFolderPath').value.trim(); const st = $('nicheFolderStatus');
  if (!dir) { st.textContent = '❌ Pick a folder (or paste its full path) first.'; return; }
  const spread = $('nicheFolderSpread').checked;
  await saveNicheFolderPath(dir);
  st.textContent = '⏳ Scanning folder…';
  let res; try { res = await window.api.folderScan(dir, currentNiche, spread); } catch (e) { res = { ok: false, error: e.message }; }
  if (!res || !res.ok) { st.textContent = '❌ ' + ((res && res.error) || 'Import failed.'); return; }
  if (!res.total) { st.textContent = 'ℹ No video files found in that folder.'; return; }
  let msg = `✓ Imported ${res.added} video${res.added !== 1 ? 's' : ''}`;
  if (res.skipped) msg += ` · ${res.skipped} already added`;
  if (spread && res.channels) msg += ` · spread across ${res.channels} channel${res.channels !== 1 ? 's' : ''}`;
  else if (spread && !res.channels) msg += ` · (no channels in this niche yet to spread across)`;
  st.textContent = msg;
  await load();
});

function renderMemberNav() {
  const box = $('memberNav'); box.innerHTML = '';
  team.forEach(m => {
    const b = document.createElement('button'); b.textContent = '👤 ' + m.name; b.dataset.member = m.name;
    b.addEventListener('click', () => {
      setActive(b); currentMember = m.name; $('pageTitle').textContent = m.name;
      showView('view-member'); renderMember();
    });
    box.appendChild(b);
  });
}

// ---- dashboard sheet (table view) ----
function populateFilters() {
  const fc = $('fltChannel'), fn = $('fltNiche'); const curC = fc.value, curN = fn.value;
  const opt = (sel, v, l) => { const o = document.createElement('option'); o.value = v; o.textContent = l; sel.appendChild(o); };
  fc.innerHTML = ''; fn.innerHTML = '';
  opt(fc, '', 'All channels'); channels.forEach(c => opt(fc, c.number, `${c.number} · ${c.name}`)); opt(fc, '__none', '(no channel)');
  opt(fn, '', 'All niches'); [...new Set(content.map(c => c.category).filter(Boolean))].sort().forEach(n => opt(fn, n, n));
  fc.value = curC || ''; fn.value = curN || '';
}
function linkCell(url, label) {
  if (url && /^https?:\/\//i.test(url)) {
    const a = document.createElement('span'); a.className = 'lnk'; a.textContent = label;
    a.addEventListener('click', () => window.api.openLink(url)); return a;
  }
  const s = document.createElement('span'); s.className = 'nolnk'; s.textContent = '—'; return s;
}
function videoCell(c) {
  const wrap = document.createElement('div'); wrap.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap';
  const link = c.driveLink || c.url;
  if (link && /^https?:\/\//i.test(link)) {
    wrap.appendChild(linkCell(link, '▶ Open'));
    if (c.localFile) {
      const f = document.createElement('span'); f.className = 'lnk'; f.textContent = '📂 In tool'; f.title = c.localFile;
      f.addEventListener('click', () => window.api.openPath(c.localFile)); wrap.appendChild(f);
    } else {
      const d = document.createElement('span'); d.className = 'lnk'; d.textContent = '⬇ Download';
      d.addEventListener('click', async () => { d.textContent = '⏳...'; const r = await window.api.videoDownload(c.id); if (!r.ok) { d.textContent = '⬇ retry'; alert(r.error); return; } await load(); });
      wrap.appendChild(d);
    }
    // Upload to YouTube (browser automation) — only when the video is downloaded locally
    if (c.localFile) {
      if (c.youtubeLink) {
        wrap.appendChild(linkCell(c.youtubeLink, '▶ On YouTube'));
      } else {
        const u = document.createElement('span'); u.className = 'lnk'; u.textContent = '⬆ Upload';
        u.addEventListener('click', async () => {
          const vis = appCfg.uploadVisibility || 'public';
          if (!confirm(`Upload this video to YouTube as ${vis.toUpperCase()}?\n\nA browser will open — sign in / verify if it asks.`)) return;
          u.textContent = '⏳ Uploading…';
          const r = await window.api.ytUpload(c.id, vis);
          if (!r.ok) { u.textContent = '⬆ retry'; notify('Upload failed', c.title); alert('Upload fail:\n' + r.error); return; }
          notify('Upload finished', c.title);
          alert('Uploaded ✓' + (r.link ? '\nLink: ' + r.link : ''));
          await load();
        });
        wrap.appendChild(u);
      }
    }
  } else { const s = document.createElement('span'); s.className = 'nolnk'; s.textContent = '—'; wrap.appendChild(s); }
  return wrap;
}
function channelCell(c) {
  const sel = document.createElement('select');
  const none = document.createElement('option'); none.value = ''; none.textContent = '— none —'; sel.appendChild(none);
  const chs = channels.filter(ch => (ch.niche || '').toLowerCase() === (c.category || '').toLowerCase());
  chs.forEach(ch => {
    const o = document.createElement('option'); o.value = ch.number;
    o.textContent = (ch.name && ch.name !== ch.number) ? `${ch.number} · ${ch.name}` : ch.number;
    if (ch.number === c.channel) o.selected = true; sel.appendChild(o);
  });
  // show an unknown/stale saved value too, so it isn't silently lost
  if (c.channel && !chs.some(ch => ch.number === c.channel)) {
    const o = document.createElement('option'); o.value = c.channel; o.textContent = c.channel; o.selected = true; sel.appendChild(o);
  }
  const add = document.createElement('option'); add.value = '__add'; add.textContent = '＋ Add channel…'; sel.appendChild(add);
  sel.addEventListener('change', async e => {
    const v = e.target.value;
    if (v === '__add') {
      sel.value = c.channel || '';
      const niche = c.category || currentNiche;
      if (!niche) { alert('This video has no niche set.'); return; }
      const r = await askInput('New channel in ' + niche, 'Channel number (e.g. Channel 1)', 'Channel name (optional)', 'Channel link (optional)');
      if (!r) return;
      const number = r[0], name = r[1] || r[0], link = r[2] || '';
      channels.push({ number, name, link, niche });
      await window.api.channelsSave(channels);
      c.channel = number; c.status = 'Uploaded'; if (!c.uploadedDate) c.uploadedDate = new Date().toISOString();
      await window.api.contentSave(c); await load(); return;
    }
    c.channel = v;
    if (v) { c.status = 'Uploaded'; if (!c.uploadedDate) c.uploadedDate = new Date().toISOString(); }
    await window.api.contentSave(c); await load();
  });
  return sel;
}
function buildSheet(t, items) {
  t.innerHTML = '<thead><tr><th>Title</th><th>Video</th><th>Thumbnail</th><th>Metadata</th><th>Status</th><th>Channel</th></tr></thead>';
  const tb = document.createElement('tbody');
  if (!items.length) {
    const tr = document.createElement('tr'), td = document.createElement('td');
    td.colSpan = 6; td.className = 'empty'; td.textContent = 'No content — attach a sheet or "＋ New content".';
    tr.appendChild(td); tb.appendChild(tr);
  } else items.forEach(c => {
    const tr = document.createElement('tr');
    const tdT = document.createElement('td'); tdT.className = 'ttl'; tdT.textContent = c.title; tdT.style.cursor = 'pointer'; tdT.title = 'Edit'; tdT.addEventListener('click', () => openModal(c)); tr.appendChild(tdT);
    const tdV = document.createElement('td'); tdV.appendChild(videoCell(c)); tr.appendChild(tdV);
    const tdTh = document.createElement('td'); tdTh.appendChild(linkCell(c.thumbLink, '🖼 Thumbnail')); tr.appendChild(tdTh);
    const tdM = document.createElement('td'); tdM.appendChild(linkCell(c.metaLink, '📄 Metadata')); tr.appendChild(tdM);
    const tdS = document.createElement('td'); const sel = document.createElement('select');
    STATUSES.forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; if (s === c.status) o.selected = true; sel.appendChild(o); });
    sel.addEventListener('change', async e => { c.status = e.target.value; if (c.status === 'Uploaded' && !c.uploadedDate) c.uploadedDate = new Date().toISOString(); await window.api.contentSave(c); await load(); });
    tdS.appendChild(sel); tr.appendChild(tdS);
    const tdCh = document.createElement('td'); tdCh.appendChild(channelCell(c)); tr.appendChild(tdCh);
    tb.appendChild(tr);
  });
  t.appendChild(tb);
}
function renderSheet() {
  populateFilters();
  const fc = $('fltChannel').value, fn = $('fltNiche').value;
  let items = content.slice().reverse();
  if (fc === '__none') items = items.filter(c => !c.channel);
  else if (fc) items = items.filter(c => c.channel === fc);
  if (fn) items = items.filter(c => (c.category || '') === fn);
  if (query) items = items.filter(c => (c.title + ' ' + (c.category || '') + ' ' + (c.assignee || '')).toLowerCase().includes(query));
  $('dashCount').textContent = `${items.length} items`;
  buildSheet($('sheet'), items);
}

// ---- (legacy cards — unused) ----
function isThisWeek(iso) { if (!iso) return false; const d = new Date(iso), n = new Date(); return (n - d)/86400000 <= 7 && d <= n; }
function dayName(iso) { try { return new Date(iso).toLocaleDateString('en', { weekday:'short' }); } catch { return ''; } }

function renderDashboard() {
  const uploaded = content.filter(c => c.status === 'Uploaded');
  const ready = content.filter(c => c.status === 'Ready');
  const week = uploaded.filter(c => isThisWeek(c.uploadedDate));
  const cats = [...new Set(content.map(c => c.category).filter(Boolean))];
  $('s-total').textContent = uploaded.length; $('s-ready').textContent = ready.length;
  $('s-week').textContent = week.length; $('s-cat').textContent = cats.length;

  $('ready-count').textContent = ready.length ? ready.length + ' videos' : '';
  $('ready-list').innerHTML = ready.length ? '' : '<div class="empty">No videos ready.</div>';
  ready.forEach(c => {
    const d = document.createElement('div'); d.className = 'row';
    d.innerHTML = `<div class="thumb">${c.type === 'Short' ? '9:16' : '16:9'}</div>
      <div class="rt"><div class="ti">${esc(c.title)}</div><div class="ts">${esc(c.category || '—')} · ${esc(c.assignee || '—')}</div></div>
      <span class="av">${esc(initials(c.assignee))}</span>`;
    const b = document.createElement('button'); b.className = 'up'; b.textContent = 'Upload';
    b.addEventListener('click', () => openModal(c, 'Uploaded')); d.appendChild(b); $('ready-list').appendChild(d);
  });

  $('week-count').textContent = week.length ? week.length + ' uploaded' : '';
  $('week-list').innerHTML = week.length ? '' : '<div class="empty">Nothing uploaded this week.</div>';
  week.sort((a,b) => new Date(b.uploadedDate) - new Date(a.uploadedDate)).forEach(c => {
    const ch = channels.find(x => x.number === c.channel);
    const d = document.createElement('div'); d.className = 'row';
    d.innerHTML = `<div class="rt"><div class="ti">${esc(c.title)}</div><div class="ts">${esc(c.category || '—')} · by ${esc(c.assignee || '—')}</div></div>
      <span class="chip">${esc(c.channel || '—')}${ch ? ' ' + esc(ch.name) : ''}</span><span class="day">${dayName(c.uploadedDate)}</span>`;
    $('week-list').appendChild(d);
  });

  const counts = {}; content.forEach(c => { if (c.category) counts[c.category] = (counts[c.category]||0)+1; });
  const max = Math.max(1, ...Object.values(counts));
  const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
  $('cat-list').innerHTML = sorted.length ? '' : '<div class="empty">No niches yet — they appear as you add content.</div>';
  sorted.forEach(([cat, n]) => {
    const el = document.createElement('div'); el.className = 'cat';
    el.innerHTML = `<span class="cn">${esc(cat)}</span><span class="bar"><i style="width:${Math.round(n/max*100)}%;background:${catColor(cat)}"></i></span><span class="cc">${n}</span>`;
    $('cat-list').appendChild(el);
  });

  $('ch-count').textContent = channels.length ? channels.length + ' active' : '';
  $('ch-list').innerHTML = channels.length ? '' : '<div class="empty">No channels.</div>';
  channels.forEach(c => { const el = document.createElement('div'); el.className = 'ch'; el.innerHTML = `<span class="cnum">${esc(c.number)}</span> ${esc(c.name)}`; $('ch-list').appendChild(el); });
}

// ---- row builder (reused) ----
function contentRow(c) {
  const d = document.createElement('div'); d.className = 'row'; d.style.cursor = 'pointer';
  const link = c.driveLink || c.url || '';
  const openVideo = (e) => { e.stopPropagation(); if (link) window.api.openLink(link); };

  // thumbnail (image if available, else ratio placeholder)
  let thumb;
  const placeholder = () => { const p = document.createElement('div'); p.className = 'thumb'; p.textContent = c.type === 'Short' ? '9:16' : '16:9'; if (link) p.addEventListener('click', openVideo); return p; };
  if (c.thumbnail) {
    thumb = document.createElement('img'); thumb.className = 'thumb thumbimg'; thumb.src = c.thumbnail;
    thumb.referrerPolicy = 'no-referrer'; thumb.title = 'Open video';
    thumb.addEventListener('click', openVideo);
    thumb.addEventListener('error', () => thumb.replaceWith(placeholder()));
  } else thumb = placeholder();
  d.appendChild(thumb);

  const info = document.createElement('div'); info.className = 'rt';
  info.innerHTML = `<div class="ti">${esc(c.title)}</div><div class="ts">${esc(c.assignee || 'unassigned')}${c.channel ? ' · ' + esc(c.channel) : ''}</div>`;
  d.appendChild(info);

  const tag = document.createElement('span'); tag.className = 'tag'; tag.style.color = catColor(c.category); tag.textContent = c.category || '—';
  d.appendChild(tag);

  if (link) { const a = document.createElement('span'); a.className = 'openlink'; a.textContent = '▶ Open'; a.addEventListener('click', openVideo); d.appendChild(a); }

  const sel = document.createElement('select');
  STATUSES.forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; if (s === c.status) o.selected = true; sel.appendChild(o); });
  sel.addEventListener('click', e => e.stopPropagation());
  sel.addEventListener('change', async e => {
    c.status = e.target.value;
    if (c.status === 'Uploaded' && !c.uploadedDate) c.uploadedDate = new Date().toISOString();
    await window.api.contentSave(c); await load();
  });
  d.appendChild(sel);
  d.addEventListener('click', () => openModal(c));
  return d;
}

// ---- all content ----
function renderContentList() {
  const box = $('content-list');
  let items = content.slice().reverse();
  if (query) items = items.filter(c => (c.title + ' ' + (c.category||'') + ' ' + (c.assignee||'')).toLowerCase().includes(query));
  if (!items.length) { box.innerHTML = '<div class="empty">No content. Add with "＋ New content".</div>'; return; }
  box.innerHTML = ''; items.forEach(c => box.appendChild(contentRow(c)));
}

// ---- member view ----
function renderMember() {
  $('member-name').textContent = currentMember || '';
  const box = $('member-list');
  const items = content.filter(c => (c.assignee || '') === currentMember).reverse();
  if (!items.length) { box.innerHTML = '<div class="empty">No content for this member — add with "＋ Add for this member".</div>'; return; }
  box.innerHTML = ''; items.forEach(c => box.appendChild(contentRow(c)));
}
$('memberNewBtn').addEventListener('click', () => openModal({ assignee: currentMember }));

// ---- channels (niche-based) ----
// ---- Channels tab: flat list + performance ----
function openChannelModal(idx) {
  if (!niches.length) { alert('Add a niche first in the Niches tab.'); return; }
  const editing = (idx != null && channels[idx]);
  const ch = editing ? channels[idx] : {};
  $('chTitle').textContent = editing ? 'Edit channel' : 'New channel';
  $('ch-idx').value = editing ? String(idx) : '';
  const nsel = $('ch-niche'); nsel.innerHTML = '';
  niches.map(nicheName).forEach(nn => { const o = document.createElement('option'); o.value = nn; o.textContent = nn; if (nn === ch.niche) o.selected = true; nsel.appendChild(o); });
  $('ch-name').value = ch.name || '';
  $('ch-subs').value = ch.subscribers || '';
  $('ch-link').value = ch.link || '';
  // schedule
  const s = ch.schedule || {};
  $('ch-sched-on').checked = !!s.enabled;
  $('ch-sched-fields').style.display = s.enabled ? 'block' : 'none';
  $('ch-sched-time').value = s.time || '18:00';
  $('ch-sched-vis').value = s.visibility || 'public';
  const days = Array.isArray(s.days) ? s.days : [1, 2, 3, 4, 5];
  document.querySelectorAll('#ch-sched-days button').forEach(b => b.classList.toggle('on', days.includes(Number(b.dataset.d))));
  $('ch-del').style.display = editing ? 'inline-block' : 'none';
  $('chBg').classList.add('on');
  setTimeout(() => $('ch-name').focus(), 40);
}
// schedule UI interactions
if ($('ch-sched-on')) $('ch-sched-on').addEventListener('change', e => { $('ch-sched-fields').style.display = e.target.checked ? 'block' : 'none'; });
document.querySelectorAll('#ch-sched-days button').forEach(b => b.addEventListener('click', () => b.classList.toggle('on')));
function readScheduleFromModal() {
  const days = [...document.querySelectorAll('#ch-sched-days button.on')].map(b => Number(b.dataset.d));
  return { enabled: $('ch-sched-on').checked, time: $('ch-sched-time').value || '18:00', visibility: $('ch-sched-vis').value, days };
}
$('addChannelBtn').addEventListener('click', () => openChannelModal(null));
// YouTube browser-automation connect
function setYtStatus(txt, ok) { const s = $('ytStatus'); if (s) { s.textContent = txt; s.style.color = ok ? 'var(--green)' : 'var(--muted)'; } }
if ($('ytConnectBtn')) $('ytConnectBtn').addEventListener('click', async () => {
  setYtStatus('Opening browser… sign in', false);
  const r = await window.api.ytConnect();
  if (r.ok && r.signedIn) setYtStatus('Connected ✓', true);
  else setYtStatus(r.error || r.note || 'Could not connect', false);
});
async function refreshYtStatus() {
  if (!$('ytStatus')) return;
  const r = await window.api.ytStatus().catch(() => null);
  if (r && r.signedIn) setYtStatus('Connected ✓', true);
}
if (window.api && window.api.onYtStep) window.api.onYtStep(d => { if (d && d.step) setYtStatus(d.step, false); });
if (window.api && window.api.onContentChanged) window.api.onContentChanged(() => { load(); });
$('ch-cancel').addEventListener('click', () => $('chBg').classList.remove('on'));
$('chBg').addEventListener('click', e => { if (e.target === $('chBg')) $('chBg').classList.remove('on'); });
$('ch-del').addEventListener('click', async () => {
  const idx = $('ch-idx').value; if (idx === '') return;
  channels.splice(Number(idx), 1); await window.api.channelsSave(channels); $('chBg').classList.remove('on'); await load();
});
$('ch-save').addEventListener('click', async () => {
  const name = $('ch-name').value.trim(); if (!name) { $('ch-name').focus(); return; }
  const niche = $('ch-niche').value;
  const subscribers = $('ch-subs').value.trim();
  const link = $('ch-link').value.trim();
  const idx = $('ch-idx').value;
  const schedule = readScheduleFromModal();
  if (idx === '') {
    const number = 'Channel ' + (channels.length + 1);
    channels.push({ number, name, niche, link, subscribers, schedule });
  } else {
    const ch = channels[Number(idx)];
    ch.name = name; ch.niche = niche; ch.subscribers = subscribers; ch.link = link; ch.schedule = schedule;
  }
  await window.api.channelsSave(channels); $('chBg').classList.remove('on'); await load();
});
function renderChannels() {
  const area = $('channels-list'); if (!area) return;
  area.innerHTML = '';
  if (!channels.length) {
    area.innerHTML = '<div class="card"><div class="empty">No channels yet. Click “＋ Add channel” to add your first one.</div></div>';
  } else {
    const grid = document.createElement('div'); grid.className = 'ch-grid';
    channels.forEach((ch, i) => {
      const up = content.filter(c => c.channel === ch.number && c.status === 'Uploaded').length;
      const card = document.createElement('div'); card.className = 'ch-card';
      card.innerHTML =
        `<div class="ch-top"><span class="cnum">${esc(ch.number)}</span><span class="ch-nicheb">${esc(ch.niche || '—')}</span></div>` +
        `<div class="ch-title">${esc(ch.name || ch.number)}</div>` +
        `<div class="ch-stats"><div><div class="csv">${up}</div><div class="csl">videos uploaded</div></div>` +
        `<div><div class="csv">${ch.subscribers ? esc(ch.subscribers) : '—'}</div><div class="csl">subscribers</div></div></div>` +
        scheduleTag(ch.schedule) +
        `<div class="ch-actions"></div>`;
      const act = card.querySelector('.ch-actions');
      if (ch.link && /^https?:\/\//i.test(ch.link)) { const a = document.createElement('span'); a.className = 'lnk'; a.textContent = '🔗 Open channel'; a.addEventListener('click', () => window.api.openLink(ch.link)); act.appendChild(a); }
      const ed = document.createElement('button'); ed.className = 'btn sm'; ed.textContent = 'Edit'; ed.addEventListener('click', () => openChannelModal(i)); act.appendChild(ed);
      grid.appendChild(card);
    });
    area.appendChild(grid);
  }
  area.appendChild(autoUploadCard());
}
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function scheduleTag(s) {
  if (!s || !s.enabled) return '';
  const days = Array.isArray(s.days) && s.days.length ? (s.days.length === 7 ? 'Every day' : s.days.slice().sort().map(d => DAY_NAMES[d]).join(', ')) : 'Every day';
  return `<span class="ch-sched-tag">📅 Auto-upload · ${days} · ${esc(s.time || '')} · ${esc(s.visibility || 'public')}</span>`;
}
function autoUploadCard() {
  const c = document.createElement('div'); c.className = 'card';
  c.innerHTML =
    `<h3>Auto-upload <span class="mini">· planned</span></h3>` +
    `<p style="font-size:12.5px;color:var(--muted);line-height:1.6;margin:0 0 12px">How it will work — the tool does the whole pipeline for you:</p>` +
    `<div class="flow">` +
    `<div class="flow-step"><span class="fnum">1</span><div><b>Content lands in the cloud</b><div class="fsub">Your team's finished videos, thumbnails & metadata are generated and stored in the cloud, organised by niche.</div></div></div>` +
    `<div class="flow-step"><span class="fnum">2</span><div><b>Tool pulls it into the niche folder</b><div class="fsub">You point the tool at a niche's cloud folder; it downloads each video into that niche's local folder automatically.</div></div></div>` +
    `<div class="flow-step"><span class="fnum">3</span><div><b>Connect each channel once</b><div class="fsub">You log into each YouTube channel one time inside the tool. After that it stays connected.</div></div></div>` +
    `<div class="flow-step"><span class="fnum">4</span><div><b>Tool uploads on its own</b><div class="fsub">It uploads each video to the right channel and fills the title, thumbnail, description & tags — then marks it "Uploaded".</div></div></div>` +
    `</div>`;
  return c;
}
async function editChannel(c) {
  const r = await askInput('Edit channel', 'Channel number', 'Channel name', 'Channel link (YouTube)', [c.number, c.name, c.link || '']);
  if (!r) return;
  c.number = r[0]; c.name = r[1] || r[0]; c.link = r[2] || '';
  await window.api.channelsSave(channels); await load();
}
$('addChBtn').addEventListener('click', async () => {
  if (!currentNiche) { alert('Open a niche first.'); return; }
  const r = await askInput('New channel in ' + currentNiche, 'Channel number (e.g. CH-01)', 'Channel name', 'Channel link (optional)'); if (!r) return;
  const number = r[0], name = r[1] || r[0], link = r[2] || '';
  channels.push({ number, name, link, niche: currentNiche }); await window.api.channelsSave(channels); await load();
});

// ---- team ----
function renderTeam() {
  const box = $('team-list');
  box.innerHTML = team.length ? '' : '<div class="empty">No members. Add with "＋ Add member".</div>';
  team.forEach((m, i) => {
    const d = document.createElement('div'); d.className = 'row';
    const n = content.filter(c => (c.assignee||'') === m.name).length;
    d.innerHTML = `<span class="av">${esc(initials(m.name))}</span><div class="rt"><div class="ti">${esc(m.name)}</div><div class="ts">${n} content items</div></div>`;
    const del = document.createElement('button'); del.className = 'btn danger sm'; del.textContent = 'Remove';
    del.addEventListener('click', async () => { team.splice(i,1); await window.api.teamSave(team); await load(); });
    d.appendChild(del); box.appendChild(d);
  });
}
$('addMemberBtn').addEventListener('click', async () => {
  const r = await askInput('New member', 'Member name'); if (!r) return;
  const name = r[0];
  if (!team.some(m => m.name === name)) { team.push({ name }); await window.api.teamSave(team); await load(); }
});

// ---- modal ----
function fillSelect(sel, arr, current, blank) {
  sel.innerHTML = '';
  if (blank) { const o = document.createElement('option'); o.value = ''; o.textContent = blank; sel.appendChild(o); }
  arr.forEach(v => { const o = document.createElement('option'); o.value = v.value; o.textContent = v.label; if (v.value === current) o.selected = true; sel.appendChild(o); });
}
function openModal(item, presetStatus) {
  item = item || {};
  $('modalTitle').textContent = item.id ? 'Edit content' : 'New content';
  $('f-id').value = item.id || ''; $('f-title').value = item.title || '';
  $('f-category').value = item.category || appCfg.defaultNiche || ''; $('f-type').value = item.type || 'Long';
  $('f-assignee').value = item.assignee || '';
  fillSelect($('f-status'), STATUSES.map(s => ({ value:s, label:s })), presetStatus || item.status || 'Idea');
  fillSelect($('f-channel'), channels.map(c => ({ value:c.number, label:`${c.number} · ${c.name}` })), item.channel || '', '— none —');
  $('f-url').value = item.url || '';
  $('delBtn').style.display = item.id ? 'inline-block' : 'none';
  if (item.id) { $('driveBox').style.display = 'block'; renderDriveBox(item); }
  else { $('driveBox').style.display = 'none'; }
  $('modalBg').classList.add('on');
}
function renderDriveBox(item) {
  const thumb = $('driveThumb'), link = $('driveLinkA'), meta = $('driveMeta');
  if (item.driveLink) {
    link.href = '#'; link.textContent = 'Open on Drive ↗';
    link.onclick = (e) => { e.preventDefault(); window.api.openLink(item.driveLink); };
    if (item.thumbnail) { thumb.src = item.thumbnail; thumb.referrerPolicy = 'no-referrer'; thumb.style.display = 'block'; thumb.style.cursor = 'pointer'; thumb.onclick = () => window.api.openLink(item.driveLink); } else thumb.style.display = 'none';
    meta.textContent = [item.fileName, item.size ? Math.round(item.size/1048576) + ' MB' : '', item.mimeType].filter(Boolean).join(' · ');
    $('driveUploadBtn').textContent = '⬆ Re-upload';
  } else {
    link.textContent = ''; link.removeAttribute('href'); thumb.style.display = 'none'; meta.textContent = '';
    $('driveUploadBtn').textContent = '⬆ Upload video to Drive';
  }
}
$('driveUploadBtn').addEventListener('click', async () => {
  const id = $('f-id').value;
  if (!id) { alert('Save first, then upload to Drive.'); return; }
  const btn = $('driveUploadBtn'); btn.disabled = true; btn.textContent = '⏳ Uploading...';
  const r = await window.api.driveUploadForContent(id);
  btn.disabled = false;
  if (r.canceled) { renderDriveBox(content.find(c => c.id === id) || {}); return; }
  if (!r.ok) { $('driveMeta').textContent = '❌ ' + r.error; btn.textContent = '⬆ Retry'; return; }
  $('f-url').value = r.item.driveLink || '';
  renderDriveBox(r.item); await load();
});
function closeModal() { $('modalBg').classList.remove('on'); }
if ($('newBtn')) $('newBtn').addEventListener('click', () => openModal(currentMember ? { assignee: currentMember } : {}));
$('cancelBtn').addEventListener('click', closeModal);
$('modalBg').addEventListener('click', e => { if (e.target === $('modalBg')) closeModal(); });
$('saveBtn').addEventListener('click', async () => {
  const title = $('f-title').value.trim(); if (!title) { $('f-title').focus(); return; }
  const item = {
    id: $('f-id').value || undefined, title, category: $('f-category').value.trim(), type: $('f-type').value,
    assignee: $('f-assignee').value.trim(), status: $('f-status').value, channel: $('f-channel').value, url: $('f-url').value.trim()
  };
  if (item.status === 'Uploaded') { const ex = content.find(c => c.id === item.id); item.uploadedDate = (ex && ex.uploadedDate) || new Date().toISOString(); }
  await window.api.contentSave(item); closeModal(); await load();
});
$('delBtn').addEventListener('click', async () => {
  const id = $('f-id').value;
  if (id && confirm('Delete this content?')) { await window.api.contentDelete(id); closeModal(); await load(); }
});

// ---- search ----
if ($('search')) $('search').addEventListener('input', e => { query = e.target.value.toLowerCase().trim(); renderDashboardNiches(); });

// ---- settings + Google Drive ----
async function loadSettings() {
  const s = await window.api.settingsGet();
  $('dataPath').value = s.dataDir || '';
  if ($('userNameInput')) $('userNameInput').value = s.userName || '';
  if ($('userName')) $('userName').textContent = s.userName || 'Admin';
  $('driveClientId').value = s.driveClientId || '';
  $('driveClientSecret').value = s.driveClientSecret || '';
  // account + profile photo
  applyDp(s.userDp || '', s.userName || '');
  if ($('accEmail')) $('accEmail').textContent = s.licenseEmail || '(login off — testing)';
  if ($('accPc')) { try { $('accPc').textContent = navigator.userAgent.includes('Mac') ? 'Mac' : (navigator.userAgent.includes('Windows') ? 'Windows PC' : 'This PC'); } catch { $('accPc').textContent = 'This PC'; } }
  // api keys
  if ($('aiProvider')) $('aiProvider').value = s.aiProvider || 'openrouter';
  fillAiModels(s.aiProvider || 'openrouter', s.aiModel || '');
  if ($('aiKey')) $('aiKey').value = s.aiKey || '';
  if ($('ytApiKey')) $('ytApiKey').value = s.youtubeApiKey || '';
  // general options
  if ($('setVisibility')) $('setVisibility').value = s.uploadVisibility || 'public';
  if ($('setNotif')) $('setNotif').checked = !!s.notifications;
  if ($('setDefaultNiche')) {
    const sel = $('setDefaultNiche'); sel.innerHTML = '<option value="">— none —</option>';
    niches.map(nicheName).forEach(nn => { const o = document.createElement('option'); o.value = nn; o.textContent = nn; if (nn === s.defaultNiche) o.selected = true; sel.appendChild(o); });
  }
  // version
  try { if ($('appVersion')) $('appVersion').textContent = await window.api.appVersion(); } catch {}
  showZoom(s.uiZoom);
  updateQuota();
  updateDriveStatus(await window.api.driveStatus());
}
// display size (zoom)
function showZoom(z) { const el = $('zoomVal'); if (el) el.textContent = Math.round((Number(z) || 1.15) * 100) + '%'; }
if ($('zoomIn')) $('zoomIn').addEventListener('click', async () => showZoom(await window.api.uiZoom(0.1)));
if ($('zoomOut')) $('zoomOut').addEventListener('click', async () => showZoom(await window.api.uiZoom(-0.1)));
if ($('zoomReset')) $('zoomReset').addEventListener('click', async () => showZoom(await window.api.uiZoom(0, true)));
// general option handlers
if ($('setVisibility')) $('setVisibility').addEventListener('change', async e => { appCfg.uploadVisibility = e.target.value; await window.api.settingsSet({ uploadVisibility: e.target.value }); });
if ($('setNotif')) $('setNotif').addEventListener('change', async e => { appCfg.notifications = e.target.checked; await window.api.settingsSet({ notifications: e.target.checked }); if (e.target.checked) { try { Notification.requestPermission(); } catch {} } });
if ($('setDefaultNiche')) $('setDefaultNiche').addEventListener('change', async e => { appCfg.defaultNiche = e.target.value; await window.api.settingsSet({ defaultNiche: e.target.value }); });
if ($('resetDataBtn')) $('resetDataBtn').addEventListener('click', async () => {
  if (!confirm('Clear ALL data (niches, channels, content, team) on this PC? This cannot be undone.')) return;
  const r = await window.api.dataReset();
  if (r.ok) { currentNiche = null; currentMember = null; await load(); alert('All data cleared.'); }
  else alert('Reset failed: ' + (r.error || ''));
});
// MCP tab
async function loadMcp() {
  try {
    const cfg = await window.api.mcpConfig();
    if ($('mcpConfig')) $('mcpConfig').textContent = cfg;
  } catch (e) { if ($('mcpConfig')) $('mcpConfig').textContent = 'Could not load config: ' + e.message; }
}
if ($('mcpCopyBtn')) $('mcpCopyBtn').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('mcpConfig').textContent); $('mcpCopyBtn').textContent = 'Copied ✓'; setTimeout(() => $('mcpCopyBtn').textContent = 'Copy', 1500); } catch {}
});
// MCP "Add to <app>" buttons — copy config + show where to paste
document.querySelectorAll('.ai-add').forEach(b => b.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('mcpConfig').textContent); } catch {}
  const where = b.getAttribute('data-app') || '';
  const h = $('aiHint'); if (h) h.innerHTML = 'Config copied ✓ — paste it in: <b>' + where + '</b>, then save and restart the app.';
}));

// ---- profile photo (DP) ----
function applyDp(dataUrl, name) {
  const dp = $('accDp'); const logo = document.querySelector('.brand .logo'); const gl = document.querySelector('.gate-logo');
  const letter = (name || 'C').trim().charAt(0).toUpperCase() || 'C';
  [dp].forEach(el => { if (!el) return; if (dataUrl) { el.style.backgroundImage = `url('${dataUrl}')`; el.textContent = ''; } else { el.style.backgroundImage = ''; el.textContent = letter; } });
  if (logo) { if (dataUrl) { logo.style.backgroundImage = `url('${dataUrl}')`; logo.style.backgroundSize = 'cover'; logo.textContent = ''; } else { logo.style.backgroundImage = ''; logo.textContent = 'C'; } }
  if ($('dpRemove')) $('dpRemove').style.display = dataUrl ? 'inline-block' : 'none';
}
if ($('dpBtn')) $('dpBtn').addEventListener('click', () => {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => {
    const f = inp.files && inp.files[0]; if (!f) return;
    if (f.size > 3 * 1024 * 1024) { alert('Please choose an image under 3 MB.'); return; }
    const r = new FileReader();
    r.onload = async () => { const url = r.result; await window.api.settingsSet({ userDp: url }); applyDp(url, $('userNameInput') ? $('userNameInput').value : ''); };
    r.readAsDataURL(f);
  };
  inp.click();
});
if ($('dpRemove')) $('dpRemove').addEventListener('click', async () => { await window.api.settingsSet({ userDp: '' }); applyDp('', $('userNameInput') ? $('userNameInput').value : ''); });
// API keys save / test
// ---- AI model lists per provider (cheap/popular first) + custom option ----
const AI_MODELS = {
  openrouter: [
    'openai/gpt-4o-mini', 'openai/gpt-4.1-mini', 'openai/gpt-4.1-nano',
    'google/gemini-2.0-flash-001', 'google/gemini-2.0-flash-lite-001', 'google/gemini-flash-1.5', 'google/gemini-flash-1.5-8b',
    'anthropic/claude-3.5-haiku', 'anthropic/claude-3-haiku',
    'deepseek/deepseek-chat', 'deepseek/deepseek-r1',
    'meta-llama/llama-3.3-70b-instruct', 'meta-llama/llama-3.1-8b-instruct', 'mistralai/mistral-nemo', 'mistralai/mistral-7b-instruct',
    'qwen/qwen-2.5-7b-instruct', 'microsoft/phi-3-mini-128k-instruct',
    'google/gemini-2.0-flash-exp:free', 'meta-llama/llama-3.1-8b-instruct:free', 'deepseek/deepseek-r1:free'
  ],
  gemini: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-2.5-flash', 'gemini-1.5-pro'],
  openai: ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4.1-nano', 'o4-mini', 'gpt-4o', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-haiku-latest', 'claude-3-haiku-20240307', 'claude-3-5-sonnet-latest', 'claude-3-7-sonnet-latest']
};
function fillAiModels(provider, selected) {
  const sel = $('aiModelSel'), custom = $('aiModel'); if (!sel) return;
  const list = AI_MODELS[provider] || [];
  sel.innerHTML = list.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join('') + `<option value="__custom__">＋ Custom model…</option>`;
  const inList = selected && list.includes(selected);
  if (selected && !inList) { sel.value = '__custom__'; if (custom) { custom.hidden = false; custom.value = selected; } }
  else { sel.value = inList ? selected : (list[0] || '__custom__'); if (custom) { custom.hidden = true; custom.value = sel.value === '__custom__' ? '' : sel.value; } }
}
if ($('aiProvider')) $('aiProvider').addEventListener('change', e => fillAiModels(e.target.value, ''));
if ($('aiModelSel')) $('aiModelSel').addEventListener('change', e => {
  const custom = $('aiModel');
  if (e.target.value === '__custom__') { if (custom) { custom.hidden = false; custom.value = ''; custom.focus(); } }
  else { if (custom) { custom.hidden = true; custom.value = e.target.value; } }
});
function aiModelValue() { const sel = $('aiModelSel'), custom = $('aiModel'); if (sel && sel.value && sel.value !== '__custom__') return sel.value; return custom ? custom.value.trim() : ''; }
if ($('aiSaveBtn')) $('aiSaveBtn').addEventListener('click', async () => {
  await window.api.settingsSet({ aiProvider: $('aiProvider').value, aiModel: aiModelValue(), aiKey: $('aiKey').value.trim() });
  $('aiTestStatus').textContent = 'Saved ✓'; $('aiTestStatus').style.color = 'var(--green)';
});
if ($('aiTestBtn')) $('aiTestBtn').addEventListener('click', async () => {
  const st = $('aiTestStatus'); st.textContent = '⏳ Testing…'; st.style.color = 'var(--muted)';
  const r = await window.api.apiTest({ provider: $('aiProvider').value, key: $('aiKey').value.trim(), model: aiModelValue() });
  st.textContent = r.ok ? '✓ Key working' : ('❌ ' + (r.error || 'fail')); st.style.color = r.ok ? 'var(--green)' : 'var(--red)';
});
// YouTube Data API key save / help
if ($('ytApiSaveBtn')) $('ytApiSaveBtn').addEventListener('click', async () => {
  await window.api.settingsSet({ youtubeApiKey: $('ytApiKey').value.trim() });
  const st = $('ytApiStatus'); st.textContent = 'Saved ✓'; st.style.color = 'var(--green)';
  researchData = null; // force a fresh search next time
});
if ($('ytApiTestBtn')) $('ytApiTestBtn').addEventListener('click', async () => {
  const st = $('ytApiStatus'); st.textContent = '⏳ Testing…'; st.style.color = 'var(--muted)';
  await window.api.settingsSet({ youtubeApiKey: $('ytApiKey').value.trim() }); // save first so test uses current key
  const r = await window.api.ytTestKey();
  st.textContent = r.ok ? '✓ Key working' : ('❌ ' + (r.error || 'fail')); st.style.color = r.ok ? 'var(--green)' : 'var(--red)';
  updateQuota();
});
if ($('ytApiHelpBtn')) $('ytApiHelpBtn').addEventListener('click', () => {
  window.api.openLink('https://console.cloud.google.com/apis/library/youtube.googleapis.com');
  const st = $('ytApiStatus'); st.textContent = 'Opened Google Cloud — enable "YouTube Data API v3", then Credentials → Create API key.'; st.style.color = 'var(--muted)';
});
// sign out
if ($('signOutBtn')) $('signOutBtn').addEventListener('click', async () => {
  await window.api.authLogout(); location.reload();
});
if ($('userNameInput')) $('userNameInput').addEventListener('change', async e => {
  const name = e.target.value.trim();
  await window.api.settingsSet({ userName: name });
  if ($('userName')) $('userName').textContent = name || 'Admin';
});
function updateDriveStatus(st) {
  const el = $('driveStatus');
  el.textContent = st.connected ? '● Connected' : (st.hasCreds ? '○ Keys saved — connect' : '○ Not set up');
  el.style.color = st.connected ? 'var(--green)' : 'var(--muted)';
  $('driveDisconnectBtn').style.display = st.connected ? 'inline-block' : 'none';
}
$('pickFolderBtn').addEventListener('click', async () => { const d = await window.api.pickDataFolder(); if (d) { $('dataPath').value = d; await load(); } });
$('driveSaveBtn').addEventListener('click', async () => {
  const st = await window.api.driveSaveCreds($('driveClientId').value.trim(), $('driveClientSecret').value.trim());
  updateDriveStatus(st);
});
$('driveConnectBtn').addEventListener('click', async () => {
  await window.api.driveSaveCreds($('driveClientId').value.trim(), $('driveClientSecret').value.trim());
  $('driveStatus').textContent = '⏳ Browser will open — authorize…'; $('driveStatus').style.color = 'var(--muted)';
  const r = await window.api.driveConnect();
  if (!r.ok) { $('driveStatus').textContent = '❌ ' + r.error; $('driveStatus').style.color = 'var(--red)'; return; }
  updateDriveStatus(r.status);
});
$('driveDisconnectBtn').addEventListener('click', async () => { updateDriveStatus(await window.api.driveDisconnect()); });

// ---- IMPORT from sheet ----
const IMPORT_FIELDS = [
  { key:'title', label:'Title', kw:['title','name','content','subject','heading'] },
  { key:'category', label:'Category / Niche', kw:['category','niche','topic','genre'] },
  { key:'status', label:'Status', kw:['status','stage','state'] },
  { key:'assignee', label:'Assigned to', kw:['assignee','assigned','owner','editor','member'] },
  { key:'channel', label:'Channel', kw:['channel'] },
  { key:'driveLink', label:'Video / Drive link', kw:['drive link','video link','drive','video url','mp4','video'] },
  { key:'thumbLink', label:'Thumbnail link', kw:['thumbnail','thumb','cover','image'] },
  { key:'metaLink', label:'Metadata link', kw:['metadata','meta','json','info'] },
  { key:'type', label:'Type', kw:['type','format'] }
];
let impHeaders = [], impRows = [], impLinks = [];

function driveThumbFromLink(link) {
  const m = String(link).match(/\/d\/([a-zA-Z0-9-_]+)/) || String(link).match(/[?&]id=([a-zA-Z0-9-_]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w320` : '';
}
function normStatus(v) {
  const s = (v || '').toString().trim().toLowerCase(); if (!s) return '';
  if (/(upload|publish|done|live|posted)/.test(s)) return 'Uploaded';
  if (/ready/.test(s)) return 'Ready';
  const hit = STATUSES.find(x => x.toLowerCase() === s); return hit || 'Idea';
}
function autoMatch(kw) { return impHeaders.find(h => kw.some(k => h.toLowerCase().includes(k))) || ''; }

// Smart auto-mapping: each column goes to ONE field, exact/word matches win over
// substrings, and earlier keywords rank higher (so "Video Title" -> title, "Video" -> driveLink)
function hdrScore(h, kw) {
  const hl = String(h).toLowerCase().trim(); let best = 0;
  kw.forEach((k, idx) => {
    const kl = String(k).toLowerCase(); const prio = kw.length - idx;
    const re = new RegExp('\\b' + kl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
    let s = 0;
    if (hl === kl) s = 300 + prio;
    else if (re.test(hl)) s = 200 + prio;
    else if (hl.includes(kl)) s = 100 + prio;
    if (s > best) best = s;
  });
  return best;
}
function autoMap() {
  const used = new Set(); const map = {};
  IMPORT_FIELDS.forEach(f => {
    let bh = '', bs = 0;
    impHeaders.forEach(h => { if (used.has(h)) return; const s = hdrScore(h, f.kw); if (s > bs) { bs = s; bh = h; } });
    map[f.key] = bh; if (bh) used.add(bh);
  });
  return map;
}

function openImport() {
  $('impUrl').value = ''; $('impStatus').textContent = ''; $('impMap').style.display = 'none';
  $('impDo').style.display = 'none'; impHeaders = []; impRows = [];
  $('importBg').classList.add('on');
}
function renderMapping() {
  $('impMap').style.display = 'block'; $('impDo').style.display = 'inline-block';
  $('impCount').textContent = `(${impRows.length} rows)`;
  const box = $('impMapRows'); box.innerHTML = '';
  const amap = autoMap();
  IMPORT_FIELDS.forEach(f => {
    const auto = amap[f.key];
    const row = document.createElement('div'); row.className = 'fld';
    const sel = document.createElement('select'); sel.id = 'map-' + f.key; sel.style.width = '100%';
    const none = document.createElement('option'); none.value = ''; none.textContent = '— none —'; sel.appendChild(none);
    impHeaders.forEach(h => { const o = document.createElement('option'); o.value = h; o.textContent = h; if (h === auto) o.selected = true; sel.appendChild(o); });
    row.innerHTML = `<label>${f.label}</label>`; row.appendChild(sel); box.appendChild(row);
  });
}
async function impLoad(result) {
  if (result.canceled) return;
  if (!result.ok) { $('impStatus').textContent = '❌ ' + result.error; return; }
  if (!result.rows.length) { $('impStatus').textContent = 'Sheet khaali hai.'; return; }
  impHeaders = result.headers; impRows = result.rows; impLinks = result.links || [];
  // auto-detect columns
  const map = autoMap();
  if (!map.title) {
    $('impStatus').textContent = 'Could not auto-detect columns — map them below and Import.';
    renderMapping(); return;
  }
  // seedha import (replace), koi option nahi
  $('impStatus').textContent = '⏳ Importing…';
  const items = buildItems(map);
  if (!items.length) { $('impStatus').textContent = '❌ No valid rows (Title empty).'; return; }
  const res = await window.api.importAdd({ items, replace: true });
  if (!res.ok) { $('impStatus').textContent = '❌ ' + (res.error || 'fail'); return; }
  $('importBg').classList.remove('on'); await load();
}
if ($('importBtn')) $('importBtn').addEventListener('click', openImport);
$('impCancel').addEventListener('click', () => $('importBg').classList.remove('on'));
$('importBg').addEventListener('click', e => { if (e.target === $('importBg')) $('importBg').classList.remove('on'); });
$('impLoadUrl').addEventListener('click', async () => {
  const url = $('impUrl').value.trim(); if (!url) return;
  $('impStatus').textContent = '⏳ Sheet load ho rahi hai...';
  impLoad(await window.api.importFromUrl(url));
});
$('impLoadFile').addEventListener('click', async () => {
  $('impStatus').textContent = '⏳ File load ho rahi hai...';
  impLoad(await window.api.importFromFile());
});
function buildItems(map) {
  return impRows.map((r, i) => {
    const g = (k) => map[k] ? String(r[map[k]] ?? '').trim() : '';
    const linkOf = (k) => { let v = (impLinks[i] && map[k]) ? impLinks[i][map[k]] : ''; v = v || g(k); return /^https?:\/\//i.test(v) ? v : ''; };
    const video = linkOf('driveLink');
    return {
      title: g('title'), category: g('category'), type: /short/i.test(g('type')) ? 'Short' : 'Long',
      assignee: g('assignee'), channel: g('channel'),
      status: normStatus(g('status')) || (video ? 'Ready' : 'Idea'),
      url: video, driveLink: video, thumbLink: linkOf('thumbLink'), metaLink: linkOf('metaLink')
    };
  }).filter(it => it.title);
}
$('impDo').addEventListener('click', async () => {
  const map = {}; IMPORT_FIELDS.forEach(f => map[f.key] = $('map-' + f.key).value);
  if (!map.title) { $('impStatus').textContent = '❌ Map the Title column.'; return; }
  const items = buildItems(map);
  if (!items.length) { $('impStatus').textContent = '❌ No valid rows (Title empty).'; return; }
  const res = await window.api.importAdd({ items, replace: $('impReplace') ? $('impReplace').checked : true });
  if (!res.ok) { $('impStatus').textContent = '❌ ' + (res.error || 'fail'); return; }
  $('importBg').classList.remove('on'); await load();
});

// ---- theme (light / dark) — set in Settings > General ----
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const l = $('themeLight'), d = $('themeDark');
  if (l) l.classList.toggle('on', t !== 'dark');
  if (d) d.classList.toggle('on', t === 'dark');
}
function setTheme(t) { applyTheme(t); try { localStorage.setItem('cm-theme', t); } catch {} }
(function initTheme() {
  let t = 'light';
  try { t = localStorage.getItem('cm-theme') || 'light'; } catch {}
  applyTheme(t);
  if ($('themeLight')) $('themeLight').addEventListener('click', () => setTheme('light'));
  if ($('themeDark')) $('themeDark').addEventListener('click', () => setTheme('dark'));
})();

// ---- login gate ----
function showApp() {
  const g = $('loginGate'); if (g) g.style.display = 'none';
  const a = $('appRoot'); if (a) a.style.display = 'flex';
}
async function enterApp() { showApp(); await load(); applyAdminUi(); }
async function doLogin() {
  const email = $('loginEmail').value.trim(), key = ($('loginKey') ? $('loginKey').value.trim() : '');
  const err = $('loginErr'); err.textContent = '';
  if (!email || !key) { err.textContent = 'Enter both email and license key.'; return; }
  const btn = $('loginBtn'); const old = btn.textContent; btn.textContent = 'Checking…'; btn.disabled = true;
  try {
    const r = await window.api.authCheck(email, key);
    if (r && r.ok) { isAdmin = !!r.admin; await enterApp(); }
    else { err.textContent = (r && r.reason) || 'Login failed.'; }
  } catch (e) { err.textContent = e.message; }
  btn.textContent = old; btn.disabled = false;
}
async function initGate() {
  // browser-preview mock (no window.api)
  if (!window.api) { isAdmin = true; await enterApp(); return; }
  try {
    const s = await window.api.authStatus();
    if (s && s.ok) { isAdmin = !!s.admin; await enterApp(); return; }
  } catch {}
  // need login
  const g = $('loginGate'); if (g) g.style.display = 'flex';
  if ($('loginBtn')) $('loginBtn').addEventListener('click', doLogin);
  ['loginEmail', 'loginKey'].forEach(id => { const el = $(id); if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); }); });
  setTimeout(() => { const el = $('loginEmail'); if (el) el.focus(); }, 60);
}
initGate();
