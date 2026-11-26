/* 按蒙版给母图分区换色（6部位）。亮度残差保留衣褶，真墨线不在蒙版里。支持局部柔缓晕染过渡与直接点衣命中。 */
(function () {
  var PARTS = ['beizi', 'inner', 'zhongyi', 'skirt', 'waist', 'shoes'];
  var YREF = {
    beizi: 223.9628,
    inner: 230.737,
    zhongyi: 239.329,
    skirt: 184.107,
    waist: 183.6044,
    shoes: 215.729
  };
  var PROBE = {
    beizi: 659 * 720 + 402,
    inner: 375 * 720 + 342,
    zhongyi: 290 * 720 + 348,
    skirt: 958 * 720 + 381,
    waist: 477 * 720 + 325,
    shoes: 1220 * 720 + 308
  };
  var W = 720;
  var H = 1280;
  var master = null;
  var frame = null;
  var display = null;
  var hitMap = null;
  var centers = {};
  var index = {};
  var colors = { beizi: null, inner: null, zhongyi: null, skirt: null, waist: null, shoes: null };
  var canvas = null;
  var ctx = null;
  var imageBuf = null;
  var previewOriginal = false;
  var animRaf = 0;

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error(src)); };
      img.src = src;
    });
  }

  function buildMaskData(img, partIndex) {
    var c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    var g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    var data = g.getImageData(0, 0, c.width, c.height).data;
    var list = [];
    var sumX = 0;
    var sumY = 0;
    var i;
    var p;
    var code = partIndex + 1;
    for (i = 0; i < data.length; i += 4) {
      if (data[i] > 127) {
        p = i / 4;
        list.push(p);
        if (p < hitMap.length) hitMap[p] = code;
        sumX += p % W;
        sumY += Math.floor(p / W);
      }
    }
    return {
      list: list,
      center: list.length
        ? { x: Math.round(sumX / list.length), y: Math.round(sumY / list.length) }
        : { x: Math.round(W / 2), y: Math.round(H / 2) }
    };
  }

  function parseHex(hex) {
    var n = parseInt(String(hex).slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function luma(r, g, b) {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function paintPartInto(targetBuf, part, hex) {
    var list = index[part];
    var yref = YREF[part];
    var i;
    var p;
    var o;
    var y;
    var yn;
    var rgb;
    var yt;
    var cr;
    var cg;
    var cb;
    if (!list) return;
    if (!hex) {
      for (i = 0; i < list.length; i++) {
        o = list[i] * 4;
        targetBuf[o] = master[o];
        targetBuf[o + 1] = master[o + 1];
        targetBuf[o + 2] = master[o + 2];
      }
      return;
    }
    rgb = parseHex(hex);
    yt = luma(rgb[0], rgb[1], rgb[2]);
    cr = rgb[0] / (yt || 1);
    cg = rgb[1] / (yt || 1);
    cb = rgb[2] / (yt || 1);
    for (i = 0; i < list.length; i++) {
      p = list[i];
      o = p * 4;
      y = luma(master[o], master[o + 1], master[o + 2]);
      yn = yt + (y - yref);
      if (yn < 8) yn = 8;
      if (yn > 250) yn = 250;
      targetBuf[o] = yn * cr;
      targetBuf[o + 1] = yn * cg;
      targetBuf[o + 2] = yn * cb;
    }
  }

  function paintPart(part) {
    paintPartInto(frame, part, colors[part]);
  }

  function renderOffscreen(nextColors) {
    var c = document.createElement('canvas');
    var g = c.getContext('2d');
    var buf;
    var imgData;
    var i;
    var part;
    c.width = W;
    c.height = H;
    if (!master) return c;
    buf = new Uint8ClampedArray(master);
    for (i = 0; i < PARTS.length; i++) {
      part = PARTS[i];
      if (nextColors && nextColors[part]) {
        paintPartInto(buf, part, nextColors[part]);
      }
    }
    imgData = g.createImageData(W, H);
    imgData.data.set(buf);
    g.putImageData(imgData, 0, 0);
    return c;
  }

  function present(sourcePixels) {
    var pixels = sourcePixels || (previewOriginal ? master : display);
    if (!ctx || !pixels) return;
    if (!imageBuf) imageBuf = ctx.createImageData(W, H);
    imageBuf.data.set(pixels);
    ctx.putImageData(imageBuf, 0, 0);
  }

  function flush() {
    if (animRaf) {
      cancelAnim();
      display.set(frame);
      if (!previewOriginal) present(display);
    }
  }

  function cancelAnim() {
    if (animRaf && window.cancelAnimationFrame) {
      window.cancelAnimationFrame(animRaf);
    }
    animRaf = 0;
  }

  function runBlend(changedParts) {
    var lists = [];
    var i;
    var fromPixels;
    var startTime = 0;
    var duration = 180;
    for (i = 0; i < changedParts.length; i++) {
      if (index[changedParts[i]]) lists.push(index[changedParts[i]]);
    }
    if (!lists.length || !window.requestAnimationFrame) {
      display.set(frame);
      present();
      return;
    }
    cancelAnim();
    fromPixels = new Uint8ClampedArray(display);

    function step(now) {
      var t;
      var ease;
      var li;
      var list;
      var j;
      var o;
      if (!startTime) startTime = now;
      t = Math.min(1, (now - startTime) / duration);
      ease = 1 - Math.pow(1 - t, 3);
      for (li = 0; li < lists.length; li++) {
        list = lists[li];
        for (j = 0; j < list.length; j++) {
          o = list[j] * 4;
          display[o] = fromPixels[o] + (frame[o] - fromPixels[o]) * ease;
          display[o + 1] = fromPixels[o + 1] + (frame[o + 1] - fromPixels[o + 1]) * ease;
          display[o + 2] = fromPixels[o + 2] + (frame[o + 2] - fromPixels[o + 2]) * ease;
        }
      }
      present();
      if (t < 1 && !previewOriginal) {
        animRaf = window.requestAnimationFrame(step);
      } else {
        animRaf = 0;
        display.set(frame);
        present();
      }
    }
    animRaf = window.requestAnimationFrame(step);
  }

  function paintAll(changedParts, animate) {
    var i;
    frame.set(master);
    for (i = 0; i < PARTS.length; i++) {
      if (colors[PARTS[i]]) paintPart(PARTS[i]);
    }
    if (animate && !previewOriginal && changedParts && changedParts.length) {
      runBlend(changedParts);
    } else {
      cancelAnim();
      display.set(frame);
      present();
    }
  }

  function hitTest(x, y) {
    var cx;
    var cy;
    var code;
    var r;
    var dy;
    var dx;
    var nx;
    var ny;
    if (!hitMap) return '';
    cx = Math.round(x);
    cy = Math.round(y);
    if (cx < 0 || cx >= W || cy < 0 || cy >= H) return '';
    code = hitMap[cy * W + cx];
    if (code > 0) return PARTS[code - 1] || '';
    for (r = 1; r <= 7; r++) {
      for (dy = -r; dy <= r; dy++) {
        ny = cy + dy;
        if (ny < 0 || ny >= H) continue;
        for (dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          nx = cx + dx;
          if (nx < 0 || nx >= W) continue;
          code = hitMap[ny * W + nx];
          if (code > 0) return PARTS[code - 1] || '';
        }
      }
    }
    return '';
  }

  var ready = Promise.all([
    loadImage('./images/figure.png'),
    loadImage('./images/mask-beizi.png'),
    loadImage('./images/mask-inner.png'),
    loadImage('./images/mask-zhongyi.png'),
    loadImage('./images/mask-skirt.png'),
    loadImage('./images/mask-waist.png'),
    loadImage('./images/mask-shoes.png')
  ]).then(function (imgs) {
    var i;
    var built;
    canvas = document.getElementById('figure');
    ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;
    imageBuf = ctx.createImageData(W, H);
    ctx.drawImage(imgs[0], 0, 0);
    var snap = ctx.getImageData(0, 0, W, H);
    master = new Uint8ClampedArray(snap.data);
    frame = new Uint8ClampedArray(master);
    display = new Uint8ClampedArray(master);
    hitMap = new Uint8Array(W * H);
    for (i = 0; i < PARTS.length; i++) {
      built = buildMaskData(imgs[i + 1], i);
      index[PARTS[i]] = built.list;
      centers[PARTS[i]] = built.center;
    }
    present();
    return true;
  });

  window.WardrobePaint = {
    ready: ready,
    parts: PARTS,
    width: W,
    height: H,
    canvas: function () {
      flush();
      return canvas;
    },
    flush: flush,
    getColors: function () {
      return {
        beizi: colors.beizi,
        inner: colors.inner,
        zhongyi: colors.zhongyi,
        skirt: colors.skirt,
        waist: colors.waist,
        shoes: colors.shoes
      };
    },
    setColors: function (next, animate) {
      var i;
      var key;
      var nextVal;
      var changed = [];
      for (i = 0; i < PARTS.length; i++) {
        key = PARTS[i];
        nextVal = next && next[key] ? next[key] : null;
        if (colors[key] !== nextVal) changed.push(key);
        colors[key] = nextVal;
      }
      paintAll(changed, !!animate);
    },
    setPreviewOriginal: function (flag) {
      var next = !!flag;
      if (previewOriginal === next) return;
      previewOriginal = next;
      if (previewOriginal) {
        cancelAnim();
        present(master);
      } else {
        display.set(frame);
        present(display);
      }
    },
    hitTest: hitTest,
    renderOffscreen: renderOffscreen,
    partCenter: function (part) {
      return centers[part] || { x: Math.round(W / 2), y: Math.round(H / 2) };
    },
    sample: function (part) {
      var p = PROBE[part];
      var o = p * 4;
      return [frame[o], frame[o + 1], frame[o + 2]];
    }
  };
})();
