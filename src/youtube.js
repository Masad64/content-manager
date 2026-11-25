// Browser-automation YouTube uploader (A2).
// Uses a persistent browser profile so the one-time login stays saved.
// The browser opens VISIBLY on purpose, so the user can help with login / "verify it's you".
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

let _ctx = null;

function profileDir(base) {
  const d = path.join(base, 'yt-profile');
  fs.mkdirSync(d, { recursive: true });
  return d;
}

async function getContext(base) {
  if (_ctx) {
    try { if (_ctx.browser() && _ctx.browser().isConnected()) return _ctx; } catch {}
    try { await _ctx.close(); } catch {}
    _ctx = null;
  }
  const dir = profileDir(base);
  const opts = {
    headless: false,
    viewport: null,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled']
  };
  // Prefer the user's real Chrome (Google trusts it more for sign-in); fall back to bundled Chromium.
  try {
    _ctx = await chromium.launchPersistentContext(dir, { ...opts, channel: 'chrome' });
  } catch (e) {
    _ctx = await chromium.launchPersistentContext(dir, opts);
  }
  return _ctx;
}

async function firstPage(ctx) {
  const pages = ctx.pages();
  return pages.length ? pages[0] : await ctx.newPage();
}

// Open YouTube so the user can sign in once. Resolves when the avatar (signed-in) appears.
async function connect(base) {
  const ctx = await getContext(base);
  const page = await firstPage(ctx);
  await page.goto('https://www.youtube.com', { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForSelector('button#avatar-btn, #avatar-btn', { timeout: 240000 });
    return { ok: true, signedIn: true };
  } catch {
    return { ok: true, signedIn: false, note: 'Sign-in not confirmed — complete login in the browser and try again.' };
  }
}

async function status(base) {
  // Lightweight check without forcing a new window if one is open
  try {
    const ctx = await getContext(base);
    const page = await firstPage(ctx);
    await page.goto('https://www.youtube.com', { waitUntil: 'domcontentloaded' });
    const el = await page.$('button#avatar-btn, #avatar-btn');
    return { ok: true, signedIn: !!el };
  } catch (e) {
    return { ok: false, signedIn: false, error: e.message };
  }
}

async function disconnect(base) {
  try { if (_ctx) { await _ctx.close(); _ctx = null; } } catch {}
  // wipe saved session
  try { fs.rmSync(profileDir(base), { recursive: true, force: true }); } catch {}
  return { ok: true };
}

// Upload one local video file to the currently signed-in channel.
async function upload(base, { file, title, description, tags, thumb, visibility, onStep }) {
  if (!file || !fs.existsSync(file)) throw new Error('Local video file not found — download the video first.');
  const step = (s) => { try { onStep && onStep(s); } catch {} };
  const ctx = await getContext(base);
  const page = await firstPage(ctx);

  step('Opening the upload page…');
  // Direct upload entry — opens the upload dialog with a file input ready (more reliable than clicking Create)
  await page.goto('https://www.youtube.com/upload', { waitUntil: 'load' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);

  let fileInput = page.locator('input[type="file"]').first();
  let haveInput = false;
  try { await fileInput.waitFor({ state: 'attached', timeout: 30000 }); haveInput = true; } catch {}

  if (!haveInput) {
    // Fallback: click Create -> Upload videos inside Studio
    step('Opening the upload dialog…');
    const createBtn = page.locator('ytcp-button#create-icon, #create-icon').first();
    try { await createBtn.waitFor({ state: 'visible', timeout: 60000 }); }
    catch { throw new Error('YouTube Studio did not load. Is there a channel-select / onboarding / sign-in screen in the browser? Select the channel manually once and try again.'); }
    await createBtn.click({ timeout: 30000 });
    await page.waitForTimeout(800);
    await page.locator('#text-item-0, tp-yt-paper-item#text-item-0').first().click({ timeout: 15000 }).catch(async () => {
      await page.getByText('Upload videos', { exact: false }).first().click({ timeout: 15000 });
    });
    fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: 'attached', timeout: 30000 });
  }

  step('Selecting the video file…');
  await fileInput.setInputFiles(file);

  step('Filling the title…');
  await page.waitForTimeout(3500);
  const titleBox = page.locator('#title-textarea #textbox, ytcp-social-suggestions-textbox[id="title-textarea"] #textbox, div#textbox[aria-label*="title" i]').first();
  await titleBox.waitFor({ timeout: 40000 });
  await titleBox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await titleBox.type((title || 'Untitled').slice(0, 95), { delay: 8 });

  if (description) {
    step('Filling the description…');
    try {
      const descBox = page.locator('#description-textarea #textbox, #description-container #textbox').first();
      await descBox.click({ timeout: 8000 });
      await descBox.type(String(description).slice(0, 4500), { delay: 4 });
    } catch {}
  }

  // Thumbnail (optional)
  if (thumb && fs.existsSync(thumb)) {
    step('Setting the thumbnail…');
    try {
      const thumbInput = page.locator('#file-loader, ytcp-thumbnails-compact-editor-uploader input[type="file"], input[type="file"]#file-loader').first();
      await thumbInput.waitFor({ state: 'attached', timeout: 10000 });
      await thumbInput.setInputFiles(thumb);
      await page.waitForTimeout(2500);
    } catch {}
  }

  // "Not made for kids"
  try {
    await page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first().click({ timeout: 8000 });
  } catch {}

  // Tags (optional, under Show more)
  if (tags) {
    try {
      await page.locator('#toggle-button, ytcp-button#toggle-button').first().click({ timeout: 5000 });
      await page.waitForTimeout(500);
      const tagBox = page.locator('#tags-container #text-input, input[aria-label*="tag" i]').first();
      await tagBox.click({ timeout: 5000 });
      await tagBox.type(String(tags).slice(0, 400) + ',', { delay: 4 });
    } catch {}
  }

  step('Moving through the steps…');
  for (let i = 0; i < 3; i++) {
    await page.locator('#next-button, ytcp-button#next-button').first().click({ timeout: 25000 });
    await page.waitForTimeout(1200);
  }

  // Visibility
  const vis = (visibility || 'unlisted').toLowerCase();
  const visName = vis === 'public' ? 'PUBLIC' : vis === 'private' ? 'PRIVATE' : 'UNLISTED';
  step('Setting visibility: ' + visName.toLowerCase() + '…');
  try {
    await page.locator(`tp-yt-paper-radio-button[name="${visName}"], [name="${visName}"]`).first().click({ timeout: 15000 });
  } catch {}

  // Try to read the share link
  let link = '';
  try { link = await page.locator('a.ytcp-video-info, #share-url').first().getAttribute('href', { timeout: 6000 }) || ''; } catch {}

  step('Waiting for upload to finish…');
  await page.waitForTimeout(1200);
  // Done button stays disabled until the file finishes uploading — big files take a while.
  let done = false;
  for (let i = 0; i < 160 && !done; i++) {
    try {
      const btn = page.locator('#done-button, ytcp-button#done-button').first();
      if (await btn.isEnabled()) { await btn.click({ timeout: 8000 }); done = true; break; }
      if (i % 6 === 0) step('Still uploading… (' + (i * 5) + 's)');
      await page.waitForTimeout(5000);
    } catch { await page.waitForTimeout(5000); }
  }
  if (!done) throw new Error('The Done button did not enable — the file may be large/slow. The browser is open; finish it there manually.');

  await page.waitForTimeout(2500);
  try { await page.locator('#close-button, ytcp-button#close-button').first().click({ timeout: 6000 }); } catch {}

  step('Done ✓');
  return { ok: true, link, visibility: vis };
}

// Change an already-uploaded video's visibility (e.g. make it Public)
async function setVisibility(base, { titleContains, visibility, onStep }) {
  const step = (s) => { try { onStep && onStep(s); } catch {} };
  const ctx = await getContext(base);
  const page = await firstPage(ctx);
  step('Opening YouTube Studio…');
  await page.goto('https://studio.youtube.com', { waitUntil: 'load' });
  await page.waitForLoadState('networkidle').catch(() => {});
  const chMatch = (page.url().match(/channel\/([\w-]+)/) || []);
  if (chMatch[1]) {
    await page.goto(`https://studio.youtube.com/channel/${chMatch[1]}/videos/upload`, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});
  }
  step('Finding the video…');
  await page.waitForSelector('a#video-title', { timeout: 40000 });
  let vid = '';
  if (titleContains) {
    const links = await page.locator('a#video-title').all();
    for (const l of links) {
      const t = (await l.textContent()) || '';
      if (t.toLowerCase().includes(titleContains.toLowerCase())) { const href = (await l.getAttribute('href')) || ''; vid = (href.match(/video\/([\w-]+)/) || [])[1] || ''; break; }
    }
  }
  if (!vid) { const href = (await page.locator('a#video-title').first().getAttribute('href')) || ''; vid = (href.match(/video\/([\w-]+)/) || [])[1] || ''; }
  if (!vid) throw new Error('Video not found in the Studio content list.');

  step('Opening visibility settings…');
  await page.goto(`https://studio.youtube.com/video/${vid}/edit/visibility`, { waitUntil: 'load' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);

  const name = (visibility || 'public').toUpperCase();
  step('Setting ' + name.toLowerCase() + '…');
  await page.locator(`tp-yt-paper-radio-button[name="${name}"], [name="${name}"]`).first().click({ timeout: 25000 });
  await page.waitForTimeout(800);
  step('Saving…');
  await page.locator('#save-button, ytcp-button#save-button').first().click({ timeout: 25000 });
  await page.waitForTimeout(3000);
  step('Done ✓');
  return { ok: true, videoId: vid, url: `https://youtu.be/${vid}` };
}

module.exports = { connect, status, disconnect, upload, setVisibility };
