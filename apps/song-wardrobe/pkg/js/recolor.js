/* 按蒙版给母图分区换色。亮度残差保留衣褶，真墨线不在蒙版里。 */
(function () {
  var PARTS = ['beizi', 'inner', 'skirt', 'waist'];
  var YREF = {
    beizi: 223.9628,
    inner: 231.5244,
    skirt: 184.107,
    waist: 183.6044
  };
  var PROBE = {
    beizi: 659 * 720 + 402,
    inner: 375 * 720 + 342,
    skirt: 958 * 720 + 381,
    waist: 477 * 720 + 325
  };
  var W = 720;
  var H = 1280;
  var master = null;
  var frame = null;
  var index = {};
  var colors = { beizi: null, inner: null, skirt: null, waist: null };
  var canvas = null;
  var ctx = null;

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error(src)); };
      img.src = src;
    });
  }

  function maskIndex(img) {
    var c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    var g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    var data = g.getImageData(0, 0, c.width, c.height).data;
    var list = [];
    var i;
    for (i = 0; i < data.length; i += 4) {
      if (data[i] > 127) list.push(i / 4);
    }
    return list;
  }

  function parseHex(hex) {
    var n = parseInt(String(hex).slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function luma(r, g, b) {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function paintPart(part) {
    var hex = colors[part];
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
    if (!hex) {
      for (i = 0; i < list.length; i++) {
        o = list[i] * 4;
        frame[o] = master[o];
        frame[o + 1] = master[o + 1];
        frame[o + 2] = master[o + 2];
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
      frame[o] = yn * cr;
      frame[o + 1] = yn * cg;
      frame[o + 2] = yn * cb;
    }
  }

  function present() {
    var image = ctx.createImageData(W, H);
    image.data.set(frame);
    ctx.putImageData(image, 0, 0);
  }

  function paintAll() {
    var i;
    frame.set(master);
    for (i = 0; i < PARTS.length; i++) {
      if (colors[PARTS[i]]) paintPart(PARTS[i]);
    }
    present();
  }

  var ready = Promise.all([
    loadImage('./images/figure.png'),
    loadImage('./images/mask-beizi.png'),
    loadImage('./images/mask-inner.png'),
    loadImage('./images/mask-skirt.png'),
    loadImage('./images/mask-waist.png')
  ]).then(function (imgs) {
    canvas = document.getElementById('figure');
    ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;
    ctx.drawImage(imgs[0], 0, 0);
    var snap = ctx.getImageData(0, 0, W, H);
    master = new Uint8ClampedArray(snap.data);
    frame = new Uint8ClampedArray(master);
    index.beizi = maskIndex(imgs[1]);
    index.inner = maskIndex(imgs[2]);
    index.skirt = maskIndex(imgs[3]);
    index.waist = maskIndex(imgs[4]);
    present();
    return true;
  });

  window.WardrobePaint = {
    ready: ready,
    parts: PARTS,
    width: W,
    height: H,
    canvas: function () { return canvas; },
    getColors: function () {
      return {
        beizi: colors.beizi,
        inner: colors.inner,
        skirt: colors.skirt,
        waist: colors.waist
      };
    },
    setColors: function (next) {
      var i;
      var key;
      for (i = 0; i < PARTS.length; i++) {
        key = PARTS[i];
        colors[key] = next && next[key] ? next[key] : null;
      }
      paintAll();
    },
    sample: function (part) {
      var p = PROBE[part];
      var o = p * 4;
      return [frame[o], frame[o + 1], frame[o + 2]];
    }
  };
})();
