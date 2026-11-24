/* 宋式工笔小插画：内联 SVG，纯字符串生成，不联网。
 * 每幅 240x240（首页横幅 260x160），共享同一套淡雅配色：
 * 暖米底、藕粉、青碧、驼色，墨线细而淡。 */
(function () {
  var INK = '#3E4852';
  var ROSE = '#C996A0';
  var BLUSH = '#ECCECE';
  var CREAM = '#F7F2EA';
  var SAND = '#D6BEA0';
  var GOLD = '#D6AA78';

  function r1(n) { return Math.round(n * 100) / 100; }

  function seeded(seed) {
    var s = seed || 7;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  function lg(id, x1, y1, x2, y2, stops) {
    var s = '';
    for (var i = 0; i < stops.length; i++) {
      s += '<stop offset="' + stops[i][0] + '" stop-color="' + stops[i][1] + '"' +
        (stops[i][2] !== undefined ? ' stop-opacity="' + stops[i][2] + '"' : '') + '/>';
    }
    return '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + s + '</linearGradient>';
  }

  function rg(id, cx, cy, r, stops, fx, fy) {
    var s = '';
    for (var i = 0; i < stops.length; i++) {
      s += '<stop offset="' + stops[i][0] + '" stop-color="' + stops[i][1] + '"' +
        (stops[i][2] !== undefined ? ' stop-opacity="' + stops[i][2] + '"' : '') + '/>';
    }
    return '<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '"' +
      (fx !== undefined ? ' fx="' + fx + '" fy="' + fy + '"' : '') + '>' + s + '</radialGradient>';
  }

  function wrap(vb, defs, body) {
    return '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<defs>' + defs + '</defs>' + body + '</svg>';
  }

  /* 花瓣：原点出发，朝上，长 len 宽 w */
  function petal(len, w) {
    return 'M0 0 C ' + r1(-w) + ' ' + r1(-len * 0.28) + ' ' + r1(-w * 1.1) + ' ' + r1(-len * 0.82) + ' 0 ' + r1(-len) +
      ' C ' + r1(w * 1.1) + ' ' + r1(-len * 0.82) + ' ' + r1(w) + ' ' + r1(-len * 0.28) + ' 0 0Z';
  }

  /* 圆瓣小花（梅花式）：5 瓣 */
  function blossom(x, y, r, fill, stroke, core) {
    var s = '<g transform="translate(' + x + ' ' + y + ')">';
    for (var i = 0; i < 5; i++) {
      s += '<circle cx="0" cy="' + r1(-r * 0.62) + '" r="' + r1(r * 0.52) + '" fill="' + fill + '" stroke="' + stroke +
        '" stroke-width="' + r1(Math.max(0.5, r * 0.07)) + '" transform="rotate(' + (i * 72) + ')"/>';
    }
    s += '<circle r="' + r1(r * 0.24) + '" fill="' + (core || GOLD) + '"/>';
    s += '<circle r="' + r1(r * 0.34) + '" fill="none" stroke="' + (core || GOLD) + '" stroke-width="0.5" stroke-dasharray="0.8 1.4"/>';
    return s + '</g>';
  }

  /* 圆盘底：渐变、细圈、柔光 */
  function disc(p, c1, c2, ringColor) {
    return {
      defs: rg(p + 'bg', '50%', '36%', '78%', [[0, c1], [1, c2]]) +
        '<clipPath id="' + p + 'clip"><circle cx="120" cy="120" r="108"/></clipPath>',
      body: '<circle cx="120" cy="120" r="111" fill="' + (ringColor || SAND) + '" opacity="0.55"/>' +
        '<circle cx="120" cy="120" r="108" fill="url(#' + p + 'bg)"/>' +
        '<circle cx="120" cy="120" r="102" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="0.9"/>' +
        '<circle cx="120" cy="120" r="96" fill="none" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="0.6" stroke-dasharray="1 4"/>'
    };
  }

  function steam(x, y, h, w) {
    var d = 'M' + x + ' ' + y + ' C ' + (x - w) + ' ' + (y - h * 0.3) + ' ' + (x + w) + ' ' + (y - h * 0.6) + ' ' + x + ' ' + (y - h);
    return '<path d="' + d + '" fill="none" stroke="#5E8584" stroke-width="4.6" stroke-opacity="0.12" stroke-linecap="round"/>' +
      '<path d="' + d + '" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-opacity="0.9" stroke-linecap="round"/>';
  }

  /* ---------- 点茶：盏托、青白盏、汤花、茶筅 ---------- */
  function cupParts(p) {
    var defs =
      lg(p + 'tray', 0, 0, 0, 1, [[0, '#EFE0C4'], [1, '#C7A87E']]) +
      lg(p + 'bowl', 0, 0, 0, 1, [[0, '#FBF8F1'], [0.55, '#EDEBDF'], [1, '#BFD3CF']]) +
      lg(p + 'bowlside', 0, 0, 1, 0, [[0, '#FFFFFF', 0.55], [0.35, '#FFFFFF', 0], [0.8, '#6E9694', 0], [1, '#6E9694', 0.28]]) +
      lg(p + 'tea', 0, 0, 0, 1, [[0, '#7FA6A3'], [1, '#9CC0BC']]) +
      lg(p + 'wood', 0, 0, 1, 0, [[0, '#C9A874'], [0.5, '#E6CF9E'], [1, '#B8935D']]);
    var s = '';
    // 盏托
    s += '<ellipse cx="120" cy="186" rx="76" ry="9" fill="' + INK + '" opacity="0.1"/>';
    s += '<path d="M54 170 C54 160 80 156 120 156 C160 156 186 160 186 170 L184 176 C182 184 156 188 120 188 C84 188 58 184 56 176 Z" fill="url(#' + p + 'tray)" stroke="#8A6E4E" stroke-width="1.1" stroke-linejoin="round"/>';
    s += '<ellipse cx="120" cy="170" rx="64" ry="10.5" fill="#F3E7CE" stroke="#B3946A" stroke-width="0.9"/>';
    s += '<ellipse cx="120" cy="170" rx="54" ry="7.6" fill="none" stroke="#C9AB7E" stroke-width="0.6" stroke-dasharray="1.2 2.2"/>';
    s += '<path d="M62 177 C80 184 160 184 178 177" fill="none" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="0.9"/>';
    // 盏足
    s += '<ellipse cx="120" cy="167" rx="22" ry="4.6" fill="#D6CDB9" stroke="#8C8470" stroke-width="0.9"/>';
    // 盏身
    var bodyPath = 'M60 102 C63 134 92 166 120 166 C148 166 177 134 180 102 Z';
    s += '<path d="' + bodyPath + '" fill="url(#' + p + 'bowl)" stroke="' + INK + '" stroke-width="1.3" stroke-linejoin="round"/>';
    s += '<path d="' + bodyPath + '" fill="url(#' + p + 'bowlside)"/>';
    // 兔毫细纹
    var i;
    for (i = -6; i <= 6; i++) {
      var x0 = 120 + i * 8.6;
      var x1 = 120 + i * 3.6;
      s += '<path d="M' + r1(x0) + ' 116 Q ' + r1((x0 + x1) / 2 + i * 0.6) + ' 140 ' + r1(x1) + ' ' + r1(158 - Math.abs(i) * 0.9) + '" fill="none" stroke="#9FB5AE" stroke-opacity="0.55" stroke-width="0.7"/>';
    }
    // 口沿
    s += '<ellipse cx="120" cy="102" rx="60" ry="13.5" fill="#F4EFE4" stroke="' + INK + '" stroke-width="1.3"/>';
    s += '<ellipse cx="120" cy="102" rx="57.4" ry="12" fill="none" stroke="' + GOLD + '" stroke-width="1.1"/>';
    // 茶汤与汤花
    s += '<ellipse cx="120" cy="103" rx="52" ry="10.4" fill="url(#' + p + 'tea)" stroke="#6C8E8B" stroke-width="0.7"/>';
    s += '<ellipse cx="120" cy="102.4" rx="46" ry="8.3" fill="#FCFAF3"/>';
    s += '<path d="M78 103 C96 98 108 108 122 103 C134 99 146 106 162 101" fill="none" stroke="#DCE8E3" stroke-width="2.2" stroke-linecap="round"/>';
    s += '<path d="M84 106 C100 110 114 100 128 107" fill="none" stroke="#E7EFEA" stroke-width="1.4" stroke-linecap="round"/>';
    // 茶百戏小梅花
    s += '<g transform="translate(118 102.4) scale(1 0.4)">' + blossom(0, 0, 11, '#E8B4BC', '#C27E8B', GOLD).replace('<g transform="translate(0 0)">', '<g>') + '</g>';
    var bub = [[92, 102, 1.6], [101, 106, 1.1], [142, 104, 1.5], [150, 100, 1.1], [134, 107, 1.0], [86, 100, 1.0]];
    for (i = 0; i < bub.length; i++) {
      s += '<circle cx="' + bub[i][0] + '" cy="' + bub[i][1] + '" r="' + bub[i][2] + '" fill="#FFFFFF" stroke="#C9D8D2" stroke-width="0.5"/>';
    }
    s += '<path d="M70 108 C74 128 82 144 92 154" fill="none" stroke="#FFFFFF" stroke-opacity="0.75" stroke-width="2.2" stroke-linecap="round"/>';
    return { defs: defs, body: s };
  }

  function whisk(p) {
    var s = '';
    s += '<ellipse cx="200" cy="188" rx="17" ry="4" fill="' + INK + '" opacity="0.12"/>';
    // 茶筅头：细密竹丝，向内卷
    s += '<path d="M190 146 C180 152 177 170 183 184 C190 190 210 190 217 184 C223 170 220 152 210 146 Z" fill="#EEDFBF" stroke="#A58B62" stroke-width="0.9"/>';
    var i;
    for (i = 0; i < 11; i++) {
      var t = i / 10;
      var xa = 191 + t * 18;
      var xb = 182.5 + t * 35;
      s += '<path d="M' + r1(xa) + ' 147 C ' + r1(xa + (t - 0.5) * 10) + ' 160 ' + r1(xb + (t - 0.5) * 3) + ' 172 ' + r1(xb) + ' 185" fill="none" stroke="#B9A07A" stroke-width="0.6" stroke-opacity="0.8"/>';
    }
    s += '<path d="M185 184 C190 178 196 182 200 178 C204 182 210 178 215 184" fill="none" stroke="#A58B62" stroke-width="0.8"/>';
    // 竹柄
    s += '<path d="M191 112 L209 112 L208 148 L192 148 Z" fill="url(#' + p + 'wood)" stroke="#8A6E4E" stroke-width="1" stroke-linejoin="round"/>';
    s += '<path d="M191.5 124 L208.5 124 M192 136 L208 136" stroke="#8A6E4E" stroke-width="0.9"/>';
    s += '<path d="M194 114 L193.6 146" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="1.2" stroke-linecap="round"/>';
    s += '<ellipse cx="200" cy="112" rx="9" ry="2" fill="#E6CF9E" stroke="#8A6E4E" stroke-width="0.9"/>';
    return s;
  }

  function cha() {
    var p = 'ca';
    var d = disc(p, '#E1EEEB', '#9BBDBA');
    var cup = cupParts(p);
    var s = d.body + '<g clip-path="url(#' + p + 'clip)">';
    s += '<path d="M12 168 C60 150 100 176 150 164 C190 154 214 160 232 150 L232 240 L12 240 Z" fill="#FFFFFF" opacity="0.16"/>';
    s += '</g>';
    s += '<g transform="translate(-8 -6)">' + cup.body + steam(104, 88, 30, 6) + steam(124, 84, 36, 7) + steam(142, 90, 24, 5) + whisk(p) + '</g>';
    s += blossom(48, 66, 9, BLUSH, '#C996A0') + blossom(188, 52, 6.5, '#F7F2EA', '#C996A0') + blossom(204, 84, 4.2, BLUSH, '#C996A0');
    return wrap('0 0 240 240', d.defs + cup.defs, s);
  }

  /* ---------- 簪花：牡丹、金簪、珠串 ---------- */
  function leaf(len, w, rot, x, y, p) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' +
      '<path d="M0 0 C ' + r1(len * 0.25) + ' ' + r1(-w) + ' ' + r1(len * 0.7) + ' ' + r1(-w * 0.9) + ' ' + len + ' 0 C ' + r1(len * 0.7) + ' ' + r1(w * 0.9) + ' ' + r1(len * 0.25) + ' ' + r1(w) + ' 0 0Z" fill="url(#' + p + 'leaf)" stroke="#4F7566" stroke-width="0.8" stroke-linejoin="round"/>' +
      '<path d="M2 0 L' + r1(len * 0.92) + ' 0" stroke="#4F7566" stroke-width="0.7" stroke-opacity="0.8"/>' +
      '<path d="M' + r1(len * 0.2) + ' 0 L' + r1(len * 0.36) + ' ' + r1(-w * 0.55) + ' M' + r1(len * 0.4) + ' 0 L' + r1(len * 0.58) + ' ' + r1(-w * 0.6) + ' M' + r1(len * 0.62) + ' 0 L' + r1(len * 0.78) + ' ' + r1(-w * 0.4) + ' M' + r1(len * 0.2) + ' 0 L' + r1(len * 0.36) + ' ' + r1(w * 0.55) + ' M' + r1(len * 0.4) + ' 0 L' + r1(len * 0.58) + ' ' + r1(w * 0.6) + ' M' + r1(len * 0.62) + ' 0 L' + r1(len * 0.78) + ' ' + r1(w * 0.4) + '" fill="none" stroke="#4F7566" stroke-width="0.5" stroke-opacity="0.55"/>' +
      '</g>';
  }

  function pearl(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#FFFDF7" stroke="#CDBFA6" stroke-width="0.7"/>' +
      '<circle cx="' + r1(x - r * 0.3) + '" cy="' + r1(y - r * 0.32) + '" r="' + r1(r * 0.34) + '" fill="#FFFFFF"/>' +
      '<circle cx="' + r1(x + r * 0.28) + '" cy="' + r1(y + r * 0.3) + '" r="' + r1(r * 0.4) + '" fill="#E7D8C6" opacity="0.55"/>';
  }

  function hua() {
    var p = 'hu';
    var d = disc(p, '#F8E6E4', '#D8A2AC');
    var defs = d.defs +
      lg(p + 'leaf', 0, 0, 1, 0, [[0, '#7FA48F'], [1, '#A9C6AE']]) +
      lg(p + 'pin', 0, 0, 0, 1, [[0, '#F6E2A8'], [0.5, '#D9B063'], [1, '#A8793A']]) +
      rg(p + 'p1', '50%', '100%', '110%', [[0, '#F9E1E3'], [1, '#EDB5BE']]) +
      rg(p + 'p2', '50%', '100%', '110%', [[0, '#F6CDD3'], [1, '#E4A0AC']]) +
      rg(p + 'p3', '50%', '100%', '110%', [[0, '#F1BAC3'], [1, '#D98898']]);
    var s = d.body;
    var cx = 128, cy = 102, i;
    // 叶
    s += leaf(70, 18, 148, cx, cy + 4, p) + leaf(68, 17, 32, cx, cy + 4, p) + leaf(58, 15, 96, cx, cy + 6, p) + leaf(56, 14, 198, cx - 2, cy, p);
    // 金簪（花后）
    s += '<path d="M52 198 L124 124" stroke="#6E4D22" stroke-width="5.6" stroke-linecap="round" opacity="0.35" transform="translate(1.5 2)"/>';
    s += '<path d="M52 198 L124 124" stroke="url(#' + p + 'pin)" stroke-width="4.4" stroke-linecap="round"/>';
    s += '<path d="M54 196 L122 126" stroke="#FFF4CF" stroke-width="1" stroke-linecap="round" stroke-opacity="0.9"/>';
    s += '<circle cx="86" cy="164" r="3.6" fill="#E7C985" stroke="#A8793A" stroke-width="0.7"/>';
    s += '<circle cx="70" cy="180" r="2.6" fill="#E7C985" stroke="#A8793A" stroke-width="0.7"/>';
    // 牡丹三层瓣
    function layer(n, len, w, off, fill, stroke) {
      var o = '';
      for (var k = 0; k < n; k++) {
        o += '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + r1(off + k * 360 / n) + ')">' +
          '<path d="' + petal(len, w) + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8" stroke-linejoin="round"/>' +
          '<path d="M0 -4 C ' + r1(-w * 0.2) + ' ' + r1(-len * 0.4) + ' ' + r1(w * 0.1) + ' ' + r1(-len * 0.6) + ' 0 ' + r1(-len * 0.82) + '" fill="none" stroke="' + stroke + '" stroke-opacity="0.5" stroke-width="0.55"/>' +
          '<path d="M' + r1(-w * 0.5) + ' ' + r1(-len * 0.5) + ' C ' + r1(-w * 0.3) + ' ' + r1(-len * 0.7) + ' ' + r1(-w * 0.2) + ' ' + r1(-len * 0.8) + ' ' + r1(-w * 0.05) + ' ' + r1(-len * 0.9) + '" fill="none" stroke="' + stroke + '" stroke-opacity="0.35" stroke-width="0.5"/>' +
          '</g>';
      }
      return o;
    }
    s += layer(9, 50, 17, 0, 'url(#' + p + 'p1)', '#C27E8B');
    s += layer(7, 40, 14, 25, 'url(#' + p + 'p2)', '#BC7482');
    s += layer(6, 29, 11, 8, 'url(#' + p + 'p3)', '#B46A7A');
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="#E9A9B5" stroke="#B46A7A" stroke-width="0.6"/>';
    for (i = 0; i < 12; i++) {
      var a = i * 30 * Math.PI / 180;
      s += '<circle cx="' + r1(cx + Math.cos(a) * 6) + '" cy="' + r1(cy + Math.sin(a) * 6) + '" r="1.35" fill="#E7B35C"/>';
    }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="2.8" fill="#D6AA78" stroke="#A8793A" stroke-width="0.5"/>';
    // 步摇珠串
    s += '<path d="M150 126 C160 142 156 156 152 170" fill="none" stroke="#C99A52" stroke-width="1.1"/>' + pearl(152, 174, 5);
    s += '<path d="M140 134 C144 150 140 164 138 180" fill="none" stroke="#C99A52" stroke-width="1.1"/>' + pearl(138, 184, 4.4);
    s += '<path d="M160 120 C172 132 174 144 172 154" fill="none" stroke="#C99A52" stroke-width="1.1"/>' + pearl(172, 158, 3.8);
    s += '<path d="M147 150 q2.6 -2.4 5.2 0 q-2.6 2.4 -5.2 0Z M135 160 q2.6 -2.4 5.2 0 q-2.6 2.4 -5.2 0Z" fill="#E7C985" stroke="#A8793A" stroke-width="0.5"/>';
    // 花苞与落瓣
    s += '<g transform="translate(70 68) rotate(-24)"><path d="' + petal(22, 8) + '" fill="url(#' + p + 'p2)" stroke="#BC7482" stroke-width="0.7"/>' +
      '<g transform="rotate(-28)"><path d="' + petal(18, 6.4) + '" fill="url(#' + p + 'p1)" stroke="#BC7482" stroke-width="0.6"/></g>' +
      '<g transform="rotate(28)"><path d="' + petal(18, 6.4) + '" fill="url(#' + p + 'p1)" stroke="#BC7482" stroke-width="0.6"/></g>' +
      '<path d="M-4 2 Q0 8 4 2 Q0 -2 -4 2Z" fill="#7FA48F" stroke="#4F7566" stroke-width="0.6"/></g>';
    s += '<path d="M72 74 C76 86 82 92 90 96" fill="none" stroke="#5F7F6B" stroke-width="1.6" stroke-linecap="round"/>';
    s += '<g transform="translate(190 168) rotate(40) scale(0.5)"><path d="' + petal(28, 11) + '" fill="#F3C2CA" stroke="#C27E8B" stroke-width="1"/></g>';
    s += '<g transform="translate(196 62) rotate(-30) scale(0.4)"><path d="' + petal(28, 11) + '" fill="#F8D6DA" stroke="#C27E8B" stroke-width="1"/></g>';
    return wrap('0 0 240 240', defs, s);
  }

  /* ---------- 古琴 ---------- */
  function qin() {
    var p = 'qi';
    var d = disc(p, '#E6EBEE', '#8E9AA4');
    var defs = d.defs +
      lg(p + 'body', 0, 0, 0, 1, [[0, '#8A705E'], [0.45, '#664F42'], [1, '#463730']]) +
      lg(p + 'face', 0, 0, 0, 1, [[0, '#7A6252'], [1, '#54433A']]) +
      rg(p + 'blk', '35%', '30%', '75%', [[0, '#7C8790'], [0.4, '#3B444C'], [1, '#1D2328']]) +
      rg(p + 'wht', '35%', '30%', '80%', [[0, '#FFFFFF'], [0.7, '#F1ECE0'], [1, '#CFC6B4']]);
    var s = d.body;
    var i;
    // 梅枝
    s += '<path d="M22 84 C46 78 66 66 100 50" fill="none" stroke="#5A4A42" stroke-width="2.8" stroke-linecap="round"/>';
    s += '<path d="M60 70 C64 58 68 52 78 44 M80 60 C90 62 98 60 106 68 M40 80 C42 90 48 94 56 94" fill="none" stroke="#5A4A42" stroke-width="1.8" stroke-linecap="round"/>';
    s += blossom(100, 52, 8, '#F9E6E6', '#C996A0') + blossom(78, 44, 7, BLUSH, '#C996A0') + blossom(106, 68, 5.5, '#F9E6E6', '#C996A0') + blossom(56, 94, 5, BLUSH, '#C996A0') + blossom(66, 66, 4.6, '#F9E6E6', '#C996A0');
    s += '<circle cx="48" cy="92" r="2" fill="#C996A0"/><circle cx="90" cy="46" r="1.8" fill="#C996A0"/>';
    // 琴身（水平绘制后微倾）
    s += '<g transform="translate(0 10) rotate(-11 120 128)">';
    s += '<ellipse cx="120" cy="156" rx="102" ry="9" fill="' + INK + '" opacity="0.14"/>';
    var body = 'M24 114 C44 108 70 105 100 104 L150 103 C160 102 165 97 172 95 C179 93 184 97 186 101 C190 105 202 105 216 105 L216 143 C202 143 190 143 186 147 C184 151 179 155 172 153 C165 151 160 146 150 145 L100 144 C70 143 44 140 24 134 Z';
    s += '<path d="' + body + '" fill="url(#' + p + 'body)" stroke="#2E2622" stroke-width="1.3" stroke-linejoin="round"/>';
    s += '<path d="M30 116 C50 111 72 109 100 108 L150 107 C162 106 168 101 173 99 C178 98 181 100 183 103" fill="none" stroke="#C7AE98" stroke-opacity="0.65" stroke-width="1"/>';
    // 琴面
    s += '<path d="M34 118 C56 113 76 112 100 111 L212 109 L212 139 L100 139 C76 138 56 136 34 131 Z" fill="url(#' + p + 'face)" stroke="#2E2622" stroke-opacity="0.5" stroke-width="0.6"/>';
    // 断纹
    s += '<path d="M60 113 l6 24 M96 111 l-4 28 M132 110 l5 29 M168 109 l-3 30 M80 112 l12 12 M150 110 l10 14" stroke="#2E2622" stroke-opacity="0.2" stroke-width="0.5" fill="none"/>';
    // 徽
    for (i = 1; i <= 13; i++) {
      var hx = 44 + i * 11.6;
      var hr = (i === 7) ? 2.6 : ((i === 4 || i === 10) ? 2.2 : 1.7);
      s += '<circle cx="' + r1(hx) + '" cy="' + r1(107.4 - i * 0.04) + '" r="' + hr + '" fill="#F8F2E1" stroke="#CDB98C" stroke-width="0.5"/>';
    }
    // 七弦
    for (i = 0; i < 7; i++) {
      var y0 = 116.6 + i * 2.5;
      var y1 = 114 + i * 4.2;
      s += '<path d="M44 ' + r1(y0) + ' L192 ' + r1(y1) + '" stroke="#2E2622" stroke-opacity="0.35" stroke-width="1.5"/>';
      s += '<path d="M44 ' + r1(y0) + ' L192 ' + r1(y1) + '" stroke="#F4ECD8" stroke-width="0.8"/>';
    }
    // 岳山、龙龈
    s += '<rect x="189" y="110" width="5" height="32" rx="1.4" fill="#C9A15B" stroke="#8A6A3A" stroke-width="0.7"/>';
    s += '<rect x="41" y="115" width="5" height="20" rx="1.4" fill="#C9A15B" stroke="#8A6A3A" stroke-width="0.7"/>';
    // 雁足、龙池凤沼示意
    s += '<rect x="202" y="119" width="9" height="3.4" rx="1.7" fill="#1F1814" opacity="0.7"/><rect x="202" y="127" width="9" height="3.4" rx="1.7" fill="#1F1814" opacity="0.7"/>';
    s += '<circle cx="30" cy="128" r="3.2" fill="#E0BE7C" stroke="#8A6A3A" stroke-width="0.7"/><circle cx="30" cy="121" r="2.6" fill="#E0BE7C" stroke="#8A6A3A" stroke-width="0.7"/>';
    // 流苏
    s += '<path d="M26 134 C22 142 28 150 24 158" fill="none" stroke="#C996A0" stroke-width="2.2" stroke-linecap="round"/>';
    s += '<path d="M24 158 l-5 12 M24 158 l-2 14 M24 158 l1 14 M24 158 l4 12 M24 158 l7 10" stroke="#C996A0" stroke-width="1" stroke-linecap="round"/>';
    s += '<ellipse cx="24" cy="158" rx="3.4" ry="2.6" fill="#E6BCC3" stroke="#B87886" stroke-width="0.6"/>';
    s += '</g>';
    // 棋子
    s += '<ellipse cx="166" cy="190" rx="30" ry="5" fill="' + INK + '" opacity="0.12"/>';
    s += '<circle cx="154" cy="184" r="11" fill="url(#' + p + 'blk)" stroke="#161B1F" stroke-width="0.7"/>';
    s += '<circle cx="177" cy="186" r="11" fill="url(#' + p + 'wht)" stroke="#B9AF9A" stroke-width="0.7"/>';
    s += '<ellipse cx="150" cy="180" rx="3.6" ry="2" fill="#FFFFFF" opacity="0.4" transform="rotate(-30 150 180)"/>';
    return wrap('0 0 240 240', defs, s);
  }

  /* ---------- 绣绷、针线 ---------- */
  function xiu() {
    var p = 'xi';
    var d = disc(p, '#F8EEDD', '#D3B48A');
    var defs = d.defs +
      lg(p + 'wood', 0, 0, 1, 1, [[0, '#E4C79A'], [0.5, '#C99B66'], [1, '#9F7448']]) +
      rg(p + 'cloth', '40%', '35%', '80%', [[0, '#FFFCF4'], [1, '#EFE5D1']]) +
      rg(p + 'ball', '35%', '30%', '80%', [[0, '#F6D4DA'], [0.6, '#D98E9E'], [1, '#B76A7B']]) +
      lg(p + 'leaf', 0, 0, 1, 0, [[0, '#86AB96'], [1, '#B3CDB5']]) +
      lg(p + 'steel', 0, 0, 0, 1, [[0, '#F2F5F6'], [1, '#A9B4BA']]) +
      '<pattern id="' + p + 'weave" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0.5 H4 M0 2.5 H4" stroke="#CDBD9E" stroke-width="0.35" stroke-opacity="0.55"/><path d="M0.5 0 V4 M2.5 0 V4" stroke="#CDBD9E" stroke-width="0.3" stroke-opacity="0.4"/></pattern>';
    var s = d.body;
    var cx = 110, cy = 110, i;
    s += '<ellipse cx="118" cy="188" rx="76" ry="7" fill="' + INK + '" opacity="0.1"/>';
    // 绷架
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="67" fill="url(#' + p + 'cloth)"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="60" fill="url(#' + p + 'weave)"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="64" fill="none" stroke="url(#' + p + 'wood)" stroke-width="9"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="68.6" fill="none" stroke="#7A5A3A" stroke-width="0.9"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="59.4" fill="none" stroke="#7A5A3A" stroke-width="0.8"/>';
    s += '<path d="M62 78 A64 64 0 0 1 100 48" fill="none" stroke="#FFF2D6" stroke-opacity="0.75" stroke-width="1.6" stroke-linecap="round"/>';
    // 螺栓
    s += '<rect x="100" y="36" width="20" height="14" rx="3" fill="#D8B66E" stroke="#8A6A3A" stroke-width="0.9"/>';
    s += '<path d="M104 36 V50 M116 36 V50" stroke="#8A6A3A" stroke-width="0.6" stroke-opacity="0.7"/>';
    s += '<circle cx="110" cy="31" r="5" fill="#E8CB88" stroke="#8A6A3A" stroke-width="0.9"/><path d="M107.6 31 H112.4" stroke="#8A6A3A" stroke-width="0.9"/>';
    // 绣样：枝、叶、花
    s += '<path d="M76 146 C84 126 100 112 128 80" fill="none" stroke="#6F9A84" stroke-width="2.2" stroke-linecap="round"/>';
    function sleaf(x, y, rot, len, w) {
      var o = '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' +
        '<path d="M0 0 C ' + r1(len * 0.25) + ' ' + r1(-w) + ' ' + r1(len * 0.7) + ' ' + r1(-w * 0.9) + ' ' + len + ' 0 C ' + r1(len * 0.7) + ' ' + r1(w * 0.9) + ' ' + r1(len * 0.25) + ' ' + r1(w) + ' 0 0Z" fill="url(#' + p + 'leaf)" stroke="#5E8A74" stroke-width="0.7"/>';
      for (var k = 1; k < 8; k++) {
        var lx = len * k / 8.5;
        var lw = w * 0.82 * Math.sin(Math.PI * k / 8.5);
        o += '<path d="M' + r1(lx) + ' 0 L' + r1(lx + 4) + ' ' + r1(-lw) + ' M' + r1(lx) + ' 0 L' + r1(lx + 4) + ' ' + r1(lw) + '" stroke="#5E8A74" stroke-width="0.45" stroke-opacity="0.7"/>';
      }
      return o + '</g>';
    }
    s += sleaf(92, 124, -20, 26, 8) + sleaf(100, 118, 70, 24, 7) + sleaf(112, 104, -50, 24, 7.5) + sleaf(80, 140, 14, 22, 6.5);
    function sflower(x, y, r, rot) {
      var o = '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">';
      for (var k = 0; k < 5; k++) {
        o += '<g transform="rotate(' + (k * 72) + ')"><path d="' + petal(r, r * 0.5) + '" fill="#EFC0C8" stroke="#C27E8B" stroke-width="0.7"/>';
        for (var m = -2; m <= 2; m++) {
          o += '<path d="M0 -2 L' + r1(m * r * 0.17) + ' ' + r1(-r * 0.86) + '" stroke="#C27E8B" stroke-width="0.4" stroke-opacity="0.65"/>';
        }
        o += '</g>';
      }
      o += '<circle r="' + r1(r * 0.22) + '" fill="#E7B35C" stroke="#A8793A" stroke-width="0.5"/></g>';
      return o;
    }
    s += sflower(128, 82, 17, 10) + sflower(98, 104, 12, 40);
    s += '<g transform="translate(70 148)"><path d="' + petal(11, 4.4) + '" fill="#E7B3BC" stroke="#C27E8B" stroke-width="0.5"/><g transform="rotate(-40)"><path d="' + petal(9, 3.6) + '" fill="#F1C8CF" stroke="#C27E8B" stroke-width="0.5"/></g><g transform="rotate(40)"><path d="' + petal(9, 3.6) + '" fill="#F1C8CF" stroke="#C27E8B" stroke-width="0.5"/></g></g>';
    // 未绣完的虚线样稿
    s += '<path d="M118 138 C136 140 146 124 144 108" fill="none" stroke="#C996A0" stroke-width="1.4" stroke-dasharray="3 2.4" stroke-linecap="round"/>';
    s += '<path d="M130 130 C142 132 152 126 156 116" fill="none" stroke="#86AB96" stroke-width="1.2" stroke-dasharray="2.4 2.2" stroke-linecap="round"/>';
    // 针线
    s += '<path d="M176 190 C198 188 204 168 188 160 C174 154 160 156 156 150" fill="none" stroke="#B76A7B" stroke-width="3.6" stroke-opacity="0.18" stroke-linecap="round" transform="translate(1 2)"/>';
    s += '<path d="M160 148 C170 146 176 156 190 162 C206 170 198 190 178 190" fill="none" stroke="#D98E9E" stroke-width="1.7" stroke-linecap="round"/>';
    s += '<path d="M118 126 L162 146" stroke="#6C767C" stroke-width="3.2" stroke-linecap="round" opacity="0.25" transform="translate(1.2 1.8)"/>';
    s += '<path d="M118 126 L162 146" stroke="url(#' + p + 'steel)" stroke-width="2.4" stroke-linecap="round"/>';
    s += '<path d="M120 125.4 L158 142.6" stroke="#FFFFFF" stroke-width="0.7" stroke-linecap="round" opacity="0.9"/>';
    s += '<ellipse cx="160.6" cy="145.4" rx="3.4" ry="1.2" transform="rotate(24 160.6 145.4)" fill="#F4E6D6" stroke="#7B868C" stroke-width="0.6"/>';
    // 线团
    s += '<circle cx="178" cy="184" r="15" fill="url(#' + p + 'ball)" stroke="#A55E70" stroke-width="0.9"/>';
    for (i = 0; i < 6; i++) {
      s += '<path d="M' + r1(165 + i * 0.6) + ' ' + r1(178 + i * 3) + ' C 172 ' + r1(172 + i * 4) + ' 184 ' + r1(174 + i * 4) + ' ' + r1(191 - i * 0.4) + ' ' + r1(180 + i * 2.4) + '" fill="none" stroke="#B76A7B" stroke-width="0.55" stroke-opacity="0.8"/>';
    }
    s += '<path d="M168 177 C174 172 182 172 187 176" fill="none" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1.2" stroke-linecap="round"/>';
    // 顶针
    s += '<path d="M40 184 L40 170 C40 158 62 158 62 170 L62 184 C62 188 40 188 40 184 Z" fill="#E4C27E" stroke="#8A6A3A" stroke-width="0.9"/>';
    s += '<ellipse cx="51" cy="184" rx="11" ry="3" fill="#C9A15B" stroke="#8A6A3A" stroke-width="0.7"/>';
    var dots = [[46, 166], [51, 164.5], [56, 166], [44, 171], [49, 170], [54, 170], [59, 171], [44, 176], [49, 175], [54, 175], [59, 176]];
    for (i = 0; i < dots.length; i++) {
      s += '<circle cx="' + dots[i][0] + '" cy="' + dots[i][1] + '" r="0.9" fill="#8A6A3A" opacity="0.75"/>';
    }
    s += '<path d="M43 168 C43 162 48 160 50 160" fill="none" stroke="#FFF6D8" stroke-opacity="0.8" stroke-width="1" stroke-linecap="round"/>';
    return wrap('0 0 240 240', defs, s);
  }

  /* ---------- 游船、柳、灯 ---------- */
  function bez(p0, p1, p2, p3, t) {
    var u = 1 - t;
    return [
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]
    ];
  }

  function you() {
    var p = 'yo';
    var d = disc(p, '#EEF2E0', '#B5C8A4');
    var defs = d.defs +
      lg(p + 'water', 0, 0, 0, 1, [[0, '#CDE0D8'], [1, '#9EBFB8']]) +
      lg(p + 'hull', 0, 0, 0, 1, [[0, '#D3AE82'], [1, '#98714A']]) +
      lg(p + 'canopy', 0, 0, 0, 1, [[0, '#9A8470'], [1, '#6F5C4E']]) +
      rg(p + 'lan', '40%', '35%', '80%', [[0, '#F6CFD3'], [0.6, '#E3A0A8'], [1, '#C46F7F']]) +
      rg(p + 'glow', '50%', '50%', '50%', [[0, '#F8D2D4', 0.75], [1, '#F8D2D4', 0]]);
    var s = d.body;
    var i;
    s += '<g clip-path="url(#' + p + 'clip)">';
    // 远山
    s += '<path d="M10 150 C34 112 58 102 84 128 C98 112 122 100 148 124 C168 108 196 104 232 144 L232 160 L10 160 Z" fill="#9DB89E" opacity="0.5"/>';
    s += '<path d="M10 160 C40 134 70 132 100 148 C130 136 170 132 232 156 L232 170 L10 170 Z" fill="#86A98F" opacity="0.5"/>';
    s += '<ellipse cx="120" cy="150" rx="116" ry="9" fill="#FFFFFF" opacity="0.38"/>';
    // 水
    s += '<rect x="0" y="154" width="240" height="90" fill="url(#' + p + 'water)"/>';
    var wr = [[40, 168, 36], [150, 164, 40], [30, 188, 50], [170, 190, 44], [90, 204, 60], [180, 208, 30]];
    for (i = 0; i < wr.length; i++) {
      var wx = wr[i][0], wy = wr[i][1], ww = wr[i][2];
      s += '<path d="M' + wx + ' ' + wy + ' q ' + r1(ww * 0.12) + ' -3 ' + r1(ww * 0.25) + ' 0 t ' + r1(ww * 0.25) + ' 0 t ' + r1(ww * 0.25) + ' 0 t ' + r1(ww * 0.25) + ' 0" fill="none" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1" stroke-linecap="round"/>';
    }
    s += '</g>';
    // 柳
    var P0 = [14, 48], P1 = [44, 36], P2 = [74, 42], P3 = [104, 62];
    s += '<path d="M14 48 C44 36 74 42 104 62" fill="none" stroke="#5E5148" stroke-width="3" stroke-linecap="round"/>';
    s += '<path d="M60 44 C70 38 80 36 92 38" fill="none" stroke="#5E5148" stroke-width="1.6" stroke-linecap="round"/>';
    var rnd = seeded(11);
    for (i = 0; i < 13; i++) {
      var t = 0.06 + i * 0.075;
      var pt = bez(P0, P1, P2, P3, t);
      var len = 34 + rnd() * 46 - Math.abs(t - 0.45) * 30;
      var sway = (rnd() - 0.4) * 10;
      s += '<path d="M' + r1(pt[0]) + ' ' + r1(pt[1]) + ' C ' + r1(pt[0] + sway * 0.4) + ' ' + r1(pt[1] + len * 0.35) + ' ' + r1(pt[0] + sway) + ' ' + r1(pt[1] + len * 0.7) + ' ' + r1(pt[0] + sway * 0.7) + ' ' + r1(pt[1] + len) + '" fill="none" stroke="#7FA68A" stroke-width="1.3" stroke-linecap="round"/>';
      for (var q = 1; q < 4; q++) {
        s += '<ellipse cx="' + r1(pt[0] + sway * q / 4) + '" cy="' + r1(pt[1] + len * q / 4 + 2) + '" rx="1.3" ry="3.4" fill="#9CC2A2" stroke="#6F9A7C" stroke-width="0.4" transform="rotate(' + r1(sway * 2) + ' ' + r1(pt[0] + sway * q / 4) + ' ' + r1(pt[1] + len * q / 4 + 2) + ')"/>';
      }
    }
    // 倒影
    s += '<ellipse cx="122" cy="182" rx="74" ry="5" fill="' + INK + '" opacity="0.12"/>';
    // 船身
    s += '<path d="M44 148 C56 172 88 182 124 182 C160 182 188 170 202 138 C192 150 174 156 150 157 L94 159 C74 159 58 155 44 148 Z" fill="url(#' + p + 'hull)" stroke="#5E4630" stroke-width="1.2" stroke-linejoin="round"/>';
    s += '<path d="M58 160 C80 172 150 176 190 156" fill="none" stroke="#5E4630" stroke-opacity="0.45" stroke-width="0.8"/>';
    s += '<path d="M52 152 C70 166 130 170 196 146" fill="none" stroke="#FFF0D6" stroke-opacity="0.5" stroke-width="1"/>';
    // 乌篷（侧视：长而低的拱棚）
    s += '<path d="M70 158 L70 144 C70 124 170 124 170 144 L170 158 Z" fill="url(#' + p + 'canopy)" stroke="#4A3C32" stroke-width="1.2" stroke-linejoin="round"/>';
    for (i = 0; i < 11; i++) {
      var cxp = 76 + i * 8.8;
      var topY = 128 + Math.pow((cxp - 120) / 50, 2) * 12;
      s += '<path d="M' + r1(cxp) + ' 157 L' + r1(cxp) + ' ' + r1(topY + 1) + '" fill="none" stroke="#3B2F27" stroke-opacity="0.32" stroke-width="0.7"/>';
    }
    s += '<path d="M74 140 C82 128 158 128 166 140" fill="none" stroke="#D9C6AE" stroke-opacity="0.55" stroke-width="1"/>';
    s += '<path d="M72 152 L168 152" stroke="#3B2F27" stroke-opacity="0.35" stroke-width="0.8"/>';
    s += '<rect x="104" y="136" width="32" height="16" rx="2" fill="#33292A" stroke="#2A2020" stroke-width="0.8"/>';
    s += '<path d="M104 136 L136 136 L134 148 L106 148 Z" fill="#E0A7AF" stroke="#B87886" stroke-width="0.7"/>';
    s += '<path d="M110 136 V148 M116 136 V148 M122 136 V148 M128 136 V148" stroke="#B87886" stroke-width="0.45"/>';
    s += '<path d="M104 136 L136 136" stroke="#8A5A64" stroke-width="1.6"/>';
    // 船头灯
    s += '<path d="M194 148 C196 132 198 118 204 100" fill="none" stroke="#5E4630" stroke-width="2.2" stroke-linecap="round"/>';
    s += '<circle cx="206" cy="118" r="28" fill="url(#' + p + 'glow)"/>';
    s += '<path d="M204 100 C210 100 210 106 208 108" fill="none" stroke="#5E4630" stroke-width="1.2"/>';
    s += '<rect x="201" y="106" width="14" height="3.6" rx="1.2" fill="#D6AA78" stroke="#8A6A3A" stroke-width="0.6"/>';
    s += '<ellipse cx="208" cy="120" rx="10" ry="12" fill="url(#' + p + 'lan)" stroke="#A5586A" stroke-width="0.9"/>';
    s += '<path d="M208 108 C203 114 203 126 208 132 M208 108 C213 114 213 126 208 132 M198.4 120 H217.6" fill="none" stroke="#A5586A" stroke-width="0.55" stroke-opacity="0.75"/>';
    s += '<rect x="203" y="130.6" width="10" height="3.2" rx="1.2" fill="#D6AA78" stroke="#8A6A3A" stroke-width="0.6"/>';
    s += '<path d="M208 134 V144 M205.6 134 L204.6 143 M210.4 134 L211.4 143" stroke="#C996A0" stroke-width="1" stroke-linecap="round"/>';
    // 船桨涟漪
    s += '<path d="M36 156 q6 -3 12 0 t12 0" fill="none" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="1.1" stroke-linecap="round"/>';
    s += '<path d="M178 172 q8 -3 16 0 t16 0" fill="none" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="1.1" stroke-linecap="round"/>';
    s += '<path d="M60 184 q10 -3 20 0 t20 0" fill="none" stroke="#FFFFFF" stroke-opacity="0.65" stroke-width="1" stroke-linecap="round"/>';
    // 飞鸟、落瓣
    s += '<path d="M168 62 q5 -5 9 0 q4 -5 9 0 M190 76 q3.4 -3.4 6 0 q3 -3.4 6 0" fill="none" stroke="' + INK + '" stroke-opacity="0.7" stroke-width="1.2" stroke-linecap="round"/>';
    s += blossom(176, 108, 4.4, BLUSH, '#C996A0') + blossom(60, 130, 3.8, '#F9E6E6', '#C996A0');
    return wrap('0 0 240 240', defs, s);
  }

  /* ---------- 书卷、笔砚 ---------- */
  function glyphs(x0, y0, cols, rows, cw, ch, seed) {
    var rnd = seeded(seed);
    var s = '';
    for (var c = 0; c < cols; c++) {
      for (var r = 0; r < rows; r++) {
        if (c === cols - 1 && r > rows - 3) continue;
        var gx = x0 - c * cw;
        var gy = y0 + r * ch;
        var n = 2 + Math.floor(rnd() * 2);
        var d = '';
        for (var k = 0; k < n; k++) {
          var ax = gx + rnd() * (cw - 4);
          var ay = gy + rnd() * (ch - 4);
          var horiz = rnd() > 0.5;
          var l = 3 + rnd() * 3.4;
          d += 'M' + r1(ax) + ' ' + r1(ay) + (horiz ? ' l' + r1(l) + ' ' + r1((rnd() - 0.5) * 1.6) : ' l' + r1((rnd() - 0.5) * 1.6) + ' ' + r1(l));
        }
        d += 'M' + r1(gx + cw / 2 - 1) + ' ' + r1(gy + 1) + ' l1 ' + r1(ch - 3);
        s += '<path d="' + d + '" fill="none" stroke="#3E4852" stroke-opacity="0.85" stroke-width="1.5" stroke-linecap="round"/>';
      }
    }
    return s;
  }

  function shu() {
    var p = 'sh';
    var d = disc(p, '#F3EAD8', '#C6B69C');
    var defs = d.defs +
      lg(p + 'paper', 0, 0, 0, 1, [[0, '#FFFCF3'], [1, '#F1E6CF']]) +
      lg(p + 'roll', 0, 0, 1, 0, [[0, '#9A774F'], [0.35, '#D8B887'], [0.7, '#C2A070'], [1, '#8A6A45']]) +
      lg(p + 'silk', 0, 0, 0, 1, [[0, '#B5CDCB'], [1, '#93B1AE']]) +
      lg(p + 'stone', 0, 0, 0, 1, [[0, '#6A747C'], [1, '#434B52']]) +
      lg(p + 'hill', 0, 0, 0, 1, [[0, '#B7CECA'], [1, '#86A39F']]) +
      lg(p + 'bam', 0, 0, 1, 0, [[0, '#C79F63'], [0.5, '#EBCF98'], [1, '#B58A52']]);
    var s = d.body;
    var i;
    // 竹叶
    s += '<path d="M206 62 C200 80 196 96 194 112" fill="none" stroke="#6F8F78" stroke-width="2.2" stroke-linecap="round"/>';
    s += '<path d="M202 76 h-6 M198 96 h-5" stroke="#4F6F5A" stroke-width="1.2"/>';
    var bl = [[205, 66, -130], [205, 66, -70], [202, 78, 160], [201, 82, 20], [198, 98, 150], [197, 100, 28]];
    for (i = 0; i < bl.length; i++) {
      s += '<g transform="translate(' + bl[i][0] + ' ' + bl[i][1] + ') rotate(' + bl[i][2] + ')"><path d="M0 0 C8 -4 20 -4 32 0 C20 4 8 4 0 0Z" fill="#86A68C" stroke="#4F6F5A" stroke-width="0.6"/><path d="M2 0 H29" stroke="#4F6F5A" stroke-width="0.5" stroke-opacity="0.7"/></g>';
    }
    // 手卷
    s += '<ellipse cx="120" cy="150" rx="86" ry="6" fill="' + INK + '" opacity="0.1"/>';
    s += '<path d="M54 64 C84 60 156 60 186 64 L186 142 C156 146 84 146 54 142 Z" fill="url(#' + p + 'silk)" stroke="#6F8E8B" stroke-width="1"/>';
    s += '<path d="M60 72 C88 69 152 69 180 72 L180 134 C152 137 88 137 60 134 Z" fill="url(#' + p + 'paper)" stroke="#CDBA98" stroke-width="0.8"/>';
    for (i = 0; i < 9; i++) {
      s += '<circle cx="' + r1(66 + i * 13.6) + '" cy="' + r1(67.6 - Math.sin(i / 8 * Math.PI) * 0.6) + '" r="0.9" fill="#F7F2EA" opacity="0.9"/>';
      s += '<circle cx="' + r1(66 + i * 13.6) + '" cy="' + r1(139.2 + Math.sin(i / 8 * Math.PI) * 0.6) + '" r="0.9" fill="#F7F2EA" opacity="0.9"/>';
    }
    // 乌丝栏与文字
    for (i = 0; i < 7; i++) {
      var lx = 74 + i * 14.4;
      s += '<path d="M' + r1(lx) + ' 76 L' + r1(lx) + ' 130" stroke="#D9C9A8" stroke-width="0.4"/>';
    }
    s += glyphs(167, 77, 6, 5, 14.4, 10.6, 5);
    s += '<rect x="68" y="116" width="10" height="10" rx="1" fill="#D98E9E" stroke="#B3606F" stroke-width="0.5" transform="rotate(-4 73 121)"/>';
    s += '<path d="M70.4 118.4 h5 M70.4 121 h5 M73 118 v6.4" stroke="#FBEDEE" stroke-width="0.9" transform="rotate(-4 73 121)"/>';
    // 轴
    function roll(x) {
      var o = '';
      o += '<rect x="' + (x - 7) + '" y="56" width="14" height="96" rx="7" fill="url(#' + p + 'roll)" stroke="#6E5233" stroke-width="1"/>';
      o += '<path d="M' + (x - 3) + ' 62 V146" stroke="#FFF0D0" stroke-opacity="0.55" stroke-width="1.4" stroke-linecap="round"/>';
      o += '<ellipse cx="' + x + '" cy="56" rx="7" ry="2.4" fill="#E7CC99" stroke="#6E5233" stroke-width="0.9"/>';
      o += '<ellipse cx="' + x + '" cy="152" rx="7" ry="2.4" fill="#A98558" stroke="#6E5233" stroke-width="0.9"/>';
      o += '<rect x="' + (x - 3) + '" y="48" width="6" height="8" rx="2" fill="#A9C7C0" stroke="#5E7F7A" stroke-width="0.8"/>';
      o += '<rect x="' + (x - 3) + '" y="152" width="6" height="8" rx="2" fill="#A9C7C0" stroke="#5E7F7A" stroke-width="0.8"/>';
      return o;
    }
    s += roll(50) + roll(190);
    // 砚台
    s += '<ellipse cx="86" cy="190" rx="38" ry="5" fill="' + INK + '" opacity="0.14"/>';
    s += '<path d="M52 172 L52 184 C52 192 120 192 120 184 L120 172 Z" fill="url(#' + p + 'stone)" stroke="#2F353A" stroke-width="1"/>';
    s += '<ellipse cx="86" cy="172" rx="34" ry="11" fill="#5C666E" stroke="#2F353A" stroke-width="1"/>';
    s += '<ellipse cx="86" cy="172" rx="27" ry="8" fill="none" stroke="#8B969D" stroke-width="0.6"/>';
    s += '<ellipse cx="80" cy="173" rx="19" ry="5.6" fill="#1D2226"/>';
    s += '<ellipse cx="76" cy="171.6" rx="8" ry="1.8" fill="#FFFFFF" opacity="0.22"/>';
    s += '<path d="M60 178 C70 184 100 184 112 178" fill="none" stroke="#9AA5AC" stroke-opacity="0.45" stroke-width="0.8"/>';
    // 墨锭
    s += '<g transform="translate(94 166) rotate(-24)"><rect x="0" y="-4" width="26" height="8" rx="1.4" fill="#2A2F33" stroke="#0F1214" stroke-width="0.6"/><path d="M4 -1 h10 M4 1.4 h14" stroke="#D6AA78" stroke-width="0.7"/></g>';
    // 笔山与毛笔
    s += '<ellipse cx="170" cy="192" rx="34" ry="4.4" fill="' + INK + '" opacity="0.14"/>';
    s += '<path d="M138 190 L148 174 L155 182 L166 164 L176 180 L184 172 L198 190 Z" fill="url(#' + p + 'hill)" stroke="#5F7F7B" stroke-width="1" stroke-linejoin="round"/>';
    s += '<path d="M148 174 L152 184 M166 164 L168 178 M184 172 L182 184" stroke="#5F7F7B" stroke-opacity="0.5" stroke-width="0.6"/>';
    s += '<g transform="translate(130 180) rotate(-14)">' +
      '<path d="M0 0 C6 -3.6 16 -4.4 28 -3.8 L28 3.8 C16 4.4 6 3.6 0 0Z" fill="#4A3B32" stroke="#2A211C" stroke-width="0.8"/>' +
      '<path d="M14 -3.2 C20 -3.8 24 -3.6 28 -3.6 L28 3.6 C24 3.6 20 3.8 14 3.2Z" fill="#EADFC8" opacity="0.9"/>' +
      '<rect x="28" y="-4" width="6" height="8" rx="1" fill="#C9A15B" stroke="#8A6A3A" stroke-width="0.7"/>' +
      '<rect x="34" y="-3.2" width="52" height="6.4" rx="3.2" fill="url(#' + p + 'bam)" stroke="#8A6A3A" stroke-width="0.9"/>' +
      '<path d="M44 -2 H84" stroke="#FFF2D6" stroke-opacity="0.7" stroke-width="0.9" stroke-linecap="round"/>' +
      '<path d="M60 -3 V3 M76 -3 V3" stroke="#8A6A3A" stroke-width="0.7"/></g>';
    s += blossom(36, 84, 5, BLUSH, '#C996A0');
    return wrap('0 0 240 240', defs, s);
  }

  /* ---------- 首页横幅：梅瓶、茶盏、书卷 ---------- */
  function hero() {
    var p = 'he';
    var cup = cupParts(p);
    var defs = cup.defs +
      rg(p + 'moon', '50%', '45%', '60%', [[0, '#FFFFFF', 0.95], [0.7, '#EEF4F1', 0.7], [1, '#D6E6E2', 0.0]]) +
      lg(p + 'vase', 0, 0, 1, 0, [[0, '#C3DAD5'], [0.35, '#F2F8F5'], [0.7, '#C9DED9'], [1, '#98B8B3']]) +
      lg(p + 'table', 0, 0, 0, 1, [[0, '#E4C99C'], [1, '#C9A675']]) +
      lg(p + 'front', 0, 0, 0, 1, [[0, '#B8966B'], [1, '#97774F']]) +
      lg(p + 'paper', 0, 0, 0, 1, [[0, '#FFFCF3'], [1, '#EDE1C9']]) +
      lg(p + 'hill1', 0, 0, 0, 1, [[0, '#B5CDC7'], [1, '#D9E7E1']]) +
      lg(p + 'hill2', 0, 0, 0, 1, [[0, '#9DBBB4'], [1, '#CFE1DB']]);
    var s = '';
    var i;
    // 月与远山
    s += '<circle cx="130" cy="68" r="62" fill="url(#' + p + 'moon)"/>';
    s += '<circle cx="130" cy="68" r="62" fill="none" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="0.8"/>';
    s += '<path d="M8 124 C36 96 60 92 86 112 C100 98 126 90 150 108 C170 94 200 92 252 122 L252 132 L8 132 Z" fill="url(#' + p + 'hill1)" opacity="0.8"/>';
    s += '<path d="M8 130 C44 112 76 112 104 124 C132 114 176 110 252 128 L252 134 L8 134 Z" fill="url(#' + p + 'hill2)" opacity="0.85"/>';
    // 案
    s += '<ellipse cx="130" cy="146" rx="112" ry="5" fill="' + INK + '" opacity="0.1"/>';
    s += '<path d="M18 128 L242 128 L234 136 L26 136 Z" fill="url(#' + p + 'table)" stroke="#8A6E4E" stroke-width="1" stroke-linejoin="round"/>';
    s += '<rect x="26" y="136" width="208" height="6" rx="1" fill="url(#' + p + 'front)" stroke="#7A5C3A" stroke-width="0.9"/>';
    s += '<path d="M30 131 L230 131" stroke="#FFF2D6" stroke-opacity="0.5" stroke-width="0.8"/>';
    s += '<path d="M44 142 v6 M216 142 v6" stroke="#7A5C3A" stroke-width="2.4" stroke-linecap="round"/>';
    // 梅瓶与梅枝
    s += '<path d="M62 62 C48 50 34 36 22 30 M62 62 C70 48 78 34 92 22 M52 52 C46 44 46 36 50 28 M70 50 C78 46 86 46 94 50" fill="none" stroke="#5A4A42" stroke-width="2" stroke-linecap="round"/>';
    s += blossom(22, 30, 7, '#F9E6E6', '#C996A0') + blossom(92, 22, 7.6, BLUSH, '#C996A0') + blossom(50, 28, 6, '#F9E6E6', '#C996A0') + blossom(94, 50, 5.4, BLUSH, '#C996A0') + blossom(36, 44, 4.4, BLUSH, '#C996A0') + blossom(78, 36, 4.2, '#F9E6E6', '#C996A0');
    s += '<circle cx="14" cy="42" r="2" fill="#C996A0"/><circle cx="104" cy="34" r="1.8" fill="#C996A0"/><circle cx="58" cy="18" r="1.8" fill="#C996A0"/>';
    var vase = 'M54 60 C54 56 70 56 70 60 L69 66 C69 70 80 74 82 88 C84 104 74 114 72 128 L52 128 C50 114 40 104 42 88 C44 74 55 70 55 66 Z';
    s += '<path d="' + vase + '" fill="url(#' + p + 'vase)" stroke="#5D7F7B" stroke-width="1.1" stroke-linejoin="round"/>';
    s += '<ellipse cx="62" cy="59.6" rx="8.4" ry="2.4" fill="#E3EFEA" stroke="#5D7F7B" stroke-width="0.9"/>';
    s += '<ellipse cx="62" cy="59.6" rx="5" ry="1.2" fill="#7FA09B"/>';
    s += '<path d="M43 90 C52 96 72 96 81 90 M44 100 C54 106 70 106 80 100" fill="none" stroke="#7FA3A0" stroke-opacity="0.7" stroke-width="0.8"/>';
    s += '<path d="M54 74 C58 80 64 80 68 76 M50 114 C56 118 68 118 74 114" fill="none" stroke="#7FA3A0" stroke-opacity="0.55" stroke-width="0.7"/>';
    s += blossom(62, 103, 5, '#F4CBD1', '#C27E8B') ;
    s += '<path d="M48 82 C47 96 50 110 54 124" fill="none" stroke="#FFFFFF" stroke-opacity="0.85" stroke-width="2.2" stroke-linecap="round"/>';
    // 茶盏
    s += '<g transform="translate(70 36) scale(0.5)">' + cup.body + steam(104, 88, 30, 6) + steam(124, 84, 36, 7) + steam(142, 90, 24, 5) + '</g>';
    s += '<g transform="translate(70 36) scale(0.5)"></g>';
    // 书卷
    s += '<ellipse cx="206" cy="130" rx="38" ry="3.6" fill="' + INK + '" opacity="0.14"/>';
    s += '<path d="M182 108 L232 108 L232 128 L182 128 Z" fill="url(#' + p + 'paper)" stroke="#9E8A66" stroke-width="1"/>';
    for (i = 0; i < 5; i++) {
      s += '<path d="M' + (186 + i * 9.6) + ' 111 h' + (5 + (i % 2) * 2) + ' M' + (186 + i * 9.6) + ' 116 h' + (4 + ((i + 1) % 2) * 3) + ' M' + (186 + i * 9.6) + ' 121 h' + (6 - (i % 3)) + '" stroke="#3E4852" stroke-opacity="0.55" stroke-width="1" stroke-linecap="round"/>';
    }
    s += '<ellipse cx="182" cy="118" rx="5" ry="10" fill="#E9DEC6" stroke="#9E8A66" stroke-width="1"/>';
    s += '<ellipse cx="182" cy="118" rx="2.6" ry="5.4" fill="none" stroke="#9E8A66" stroke-width="0.8"/>';
    s += '<ellipse cx="232" cy="118" rx="5" ry="10" fill="#F4EBD6" stroke="#9E8A66" stroke-width="1"/>';
    s += '<ellipse cx="232" cy="118" rx="2.6" ry="5.4" fill="none" stroke="#9E8A66" stroke-width="0.8"/>';
    s += '<path d="M206 106 L206 130" stroke="#C996A0" stroke-width="3.4"/><path d="M206 106 L206 130" stroke="#E6BCC3" stroke-width="1.2"/>';
    s += '<path d="M206 130 C204 136 202 138 200 142 M206 130 C208 136 210 138 212 142" stroke="#C996A0" stroke-width="1.2" stroke-linecap="round" fill="none"/>';
    // 毛笔
    s += '<g transform="translate(238 100) rotate(196)"><path d="M0 0 C5 -2.6 12 -3 20 -2.6 L20 2.6 C12 3 5 2.6 0 0Z" fill="#4A3B32" stroke="#2A211C" stroke-width="0.7"/><rect x="20" y="-2.8" width="4" height="5.6" rx="0.8" fill="#C9A15B" stroke="#8A6A3A" stroke-width="0.6"/><rect x="24" y="-2.2" width="34" height="4.4" rx="2.2" fill="url(#' + p + 'paper)" stroke="#8A6A3A" stroke-width="0.8"/><rect x="24" y="-2.2" width="34" height="4.4" rx="2.2" fill="#D9B880" opacity="0.8"/></g>';
    // 落瓣
    s += '<g transform="translate(124 24) rotate(30) scale(0.4)"><path d="' + petal(28, 11) + '" fill="#F3C2CA" stroke="#C27E8B" stroke-width="1"/></g>';
    s += '<g transform="translate(176 40) rotate(-40) scale(0.36)"><path d="' + petal(28, 11) + '" fill="#F8D6DA" stroke="#C27E8B" stroke-width="1"/></g>';
    s += '<g transform="translate(160 18) rotate(80) scale(0.3)"><path d="' + petal(28, 11) + '" fill="#F3C2CA" stroke="#C27E8B" stroke-width="1"/></g>';
    return wrap('0 0 260 160', defs, s);
  }

  window.SCG_MOTIFS = {
    cha: cha(),
    hua: hua(),
    qin: qin(),
    xiu: xiu(),
    you: you(),
    shu: shu(),
    hero: hero()
  };
})();
