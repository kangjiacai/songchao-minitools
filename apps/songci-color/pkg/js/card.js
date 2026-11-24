/* 色卡导出：1080×1440。地色与界面同为笔记暖奶油 #F7F2EA。词句用衬线，其余用无衬线。 */
(function () {
  var W = 1080;
  var H = 1440;
  var PAPER = '#F7F2EA';
  var INK = '#3A3732';
  var MUTED = '#8A847A';
  var RADIUS = 28;
  var SANS = '"PingFang SC","Hiragino Sans GB","Noto Sans CJK SC","Source Han Sans SC","Microsoft YaHei",sans-serif';
  var SERIF = '"Songti SC","STSong","Noto Serif CJK SC","Source Han Serif SC","SimSun",serif';

  function fontSans(size, weight) {
    return (weight || '400') + ' ' + size + 'px ' + SANS;
  }

  function fontSerif(size, weight) {
    return (weight || '400') + ' ' + size + 'px ' + SERIF;
  }

  function roundRect(ctx, x, y, w, h, r) {
    var radius = r;
    if (w < 2 * radius) radius = w / 2;
    if (h < 2 * radius) radius = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function wrapText(ctx, text, maxWidth) {
    var lines = [];
    var paras = String(text || '').split('\n');
    var p, i;
    for (p = 0; p < paras.length; p++) {
      var cur = '';
      var chars = paras[p].split('');
      for (i = 0; i < chars.length; i++) {
        var ch = chars[i];
        var trial = cur + ch;
        if (cur && ctx.measureText(trial).width > maxWidth) {
          if ('，。、；：！？）」』”'.indexOf(ch) !== -1) {
            cur = trial;
            ch = '';
          }
          lines.push(cur);
          cur = ch;
        } else {
          cur = trial;
        }
      }
      if (cur) lines.push(cur);
    }
    return lines;
  }

  function contrastInk(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length !== 6) return INK;
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    var y = (r * 299 + g * 587 + b * 114) / 1000;
    return y < 150 ? PAPER : INK;
  }

  function render(ci) {
    var canvas = document.getElementById('card-canvas');
    if (!canvas || !ci) return '';
    var ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = MUTED;
    ctx.font = fontSans(26, '500');
    ctx.textAlign = 'left';
    ctx.fillText('宋朝配色', 80, 120);

    ctx.fillStyle = MUTED;
    ctx.font = fontSans(28, '400');
    ctx.fillText(ci.poet + '《' + ci.tune + '》', 80, 210);

    ctx.fillStyle = INK;
    ctx.font = fontSerif(54, '700');
    var lines = wrapText(ctx, ci.line, 920);
    var i;
    var y = 290;
    for (i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 80, y);
      y += 76;
    }

    if (ci.note) {
      ctx.fillStyle = MUTED;
      ctx.font = fontSans(24, '400');
      var notes = wrapText(ctx, ci.note, 920);
      y += 8;
      for (i = 0; i < notes.length; i++) {
        ctx.fillText(notes[i], 80, y);
        y += 38;
      }
    }

    y += 36;
    var colors = ci.colors || [];
    var gridBottom = H - 160;
    var gridH = gridBottom - y;
    if (gridH < 420) gridH = 420;
    var gap = 18;
    var colW = Math.floor((W - 160 - gap * 3) / 4);
    var ox = 80;

    for (i = 0; i < colors.length && i < 4; i++) {
      var cx = ox + i * (colW + gap);
      ctx.fillStyle = colors[i].hex;
      roundRect(ctx, cx, y, colW, gridH, RADIUS);
      ctx.fill();
      var cr = parseInt(String(colors[i].hex).slice(1, 3), 16);
      var cg = parseInt(String(colors[i].hex).slice(3, 5), 16);
      var cb = parseInt(String(colors[i].hex).slice(5, 7), 16);
      if (Math.abs(cr - 247) + Math.abs(cg - 242) + Math.abs(cb - 234) < 90) {
        ctx.strokeStyle = 'rgba(58, 55, 50, 0.12)';
        ctx.lineWidth = 2;
        roundRect(ctx, cx + 1, y + 1, colW - 2, gridH - 2, Math.max(0, RADIUS - 1));
        ctx.stroke();
      }
      ctx.fillStyle = contrastInk(colors[i].hex);
      ctx.font = fontSans(28, '500');
      ctx.textAlign = 'left';
      ctx.fillText(colors[i].name, cx + 22, y + gridH - 56);
      ctx.font = fontSans(22, '400');
      ctx.fillText(colors[i].hex, cx + 22, y + gridH - 24);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = MUTED;
    ctx.font = fontSans(22, '400');
    ctx.fillText('意象取色，非文物实测', 80, H - 80);

    try {
      return canvas.toDataURL('image/png');
    } catch (err) {
      return '';
    }
  }

  window.SCC_CARD = { render: render, contrastInk: contrastInk };
})();
