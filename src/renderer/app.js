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
    pickDataFolder: () => ok(null), pickVideosFolder: () => ok(null),
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
    videoDownload: () => ok({ ok: false, error: 'Preview mode — asli app mein download hoga.' })
  };
}

const STATUSES = ['Idea', 'Script', 'Visuals', 'Voiceover', 'Rendering', 'Ready', 'Uploaded'];
const CAT_COLORS = { history:'var(--amber)', nature:'var(--green)', sports:'var(--pink)', tech:'var(--blue)', aviation:'var(--accent)' };
const PALETTE = ['var(--amber)','var(--green)','var(--pink)','var(--blue)','var(--accent)','var(--red)'];

let content = [], channels = [], team = [], niches = [], query = '', nicheQuery = '', currentMember = null, currentNiche = null, appCfg = {};
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
  renderPerf(); renderQueue(); renderChannels();
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
const titles = { dashboard:'Overview', niches:'Niches', perf:'Performance', queue:'Upload queue', channels:'Channels', research:'Research', team:'Team', mcp:'MCP', guide:'Guide', help:'Help', settings:'Settings' };
function setActive(el) { document.querySelectorAll('#nav button, .nav-bottom button').forEach(x => x.classList.toggle('on', x === el)); }
function showView(id) { document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.id === id)); }
document.querySelectorAll('#nav > button[data-view], .nav-bottom > button[data-view]').forEach(b => b.addEventListener('click', () => {
  setActive(b); showView('view-' + b.dataset.view); currentMember = null; currentNiche = null;
  $('pageTitle').textContent = titles[b.dataset.view];
  const v = b.dataset.view;
  if (v === 'settings') loadSettings();
  else if (v === 'dashboard') { renderOverview(); replayOverview(); startOverviewRotator(); }
  else if (v === 'niches') renderDashboardNiches();
  else if (v === 'perf') renderPerf();
  else if (v === 'queue') renderQueue();
  else if (v === 'channels') renderChannels();
  else if (v === 'research') renderResearch();
  else if (v === 'mcp') loadMcp();
}));

// ---- Research: competitor channels (NexLev) ----
function fmtNum(n) { n = Number(n) || 0; if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'; if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'; return String(n); }
function isNewChannel(created) { try { const d = new Date(created); return (Date.now() - d.getTime()) / 86400000 <= 400; } catch { return false; } }
async function renderResearch() {
  const box = $('research-list'); if (!box) return;
  let data = {};
  try { data = await window.api.researchAll(); } catch {}
  const myNiches = niches.map(nicheName);
  box.innerHTML = '';
  if (!myNiches.length) { box.innerHTML = '<div class="card"><div class="empty">Add a niche first — competitors will show up here.</div></div>'; return; }
  myNiches.forEach(nn => {
    const list = data[nn] || data[Object.keys(data).find(k => k.toLowerCase() === nn.toLowerCase())] || [];
    const card = document.createElement('div'); card.className = 'card';
    const head = document.createElement('h3');
    head.innerHTML = `<span>${esc(nn)} <span class="mini">· ${list.length} competitor${list.length === 1 ? '' : 's'}</span></span>`;
    card.appendChild(head);
    if (!list.length) {
      const e = document.createElement('div'); e.className = 'empty'; e.style.padding = '12px';
      e.textContent = 'No competitors saved for this niche yet.';
      card.appendChild(e);
    } else {
      // sort: newest first, then outlier
      list.slice().sort((a, b) => (new Date(b.created) - new Date(a.created)) || (b.outlier - a.outlier)).forEach(c => {
        const row = document.createElement('div'); row.className = 'comp-row';
        const badges = [];
        if (isNewChannel(c.created)) badges.push('<span class="comp-badge new">🆕 New</span>');
        if (c.outlier >= 2) badges.push(`<span class="comp-badge hot">🔥 ${c.outlier}x</span>`);
        if (c.ai) badges.push('<span class="comp-badge ai">AI</span>');
        row.innerHTML =
          `<div class="comp-info"><div class="comp-name">${esc(c.title)} ${badges.join(' ')}</div>` +
          `<div class="comp-meta">${fmtNum(c.subs)} subs${c.revenue ? ' · $' + fmtNum(c.revenue) + '/mo' : ''} · started ${c.created}</div>` +
          `<div class="comp-top">▶ ${esc(c.topVideo || '')} <span class="comp-views">${fmtNum(c.topViews)} views</span></div></div>`;
        const open = document.createElement('button'); open.className = 'btn sm'; open.textContent = 'Open';
        open.addEventListener('click', () => window.api.openLink(c.url));
        row.appendChild(open);
        card.appendChild(row);
      });
    }
    box.appendChild(card);
  });
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
function renderPerf() {
  const el = $('perf-stats');
  if (el) {
    const up = content.filter(c => c.status === 'Uploaded').length;
    const rem = content.length - up;
    const week = content.filter(c => c.status === 'Uploaded' && isThisWeek(c.uploadedDate)).length;
    el.innerHTML =
      `<div class="stat"><div class="l">Total videos</div><div class="n">${content.length}</div></div>` +
      `<div class="stat"><div class="l">Uploaded</div><div class="n" style="color:var(--green)">${up}</div></div>` +
      `<div class="stat"><div class="l">Remaining</div><div class="n" style="color:var(--amber)">${rem}</div></div>` +
      `<div class="stat"><div class="l">This week</div><div class="n" style="color:var(--blue)">${week}</div></div>`;
  }
  const box = $('perf-niches'); if (!box) return;
  box.innerHTML = niches.length ? '' : '<div class="empty">No niches yet.</div>';
  niches.map(nicheName).forEach(name => {
    const inN = content.filter(c => (c.category || '').toLowerCase() === name.toLowerCase());
    const up = inN.filter(c => c.status === 'Uploaded').length;
    const pct = inN.length ? Math.round(up / inN.length * 100) : 0;
    const d = document.createElement('div'); d.className = 'cat';
    d.innerHTML = `<span class="cn">${esc(name)}</span><span class="bar" style="width:170px"><i style="width:${pct}%;background:var(--green)"></i></span><span class="cc">${up}/${inN.length}</span>`;
    box.appendChild(d);
  });
}
function renderQueue() { const t = $('queue-sheet'); if (!t) return; buildSheet(t, content.filter(c => c.status === 'Ready').reverse()); }
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
  if ($('aiModel')) $('aiModel').value = s.aiModel || '';
  if ($('aiKey')) $('aiKey').value = s.aiKey || '';
  // general options
  if ($('setVisibility')) $('setVisibility').value = s.uploadVisibility || 'public';
  if ($('setNotif')) $('setNotif').checked = !!s.notifications;
  if ($('setDefaultNiche')) {
    const sel = $('setDefaultNiche'); sel.innerHTML = '<option value="">— none —</option>';
    niches.map(nicheName).forEach(nn => { const o = document.createElement('option'); o.value = nn; o.textContent = nn; if (nn === s.defaultNiche) o.selected = true; sel.appendChild(o); });
  }
  // version
  try { if ($('appVersion')) $('appVersion').textContent = await window.api.appVersion(); } catch {}
  updateDriveStatus(await window.api.driveStatus());
}
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
if ($('aiSaveBtn')) $('aiSaveBtn').addEventListener('click', async () => {
  await window.api.settingsSet({ aiProvider: $('aiProvider').value, aiModel: $('aiModel').value.trim(), aiKey: $('aiKey').value.trim() });
  $('aiTestStatus').textContent = 'Saved ✓'; $('aiTestStatus').style.color = 'var(--green)';
});
if ($('aiTestBtn')) $('aiTestBtn').addEventListener('click', async () => {
  const st = $('aiTestStatus'); st.textContent = '⏳ Testing…'; st.style.color = 'var(--muted)';
  const r = await window.api.apiTest({ provider: $('aiProvider').value, key: $('aiKey').value.trim(), model: $('aiModel').value.trim() });
  st.textContent = r.ok ? '✓ Key working' : ('❌ ' + (r.error || 'fail')); st.style.color = r.ok ? 'var(--green)' : 'var(--red)';
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
async function enterApp() { showApp(); await load(); }
async function doLogin() {
  const email = $('loginEmail').value.trim(), key = $('loginKey').value.trim();
  const err = $('loginErr'); err.textContent = '';
  if (!email || !key) { err.textContent = 'Enter both email and key.'; return; }
  const btn = $('loginBtn'); const old = btn.textContent; btn.textContent = 'Checking…'; btn.disabled = true;
  try {
    const r = await window.api.authCheck(email, key);
    if (r && r.ok) { await enterApp(); }
    else { err.textContent = (r && r.reason) || 'Login failed.'; }
  } catch (e) { err.textContent = e.message; }
  btn.textContent = old; btn.disabled = false;
}
async function initGate() {
  // browser-preview mock (no window.api)
  if (!window.api) { await enterApp(); return; }
  try {
    const s = await window.api.authStatus();
    if (s && s.ok) { await enterApp(); return; }
  } catch {}
  // need login
  const g = $('loginGate'); if (g) g.style.display = 'flex';
  if ($('loginBtn')) $('loginBtn').addEventListener('click', doLogin);
  ['loginEmail', 'loginKey'].forEach(id => { const el = $(id); if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); }); });
  setTimeout(() => { const el = $('loginEmail'); if (el) el.focus(); }, 60);
}
initGate();
