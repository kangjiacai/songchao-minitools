/* 竖图画册：纯净宣纸底色，人物与右侧竖排宋词题跋融合，底部保留纯粹留白。 */
(function () {
  var SERIF = '"Songti SC", "STSong", "SimSun", "Noto Serif CJK SC", "WenQuanYi Micro Hei", serif';
  var PAPER = '#F5E5CE';
  var INK = '#2E2924';
  var INK_MID = '#6E655B';
  var INK_LIGHT = '#9A8E80';

  function splitPoemColumns(text) {
    var clean = String(text || '').replace(/\s+/g, '');
    var mid;
    var best = -1;
    var bestDist = 999;
    var i;
    var ch;
    if (!clean) return [''];
    if (clean.length <= 12) return [clean];
    mid = clean.length / 2;
    for (i = 2; i < clean.length - 2; i++) {
      ch = clean.charAt(i);
      if ('，。？！；、'.indexOf(ch) !== -1) {
        if (Math.abs(i + 1 - mid) < bestDist) {
          bestDist = Math.abs(i + 1 - mid);
          best = i + 1;
        }
      }
    }
    if (best > 0) return [clean.slice(0, best), clean.slice(best)];
    return [clean.slice(0, Math.ceil(mid)), clean.slice(Math.ceil(mid))];
  }

  function isPunct(ch) {
    return '，。？！；、'.indexOf(ch) !== -1;
  }

  function drawVerticalText(ctx, text, x, startY, stepY, fontStr, color) {
    var i;
    var ch;
    var y = startY;
    ctx.font = fontStr;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (i = 0; i < text.length; i++) {
      ch = text.charAt(i);
      if (ch === '·') {
        ctx.fillText(ch, x, y - stepY * 0.14);
        y += stepY * 0.62;
      } else if (isPunct(ch)) {
        ctx.fillText(ch, x + stepY * 0.24, y - stepY * 0.22);
        y += stepY;
      } else {
        ctx.fillText(ch, x, y);
        y += stepY;
      }
    }
  }

  function featherEdges(ctx, x, y, w, h, sideW) {
    var grad;
    var sw = typeof sideW === 'number' ? sideW : 136;
    grad = ctx.createLinearGradient(0, y, 0, y + 48);
    grad.addColorStop(0, PAPER);
    grad.addColorStop(1, 'rgba(245, 229, 206, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, 48);

    grad = ctx.createLinearGradient(0, y + h, 0, y + h - 36);
    grad.addColorStop(0, PAPER);
    grad.addColorStop(1, 'rgba(245, 229, 206, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y + h - 36, w, 36);

    grad = ctx.createLinearGradient(x, 0, x + sw, 0);
    grad.addColorStop(0, PAPER);
    grad.addColorStop(1, 'rgba(245, 229, 206, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, sw, h);

    grad = ctx.createLinearGradient(x + w, 0, x + w - sw, 0);
    grad.addColorStop(0, PAPER);
    grad.addColorStop(1, 'rgba(245, 229, 206, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x + w - sw, y, sw, h);
  }

  function render(source, meta) {
    var canvas = document.createElement('canvas');
    var ctx;
    var cols;
    var colCount;
    var maxChars = 0;
    var i;
    var fontSize;
    var stepY;
    var rightColX;
    var colGap;
    var metaX;
    var metaText;
    var metaStartY;

    canvas.width = 1080;
    canvas.height = 1680;
    ctx = canvas.getContext('2d');
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, 1080, 1680);

    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 56, 120, 810, 1440);
    featherEdges(ctx, 56, 120, 810, 1440);

    /* 右上小标：宋式衣橱 */
    drawVerticalText(ctx, '宋式衣橱', 990, 140, 28, '20px ' + SERIF, INK_LIGHT);

    /* 右侧竖排题诗 */
    cols = splitPoemColumns((meta && meta.line) || '');
    colCount = cols.length;
    for (i = 0; i < colCount; i++) {
      if (cols[i].length > maxChars) maxChars = cols[i].length;
    }
    fontSize = maxChars > 12 ? 36 : 42;
    stepY = Math.round(fontSize * 1.34);
    rightColX = 910;
    colGap = 64;
    for (i = 0; i < colCount; i++) {
      drawVerticalText(ctx, cols[i], rightColX - i * colGap, 256, stepY, fontSize + 'px ' + SERIF, INK);
    }

    /* 落款错落居诗句左下方 */
    metaText = String((meta && meta.source) || '').replace('《', '·').replace('》', '').replace(/\s+/g, '');
    if (metaText) {
      metaX = rightColX - colCount * colGap - 4;
      metaStartY = 336;
      if (metaStartY + metaText.length * 32 > 1480) {
        metaStartY = Math.max(256, 1480 - metaText.length * 32);
      }
      drawVerticalText(ctx, metaText, metaX, metaStartY, 32, '23px ' + SERIF, INK_MID);
    }

    return canvas;
  }

  function drawDiptychPanel(ctx, source, meta, centerX, dx, dy, dw, dh, labelPrefix) {
    var lookName = (meta && meta.lookName) || '宣纸素本';
    var srcText = String((meta && meta.source) || '').replace('《', '·').replace('》', '').replace(/\s+/g, '');

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '26px ' + SERIF;
    ctx.fillStyle = INK;
    ctx.fillText(labelPrefix + ' · ' + lookName, centerX, 144);

    if (srcText) {
      ctx.font = '18px ' + SERIF;
      ctx.fillStyle = INK_MID;
      ctx.fillText(srcText, centerX, 178);
    }

    ctx.drawImage(source, 120, 0, 480, 1280, dx, dy, dw, dh);
    featherEdges(ctx, dx, dy, dw, dh, 52);
  }

  function renderDiptych(sourceA, metaA, sourceB, metaB) {
    var canvas = document.createElement('canvas');
    var ctx;
    canvas.width = 1080;
    canvas.height = 1440;
    ctx = canvas.getContext('2d');
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, 1080, 1440);

    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';

    ctx.strokeStyle = 'rgba(46, 41, 36, 0.10)';
    ctx.lineWidth = 2;
    ctx.strokeRect(34, 34, 1012, 1372);

    ctx.strokeStyle = 'rgba(46, 41, 36, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(540, 120);
    ctx.lineTo(540, 1310);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '22px ' + SERIF;
    ctx.fillStyle = INK_LIGHT;
    ctx.fillText('宋 式 衣 橱 · 双 联 试 衣', 540, 80);

    drawDiptychPanel(ctx, sourceA, metaA, 285, 78, 204, 414, 1104, '左');
    drawDiptychPanel(ctx, sourceB, metaB, 795, 588, 204, 414, 1104, '右');

    return canvas;
  }

  window.WardrobePoster = {
    render: render,
    renderDiptych: renderDiptych
  };
})();
