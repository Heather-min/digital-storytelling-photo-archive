/* ==========================================================================
   Distance Archive: script.js
   Pure vanilla JS. No build step, no dependencies.

   Contents
     1. ARCHIVE_DATA      ← edit captions / dates / GPS here
     2. Narrative config  ← Act III branches, Act V hotspot, pacing
     3. Core: grouping, ambient, telemetry, geolocation, act switching
     4. Acts I–V
     5. Boot
   ========================================================================== */
'use strict';

/* ==========================================================================
   1. ARCHIVE_DATA
   --------------------------------------------------------------------------
   One entry per photograph in ./images/. The act is taken automatically from
   the filename prefix ("2-7" → Act II), and photos are ordered by the number
   after the dash.

     id        "act-number" (must match the filename without extension)
     file      exact filename inside ./images/ (lowercase .jpg, case matters
               on GitHub Pages)
     date      capture date  "YYYY-MM-DD"  (pre-filled from camera EXIF)
     time      capture time  "HH:MM:SS"    (pre-filled from camera EXIF)
     location  place name shown in DATA mode ("" = shown as —)
     lat, lon  decimal degrees (null = "NO FIX"; distance can't be computed)
     branch    Act III only: "shore" (open air / sea) or "gate" (arrivals)
   ========================================================================== */
const ARCHIVE_DATA = [
  // ── Act I · The Open Stage ────────────────────────────────────────────
  { id: '1-1',  file: '1-1.jpg',  date: '2026-03-30', time: '15:07:49', location: '', lat: null, lon: null },
  { id: '1-2',  file: '1-2.jpg',  date: '2024-03-25', time: '21:25:44', location: '', lat: null, lon: null },
  { id: '1-3',  file: '1-3.jpg',  date: '2024-04-01', time: '19:24:26', location: '', lat: null, lon: null },
  { id: '1-4',  file: '1-4.jpg',  date: '2025-03-20', time: '15:06:15', location: '', lat: null, lon: null },
  { id: '1-5',  file: '1-5.jpg',  date: '2025-06-14', time: '12:19:27', location: '', lat: null, lon: null },
  { id: '1-6',  file: '1-6.jpg',  date: '2025-06-22', time: '13:04:38', location: '', lat: null, lon: null },
  { id: '1-7',  file: '1-7.jpg',  date: '2025-06-22', time: '13:14:38', location: '', lat: null, lon: null },
  { id: '1-8',  file: '1-8.jpg',  date: '2023-07-21', time: '12:30:54', location: '', lat: null, lon: null },
  { id: '1-9',  file: '1-9.jpg',  date: '2026-09-23', time: '09:48:03', location: '', lat: null, lon: null },
  { id: '1-10', file: '1-10.jpg', date: '2025-03-19', time: '12:02:40', location: '', lat: null, lon: null },

  // ── Act II · Intimacy & Companions ────────────────────────────────────
  { id: '2-1',  file: '2-1.jpg',  date: '2024-04-26', time: '04:28:35', location: '', lat: null, lon: null },
  { id: '2-2',  file: '2-2.jpg',  date: '2024-02-04', time: '18:51:06', location: '', lat: null, lon: null },
  { id: '2-3',  file: '2-3.jpg',  date: '2024-04-06', time: '01:54:23', location: '', lat: null, lon: null },
  { id: '2-4',  file: '2-4.jpg',  date: '2024-04-26', time: '04:05:38', location: '', lat: null, lon: null },
  { id: '2-5',  file: '2-5.jpg',  date: '2026-01-29', time: '14:23:29', location: '', lat: null, lon: null },
  { id: '2-6',  file: '2-6.jpg',  date: '2024-06-22', time: '09:58:23', location: '', lat: null, lon: null },
  { id: '2-7',  file: '2-7.jpg',  date: '2024-08-26', time: '14:00:29', location: '', lat: null, lon: null },
  { id: '2-8',  file: '2-8.jpg',  date: '2025-04-08', time: '10:38:47', location: '', lat: null, lon: null },
  { id: '2-9',  file: '2-9.jpg',  date: '2025-04-13', time: '07:47:33', location: '', lat: null, lon: null },
  { id: '2-10', file: '2-10.jpg', date: '2024-02-04', time: '18:44:57', location: '', lat: null, lon: null },
  { id: '2-11', file: '2-11.jpg', date: '2026-04-01', time: '13:09:25', location: '', lat: null, lon: null },
  { id: '2-12', file: '2-12.jpg', date: '2026-03-14', time: '11:24:33', location: '', lat: 51.520603, lon: -0.177464 },
  { id: '2-13', file: '2-13.jpg', date: '2026-03-31', time: '09:44:37', location: '', lat: null, lon: null },
  { id: '2-14', file: '2-14.jpg', date: '2026-11-02', time: '12:45:40', location: '', lat: null, lon: null },

  // ── Act III · Wonder (two parallel spaces of waiting) ─────────────────
  { id: '3-1',  file: '3-1.jpg',  date: '2024-07-13', time: '12:25:41', location: '', lat: null, lon: null, branch: 'shore' },
  { id: '3-2',  file: '3-2.jpg',  date: '2024-07-13', time: '12:34:30', location: '', lat: null, lon: null, branch: 'shore' },
  { id: '3-3',  file: '3-3.jpg',  date: '2025-05-25', time: '12:44:50', location: '', lat: null, lon: null, branch: 'shore' },
  { id: '3-4',  file: '3-4.jpg',  date: '2025-05-25', time: '12:45:31', location: '', lat: null, lon: null, branch: 'shore' },
  { id: '3-5',  file: '3-5.jpg',  date: '',           time: '',         location: '', lat: null, lon: null, branch: 'shore' }, // converted from HEIC; EXIF not carried over
  { id: '3-6',  file: '3-6.jpg',  date: '2025-06-28', time: '16:06:29', location: '', lat: null, lon: null, branch: 'gate' },
  { id: '3-7',  file: '3-7.jpg',  date: '2025-06-28', time: '16:05:56', location: '', lat: null, lon: null, branch: 'gate' },
  { id: '3-8',  file: '3-8.jpg',  date: '2025-06-28', time: '16:17:23', location: '', lat: null, lon: null, branch: 'gate' },
  { id: '3-9',  file: '3-9.jpg',  date: '2025-06-28', time: '16:08:20', location: '', lat: null, lon: null, branch: 'gate' },

  // ── Act IV · Solitude & Focus ─────────────────────────────────────────
  { id: '4-1',  file: '4-1.jpg',  date: '2026-09-24', time: '11:23:10', location: '', lat: null, lon: null },
  { id: '4-2',  file: '4-2.jpg',  date: '2024-03-29', time: '00:27:58', location: '', lat: null, lon: null },
  { id: '4-3',  file: '4-3.jpg',  date: '2024-06-23', time: '15:59:10', location: '', lat: null, lon: null },
  { id: '4-4',  file: '4-4.jpg',  date: '2025-04-14', time: '14:20:43', location: '', lat: null, lon: null },
  { id: '4-5',  file: '4-5.jpg',  date: '2026-09-25', time: '12:49:28', location: '', lat: null, lon: null },
  { id: '4-6',  file: '4-6.jpg',  date: '2024-02-22', time: '21:14:53', location: '', lat: null, lon: null },
  { id: '4-7',  file: '4-7.jpg',  date: '2026-11-01', time: '15:46:35', location: '', lat: null, lon: null },
  { id: '4-8',  file: '4-8.jpg',  date: '2024-04-03', time: '22:36:51', location: '', lat: null, lon: null },

  // ── Act V · Gaze ──────────────────────────────────────────────────────
  { id: '5-1',  file: '5-1.jpg',  date: '2026-11-04', time: '11:57:52', location: '', lat: null, lon: null },
  { id: '5-2',  file: '5-2.jpg',  date: '2024-06-29', time: '10:52:06', location: '', lat: null, lon: null },
  { id: '5-3',  file: '5-3.jpg',  date: '2026-01-19', time: '16:31:35', location: '', lat: null, lon: null },
  { id: '5-4',  file: '5-4.jpg',  date: '2025-05-23', time: '11:27:11', location: '', lat: null, lon: null },
];

/* ==========================================================================
   2. Narrative configuration
   ========================================================================== */

/*
  Act V final frame: the invisible hotspot over the smartphone screen.
  All values are PERCENTAGES OF THE PHOTOGRAPH (not the window), so the box
  stays on the phone at every screen size. Set DEBUG_HOTSPOT = true to see
  a red box while adjusting.
*/
const FINAL_HOTSPOT = {
  image: '5-4',   // which photo is the final frame (the phone + painting)
  left: 7.5,      // % from the photo's left edge
  top: 51,        // % from the photo's top edge
  width: 16,      // % of the photo's width
  height: 16,     // % of the photo's height
};
const DEBUG_HOTSPOT = false;

const CONFIG = {
  imageDir: 'images/',
  thumbDir: 'images/thumbs/',

  // Act I: how many nodes must be approached before → appears.
  act1UnlockAfter: 6,

  // Minimum time (ms, daytime) a photo is held before the forward cue
  // appears. Multiplied by the ambient pace (slower at night).
  dwell: { act1: 1600, act2: 2400, act3: 1800, act4: 1400, act5: 3200 },

  // Act IV: seconds of stillness / holding to fully clear the glass,
  // and seconds for it to fog over again after release.
  focusSeconds: 2.5,
  refogSeconds: 3.8,
  // How long the mouse must stay still before attention "counts" (ms).
  stillnessDelay: 300,

  // Ambient pacing multipliers by time of day.
  pace: { day: 1, twilight: 1.25, night: 1.6 },
  baseFade: 1400, // ms
};

/* ==========================================================================
   3. Core
   ========================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const body = document.body;
const stage = $('#stage');
const veil = $('#veil');
const indicator = $('#act-indicator');
const dataToggle = $('#data-toggle');
const telemetry = $('#telemetry');

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

const state = {
  act: 0,
  current: null,     // photo currently in view (for telemetry), or null
  fieldInfo: null,   // Act I field summary when no photo is focused
  pace: 1,
  lum: 1,
  ambient: 'day',
  telemetry: false,
  geo: { status: 'idle', lat: null, lon: null, acc: null, watchId: null },
  ctx: null,         // lifecycle context of the running act
  token: 0,          // guards against overlapping act transitions
  onKey: null,
  onKeyUp: null,
};

/* ---------- small helpers ---------- */

function el(tag, className = '', attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const paced = (ms) => Math.round(ms * state.pace);
const fadeMs = () => paced(CONFIG.baseFade);
const srcOf = (d) => CONFIG.imageDir + d.file;
const thumbOf = (d) => CONFIG.thumbDir + d.file;
const numOf = (id) => parseInt(id.split('-')[1], 10);
// Two animation frames (so CSS transitions start from the initial state),
// with a timer fallback in case rAF is throttled (background tab, iframes).
const nextFrame = () => new Promise((r) => {
  let done = false;
  const finish = () => { if (!done) { done = true; r(); } };
  requestAnimationFrame(() => requestAnimationFrame(finish));
  setTimeout(finish, 80);
});

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function preload(d) {
  if (!d) return;
  const img = new Image();
  img.decoding = 'async';
  img.src = srcOf(d);
}

function whenLoaded(img) {
  if (img.complete && img.naturalWidth) return Promise.resolve(true);
  return new Promise((r) => {
    img.addEventListener('load', () => r(true), { once: true });
    img.addEventListener('error', () => r(false), { once: true });
  });
}

/* Deterministic PRNG so the Act I field layout is stable between visits. */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/*
  Per-act lifecycle: every listener, timer and animation frame an act
  creates is registered here, so leaving an act tears everything down.
*/
function createContext() {
  const ac = new AbortController();
  const timers = new Set();
  const rafs = new Set();
  return {
    signal: ac.signal,
    alive: true,
    view: null,
    later(fn, ms) {
      const id = setTimeout(() => { timers.delete(id); if (this.alive) fn(); }, ms);
      timers.add(id);
      return id;
    },
    raf(fn) {
      const id = requestAnimationFrame((t) => { rafs.delete(id); if (this.alive) fn(t); });
      rafs.add(id);
      return id;
    },
    dispose() {
      this.alive = false;
      ac.abort();
      timers.forEach(clearTimeout);
      rafs.forEach(cancelAnimationFrame);
    },
  };
}

/* ---------- grouping (by filename prefix) ---------- */

const ACTS = {};
function groupArchive() {
  for (const k of Object.keys(ACTS)) delete ACTS[k];
  for (const d of ARCHIVE_DATA) {
    if (d.missing) continue;
    const act = parseInt(d.id.split('-')[0], 10);
    (ACTS[act] ||= []).push(d);
  }
  for (const list of Object.values(ACTS)) list.sort((a, b) => numOf(a.id) - numOf(b.id));
}

/*
  Probe every image once (thumbnail first, full file as fallback). Any
  photo that can't be loaded is dropped silently instead of showing a
  broken image, which also protects against filename-case typos on deploy.
*/
function probeArchive() {
  const tryLoad = (url) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
  return Promise.all(ARCHIVE_DATA.map(async (d) => {
    const ok = (await tryLoad(thumbOf(d))) || (await tryLoad(srcOf(d)));
    if (!ok) {
      d.missing = true;
      console.warn(`[archive] ${d.file} could not be loaded and was skipped.`);
    }
  }));
}

/* ---------- ambient: time-of-day adaptation ---------- */

function ambientFor(hour) {
  if (hour >= 22 || hour < 5) return 'night';
  if (hour < 8 || hour >= 18) return 'twilight';
  return 'day';
}

function applyAmbient() {
  const mode = ambientFor(new Date().getHours());
  state.ambient = mode;
  state.pace = CONFIG.pace[mode];
  state.lum = { day: 1, twilight: 0.96, night: 0.9 }[mode];
  body.dataset.ambient = mode;
  document.documentElement.style.setProperty('--fade', fadeMs() + 'ms');
}

/* ---------- geolocation & distance ---------- */

function startGeolocation() {
  const g = state.geo;
  if (g.status !== 'idle') return;
  if (!('geolocation' in navigator) || !window.isSecureContext) {
    g.status = 'unavailable';
    renderTelemetry();
    return;
  }
  g.status = 'pending';
  g.watchId = navigator.geolocation.watchPosition(
    (pos) => {
      g.status = 'ok';
      g.lat = pos.coords.latitude;
      g.lon = pos.coords.longitude;
      g.acc = pos.coords.accuracy;
      renderTelemetry();
    },
    (err) => {
      if (g.status === 'ok') return; // keep the last good fix
      g.status = err.code === 1 ? 'denied' : 'unavailable';
      renderTelemetry();
    },
    { enableHighAccuracy: false, maximumAge: 60000, timeout: 15000 }
  );
}

/* Great-circle distance (haversine), km. */
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371.0088;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

function fmtCoord(lat, lon) {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(5)}° ${ns}  ${Math.abs(lon).toFixed(5)}° ${ew}`;
}

function fmtDistance(km) {
  if (km < 1) return `${Math.round(km * 1000).toLocaleString('en-US')} m`;
  return `${km.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
}

/* ---------- telemetry overlay ---------- */

function renderTelemetry() {
  if (!state.telemetry) return;
  const g = state.geo;
  const rows = [];
  const d = state.current;

  if (d) {
    rows.push(['FILE', d.file]);
    rows.push(['CAPTURED', [d.date, d.time].filter(Boolean).join('  ') || '—']);
    rows.push(['LOCATION', d.location || '—']);
    const hasFix = typeof d.lat === 'number' && typeof d.lon === 'number';
    rows.push(['COORD', hasFix ? fmtCoord(d.lat, d.lon) : 'NO FIX']);

    let dist;
    if (!hasFix) dist = '—  (subject position unrecorded)';
    else if (g.status === 'ok') dist = fmtDistance(distanceKm(g.lat, g.lon, d.lat, d.lon));
    else if (g.status === 'pending') dist = '—  (acquiring viewer position)';
    else dist = '—  (viewer position withheld)';
    rows.push(['DISTANCE', dist]);
  } else if (state.fieldInfo) {
    rows.push(['FIELD', `${state.fieldInfo.total} NODES`]);
    rows.push(['APPROACHED', `${state.fieldInfo.visited} / ${state.fieldInfo.total}`]);
  }

  rows.push(['', '']);
  const viewer = {
    idle: '—',
    pending: 'ACQUIRING…',
    ok: g.lat != null ? `${fmtCoord(g.lat, g.lon)}  ±${Math.round(g.acc)} m` : '—',
    denied: 'WITHHELD',
    unavailable: 'UNAVAILABLE',
  }[g.status];
  rows.push(['VIEWER', viewer]);

  const now = new Date();
  const clock = now.toLocaleTimeString('en-GB', { hour12: false });
  rows.push(['LOCAL', `${clock}  ·  ${state.ambient.toUpperCase()}`]);

  telemetry.innerHTML = rows
    .map(([k, v]) => (k ? `<span class="k">${k.padEnd(11, ' ')}</span><span class="v">${escapeHTML(v)}</span>` : ''))
    .join('\n');
}

function setCurrent(d) {
  state.current = d;
  renderTelemetry();
}

function setTelemetry(on) {
  state.telemetry = on;
  body.dataset.telemetry = on ? 'on' : 'off';
  dataToggle.textContent = on ? '[ − DATA ]' : '[ + DATA ]';
  dataToggle.setAttribute('aria-pressed', String(on));
  if (on) startGeolocation();
  renderTelemetry();
}

/* ---------- photo views ---------- */

function makeFrame(d, extraClass = '') {
  const frame = el('div', ('frame ' + extraClass).trim());
  const img = new Image();
  img.decoding = 'async';
  img.draggable = false;
  img.alt = `Photograph ${d.id}`;
  img.src = srcOf(d);
  frame.append(img);
  return { frame, img };
}

/*
  Show one photograph in a fresh .view inside `parent`, crossfading out
  whatever view the context currently holds.
*/
async function showPhoto(ctx, parent, d, { fromFar = false, viewClass = '', frameClass = '' } = {}) {
  const prev = ctx.view;
  if (prev) {
    const pf = prev.querySelector('.frame');
    if (pf) pf.classList.add('photo-exit');
    ctx.later(() => prev.remove(), fadeMs() + 60);
  }

  const view = el('div', ('view ' + viewClass).trim());
  const { frame, img } = makeFrame(d, frameClass);
  frame.classList.add('photo-enter');
  if (fromFar) frame.classList.add('from-far');
  view.append(frame);
  parent.append(view);
  ctx.view = view;

  await whenLoaded(img);
  if (!ctx.alive) return null;
  await nextFrame();
  frame.classList.add('is-in');
  setCurrent(d);
  return { view, frame, img };
}

/* The single forward glyph (→). */
function makeCue(ctx, onActivate) {
  const btn = el('button', 'cue', { type: 'button', 'aria-label': 'Continue' });
  btn.textContent = '→';
  stage.append(btn);
  btn.addEventListener('click', (e) => { e.stopPropagation(); if (cue.visible) onActivate(); }, { signal: ctx.signal });
  const cue = {
    visible: false,
    show() { cue.visible = true; btn.classList.add('is-visible'); },
    hide() { cue.visible = false; btn.classList.remove('is-visible'); },
  };
  return cue;
}

/* Horizontal swipe detection for touch screens. */
function onSwipe(target, { left, right }, signal) {
  let x0 = null, y0 = 0, t0 = 0;
  target.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; t0 = performance.now(); }, { signal });
  target.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    x0 = null;
    if (performance.now() - t0 > 800) return;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    if (dx < 0 && left) left();
    if (dx > 0 && right) right();
  }, { signal });
}

/* ---------- act switching ---------- */

async function goToAct(n, opts = {}) {
  const token = ++state.token;
  if (state.act !== 0) {
    stage.classList.add('is-leaving');
    await sleep(fadeMs());
    if (token !== state.token) return;
  }
  if (state.ctx) state.ctx.dispose();
  stage.innerHTML = '';
  state.onKey = null;
  state.onKeyUp = null;
  state.fieldInfo = null;
  setCurrent(null);

  state.act = n;
  body.dataset.act = String(n);
  indicator.textContent = `${ROMAN[n]} / V`;

  const ctx = createContext();
  state.ctx = ctx;
  ACT_RENDERERS[n](ctx, opts);
  await nextFrame();
  stage.classList.remove('is-leaving');
}

/* ==========================================================================
   4. Acts
   ========================================================================== */

/* --------------------------------------------------------------------------
   ACT I · The Open Stage
   A dark 2D field larger than the screen. Photographs sit far apart as
   small, dim nodes among empty crosshairs. Drag / swipe / scroll to pan;
   click a node to approach it. After enough approaches, → appears.
   The act always opens on 1-1 already approached; clicking it lets the
   photograph recede into the field.
   -------------------------------------------------------------------------- */
function renderAct1(ctx, { openFirst = true } = {}) {
  const items = ACTS[1] || [];
  const visited = new Set();
  const unlockAt = Math.min(CONFIG.act1UnlockAfter, items.length);

  const field = el('div', 'field');
  const world = el('div', 'world');
  const focus = el('div', 'focus');
  field.append(world);
  stage.append(field, focus);

  let vw = window.innerWidth;
  let vh = window.innerHeight;
  const W = Math.max(2600, vw * 2.6);
  const H = Math.max(1800, vh * 2.6);
  world.style.width = W + 'px';
  world.style.height = H + 'px';

  const rand = mulberry32(1108);

  // Empty crosshairs: negative space with a faint sense of measurement.
  for (let i = 0; i < 42; i++) {
    const m = el('span', 'mark');
    m.style.left = (rand() * W) + 'px';
    m.style.top = (rand() * H) + 'px';
    world.append(m);
  }

  // Place nodes far apart. The first photo (1-1) sits at the centre.
  const minGap = Math.min(W, H) * 0.2;
  const nodesPlaced = [];
  const nodes = items.map((d, i) => {
    let p;
    if (i === 0) p = { x: W / 2, y: H / 2 };
    else {
      let tries = 0;
      do {
        p = { x: 180 + rand() * (W - 360), y: 160 + rand() * (H - 320) };
        tries++;
      } while (tries < 300 && nodesPlaced.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < minGap));
    }
    nodesPlaced.push(p);

    const w = Math.round(64 + rand() * 96); // apparent distance
    const btn = el('button', 'node', { type: 'button', 'aria-label': `Approach photograph ${d.id}` });
    btn.style.width = w + 'px';
    btn.style.left = (p.x - w / 2) + 'px';
    btn.style.top = (p.y - w * 0.33) + 'px';
    const img = new Image();
    img.decoding = 'async';
    img.draggable = false;
    img.alt = '';
    img.src = thumbOf(d);
    const coord = el('span', 'coord');
    coord.textContent = typeof d.lat === 'number'
      ? fmtCoord(d.lat, d.lon)
      : `X ${String(Math.round(p.x)).padStart(4, '0')}  Y ${String(Math.round(p.y)).padStart(4, '0')}`;
    btn.append(img, coord);
    world.append(btn);

    // Keyboard activation only; pointer clicks are resolved in pointerup
    // so a drag that ends on a node doesn't count as a click.
    btn.addEventListener('click', (e) => { if (e.detail === 0) approach(i); }, { signal: ctx.signal });
    return { d, p, btn };
  });

  const cue = makeCue(ctx, () => goToAct(2, { fromFar: true }));

  /* ---- camera ---- */
  const cam = { x: vw / 2 - W / 2, y: vh / 2 - H / 2 };
  function clampCam() {
    cam.x = Math.min(vw * 0.4, Math.max(vw * 0.6 - W, cam.x));
    cam.y = Math.min(vh * 0.4, Math.max(vh * 0.6 - H, cam.y));
  }
  function camTransform() { return `translate3d(${cam.x}px, ${cam.y}px, 0) scale(1)`; }
  function applyCam() { world.style.transform = camTransform(); }
  clampCam();
  applyCam();

  function updateInfo() {
    state.fieldInfo = { total: items.length, visited: visited.size };
    if (visited.size >= unlockAt) ctx.later(() => cue.show(), paced(CONFIG.dwell.act1));
    renderTelemetry();
  }

  /* ---- approach / retreat ---- */
  let focused = -1;
  let focusBusy = false;

  async function approach(i, instant = false) {
    if (focused !== -1 || focusBusy) return;
    focusBusy = true;
    focused = i;
    const { d, p, btn } = nodes[i];
    visited.add(d.id);
    btn.classList.add('is-visited');

    // Fly the camera into the node.
    const s = 2.6;
    const tx = vw / 2 - p.x * s;
    const ty = vh / 2 - p.y * s;
    if (!instant) world.classList.add('is-approaching');
    world.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
    world.style.opacity = '0';
    // Remember where to come back to: centred on this node.
    cam.x = vw / 2 - p.x;
    cam.y = vh / 2 - p.y;
    clampCam();

    focus.innerHTML = '';
    const { frame, img } = makeFrame(d);
    focus.append(frame);
    await whenLoaded(img);
    if (!ctx.alive) return;
    if (!instant) await sleep(fadeMs() * 0.5);
    focus.classList.add('is-open');
    setCurrent(d);
    updateInfo();
    preload(nodes[i + 1] && nodes[i + 1].d);
    focusBusy = false;
  }

  function retreat() {
    if (focused === -1 || focusBusy) return;
    focused = -1;
    focus.classList.remove('is-open');
    world.classList.add('is-approaching');
    applyCam();
    world.style.opacity = '1';
    setCurrent(null);
    renderTelemetry();
    ctx.later(() => world.classList.remove('is-approaching'), fadeMs() * 1.7);
  }

  focus.addEventListener('click', retreat, { signal: ctx.signal });

  /* ---- panning (mouse, touch, pen) with gentle inertia ---- */
  let drag = null;
  let vel = { x: 0, y: 0 };
  let coasting = false;

  field.addEventListener('pointerdown', (e) => {
    if (focused !== -1) return;
    world.classList.remove('is-approaching');
    coasting = false;
    drag = {
      id: e.pointerId, x: e.clientX, y: e.clientY,
      cx: cam.x, cy: cam.y, moved: false,
      lastX: e.clientX, lastY: e.clientY, lastT: performance.now(),
      node: e.target.closest('.node'),
    };
    field.setPointerCapture(e.pointerId);
  }, { signal: ctx.signal });

  field.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 6) { drag.moved = true; field.classList.add('is-dragging'); }
    if (!drag.moved) return;
    const now = performance.now();
    const dt = Math.max(1, now - drag.lastT);
    vel = { x: (e.clientX - drag.lastX) / dt, y: (e.clientY - drag.lastY) / dt };
    drag.lastX = e.clientX; drag.lastY = e.clientY; drag.lastT = now;
    cam.x = drag.cx + dx;
    cam.y = drag.cy + dy;
    clampCam();
    applyCam();
  }, { signal: ctx.signal });

  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const wasDrag = drag.moved;
    const node = drag.node;
    drag = null;
    field.classList.remove('is-dragging');
    if (!wasDrag && node) {
      const idx = nodes.findIndex((n) => n.btn === node);
      if (idx !== -1) approach(idx);
      return;
    }
    if (wasDrag && e.type === 'pointerup') coast();
  }
  field.addEventListener('pointerup', endDrag, { signal: ctx.signal });
  field.addEventListener('pointercancel', endDrag, { signal: ctx.signal });

  function coast() {
    coasting = true;
    let last = performance.now();
    const step = (t) => {
      if (!coasting) return;
      const dt = t - last; last = t;
      cam.x += vel.x * dt; cam.y += vel.y * dt;
      vel.x *= 0.93; vel.y *= 0.93;
      clampCam(); applyCam();
      if (Math.hypot(vel.x, vel.y) > 0.01) ctx.raf(step);
      else coasting = false;
    };
    ctx.raf(step);
  }

  field.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (focused !== -1) return;
    world.classList.remove('is-approaching');
    cam.x -= e.deltaX;
    cam.y -= e.deltaY;
    clampCam();
    applyCam();
  }, { passive: false, signal: ctx.signal });

  window.addEventListener('resize', () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    if (focused === -1) { clampCam(); applyCam(); }
  }, { signal: ctx.signal });

  state.onKey = (key) => {
    if (focused !== -1) {
      if (key === 'Escape' || key === 'Enter' || key === ' ') retreat();
      else if (key === 'ArrowRight' && cue.visible) goToAct(2, { fromFar: true });
      return;
    }
    const step = 140;
    const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[key]) {
      world.classList.add('is-approaching');
      cam.x += moves[key][0]; cam.y += moves[key][1];
      clampCam(); applyCam();
    }
  };

  updateInfo();
  if (openFirst && nodes.length) approach(0, true);
}

/* --------------------------------------------------------------------------
   ACT II · Intimacy & Companions
   Linear, slow. The first photograph arrives from far away (continuing the
   zoom from Act I). → appears only after the photo has been held a while.
   -------------------------------------------------------------------------- */
function renderAct2(ctx, { fromFar = false } = {}) {
  const items = ACTS[2] || [];
  let i = 0;
  const cue = makeCue(ctx, next);

  async function show(idx, far = false) {
    cue.hide();
    const shown = await showPhoto(ctx, stage, items[idx], { fromFar: far });
    if (!shown) return;
    preload(items[idx + 1]);
    ctx.later(() => cue.show(), paced(CONFIG.dwell.act2));
  }

  function next() {
    if (!cue.visible) return;
    if (i >= items.length - 1) { goToAct(3); return; }
    i += 1;
    show(i);
  }

  state.onKey = (key) => { if (key === 'ArrowRight' || key === 'Enter' || key === ' ') next(); };
  onSwipe(stage, { left: next }, ctx.signal);

  if (!items.length) { goToAct(3); return; }
  show(0, fromFar);
}

/* --------------------------------------------------------------------------
   ACT III · Wonder
   Two parallel spaces of waiting: "shore" (open air, the sea) and "gate"
   (an arrivals hall). Every photograph offers two unlabelled edges:
     one stays in the same space, the other drifts to the other space.
   Which edge does which is reshuffled on every image, so each viewer
   assembles a different order. When both spaces are exhausted, → opens
   Act IV.
   -------------------------------------------------------------------------- */
function renderAct3(ctx) {
  const items = ACTS[3] || [];
  const spaces = {
    shore: items.filter((d) => d.branch !== 'gate'),
    gate: items.filter((d) => d.branch === 'gate'),
  };
  const seen = new Set();
  const cue = makeCue(ctx, () => goToAct(4));
  let choices = { left: null, right: null };

  const spaceOf = (d) => (d.branch === 'gate' ? 'gate' : 'shore');
  const otherOf = (s) => (s === 'gate' ? 'shore' : 'gate');
  const unseenIn = (s) => spaces[s].filter((d) => !seen.has(d.id));
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  async function show(d) {
    seen.add(d.id);
    cue.hide();
    choices = { left: null, right: null };

    const shown = await showPhoto(ctx, stage, d);
    if (!shown) return;

    const here = spaceOf(d);
    const stay = unseenIn(here)[0] || null;        // continue in this space
    const drift = pick(unseenIn(otherOf(here))) || null; // cross to the other
    preload(stay); preload(drift);

    if (!stay && !drift) {
      ctx.later(() => cue.show(), paced(CONFIG.dwell.act3));
      return;
    }

    // Randomise which edge holds which path.
    const targets = Math.random() < 0.5 ? [drift, stay] : [stay, drift];
    // If only one path is left, it always sits on the right.
    const [leftT, rightT] = targets[0] && targets[1] ? targets : [null, targets[0] || targets[1]];
    choices = { left: leftT, right: rightT };

    for (const side of ['left', 'right']) {
      const target = choices[side];
      const b = el('button', `choice ${side}`, { type: 'button', 'aria-label': side === 'left' ? 'Drift one way' : 'Drift the other way' });
      const glyph = el('span');
      glyph.textContent = side === 'left' ? '←' : '→';
      b.append(glyph);
      if (!target) b.hidden = true;
      b.addEventListener('click', (e) => { e.stopPropagation(); choose(side); }, { signal: ctx.signal });
      shown.frame.append(b);
      ctx.later(() => b.classList.add('is-ready'), paced(CONFIG.dwell.act3));
    }
  }

  let ready = true;
  function choose(side) {
    const target = choices[side];
    if (!target || !ready) return;
    ready = false;
    ctx.later(() => { ready = true; }, 400);
    show(target);
  }

  state.onKey = (key) => {
    if (key === 'ArrowLeft') choose('left');
    else if (key === 'ArrowRight') { if (cue.visible) goToAct(4); else choose('right'); }
  };
  onSwipe(stage, { left: () => choose('right'), right: () => choose('left') }, ctx.signal);

  if (!items.length) { goToAct(4); return; }
  // Enter through either space.
  const starts = [spaces.shore[0], spaces.gate[0]].filter(Boolean);
  show(pick(starts));
}

/* --------------------------------------------------------------------------
   ACT IV · Solitude & Focus
   Each photograph sits behind frosted glass: blur(16px) brightness(0.6).
   Press and hold (mouse / touch / Space), or rest the cursor motionless
   on the image, and it clears over ~2.5 s. Let go or move and it fogs
   again. → appears only after a photograph has been fully seen once.
   -------------------------------------------------------------------------- */
function renderAct4(ctx) {
  const items = ACTS[4] || [];
  let i = 0;
  const cue = makeCue(ctx, next);
  let stopLoop = null;

  async function show(idx) {
    cue.hide();
    if (stopLoop) stopLoop();
    const shown = await showPhoto(ctx, stage, items[idx], { frameClass: 'glass' });
    if (!shown) return;
    preload(items[idx + 1]);
    stopLoop = attachFocus(shown.frame, shown.img, () => {
      ctx.later(() => cue.show(), paced(CONFIG.dwell.act4));
    });
  }

  function attachFocus(frame, img, onRevealed) {
    const local = new AbortController();
    const opt = { signal: local.signal };
    let p = 0;               // 0 = fogged, 1 = clear
    let holding = false;
    let hovering = false;
    let lastMove = performance.now();
    let last = performance.now();
    let revealed = false;
    let pos = { x: 0, y: 0 };
    let running = true;

    frame.addEventListener('pointerdown', (e) => {
      holding = true;
      try { frame.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      e.preventDefault();
    }, opt);
    const release = () => { holding = false; };
    frame.addEventListener('pointerup', release, opt);
    frame.addEventListener('pointercancel', release, opt);
    frame.addEventListener('contextmenu', (e) => e.preventDefault(), opt);
    frame.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') { hovering = true; lastMove = performance.now(); pos = { x: e.clientX, y: e.clientY }; }
    }, opt);
    frame.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse') hovering = false;
    }, opt);
    frame.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      hovering = true;
      if (Math.hypot(e.clientX - pos.x, e.clientY - pos.y) > 3) {
        lastMove = performance.now();
        pos = { x: e.clientX, y: e.clientY };
      }
    }, opt);

    // Space bar = hold, for keyboard viewers.
    state.onKeyUp = (key) => { if (key === ' ') holding = false; };
    const spaceDown = (key) => { if (key === ' ') holding = true; };

    const tick = (t) => {
      if (!running) return;
      const dt = Math.min(64, t - last);
      last = t;
      const still = hovering && t - lastMove > CONFIG.stillnessDelay;
      const attending = holding || still;
      p += attending
        ? dt / (CONFIG.focusSeconds * 1000)
        : -dt / (CONFIG.refogSeconds * 1000);
      p = Math.max(0, Math.min(1, p));

      const e = p * p * (3 - 2 * p); // smoothstep
      const blur = 16 * (1 - e);
      const bright = (0.6 + 0.4 * e) * state.lum;
      img.style.filter = `blur(${blur.toFixed(2)}px) brightness(${bright.toFixed(3)})`;
      img.style.transform = `scale(${(1.02 - 0.02 * e).toFixed(4)})`;

      if (p >= 1 && !revealed) { revealed = true; onRevealed(); }
      ctx.raf(tick);
    };
    ctx.raf(tick);

    return Object.assign(() => { running = false; local.abort(); }, { spaceDown });
  }

  function next() {
    if (!cue.visible) return;
    if (i >= items.length - 1) { goToAct(5); return; }
    i += 1;
    show(i);
  }

  state.onKey = (key) => {
    if (key === ' ' && stopLoop && stopLoop.spaceDown) stopLoop.spaceDown(key);
    else if (key === 'ArrowRight' || key === 'Enter') next();
  };

  if (!items.length) { goToAct(5); return; }
  show(0);
}

/* --------------------------------------------------------------------------
   ACT V · Gaze
   No chrome, no glyphs, no text. A tap/click anywhere on a photograph
   moves on (after a pause). On the final frame only the smartphone screen
   responds: touching it fades to black and returns, without comment, to
   Act I.
   -------------------------------------------------------------------------- */
function renderAct5(ctx) {
  const items = ACTS[5] || [];
  // Telemetry & chrome are hidden by CSS in Act V (body[data-act="5"]);
  // the DATA preference itself is kept for the next loop.
  let i = 0;
  let ready = false;

  async function show(idx) {
    ready = false;
    const d = items[idx];
    const shown = await showPhoto(ctx, stage, d, { viewClass: 'gaze' });
    if (!shown) return;
    preload(items[idx + 1]);

    if (d.id === FINAL_HOTSPOT.image || idx === items.length - 1) {
      const hs = el('div', 'hotspot' + (DEBUG_HOTSPOT ? ' is-debug' : ''), { role: 'button', tabindex: '0', 'aria-label': '' });
      hs.style.setProperty('--hs-left', FINAL_HOTSPOT.left + '%');
      hs.style.setProperty('--hs-top', FINAL_HOTSPOT.top + '%');
      hs.style.setProperty('--hs-width', FINAL_HOTSPOT.width + '%');
      hs.style.setProperty('--hs-height', FINAL_HOTSPOT.height + '%');
      hs.addEventListener('click', (e) => { e.stopPropagation(); loopToStart(); }, { signal: ctx.signal });
      hs.addEventListener('keydown', (e) => { if (e.key === 'Enter') loopToStart(); }, { signal: ctx.signal });
      shown.frame.append(hs);
      return; // the rest of the final frame stays inert
    }

    ctx.later(() => { ready = true; }, paced(CONFIG.dwell.act5));
    shown.frame.addEventListener('click', advance, { signal: ctx.signal });
  }

  function advance() {
    if (!ready) return;
    ready = false;
    i += 1;
    if (i < items.length) show(i);
  }

  state.onKey = (key) => { if (key === 'Enter' || key === ' ' || key === 'ArrowRight') advance(); };

  if (!items.length) { loopToStart(); return; }
  show(0);
}

/* Silent loop: veil down → back to 1-1 → veil up. */
let looping = false;
async function loopToStart() {
  if (looping) return;
  looping = true;
  veil.classList.add('is-down');
  await sleep(fadeMs() * 2.4 + 300);
  state.act = 0; // skip the stage fade; the veil already covers it
  await goToAct(1, { openFirst: true });
  await sleep(fadeMs());
  veil.classList.remove('is-down');
  looping = false;
}

const ACT_RENDERERS = { 1: renderAct1, 2: renderAct2, 3: renderAct3, 4: renderAct4, 5: renderAct5 };

/* ==========================================================================
   5. Boot
   ========================================================================== */

dataToggle.addEventListener('click', () => setTelemetry(!state.telemetry));

window.addEventListener('keydown', (e) => {
  if (e.target === dataToggle && (e.key === 'Enter' || e.key === ' ')) return;
  if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
  if (e.repeat && e.key !== ' ') return;
  if (state.onKey) state.onKey(e.key);
});
window.addEventListener('keyup', (e) => { if (state.onKeyUp) state.onKeyUp(e.key); });

// No browser-style back trail: keep the history stack flat.
history.replaceState(null, '', location.pathname);

applyAmbient();
setInterval(applyAmbient, 60 * 1000);
setInterval(() => { if (state.telemetry) renderTelemetry(); }, 1000);

(async function boot() {
  veil.classList.add('is-down');
  await probeArchive();
  groupArchive();
  await goToAct(1, { openFirst: true });
  await sleep(300);
  veil.classList.remove('is-down');
})();
