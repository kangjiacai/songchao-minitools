import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

const OUT = '/opt/cursor/artifacts';
const BASE = process.env.WARDROBE_BASE || 'http://127.0.0.1:8765';
mkdirSync(OUT, { recursive: true });
rmSync('/tmp/chrome-wardrobe-mvp', { recursive: true, force: true });

const chrome = spawn('google-chrome', [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--remote-debugging-port=9341',
  '--user-data-dir=/tmp/chrome-wardrobe-mvp',
  '--window-size=390,844',
  'about:blank'
], { stdio: 'ignore' });

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitPort() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9341/json/version');
      if (res.ok) return;
    } catch (err) { /* retry */ }
    await sleep(150);
  }
  throw new Error('Chrome 调试端口没有起来');
}

await waitPort();
const list = await (await fetch('http://127.0.0.1:9341/json/list')).json();
const page = list.find((item) => item.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let seq = 0;
await new Promise((resolve) => ws.addEventListener('open', resolve));
ws.addEventListener('message', (ev) => {
  const data = JSON.parse(ev.data);
  if (!data.id || !pending.has(data.id)) return;
  const item = pending.get(data.id);
  pending.delete(data.id);
  if (data.error) item.reject(new Error(JSON.stringify(data.error)));
  else item.resolve(data.result);
});

function call(method, params) {
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params: params || {} }));
  });
}

async function evaluate(expression) {
  const res = await call('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails));
  return res.result.value;
}

async function shot(name) {
  const img = await call('Page.captureScreenshot', { format: 'png' });
  writeFileSync(OUT + '/' + name, Buffer.from(img.data, 'base64'));
}

async function open(url, width, height) {
  await call('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 2, mobile: true
  });
  await call('Page.navigate', { url });
  await sleep(700);
}

const report = { base: BASE, checks: [] };
function check(name, ok, detail) {
  report.checks.push({ name, ok: !!ok, detail: detail || '' });
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' ' + detail : ''));
}

await call('Page.enable');
await call('Runtime.enable');
await open(BASE + '/apps/song-wardrobe/pkg/index.html?v=mvp', 390, 844);
const booted = await evaluate('window.SONG_WARDROBE && window.SONG_WARDROBE.ready');
check('衣橱能展开', booted === true, String(booted));

const home = await evaluate(`(() => {
  const poem = SONG_WARDROBE.poem();
  const box = document.getElementById('figure').getBoundingClientRect();
  const stage = document.querySelector('.stage').getBoundingClientRect();
  const dock = document.querySelector('.dock').getBoundingClientRect();
  return {
    line: document.getElementById('poem-line').textContent,
    poet: poem.poet,
    tune: poem.tune,
    colors: SONG_WARDROBE.getColors(),
    sample: SONG_WARDROBE.sample('beizi'),
    figureTop: box.top,
    figureBottom: box.bottom,
    stageTop: stage.top,
    stageBottom: stage.bottom,
    dockTop: dock.top,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth
  };
})()`);
check('默认是母图原色，控件不压住人物',
  home.colors.beizi === null && home.colors.inner === null &&
  home.figureTop >= home.stageTop - 1 && home.figureBottom <= home.stageBottom + 1 &&
  home.dockTop >= home.stageBottom - 1 && home.overflowX <= 1,
  JSON.stringify(home));
await shot('wardrobe-01-default-390.png');

const before = home.sample.slice();
const poemBefore = home.line;
await evaluate('SONG_WARDROBE.redraw()');
await sleep(100);
const afterRedraw = await evaluate(`(() => ({
  line: document.getElementById('poem-line').textContent,
  sample: SONG_WARDROBE.sample('beizi'),
  colors: SONG_WARDROBE.getColors()
}))()`);
check('重新抽换词但不改衣色',
  afterRedraw.line !== poemBefore &&
  afterRedraw.colors.beizi === null &&
  afterRedraw.sample.join(',') === before.join(','),
  afterRedraw.line);

await evaluate(`(() => {
  document.getElementById('toast').className = 'toast';
  SONG_WARDROBE.setPart('beizi');
  SONG_WARDROBE.setHex('#243A5C', '黛蓝');
  SONG_WARDROBE.setPart('inner');
  SONG_WARDROBE.setHex('#D98C8C', '海棠红');
})()`);
await sleep(80);
const dyed = await evaluate(`(() => ({
  beizi: SONG_WARDROBE.sample('beizi'),
  inner: SONG_WARDROBE.sample('inner'),
  skirt: SONG_WARDROBE.sample('skirt')
}))()`);
function near(rgb, expect, tol) {
  return Math.abs(rgb[0] - expect[0]) <= tol && Math.abs(rgb[1] - expect[1]) <= tol && Math.abs(rgb[2] - expect[2]) <= tol;
}
check('褙子变色且裙仍是原色',
  near(dyed.beizi, [35, 56, 89], 2) && near(dyed.skirt, [226, 176, 145], 8) && !near(dyed.inner, dyed.beizi, 12),
  JSON.stringify(dyed));
await shot('wardrobe-02-navy-rose-390.png');

await evaluate(`(() => {
  document.getElementById('toast').className = 'toast';
  SONG_WARDROBE.setPart('beizi');
  SONG_WARDROBE.setHex('#6B3A6A', '紫');
  SONG_WARDROBE.setPart('skirt');
  SONG_WARDROBE.setHex('#E8C84A', '明黄');
  SONG_WARDROBE.setPart('waist');
  SONG_WARDROBE.setHex('#2F4A62', '深青');
})()`);
await sleep(80);
await shot('wardrobe-03-purple-390.png');

await evaluate(`document.getElementById('btn-poster').click()`);
await sleep(300);
const poster = await evaluate(`(async () => {
  const canvas = SONG_WARDROBE.renderPoster();
  const ctx = canvas.getContext('2d');
  const corner = ctx.getImageData(8, 8, 1, 1).data;
  let dark = 0;
  for (let y = 1450; y <= 1660; y += 6) {
    for (let x = 200; x <= 880; x += 10) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[0] < 100 && p[1] < 100 && p[2] < 100) dark++;
    }
  }
  return { w: canvas.width, h: canvas.height, corner: [corner[0], corner[1], corner[2]], dark };
})()`);
check('竖图尺寸和文字还在画布内',
  poster.w === 1080 && poster.h === 1680 && poster.corner[0] === 247 && poster.dark > 0,
  JSON.stringify(poster));
await shot('wardrobe-04-result-390.png');

await evaluate(`document.getElementById('btn-save').click()`);
await sleep(200);
const saveToast = await evaluate(`document.getElementById('toast').textContent`);
check('预览下载不报已保存相册',
  saveToast.indexOf('已保存到相册') < 0 && saveToast.indexOf('没有写入相册') >= 0,
  saveToast);

await call('Emulation.setDeviceMetricsOverride', { width: 320, height: 568, deviceScaleFactor: 2, mobile: true });
await sleep(200);
await evaluate(`document.getElementById('btn-back').click()`);
await sleep(150);
const narrow = await evaluate(`(() => {
  const btn = document.getElementById('btn-poster').getBoundingClientRect();
  const fig = document.getElementById('figure').getBoundingClientRect();
  const stage = document.querySelector('.stage').getBoundingClientRect();
  return {
    innerWidth: window.innerWidth,
    btnRight: btn.right,
    btnLeft: btn.left,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    figTop: fig.top,
    figBottom: fig.bottom,
    stageTop: stage.top,
    stageBottom: stage.bottom
  };
})()`);
check('窄屏按钮完整且人物在区域内',
  narrow.overflowX <= 1 && narrow.btnRight <= narrow.innerWidth - 1 &&
  narrow.figBottom <= narrow.stageBottom + 1 && narrow.figTop >= narrow.stageTop - 1,
  JSON.stringify(narrow));
await evaluate(`(() => {
  var t = document.getElementById('toast');
  t.className = 'toast';
  t.textContent = '';
})()`);
await sleep(400);
await shot('wardrobe-05-narrow-320.png');

await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await open(BASE + '/apps/song-wardrobe/pkg/index.html?v=mvp2', 390, 844);
await evaluate('window.SONG_WARDROBE.ready');
const motion = await evaluate(`document.documentElement.className`);
check('减少动态加上了标记', motion.indexOf('reduce-motion') >= 0, motion);

await call('Emulation.setEmulatedMedia', { features: [] });
await open(BASE + '/apps/songci-color/pkg/index.html', 390, 844);
const colorHome = await evaluate(`document.title`);
check('宋朝配色首页能打开', colorHome.indexOf('宋朝配色') >= 0, colorHome);

await open(BASE + '/apps/songchao-quiz/pkg/index.html', 390, 844);
const quizHome = await evaluate(`document.title`);
check('测验首页能打开', quizHome.indexOf('宋朝哪种女子') >= 0, quizHome);

writeFileSync(OUT + '/browser-check.json', JSON.stringify(report, null, 2));
chrome.kill();
ws.close();
const failed = report.checks.filter((item) => !item.ok);
if (failed.length) {
  console.log('FAILED ' + failed.length);
  process.exit(1);
}
console.log('ALL_PASS ' + report.checks.length);
process.exit(0);
