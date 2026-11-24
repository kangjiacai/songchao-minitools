import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = '/opt/cursor/artifacts';
const BASE = process.env.WARDROBE_BASE || 'http://127.0.0.1:8765';
mkdirSync(OUT, { recursive: true });

const chrome = spawn('google-chrome', [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--remote-debugging-port=9341',
  '--user-data-dir=/tmp/chrome-wardrobe-check',
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
  if (res.exceptionDetails) {
    throw new Error(JSON.stringify(res.exceptionDetails));
  }
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
  await sleep(600);
}

const report = { base: BASE, checks: [], shots: [] };

function check(name, ok, detail) {
  report.checks.push({ name, ok: !!ok, detail: detail || '' });
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' ' + detail : ''));
}

await call('Page.enable');
await call('Runtime.enable');

await open(BASE + '/apps/song-wardrobe/pkg/index.html', 390, 844);
await evaluate('window.SONG_WARDROBE.ready');
const home = await evaluate(`(() => ({
  title: document.title,
  name: document.getElementById('look-name').textContent,
  pieces: document.getElementById('look-pieces').textContent,
  hands: document.querySelectorAll('.hand').length,
  sleeves: document.querySelectorAll('.sleeve-shirt').length
}))()`);
check('首页标题', home.title === '宋式衣橱', home.name + ' / ' + home.pieces);
check('只有两只手、每侧一条衫袖', home.hands === 2 && home.sleeves === 2, JSON.stringify(home));
await shot('wardrobe-01-home-390.png');
report.shots.push('wardrobe-01-home-390.png');

const layout = await evaluate(`(() => {
  function box(id) {
    const n = document.getElementById(id).getBoundingClientRect();
    return { top: n.top, bottom: n.bottom, left: n.left, right: n.right };
  }
  const stage = document.querySelector('.stage').getBoundingClientRect();
  const dock = document.querySelector('.dock').getBoundingClientRect();
  return {
    hair: box('hair-bun'),
    shoe: box('shoe-l'),
    stage: { top: stage.top, bottom: stage.bottom },
    dockTop: dock.top,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth
  };
})()`);
check('全身在衣橱区域里，控件不压住人物',
  layout.hair.top >= layout.stage.top - 1 &&
  layout.shoe.bottom <= layout.stage.bottom + 1 &&
  layout.dockTop >= layout.stage.bottom - 1 &&
  layout.overflowX <= 1,
  JSON.stringify(layout));

await evaluate(`SONG_WARDROBE.setLook({
  scene:'winter', shirt:'yuanling', shirtColor:'yue', beizi:'long', beiziColor:'jiang',
  skirt:'lan', skirtColor:'mo', head:'warm', headColor:'cha', winter:'on', winterColor:'tian'
})`);
await sleep(200);
const winterOn = await evaluate(`document.getElementById('g-winter').style.display !== 'none' && document.getElementById('look-name').textContent.indexOf('冬日') >= 0`);
check('冬日一层棉披可见', winterOn, '');
await shot('wardrobe-02-winter-390.png');
report.shots.push('wardrobe-02-winter-390.png');

await evaluate(`SONG_WARDROBE.setLook({
  scene:'flower', shirt:'zhiling', shirtColor:'ou', beizi:'none', beiziColor:'cha',
  skirt:'xuan', skirtColor:'liu', head:'flower', headColor:'jiang', winter:'off', winterColor:'mo'
})`);
await sleep(200);
await shot('wardrobe-03-mix-390.png');
report.shots.push('wardrobe-03-mix-390.png');

await evaluate(`SONG_WARDROBE.setLook({
  scene:'home', shirt:'jiaoling', shirtColor:'zhe', beizi:'short', beiziColor:'yue',
  skirt:'pleat', skirtColor:'cha', head:'wrap', headColor:'jiang', winter:'off', winterColor:'mo'
})`);
await sleep(200);
await shot('wardrobe-03b-short-390.png');
report.shots.push('wardrobe-03b-short-390.png');

const pixels = await evaluate(`(async () => {
  const cat = window.WARDROBE_CATALOG;
  SONG_WARDROBE.setLook({
    scene:'out', shirt:'jiaoling', shirtColor:'jiang', beizi:'long', beiziColor:'liu',
    skirt:'pleat', skirtColor:'zhe', head:'pin', headColor:'tian', winter:'on', winterColor:'mo'
  });
  const canvas = await SONG_WARDROBE.renderPoster();
  const ctx = canvas.getContext('2d');
  const dest = SONG_WARDROBE.poster.dest;
  const vb = SONG_WARDROBE.poster.viewBox;
  function map(id) {
    const node = document.getElementById(id);
    const x = parseFloat(node.getAttribute('x')) + 1;
    const y = parseFloat(node.getAttribute('y')) + 1;
    return [dest.x + (x / vb.w) * dest.w, dest.y + (y / vb.h) * dest.h];
  }
  function hit(id, hex) {
    const pt = map(id);
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    let count = 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const p = ctx.getImageData(Math.round(pt[0] + dx), Math.round(pt[1] + dy), 1, 1).data;
        if (Math.abs(p[0] - r) <= 28 && Math.abs(p[1] - g) <= 28 && Math.abs(p[2] - b) <= 28) count++;
      }
    }
    return count;
  }
  let textDark = 0;
  for (let y = 1360; y <= 1590; y += 6) {
    for (let x = 280; x <= 800; x += 8) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[0] < 100 && p[1] < 100 && p[2] < 100) textDark++;
    }
  }
  const corner = ctx.getImageData(8, 8, 1, 1).data;
  const foot = ctx.getImageData(8, 1612, 1, 1).data;
  return {
    size: [canvas.width, canvas.height],
    shirt: hit('sample-shirt', cat.colorHex('jiang')),
    beizi: hit('sample-beizi-long', cat.colorHex('liu')),
    skirt: hit('sample-skirt-pleat', cat.colorHex('zhe')),
    winter: hit('sample-winter', cat.colorHex('mo')),
    head: hit('sample-head-pin', cat.colorHex('tian')),
    corner: [corner[0], corner[1], corner[2]],
    foot: [foot[0], foot[1], foot[2]],
    textDark
  };
})()`);
check('竖图尺寸 1080×1620', pixels.size[0] === 1080 && pixels.size[1] === 1620, pixels.size.join('x'));
check('竖图像素含衫、褙、裙、棉披、头面颜色',
  pixels.shirt >= 8 && pixels.beizi >= 8 && pixels.skirt >= 8 && pixels.winter >= 8 && pixels.head >= 8,
  JSON.stringify(pixels));
check('竖图四角仍是奶油底且底部没有把字裁掉',
  pixels.corner[0] === 247 && pixels.corner[1] === 242 && pixels.corner[2] === 234 &&
  pixels.foot[0] === 247 && pixels.textDark > 0,
  'textDark=' + pixels.textDark);

await evaluate(`document.getElementById('btn-poster').click()`);
await sleep(400);
const env = await evaluate(`document.getElementById('env-note').textContent`);
check('结果页标明浏览器预览', env.indexOf('浏览器预览') >= 0 && env.indexOf('不会') >= 0, env);
await shot('wardrobe-04-result-390.png');
report.shots.push('wardrobe-04-result-390.png');

await evaluate(`document.getElementById('btn-save').click()`);
await sleep(200);
const saveToast = await evaluate(`document.getElementById('toast').textContent`);
check('预览里保存不报成功', saveToast.indexOf('已保存到相册') < 0 && saveToast.indexOf('没有写入相册') >= 0, saveToast);

await evaluate(`document.getElementById('btn-comment').click()`);
await sleep(200);
const commentToast = await evaluate(`document.getElementById('toast').textContent`);
check('预览里不调用评论', commentToast.indexOf('已打开评论区') < 0 && commentToast.indexOf('预览') >= 0, commentToast);

await evaluate(`document.getElementById('btn-share').click()`);
await sleep(200);
const shareToast = await evaluate(`document.getElementById('toast').textContent`);
check('预览里不假装已经分享', shareToast.indexOf('已拉起') < 0 && shareToast.indexOf('不会假装') >= 0, shareToast);

await call('Emulation.setDeviceMetricsOverride', { width: 320, height: 568, deviceScaleFactor: 2, mobile: true });
await sleep(250);
await evaluate(`document.getElementById('btn-back').click()`);
await sleep(200);
const narrow = await evaluate(`(() => {
  const btn = document.getElementById('btn-poster').getBoundingClientRect();
  const shoe = document.getElementById('shoe-l').getBoundingClientRect();
  const stage = document.querySelector('.stage').getBoundingClientRect();
  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    btnRight: btn.right,
    btnLeft: btn.left,
    btnBottom: btn.bottom,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    shoeTop: shoe.top,
    shoeBottom: shoe.bottom,
    stageTop: stage.top,
    stageBottom: stage.bottom
  };
})()`);
check('窄屏主按钮完整且没有横向溢出',
  narrow.overflowX <= 1 && narrow.btnLeft >= 0 && narrow.btnRight <= narrow.innerWidth - 1,
  JSON.stringify(narrow));
check('窄屏头脚仍在人物区域内',
  narrow.shoeBottom <= narrow.stageBottom + 1 && narrow.shoeTop >= narrow.stageTop,
  '');
await shot('wardrobe-05-narrow-320.png');
report.shots.push('wardrobe-05-narrow-320.png');

await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await call('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
});
await open(BASE + '/apps/song-wardrobe/pkg/index.html', 390, 844);
await evaluate('window.SONG_WARDROBE.ready');
const motion = await evaluate(`(() => {
  const node = document.querySelector('[data-dye]');
  const style = getComputedStyle(node);
  return {
    cls: document.documentElement.className,
    duration: style.transitionDuration
  };
})()`);
check('减少动态时填色过渡关掉',
  motion.cls.indexOf('reduce-motion') >= 0 && (motion.duration === '0s' || motion.duration === '0ms'),
  JSON.stringify(motion));

await call('Emulation.setEmulatedMedia', { features: [] });
await open(BASE + '/apps/songci-color/pkg/index.html', 390, 844);
const colorHome = await evaluate(`document.title + '|' + (document.body.innerText || '').slice(0, 40)`);
check('宋朝配色首页能打开', colorHome.indexOf('宋朝配色') >= 0, colorHome);
await shot('songci-color-home-390.png');
report.shots.push('songci-color-home-390.png');

await open(BASE + '/apps/songchao-quiz/pkg/index.html', 390, 844);
const quizHome = await evaluate(`document.title`);
check('测验首页能打开', quizHome.indexOf('宋朝哪种女子') >= 0, quizHome);
await shot('songchao-quiz-home-390.png');
report.shots.push('songchao-quiz-home-390.png');

const failed = report.checks.filter((item) => !item.ok);
writeFileSync(OUT + '/browser-check.json', JSON.stringify(report, null, 2));
chrome.kill();
ws.close();
if (failed.length) {
  console.log('FAILED ' + failed.length);
  process.exit(1);
}
console.log('ALL_PASS ' + report.checks.length);
process.exit(0);
