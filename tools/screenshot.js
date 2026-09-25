#!/usr/bin/env node
// Screenshot the viewer after running it for a while, with knobs set. Needs Playwright (global install is fine) and a
// Chromium; in the cloud sandbox: NODE_PATH=$(npm root -g) node tools/screenshot.js out.png '{"preset":"cells"}' 15000
// Booleans tick checkboxes, everything else fills the knob's input; "preset" picks a preset first; "state" opens a world saved by
// run.js --save (then the milliseconds are how long it runs on in the viewer; 0 to show it as saved, paused).
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : { executablePath: '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e)));
  await pg.goto('file://' + path.resolve(__dirname, '../index.html'));
  await pg.waitForTimeout(500);
  const sets = JSON.parse(process.argv[3] || '{}');
  if (sets.preset) { await pg.selectOption('#preset', sets.preset); delete sets.preset; await pg.waitForTimeout(300); }
  const state = sets.state; delete sets.state;
  for (const [k, v] of Object.entries(sets)) { if (typeof v === 'boolean') await pg.setChecked('#k_' + k, v); else await pg.fill('#k_' + k, String(v)); }
  if (state) {
    if (Number(process.argv[4] || 0) === 0) await pg.click('#bRun');   // pause first, to show the state as saved
    await pg.setInputFiles('#fOpen', path.resolve(state));
  } else await pg.click('#bReset');
  await pg.waitForTimeout(Number(process.argv[4] || 6000));
  await pg.click('#bSeed');
  await pg.waitForTimeout(300);
  await pg.screenshot({ path: process.argv[2], clip: { x: 0, y: 130, width: 780, height: 770 } });
  console.log('page errors:', errs);
  await b.close();
})();
