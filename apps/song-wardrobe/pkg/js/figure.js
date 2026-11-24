/* 换装用人形。同一套骨架上叠衫、裙、褙、棉披，只画两条胳膊两只手。 */
(function () {
  var SVGNS = 'http://www.w3.org/2000/svg';
  var VIEW = { w: 400, h: 760 };
  var SKIN = '#F3D2C0';
  var SKIN_LINE = '#E2B7A4';
  var HAIR = '#2B2622';
  var HAIR_SOFT = '#4A433C';
  var INK = '#3A3732';
  var GOLD = '#C6A36A';
  var UNDER = '#EFE6D8';
  var SHOE = '#4A403A';

  var ARM_L = { a: [168, 198], b: [124, 314], c: [140, 420] };
  var ARM_R = { a: [232, 198], b: [276, 314], c: [260, 420] };

  function el(name, attrs) {
    var node = document.createElementNS(SVGNS, name);
    var key;
    if (attrs) {
      for (key in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, key) && attrs[key] != null) {
          node.setAttribute(key, String(attrs[key]));
        }
      }
    }
    return node;
  }

  function add(parent, name, attrs) {
    var node = el(name, attrs);
    parent.appendChild(node);
    return node;
  }

  function qbez(a, b, c, t) {
    var u = 1 - t;
    return [
      u * u * a[0] + 2 * u * t * b[0] + t * t * c[0],
      u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]
    ];
  }

  function qtan(a, b, c, t) {
    var dx = 2 * (1 - t) * (b[0] - a[0]) + 2 * t * (c[0] - b[0]);
    var dy = 2 * (1 - t) * (b[1] - a[1]) + 2 * t * (c[1] - b[1]);
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    return [dx / len, dy / len];
  }

  function sleevePath(arm, w0, w1, t0, t1) {
    var steps = 14;
    var left = [];
    var right = [];
    var i;
    var t;
    var p;
    var tan;
    var nx;
    var ny;
    var w;
    var pts;
    var d;
    for (i = 0; i <= steps; i++) {
      t = t0 + (t1 - t0) * (i / steps);
      p = qbez(arm.a, arm.b, arm.c, t);
      tan = qtan(arm.a, arm.b, arm.c, t);
      nx = -tan[1];
      ny = tan[0];
      w = w0 + (w1 - w0) * t;
      left.push([p[0] + nx * w, p[1] + ny * w]);
      right.push([p[0] - nx * w, p[1] - ny * w]);
    }
    pts = left.concat(right.reverse());
    d = '';
    for (i = 0; i < pts.length; i++) {
      d += (i ? 'L' : 'M') + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1);
    }
    return d + 'Z';
  }

  function dyeAttrs(key, amt, extra) {
    var attrs = extra || {};
    attrs['data-dye'] = key;
    if (amt) attrs['data-amt'] = String(amt);
    return attrs;
  }

  function strokeDye(key, amt, extra) {
    var attrs = extra || {};
    attrs['data-dye-stroke'] = key;
    if (amt) attrs['data-amt'] = String(amt);
    attrs.fill = 'none';
    return attrs;
  }

  function cloth(parent, d, key, amt) {
    return add(parent, 'path', dyeAttrs(key, amt, {
      d: d,
      stroke: INK,
      'stroke-opacity': '0.22',
      'stroke-width': '1.25'
    }));
  }

  function sample(parent, id, x, y) {
    add(parent, 'rect', {
      id: id,
      x: x - 1,
      y: y - 1,
      width: 2,
      height: 2,
      fill: 'none',
      opacity: '0'
    });
  }

  function ptsD(pts, close) {
    var i;
    var d = '';
    for (i = 0; i < pts.length; i++) {
      d += (i ? 'L' : 'M') + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1);
    }
    return close === false ? d : d + 'Z';
  }

  function mirrorPts(pts) {
    var out = [];
    var i;
    for (i = pts.length - 1; i >= 0; i--) out.push([400 - pts[i][0], pts[i][1]]);
    return out;
  }

  function skirtPoint(u, v) {
    var leftX = 156 + (104 - 156) * u;
    var leftY = 308 + (678 - 308) * u;
    var rightX = 244 + (292 - 244) * u;
    var rightY = 308 + (686 - 308) * u;
    return [
      leftX + (rightX - leftX) * v,
      leftY + (rightY - leftY) * v
    ];
  }

  function skirtStrip(v0, v1) {
    var top = [];
    var bot = [];
    var i;
    var steps = 8;
    for (i = 0; i <= steps; i++) top.push(skirtPoint(0, v0 + (v1 - v0) * (i / steps)));
    for (i = steps; i >= 0; i--) bot.push(skirtPoint(1, v0 + (v1 - v0) * (i / steps)));
    return ptsD(top.concat(bot));
  }

  function addSleeves(parent, key, w0, w1, t0, t1, amt, className) {
    var dL = sleevePath(ARM_L, w0, w1, t0, t1);
    var dR = sleevePath(ARM_R, w0, w1, t0, t1);
    cloth(parent, dL, key, amt).setAttribute('class', className);
    cloth(parent, dR, key, amt).setAttribute('class', className);
  }

  function addHands(parent) {
    addHand(parent, ARM_L, 'hand-l');
    addHand(parent, ARM_R, 'hand-r');
  }

  function addHand(parent, arm, id) {
    var wrist = arm.c;
    var elbow = arm.b;
    var dx = wrist[0] - elbow[0];
    var dy = wrist[1] - elbow[1];
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var tx = dx / len;
    var ty = dy / len;
    var nx = -ty;
    var ny = tx;
    var outward = wrist[0] >= 200 ? 1 : -1;
    var g;
    var acrossSign;
    if (nx * outward < 0) {
      nx = -nx;
      ny = -ny;
    }
    function at(along, across) {
      var ox = wrist[0] - tx * 8;
      var oy = wrist[1] - ty * 8;
      return [ox + tx * along + nx * across, oy + ty * along + ny * across];
    }
    g = add(parent, 'g', { id: id, class: 'hand' });
    add(g, 'path', {
      d: ptsD([
        at(0, -7),
        at(8, -8),
        at(24, -6),
        at(32, -1),
        at(30, 5),
        at(16, 7),
        at(2, 6)
      ]),
      fill: SKIN,
      stroke: SKIN_LINE,
      'stroke-width': '1.1'
    });
    acrossSign = -1;
    add(g, 'path', {
      d: ptsD([
        at(6, acrossSign * 2),
        at(8, acrossSign * 11),
        at(16, acrossSign * 12),
        at(18, acrossSign * 3)
      ]),
      fill: '#EBC4B0',
      stroke: SKIN_LINE,
      'stroke-width': '0.9'
    });
    add(g, 'path', {
      d: 'M' + at(18, -3).map(function (n) { return n.toFixed(1); }).join(' ') +
        'L' + at(28, -2).map(function (n) { return n.toFixed(1); }).join(' ') +
        'M' + at(18, 1).map(function (n) { return n.toFixed(1); }).join(' ') +
        'L' + at(29, 1).map(function (n) { return n.toFixed(1); }).join(' '),
      fill: 'none',
      stroke: '#E2B7A4',
      'stroke-width': '0.8'
    });
  }

  function addFlower(parent, cx, cy, fill) {
    var angles = [0, 72, 144, 216, 288];
    var i;
    var rad;
    var px;
    var py;
    for (i = 0; i < angles.length; i++) {
      rad = angles[i] * Math.PI / 180;
      px = cx + Math.cos(rad) * 7;
      py = cy + Math.sin(rad) * 7;
      add(parent, 'ellipse', {
        cx: px.toFixed(1),
        cy: py.toFixed(1),
        rx: '4.2',
        ry: '6.4',
        fill: fill,
        transform: 'rotate(' + angles[i] + ' ' + px.toFixed(1) + ' ' + py.toFixed(1) + ')'
      });
    }
    add(parent, 'circle', { cx: cx, cy: cy, r: '2.6', fill: '#E7C9A2' });
  }

  function buildScenes(svg) {
    var out = add(svg, 'g', { id: 'g-scene-out' });
    var flower = add(svg, 'g', { id: 'g-scene-flower' });
    var winter = add(svg, 'g', { id: 'g-scene-winter' });
    add(svg, 'g', { id: 'g-scene-home' });

    add(out, 'path', {
      d: 'M34 48 C52 96, 28 132, 46 196 M42 118 C62 112, 70 132, 54 146',
      fill: 'none',
      stroke: '#7E9468',
      'stroke-width': '1.7',
      'stroke-opacity': '0.8'
    });
    add(out, 'ellipse', { cx: '62', cy: '108', rx: '7', ry: '3.2', fill: '#8AA572', opacity: '0.75', transform: 'rotate(-28 62 108)' });
    add(out, 'ellipse', { cx: '58', cy: '128', rx: '6', ry: '2.8', fill: '#6E8A62', opacity: '0.7', transform: 'rotate(24 58 128)' });

    addFlower(flower, 332, 78, '#F4E4E4');
    addFlower(flower, 352, 118, '#E7B7C0');
    addFlower(flower, 318, 126, '#F7F1EA');
    add(flower, 'path', {
      d: 'M300 150 C318 132, 336 112, 348 86',
      fill: 'none',
      stroke: '#7E9468',
      'stroke-width': '1.4',
      opacity: '0.8'
    });

    add(winter, 'path', {
      d: 'M318 46 C340 78, 328 110, 356 156 M338 96 C354 92, 360 108, 346 116',
      fill: 'none',
      stroke: '#6E5A52',
      'stroke-width': '1.6'
    });
    addFlower(winter, 348, 64, '#F7F4F2');
    addFlower(winter, 326, 96, '#F0D5D8');
    var flakes = [[46, 52], [72, 88], [38, 124], [80, 156], [54, 188], [336, 188], [300, 46], [366, 132]];
    var i;
    for (i = 0; i < flakes.length; i++) {
      add(winter, 'circle', {
        cx: flakes[i][0],
        cy: flakes[i][1],
        r: i % 2 ? '2.1' : '1.5',
        fill: '#D5DCE0',
        opacity: '0.95'
      });
    }
  }

  function buildHairBack(parent) {
    add(parent, 'ellipse', { cx: '200', cy: '118', rx: '40', ry: '48', fill: HAIR });
    add(parent, 'circle', { id: 'hair-bun', cx: '198', cy: '62', r: '23', fill: HAIR });
    add(parent, 'circle', { cx: '218', cy: '50', r: '15', fill: HAIR });
  }

  function buildNeck(parent) {
    add(parent, 'path', {
      d: 'M186 146 L181 198 L219 198 L214 146 Z',
      fill: SKIN
    });
  }

  function buildFace(parent) {
    add(parent, 'ellipse', { cx: '166', cy: '120', rx: '6', ry: '9', fill: SKIN });
    add(parent, 'ellipse', { cx: '234', cy: '120', rx: '6', ry: '9', fill: SKIN });
    add(parent, 'path', {
      d: 'M200 70 C232 76, 236 108, 226 132 C218 154, 182 154, 174 132 C164 108, 168 76, 200 70 Z',
      fill: SKIN,
      stroke: SKIN_LINE,
      'stroke-width': '1.2'
    });
    add(parent, 'ellipse', { cx: '178', cy: '126', rx: '7', ry: '3.2', fill: '#E8B5A6', opacity: '0.28' });
    add(parent, 'ellipse', { cx: '222', cy: '126', rx: '7', ry: '3.2', fill: '#E8B5A6', opacity: '0.28' });
    addEye(parent, 188, 112);
    addEye(parent, 214, 112);
    add(parent, 'path', {
      d: 'M176 99 Q186 95 195 100',
      fill: 'none',
      stroke: HAIR,
      'stroke-width': '1.15'
    });
    add(parent, 'path', {
      d: 'M207 100 Q216 95 226 99',
      fill: 'none',
      stroke: HAIR,
      'stroke-width': '1.15'
    });
    add(parent, 'path', {
      d: 'M200 118 L199 126',
      fill: 'none',
      stroke: '#C9A090',
      'stroke-width': '1.2',
      'stroke-opacity': '0.65'
    });
    add(parent, 'path', {
      d: 'M194 136 Q200 139 206 136',
      fill: 'none',
      stroke: '#B78480',
      'stroke-width': '1.5'
    });
  }

  function addEye(parent, cx, cy) {
    add(parent, 'ellipse', {
      cx: String(cx),
      cy: String(cy),
      rx: '6.1',
      ry: '2.35',
      fill: '#F8F4F0',
      stroke: INK,
      'stroke-width': '0.95'
    });
    add(parent, 'circle', {
      cx: String(cx),
      cy: String(cy + 0.2),
      r: '1.45',
      fill: INK
    });
    add(parent, 'path', {
      d: 'M' + (cx - 6.4) + ' ' + (cy - 0.4) + ' Q' + cx + ' ' + (cy - 4.2) + ' ' + (cx + 6.4) + ' ' + (cy - 0.4),
      fill: 'none',
      stroke: HAIR,
      'stroke-width': '1.15'
    });
  }

  function buildHairFront(parent) {
    add(parent, 'path', {
      d: 'M176 100 C164 116, 166 134, 176 148 C182 134, 180 116, 184 104 Z',
      fill: HAIR
    });
    add(parent, 'path', {
      d: 'M224 100 C236 116, 234 134, 224 148 C218 134, 220 116, 216 104 Z',
      fill: HAIR
    });
    add(parent, 'circle', { cx: '198', cy: '62', r: '23', fill: HAIR });
    add(parent, 'circle', { cx: '218', cy: '50', r: '15', fill: HAIR });
    add(parent, 'ellipse', {
      cx: '190', cy: '56', rx: '8', ry: '5',
      fill: HAIR_SOFT, opacity: '0.55',
      transform: 'rotate(-24 190 56)'
    });
  }

  function buildShirt(parent) {
    cloth(parent, 'M148 198 C164 220, 166 248, 168 286 L162 338 L238 338 L232 286 C234 248, 236 220, 252 198 L228 176 Q200 202 172 176 Z', 'shirt', 0);
    addSleeves(parent, 'shirt', 16, 12, 0, 1, 0, 'sleeve sleeve-shirt');
    addSleeves(parent, 'shirt', 17, 14, 0.9, 1, -0.16, 'cuff cuff-shirt');
    sample(parent, 'sample-shirt', 200, 270);
  }

  function buildCollars(svg) {
    var jiao = add(svg, 'g', { id: 'g-collar-jiaoling' });
    var yuan = add(svg, 'g', { id: 'g-collar-yuanling' });
    var zhi = add(svg, 'g', { id: 'g-collar-zhiling' });
    add(jiao, 'path', strokeDye('shirt', 0.16, {
      d: 'M172 206 L198 250',
      'stroke-width': '10',
      'stroke-linecap': 'round'
    }));
    add(jiao, 'path', strokeDye('shirt', -0.18, {
      d: 'M228 204 L200 234 L168 292',
      'stroke-width': '12',
      'stroke-linecap': 'round'
    }));
    add(yuan, 'ellipse', strokeDye('shirt', -0.12, {
      cx: '200', cy: '196', rx: '26', ry: '16',
      'stroke-width': '9'
    }));
    add(zhi, 'path', {
      d: 'M190 186 L200 228 L210 186 Z',
      fill: SKIN
    });
    add(zhi, 'path', dyeAttrs('shirt', -0.16, {
      d: 'M168 184 L190 188 L186 236 L162 228 Z',
      stroke: INK,
      'stroke-opacity': '0.2',
      'stroke-width': '1'
    }));
    add(zhi, 'path', dyeAttrs('shirt', -0.16, {
      d: 'M232 184 L210 188 L214 236 L238 228 Z',
      stroke: INK,
      'stroke-opacity': '0.2',
      'stroke-width': '1'
    }));
  }

  function buildSkirt(parent, id, mode) {
    var g = add(parent, 'g', { id: id });
    var i;
    var a;
    var b;
    if (mode === 'xuan') {
      add(g, 'path', {
        d: skirtStrip(0.4, 0.6),
        fill: UNDER,
        stroke: INK,
        'stroke-opacity': '0.15',
        'stroke-width': '1'
      });
      cloth(g, skirtStrip(0, 0.46), 'skirt', 0);
      cloth(g, skirtStrip(0.54, 1), 'skirt', 0);
    } else {
      cloth(g, skirtStrip(0, 1), 'skirt', 0);
      for (i = 1; i <= 9; i++) {
        a = skirtPoint(0, i / 10);
        b = skirtPoint(1, i / 10);
        add(g, 'path', {
          d: 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1),
          fill: 'none',
          stroke: INK,
          'stroke-opacity': '0.16',
          'stroke-width': '1.15'
        });
      }
    }
    add(g, 'path', dyeAttrs('skirt', 0.14, {
      d: skirtStrip(0.08, 0.2),
      opacity: '0.9',
      stroke: 'none'
    }));
    cloth(g, waistBand(), 'skirt', -0.18);
    add(g, 'path', dyeAttrs('skirt', 0, {
      d: 'M196 318 L188 372 L198 368 Z',
      stroke: INK,
      'stroke-opacity': '0.2',
      'stroke-width': '1'
    }));
    add(g, 'path', dyeAttrs('skirt', -0.08, {
      d: 'M206 318 L216 360 L206 356 Z',
      stroke: INK,
      'stroke-opacity': '0.2',
      'stroke-width': '1'
    }));
    if (mode === 'lan') {
      cloth(g, skirtStrip(0.52, 0.64), 'skirt', -0.28);
      add(g, 'path', {
        d: (function () {
          var p1 = skirtPoint(0.52, 0);
          var p2 = skirtPoint(0.52, 1);
          var p3 = skirtPoint(0.64, 0);
          var p4 = skirtPoint(0.64, 1);
          return 'M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) +
            'L' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) +
            'M' + p3[0].toFixed(1) + ' ' + p3[1].toFixed(1) +
            'L' + p4[0].toFixed(1) + ' ' + p4[1].toFixed(1);
        })(),
        fill: 'none',
        stroke: GOLD,
        'stroke-width': '1.4',
        'stroke-opacity': '0.85'
      });
    }
    if (mode !== 'xuan') sample(g, 'sample-skirt-' + mode, 150, 650);
    else sample(g, 'sample-skirt-xuan', 150, 650);
    return g;
  }

  function waistBand() {
    return skirtStrip(0, 0.045);
  }

  function buildBeizi(parent, id, pts, sleeveEnd) {
    var g = add(parent, 'g', { id: id });
    cloth(g, ptsD(pts), 'beizi', 0);
    cloth(g, ptsD(mirrorPts(pts)), 'beizi', 0);
    cloth(g, 'M178 178 L222 178 L216 204 L184 204 Z', 'beizi', -0.1);
    addSleeves(g, 'beizi', sleeveEnd > 0.7 ? 26 : 23, sleeveEnd > 0.7 ? 20 : 18, 0, sleeveEnd, 0, 'sleeve sleeve-beizi');
    addSleeves(g, 'beizi', sleeveEnd > 0.7 ? 27 : 24, sleeveEnd > 0.7 ? 22 : 19, Math.max(0, sleeveEnd - 0.08), sleeveEnd, -0.2, 'sleeve sleeve-beizi');
    if (id === 'g-beizi-long') sample(g, 'sample-beizi-long', 152, 560);
    if (id === 'g-beizi-short') sample(g, 'sample-beizi-short', 156, 300);
    add(g, 'path', {
      d: 'M' + pts[1][0] + ' ' + pts[1][1] + ' L' + pts[2][0] + ' ' + pts[2][1],
      fill: 'none',
      stroke: INK,
      'stroke-opacity': '0.28',
      'stroke-width': '1.6'
    });
    var edge = mirrorPts(pts);
    add(g, 'path', {
      d: 'M' + edge[edge.length - 2][0] + ' ' + edge[edge.length - 2][1] + ' L' + edge[edge.length - 3][0] + ' ' + edge[edge.length - 3][1],
      fill: 'none',
      stroke: INK,
      'stroke-opacity': '0.28',
      'stroke-width': '1.6'
    });
    return g;
  }

  function buildWinter(parent) {
    var g = add(parent, 'g', { id: 'g-winter' });
    var pts = [[138, 196], [172, 226], [170, 498], [100, 512], [90, 336], [116, 228]];
    var i;
    var y;
    cloth(g, ptsD(pts), 'winter', 0);
    cloth(g, ptsD(mirrorPts(pts)), 'winter', 0);
    cloth(g, 'M164 230 L174 230 L172 490 L162 488 Z', 'winter', 0.22);
    cloth(g, 'M236 230 L226 230 L228 490 L238 488 Z', 'winter', 0.22);
    cloth(g, 'M176 178 L172 164 Q200 156 228 164 L224 178 Q200 186 176 178 Z', 'winter', -0.22);
    addSleeves(g, 'winter', 34, 29, 0, 0.44, 0, 'sleeve sleeve-winter');
    addSleeves(g, 'winter', 36, 31, 0.36, 0.44, -0.18, 'sleeve sleeve-winter');
    for (i = 0; i < 5; i++) {
      y = 268 + i * 42;
      add(g, 'path', {
        d: 'M118 ' + y + ' L158 ' + (y + 2) + ' M282 ' + y + ' L242 ' + (y + 2),
        fill: 'none',
        stroke: INK,
        'stroke-opacity': '0.28',
        'stroke-width': '1.3'
      });
    }
    sample(g, 'sample-winter', 140, 360);
    return g;
  }

  function buildHeads(svg) {
    var pin = add(svg, 'g', { id: 'g-head-pin' });
    var flower = add(svg, 'g', { id: 'g-head-flower' });
    var wrap = add(svg, 'g', { id: 'g-head-wrap' });
    var warm = add(svg, 'g', { id: 'g-head-warm' });

    add(pin, 'path', {
      d: 'M172 66 L232 48',
      fill: 'none',
      stroke: GOLD,
      'stroke-width': '3.2',
      'stroke-linecap': 'round'
    });
    add(pin, 'circle', { cx: '170', cy: '68', r: '4', fill: '#F7F3EC', stroke: GOLD, 'stroke-width': '1.2' });
    add(pin, 'path', dyeAttrs('head', 0, {
      d: 'M166 72 L160 86 L166 98 L172 86 Z',
      stroke: INK,
      'stroke-opacity': '0.2',
      'stroke-width': '1'
    }));
    sample(pin, 'sample-head-pin', 166, 86);

    addFlower(flower, 230, 48, '#F6E7E8');
    addFlower(flower, 246, 62, '#E7B7C2');
    add(flower, 'path', dyeAttrs('head', 0, {
      d: 'M236 66 Q226 84 236 96 Q244 84 248 74 Z',
      stroke: INK,
      'stroke-opacity': '0.18',
      'stroke-width': '1'
    }));
    add(flower, 'path', {
      d: 'M214 58 L248 46',
      fill: 'none',
      stroke: GOLD,
      'stroke-width': '2.4'
    });
    sample(flower, 'sample-head-flower', 238, 82);

    add(wrap, 'circle', dyeAttrs('head', 0, {
      cx: '198', cy: '60', r: '18',
      stroke: INK, 'stroke-opacity': '0.2', 'stroke-width': '1.2'
    }));
    add(wrap, 'circle', dyeAttrs('head', -0.12, {
      cx: '216', cy: '50', r: '11',
      stroke: INK, 'stroke-opacity': '0.2', 'stroke-width': '1.1'
    }));
    add(wrap, 'path', dyeAttrs('head', -0.2, {
      d: 'M180 70 Q198 80 220 66',
      fill: 'none',
      stroke: 'none'
    }));
    add(wrap, 'path', strokeDye('head', -0.25, {
      d: 'M182 68 Q200 80 222 62',
      'stroke-width': '4'
    }));
    sample(wrap, 'sample-head-wrap', 198, 60);

    add(warm, 'path', dyeAttrs('head', 0, {
      d: 'M180 82 Q200 76 220 82 L221 93 Q200 99 179 93 Z',
      stroke: INK,
      'stroke-opacity': '0.22',
      'stroke-width': '1.1'
    }));
    add(warm, 'path', dyeAttrs('head', 0.3, {
      d: 'M182 90 Q200 86 218 90 L217 95 Q200 99 183 95 Z',
      stroke: 'none'
    }));
    sample(warm, 'sample-head-warm', 200, 88);
  }

  function buildShoes(parent) {
    add(parent, 'ellipse', {
      cx: '200', cy: '728', rx: '74', ry: '8',
      fill: INK, opacity: '0.1'
    });
    add(parent, 'path', {
      id: 'shoe-l',
      d: 'M158 676 C150 696, 156 716, 176 718 L198 716 C206 706, 202 688, 188 674 Z',
      fill: SHOE,
      stroke: INK,
      'stroke-opacity': '0.3',
      'stroke-width': '1.1'
    });
    add(parent, 'path', {
      id: 'shoe-r',
      d: 'M242 678 C250 698, 246 718, 226 720 L206 718 C198 708, 202 690, 214 676 Z',
      fill: SHOE,
      stroke: INK,
      'stroke-opacity': '0.3',
      'stroke-width': '1.1'
    });
    add(parent, 'path', {
      d: 'M164 692 C172 688, 184 690, 190 696',
      fill: 'none',
      stroke: '#6A5E56',
      'stroke-width': '1.2'
    });
    add(parent, 'path', {
      d: 'M236 694 C228 690, 218 692, 212 698',
      fill: 'none',
      stroke: '#6A5E56',
      'stroke-width': '1.2'
    });
  }

  function show(id, on) {
    var node = document.getElementById(id);
    if (!node) return;
    node.style.display = on ? '' : 'none';
  }

  function applyDyes(svg, look) {
    var cat = window.WARDROBE_CATALOG;
    var map = {
      shirt: cat.colorHex(look.shirtColor),
      beizi: cat.colorHex(look.beiziColor),
      skirt: cat.colorHex(look.skirtColor),
      winter: cat.colorHex(look.winterColor),
      head: cat.colorHex(look.headColor)
    };
    var nodes = svg.querySelectorAll('[data-dye], [data-dye-stroke]');
    var i;
    var node;
    var key;
    var amt;
    var hex;
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      key = node.getAttribute('data-dye') || node.getAttribute('data-dye-stroke');
      amt = parseFloat(node.getAttribute('data-amt') || '0');
      hex = map[key] || '#E4DDD0';
      if (amt) hex = cat.shade(hex, amt);
      if (node.hasAttribute('data-dye')) node.setAttribute('fill', hex);
      if (node.hasAttribute('data-dye-stroke')) node.setAttribute('stroke', hex);
    }
  }

  function update(svg, look) {
    look = window.WARDROBE_CATALOG.sanitize(look);
    show('g-scene-out', look.scene === 'out');
    show('g-scene-flower', look.scene === 'flower');
    show('g-scene-winter', look.scene === 'winter');
    show('g-scene-home', look.scene === 'home');
    show('g-collar-jiaoling', look.shirt === 'jiaoling');
    show('g-collar-yuanling', look.shirt === 'yuanling');
    show('g-collar-zhiling', look.shirt === 'zhiling');
    show('g-skirt-pleat', look.skirt === 'pleat');
    show('g-skirt-xuan', look.skirt === 'xuan');
    show('g-skirt-lan', look.skirt === 'lan');
    show('g-beizi-long', look.beizi === 'long');
    show('g-beizi-short', look.beizi === 'short');
    show('g-winter', look.winter === 'on');
    show('g-head-pin', look.head === 'pin');
    show('g-head-flower', look.head === 'flower');
    show('g-head-wrap', look.head === 'wrap');
    show('g-head-warm', look.head === 'warm');
    applyDyes(svg, look);
  }

  function mount(parent) {
    var svg = el('svg', {
      xmlns: SVGNS,
      viewBox: '0 0 400 760',
      width: '100%',
      height: '100%',
      preserveAspectRatio: 'xMidYMid meet',
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round'
    });
    svg.setAttribute('aria-hidden', 'true');
    buildScenes(svg);
    buildShoes(svg);
    buildHairBack(svg);
    buildShirt(svg);
    buildNeck(svg);
    buildCollars(svg);
    buildSkirt(svg, 'g-skirt-pleat', 'pleat');
    buildSkirt(svg, 'g-skirt-xuan', 'xuan');
    buildSkirt(svg, 'g-skirt-lan', 'lan');
    buildBeizi(svg, 'g-beizi-long', [[150, 198], [176, 224], [176, 618], [134, 628], [122, 460], [138, 280], [148, 210]], 0.9);
    buildBeizi(svg, 'g-beizi-short', [[152, 198], [176, 220], [178, 424], [140, 434], [132, 340], [146, 240]], 0.6);
    buildWinter(svg);
    addHands(svg);
    buildFace(svg);
    buildHairFront(svg);
    buildHeads(svg);
    parent.appendChild(svg);
    return svg;
  }

  window.WardrobeFigure = {
    viewBox: VIEW,
    mount: mount,
    update: update
  };
})();
