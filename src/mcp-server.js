#!/usr/bin/env node
// Minimal local MCP server for Content Manager.
// Lets Claude/ChatGPT read & write the tool's data (niches, content) over stdio.
// No cloud — runs on this PC. Data dir comes from CM_DATA_DIR (set by the app).
const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_DIR = process.env.CM_DATA_DIR || path.join(os.homedir(), 'Documents', 'ContentManager');
function file(n) { return path.join(DATA_DIR, n); }
function readJson(n, d) { try { return JSON.parse(fs.readFileSync(file(n), 'utf-8')); } catch { return d; } }
function writeJson(n, data) { try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(file(n), JSON.stringify(data, null, 2)); return true; } catch { return false; } }
function nicheName(x) { return typeof x === 'string' ? x : (x && x.name) || ''; }

const TOOLS = [
  { name: 'list_niches', description: 'List all niches in Content Manager.', inputSchema: { type: 'object', properties: {} } },
  { name: 'list_content', description: 'List content/videos, optionally filtered by niche.', inputSchema: { type: 'object', properties: { niche: { type: 'string' } } } },
  { name: 'add_content', description: 'Add a new video/content item to a niche.', inputSchema: { type: 'object', properties: { title: { type: 'string' }, niche: { type: 'string' }, status: { type: 'string' }, videoLink: { type: 'string' }, thumbnailLink: { type: 'string' }, description: { type: 'string' } }, required: ['title', 'niche'] } },
  { name: 'set_status', description: 'Set the status of a content item (found by its title).', inputSchema: { type: 'object', properties: { title: { type: 'string' }, status: { type: 'string' } }, required: ['title', 'status'] } }
];

function callTool(name, args) {
  args = args || {};
  if (name === 'list_niches') {
    const niches = readJson('niches.json', []).map(nicheName);
    return 'Niches: ' + (niches.join(', ') || '(none)');
  }
  if (name === 'list_content') {
    let items = readJson('content.json', []);
    if (args.niche) items = items.filter(c => (c.category || '').toLowerCase() === String(args.niche).toLowerCase());
    if (!items.length) return 'No content found.';
    return items.map(c => `• [${c.status || 'Idea'}] ${c.title}${c.channel ? ' → ' + c.channel : ''}`).join('\n');
  }
  if (name === 'add_content') {
    const list = readJson('content.json', []);
    const item = {
      title: args.title, category: args.niche, type: 'Long', assignee: '', channel: '',
      status: args.status || 'Idea', url: args.videoLink || '', driveLink: args.videoLink || '',
      thumbLink: args.thumbnailLink || '', metaLink: '', description: args.description || '',
      id: 'C' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), createdAt: new Date().toISOString()
    };
    list.push(item); writeJson('content.json', list);
    return `Added "${args.title}" to ${args.niche}.`;
  }
  if (name === 'set_status') {
    const list = readJson('content.json', []);
    const it = list.find(c => (c.title || '').toLowerCase() === String(args.title).toLowerCase());
    if (!it) return `Not found: "${args.title}"`;
    it.status = args.status; if (args.status === 'Uploaded') it.uploadedDate = new Date().toISOString();
    writeJson('content.json', list);
    return `"${it.title}" status set to ${args.status}.`;
  }
  throw new Error('Unknown tool: ' + name);
}

function send(msg) { process.stdout.write(JSON.stringify(msg) + '\n'); }
function result(id, r) { send({ jsonrpc: '2.0', id, result: r }); }
function error(id, message) { send({ jsonrpc: '2.0', id, error: { code: -32000, message } }); }

function handle(msg) {
  const { id, method, params } = msg;
  if (method === 'initialize') {
    return result(id, { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'content-manager', version: '0.1.0' } });
  }
  if (method === 'notifications/initialized' || method === 'initialized') return; // notification
  if (method === 'tools/list') return result(id, { tools: TOOLS });
  if (method === 'tools/call') {
    try { const text = callTool(params.name, params.arguments); return result(id, { content: [{ type: 'text', text }] }); }
    catch (e) { return result(id, { content: [{ type: 'text', text: 'Error: ' + e.message }], isError: true }); }
  }
  if (method === 'ping') return result(id, {});
  if (id !== undefined) error(id, 'Method not found: ' + method);
}

let buf = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => {
  buf += chunk;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
    if (!line) continue;
    try { handle(JSON.parse(line)); } catch { /* ignore bad line */ }
  }
});
process.stdin.on('end', () => process.exit(0));
