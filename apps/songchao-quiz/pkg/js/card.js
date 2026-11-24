(function () {
  var W = 1080;
  var H = 1440;
  var PAPER = '#F7F2EA';
  var INK = '#3E4852';
  var MUTE = '#8C8C8A';
  var ROSE = '#C996A0';
  var SAND = '#D6BEA0';
  var BLUSH = '#ECCECE';
  var LINE = '#E8DCCD';
  var GOLD = '#D6AA78';
  var FONT = '"Noto Serif CJK SC","Songti SC","STSong","SimSun","PingFang SC","Hiragino Sans GB","Microsoft YaHei",serif';

  function font(size, bold) {
    return (bold ? '700 ' : '400 ') + size + 'px ' + FONT;
  }

  function seedRandom(seed) {
    var s = seed || 1;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  function roundRect(ctx, x, y, w, h, r) {
    var radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function ellipse(ctx, cx, cy, rx, ry) {
    ctx.beginPath();
    if (ctx.ellipse) {
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    } else {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(rx, ry);
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.restore();
    }
  }

  function wrapText(ctx, text, maxWidth) {
    var lines = [];
    var paras = String(text || '').split('\n');
    for (var p = 0; p < paras.length; p++) {
      var cur = '';
      var chars = paras[p].split('');
      for (var i = 0; i < chars.length; i++) {
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
      lines.push(cur);
    }
    return lines;
  }

  function blossom(ctx, x, y) {
    ctx.fillStyle = BLUSH;
    var pts = [[0, -10], [10, 0], [0, 10], [-10, 0]];
    for (var i = 0; i < pts.length; i++) {
      ctx.beginPath();
      ctx.arc(x + pts[i][0], y + pts[i][1], 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = GOLD;
    ctx.fill();
  }

  /* 结果卡插画：把页面同一幅 SVG 画进 canvas，保证卡片和页面一致 */
  var artCache = {};

  function svgUrl(typeId) {
    var motifs = window.SCG_MOTIFS || {};
    var svg = motifs[typeId];
    if (!svg) return '';
    svg = svg.replace('<svg ', '<svg width="960" height="960" ');
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function prepare(type) {
    var id = type && type.id;
    return new Promise(function (resolve) {
      if (!id || artCache[id]) { resolve(); return; }
      var url = svgUrl(id);
      if (!url) { resolve(); return; }
      var img = new Image();
      var done = false;
      function finish(ok) {
        if (done) return;
        done = true;
        if (ok) artCache[id] = img;
        resolve();
      }
      img.onload = function () { finish(true); };
      img.onerror = function () { finish(false); };
      setTimeout(function () { finish(false); }, 2500);
      img.src = url;
    });
  }

  function drawArt(ctx, typeId, cx, cy, size, wash) {
    var img = artCache[typeId];
    if (img) {
      try {
        ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
        return;
      } catch (err) { /* 回退到纯色圆 */ }
    }
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = wash;
    ctx.fill();
  }

  function paint(ctx, type) {
    var colors = type.colors || {};
    var wash = colors.wash || '#A0BEBE';
    var rand = seedRandom(type.id ? type.id.length * 97 : 11);

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
    var i;
    for (i = 0; i < 2600; i++) {
      var px = Math.floor(rand() * W);
      var py = Math.floor(rand() * H);
      var g = 232 + Math.floor(rand() * 11);
      ctx.fillStyle = 'rgb(' + (g + 3) + ',' + g + ',' + Math.max(0, g - 6) + ')';
      ctx.fillRect(px, py, 1, 1);
    }

    ctx.strokeStyle = SAND;
    ctx.lineWidth = 6;
    roundRect(ctx, 36, 36, W - 72, H - 72, 36);
    ctx.stroke();
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    roundRect(ctx, 52, 52, W - 104, H - 104, 28);
    ctx.stroke();

    blossom(ctx, 86, 86);
    blossom(ctx, W - 86, 86);
    blossom(ctx, 86, H - 86);
    blossom(ctx, W - 86, H - 86);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    drawArt(ctx, type.id, W / 2, 452, 540, wash);

    ctx.fillStyle = ROSE;
    ctx.font = font(28, false);
    ctx.fillText('娱乐测验结果', W / 2, 746);

    ctx.fillStyle = INK;
    ctx.font = font(84, true);
    var title = type.name || '';
    var titleSize = 84;
    while (titleSize > 56 && ctx.measureText(title).width > 820) {
      titleSize -= 4;
      ctx.font = font(titleSize, true);
    }
    ctx.fillText(title, W / 2, 798);

    ctx.fillStyle = ROSE;
    ctx.fillRect(W / 2 - 36, 918, 72, 8);

    ctx.fillStyle = INK;
    ctx.font = font(36, false);
    var lines = wrapText(ctx, type.desc || type.brief || '', 780);
    var y = 962;
    for (i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], W / 2, y);
      y += 60;
    }

    ctx.save();
    ctx.translate(W / 2 + 220, Math.min(y + 56, 1210));
    ctx.rotate(12 * Math.PI / 180);
    ctx.strokeStyle = ROSE;
    ctx.lineWidth = 3;
    ctx.strokeRect(-36, -36, 72, 72);
    ctx.fillStyle = ROSE;
    ctx.font = font(28, false);
    ctx.textBaseline = 'middle';
    ctx.fillText('戏作', 0, 0);
    ctx.restore();

    ctx.fillStyle = MUTE;
    ctx.font = font(26, false);
    ctx.textBaseline = 'top';
    ctx.fillText('测测你是宋朝哪种女子', W / 2, 1288);
    ctx.fillText('这是娱乐测验，不是历史分类', W / 2, 1334);
  }

  function drawCard(type) {
    var canvas = document.getElementById('card-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
    }
    var ctx = canvas.getContext('2d');
    if (!ctx) return '';
    paint(ctx, type);
    try {
      return canvas.toDataURL('image/png');
    } catch (err) {
      return '';
    }
  }

  window.SCG_CARD = {
    prepare: prepare,
    drawCard: drawCard
  };
})();
