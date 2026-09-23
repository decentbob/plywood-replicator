// Render a Sim's current state to a PNG (for probes): every block as its polygon, coloured by type and state, bonds
// share an edge (opt.corners: also mark the pinned corners). Needs Playwright and Chromium (NODE_PATH=$(npm root -g) in the cloud sandbox).
//   const snap = require('./tools/snap.js'); await snap(sim, 'out.png', { x0, y0, w, h, scale });
const { NV, T_A, T_B, T_C, T_D, T_E, T_M, I_TPL, I_REPEL, I_ON } = require('../src/sim.js');

function polys(s, box) {
  const out = [];
  for (let u = 0; u < s.n; u++) {
    const t = s.type[u], nv = s.corners(u);
    let x = s.px[u], y = s.py[u];
    if (box) { const W = s.p.W, H = s.p.H; x = box.x0 + (((x - box.x0) % W) + W) % W; y = box.y0 + (((y - box.y0) % H) + H) % H; if (x < box.x0 - 1 || y < box.y0 - 1 || x > box.x0 + box.w + 1 || y > box.y0 + box.h + 1) continue; }
    const pts = []; for (let k = 0; k < nv; k++) pts.push([x + s.ox[u * NV + k], y + s.oy[u * NV + k]]);
    let col;
    if (t === T_E) col = s.is[u] === I_ON ? '#ffe14d' : '#666';
    else if (t === T_M) col = s.is[u] === I_ON ? (s.bond[u * 4 + 2] >= 0 ? '#2e8b57' : '#6b8e23') : '#3a4a2a';
    else {
      const base = { [T_A]: [80, 140, 255], [T_B]: [255, 110, 90], [T_C]: [190, 110, 255], [T_D]: [60, 210, 170] }[t];
      const f = s.is[u] === I_TPL ? 1 : s.is[u] === I_REPEL ? 0.75 : (s.bond[u * 4] >= 0 || s.bond[u * 4 + 1] >= 0 || s.bond[u * 4 + 3] >= 0) ? 0.6 : 0.35;
      col = `rgb(${base.map((c) => Math.round(c * f)).join(',')})`;
    }
    const bonds = []; for (let i = 0; i < 4; i++) if (s.bond[u * 4 + i] >= 0) bonds.push(i);
    // mark the face edge so orientation reads
    const cs = s._sideCorners(u, 0, [0, 0]);
    out.push({ pts, col, face: [cs[0] - u * NV, cs[1] - u * NV], bonds: bonds.map((i) => { const c = s._sideCorners(u, i, [0, 0]); return [c[0] - u * NV, c[1] - u * NV]; }) });
  }
  return out;
}

module.exports = async function snap(s, file, opt = {}) {
  const { chromium } = require('playwright');
  const box = { x0: opt.x0 ?? 0, y0: opt.y0 ?? 0, w: opt.w ?? s.p.W, h: opt.h ?? s.p.H };
  const sc = opt.scale ?? Math.min(900 / box.w, 900 / box.h);
  const data = polys(s, box);
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ viewport: { width: Math.ceil(box.w * sc), height: Math.ceil(box.h * sc) } });
  await pg.setContent(`<canvas id=c width=${Math.ceil(box.w * sc)} height=${Math.ceil(box.h * sc)}></canvas><style>body{margin:0;background:#111}</style>`);
  await pg.evaluate(([data, box, sc, label, opts]) => {
    const g = document.getElementById('c').getContext('2d');
    g.fillStyle = '#111'; g.fillRect(0, 0, 1e5, 1e5);
    const X = (p) => (p[0] - box.x0) * sc, Y = (p) => (p[1] - box.y0) * sc;
    for (const d of data) {
      g.beginPath(); d.pts.forEach((p, k) => (k ? g.lineTo(X(p), Y(p)) : g.moveTo(X(p), Y(p)))); g.closePath();
      g.fillStyle = d.col; g.fill(); g.strokeStyle = '#000'; g.lineWidth = 1; g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = Math.max(1, sc * 0.06);
      const [a, c] = d.face; g.beginPath(); g.moveTo(X(d.pts[a]) * 0.8 + X(d.pts[c]) * 0.2, Y(d.pts[a]) * 0.8 + Y(d.pts[c]) * 0.2); g.lineTo(X(d.pts[a]) * 0.2 + X(d.pts[c]) * 0.8, Y(d.pts[a]) * 0.2 + Y(d.pts[c]) * 0.8);
      g.globalAlpha = 0.35; g.stroke(); g.globalAlpha = 1;
      g.strokeStyle = '#fff'; g.lineWidth = Math.max(1.5, sc * 0.12);
      // a bond pins the two corners of an edge onto the partner's two corners: mark those corners
      if (opts.corners) for (const [a2, c2] of d.bonds) for (const q of [a2, c2]) { g.beginPath(); g.arc(X(d.pts[q]), Y(d.pts[q]), Math.max(1, sc * 0.05), 0, 6.3); g.fillStyle = '#fff'; g.fill(); }
    }
    if (label) { g.fillStyle = '#fff'; g.font = '16px sans-serif'; g.fillText(label, 8, 20); }
  }, [data, box, sc, opt.label || '', { corners: !!opt.corners }]);
  await pg.screenshot({ path: file });
  await b.close();
};
