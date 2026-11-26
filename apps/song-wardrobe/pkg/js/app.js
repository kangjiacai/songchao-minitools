(function () {
  var POEMS = window.WARDROBE_POEMS;
  var Platform = window.WardrobePlatform;
  var Paint = window.WardrobePaint;
  var Poster = window.WardrobePoster;

  var PARTS = [
    { id: 'beizi', name: '褙子' },
    { id: 'inner', name: '内衫' },
    { id: 'zhongyi', name: '里衣' },
    { id: 'skirt', name: '裙' },
    { id: 'waist', name: '腰带' },
    { id: 'shoes', name: '鞋履' }
  ];

  var BASE_COLORS = [
    { name: '素白', hex: '#F6F4EE' },
    { name: '墨黑', hex: '#262422' }
  ];

  var SET_PATTERNS = [
    [0, 1, 2, 3],
    [1, 2, 3, 0],
    [2, 0, 1, 3],
    [3, 1, 0, 2]
  ];

  var MOODS = [
    {
      id: 'qinghuan',
      name: '清欢',
      dots: ['#8FB08A', '#F0E6C8'],
      poemIds: ['lqz-lufei', 'zbz-fenghe', 'xqc-lianpeng', 'yjd-wudi', 'oyx-meican', 'ss-caocao', 'jk-lengxiang', 'cyi-xinghua']
    },
    {
      id: 'yanyu',
      name: '烟雨',
      dots: ['#6A7A80', '#D0D6D4'],
      poemIds: ['ss-yanyu', 'jk-qingku', 'qg-siyu', 'qg-wushi', 'hz-huangyu', 'ss-wuqing', 'yjd-shuangfei']
    },
    {
      id: 'weixun',
      name: '微醺',
      dots: ['#C9B06A', '#E0A84A'],
      poemIds: ['ss-mingyue', 'ys-xinci', 'lqz-rongjin', 'lyou-hongsu', 'yjd-yinjgang', 'zbz-xincheng', 'ly-guihe']
    },
    {
      id: 'sinian',
      name: '思念',
      dots: ['#D48A9A', '#7A9BAA'],
      poemIds: ['lqz-meitou', 'lqz-xiangsi', 'jk-feishui', 'ly-yidai', 'qg-jinfeng', 'qg-changshi', 'yjd-caiyun', 'lqz-xunxun']
    },
    {
      id: 'guyong',
      name: '孤勇',
      dots: ['#2E3A55', '#E3A35C'],
      poemIds: ['xqc-lanshan', 'xqc-eersx', 'xqc-dongfeng', 'fzw-biyun', 'fzw-gucheng', 'was-chengjiang', 'jj-yingtao']
    },
    {
      id: 'guiyin',
      name: '归隐',
      dots: ['#5A6A6E', '#E8E6DC'],
      poemIds: ['jk-huainan', 'jk-lengyue', 'ss-chanjuan', 'ss-shazhou', 'lyou-xianggu', 'oyx-chunshan', 'zx-nongying', 'ly-canyue']
    }
  ];

  var STORAGE_KEY = 'songWardrobe.mvp.v1';
  var CHEST_KEY = 'songWardrobe.chest.v1';
  var CHEST_MAX = 6;

  var state = {
    poem: null,
    bag: [],
    part: 'beizi',
    picks: { beizi: null, inner: null, zhongyi: null, skirt: null, waist: null, shoes: null },
    history: [],
    setPatternIndex: 0,
    previewOriginal: false,
    exportBusy: false,
    renderedPoemId: null,
    canvas: null,
    toastTimer: 0,
    badgeTimer: 0,
    enterTimer: 0,
    drawerTimer: 0,
    drawerPoet: '',
    drawerRendered: false,
    drawerScrollLockUntil: 0,
    drawerScrollRaf: 0,
    drawerOpen: false,
    drawerTab: 'poems',
    introMode: false,
    introFromEdit: false,
    introDate: '',
    fromSnapshot: false,
    exportMode: false,
    posterWarmTimer: 0,
    chest: [],
    chestSelected: [],
    diptychOpen: false,
    diptychCanvas: null,
    diptychPair: null,
    hintDismissed: false,
    reduce: false
  };

  function $(id) { return document.getElementById(id); }

  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  function todayKey() {
    var d = new Date();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : String(m)) + '-' + (day < 10 ? '0' + day : String(day));
  }

  function clonePicks(src) {
    var out = {};
    var i;
    var id;
    for (i = 0; i < PARTS.length; i++) {
      id = PARTS[i].id;
      out[id] = src && src[id] ? { hex: src[id].hex, name: src[id].name } : null;
    }
    return out;
  }

  function isValidHex(hex) {
    return typeof hex === 'string' && /^#[0-9a-fA-F]{6}$/.test(hex);
  }

  function sanitizePick(pick) {
    if (!pick || typeof pick !== 'object' || !isValidHex(pick.hex)) return null;
    return {
      hex: pick.hex,
      name: typeof pick.name === 'string' && pick.name ? pick.name.slice(0, 16) : '选色'
    };
  }

  function sanitizePicks(raw) {
    var out = {};
    var i;
    var id;
    for (i = 0; i < PARTS.length; i++) {
      id = PARTS[i].id;
      out[id] = sanitizePick(raw && raw[id]);
    }
    return out;
  }

  function hasAnyDyed(picksObj) {
    var src = picksObj || state.picks;
    var i;
    for (i = 0; i < PARTS.length; i++) {
      if (src[PARTS[i].id]) return true;
    }
    return false;
  }

  function formatPoemLines(text) {
    var clean = String(text || '').replace(/\s+/g, '');
    var mid;
    var best = -1;
    var bestDist = 999;
    var i;
    var ch;
    if (!clean || clean.length <= 11) return clean;
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
    if (best > 0) return clean.slice(0, best) + '\n' + clean.slice(best);
    return clean.slice(0, Math.ceil(mid)) + '\n' + clean.slice(Math.ceil(mid));
  }

  function toast(text) {
    var node = $('toast');
    var extra = '';
    if (!node) return;
    window.clearTimeout(state.toastTimer);
    if (state.diptychOpen) extra = ' is-diptych';
    else if (state.exportMode) extra = ' is-result';
    node.textContent = text;
    node.className = 'toast is-on' + extra;
    state.toastTimer = window.setTimeout(function () {
      var tail = state.diptychOpen ? ' is-diptych' : (state.exportMode ? ' is-result' : '');
      node.className = 'toast' + tail;
    }, state.reduce ? 1800 : 2300);
  }

  function showStageBadge(text) {
    var badge = $('stage-badge');
    if (!badge) return;
    window.clearTimeout(state.badgeTimer);
    badge.textContent = text;
    badge.className = 'stage-badge is-on';
    state.badgeTimer = window.setTimeout(function () {
      badge.className = 'stage-badge';
    }, state.reduce ? 1100 : 1400);
  }

  function dismissHint() {
    var hint;
    if (state.hintDismissed) return;
    state.hintDismissed = true;
    hint = $('stage-hint');
    if (hint) hint.classList.add('is-gone');
  }

  function playPoemEnter() {
    var head = $('poem-head');
    var swatches = $('colors');
    window.clearTimeout(state.enterTimer);
    if (head) head.classList.remove('is-enter');
    if (swatches) swatches.classList.remove('is-enter');
    if (state.reduce) return;
    if (head) {
      void head.offsetWidth;
      head.classList.add('is-enter');
    }
    if (swatches) {
      void swatches.offsetWidth;
      swatches.classList.add('is-enter');
    }
    state.enterTimer = window.setTimeout(function () {
      if (head) head.classList.remove('is-enter');
      if (swatches) swatches.classList.remove('is-enter');
    }, 420);
  }

  function playRipple(wrapX, wrapY) {
    var ripple = $('tap-ripple');
    if (state.reduce || !ripple) return;
    ripple.classList.remove('is-active');
    ripple.style.left = Math.round(wrapX) + 'px';
    ripple.style.top = Math.round(wrapY) + 'px';
    void ripple.offsetWidth;
    ripple.classList.add('is-active');
  }

  function partName(id) {
    var i;
    for (i = 0; i < PARTS.length; i++) {
      if (PARTS[i].id === id) return PARTS[i].name;
    }
    return '';
  }

  function pickOf(id) {
    return state.picks[id] || null;
  }

  function summary(picksObj) {
    var src = picksObj || state.picks;
    var bits = [];
    var i;
    var pick;
    for (i = 0; i < PARTS.length; i++) {
      pick = src[PARTS[i].id] || null;
      bits.push(PARTS[i].name + (pick ? pick.name : '原色'));
    }
    return bits.join(' · ');
  }

  function colorItems(picksObj) {
    var src = picksObj || state.picks;
    var list = [];
    var i;
    var pick;
    for (i = 0; i < PARTS.length; i++) {
      pick = src[PARTS[i].id] || null;
      list.push({
        id: PARTS[i].id,
        name: PARTS[i].name,
        colorName: pick ? pick.name : '原色',
        hex: pick ? pick.hex : null
      });
    }
    return list;
  }

  function colorMap(picksObj) {
    var src = picksObj || state.picks;
    var out = {};
    var i;
    var id;
    var pick;
    for (i = 0; i < PARTS.length; i++) {
      id = PARTS[i].id;
      pick = src[id];
      out[id] = pick ? pick.hex : null;
    }
    return out;
  }

  function hexRgb(hex) {
    var n = parseInt(String(hex || '#000000').slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgbLuma(rgb) {
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }

  function computeLookName(picksObj) {
    var src = picksObj || state.picks;
    var order = ['beizi', 'skirt', 'inner', 'waist', 'shoes', 'zhongyi'];
    var primary = null;
    var i;
    var rawName;
    var prefix;
    var rgb;
    var y;
    var maxC;
    var minC;
    var suffixPool;
    var j;
    var suf;
    if (!hasAnyDyed(src)) return '宣纸素本';
    for (i = 0; i < order.length; i++) {
      if (src[order[i]]) {
        primary = src[order[i]];
        break;
      }
    }
    if (!primary) return '宣纸素本';
    rawName = String(primary.name || '清雅').replace(/[^一-龥]/g, '');
    if (rawName.length >= 3) {
      if ('红绿白灰蓝青黑褐金粉紫银墨黛黄赭绛淡暗翠气'.indexOf(rawName.charAt(rawName.length - 1)) !== -1) {
        prefix = rawName.slice(0, 2);
      } else {
        prefix = rawName.slice(-2);
      }
    } else if (rawName.length === 2) {
      prefix = rawName;
    } else {
      prefix = (rawName || '清') + '衫';
    }

    rgb = hexRgb(primary.hex);
    y = rgbLuma(rgb);
    maxC = Math.max(rgb[0], rgb[1], rgb[2]);
    minC = Math.min(rgb[0], rgb[1], rgb[2]);
    if (y > 205) {
      suffixPool = ['素衣', '清裳', '雪纱', '浅袂'];
    } else if (y < 85) {
      suffixPool = ['墨影', '夜袂', '幽岚', '沉香'];
    } else if (maxC - minC < 24) {
      suffixPool = ['烟衫', '水袖', '清韵', '云袂'];
    } else if (rgb[0] >= rgb[1] + 18 && rgb[0] >= rgb[2] + 18) {
      suffixPool = ['春衫', '霞帔', '芳菲', '暖袂'];
    } else if (rgb[1] >= rgb[0] + 10 && rgb[1] >= rgb[2]) {
      suffixPool = ['竹韵', '荷风', '清露', '幽篁'];
    } else {
      suffixPool = ['青衫', '水色', '晚翠', '流光'];
    }
    suf = suffixPool[0];
    for (j = 0; j < suffixPool.length; j++) {
      if (prefix.indexOf(suffixPool[j].charAt(0)) === -1 && prefix.indexOf(suffixPool[j].charAt(1)) === -1) {
        suf = suffixPool[j];
        break;
      }
    }
    return prefix + suf;
  }

  function shuffleBag() {
    var ids = [];
    var i;
    var j;
    var t;
    for (i = 0; i < POEMS.ci.length; i++) ids.push(i);
    for (i = ids.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = ids[i];
      ids[i] = ids[j];
      ids[j] = t;
    }
    if (state.poem) {
      for (i = 0; i < ids.length; i++) {
        if (POEMS.ci[ids[i]].id === state.poem.id) {
          ids.splice(i, 1);
          break;
        }
      }
    }
    state.bag = ids;
  }

  function drawPoem() {
    var idx;
    if (!state.bag.length) shuffleBag();
    idx = state.bag.shift();
    state.poem = POEMS.ci[idx];
  }

  function findPoem(id) {
    var i;
    for (i = 0; i < POEMS.ci.length; i++) {
      if (POEMS.ci[i].id === id) return POEMS.ci[i];
    }
    return null;
  }

  function findMood(id) {
    var i;
    for (i = 0; i < MOODS.length; i++) {
      if (MOODS[i].id === id) return MOODS[i];
    }
    return null;
  }

  function buildMoodPicks(poem) {
    var list = (poem && poem.colors) ? poem.colors.slice() : [];
    var sorted;
    var cLight;
    var cMidLight;
    var cMidDark;
    var cDark;
    if (list.length < 4) return clonePicks(null);
    sorted = list.slice().sort(function (a, b) {
      return rgbLuma(hexRgb(b.hex)) - rgbLuma(hexRgb(a.hex));
    });
    cLight = sorted[0];
    cMidLight = sorted[1];
    cMidDark = sorted[2];
    cDark = sorted[3];
    return {
      beizi: { hex: cMidDark.hex, name: cMidDark.name },
      inner: { hex: cLight.hex, name: cLight.name },
      zhongyi: null,
      skirt: { hex: cMidLight.hex, name: cMidLight.name },
      waist: { hex: cDark.hex, name: cDark.name },
      shoes: { hex: cDark.hex, name: cDark.name }
    };
  }

  function paintCopy() {
    var line = state.poem ? state.poem.line : '';
    var metaText = state.poem ? (state.poem.poet + '·' + state.poem.tune) : '';
    var current = pickOf(state.part);
    var clearBtn = $('btn-clear-part');
    $('poem-line').textContent = formatPoemLines(line);
    $('poem-meta').textContent = metaText;
    $('dye-label').textContent = partName(state.part) + ' · ' + (current ? current.name : '原色');
    if (clearBtn) clearBtn.hidden = !current;
  }

  function syncOriginalButton() {
    var btn = $('btn-original');
    if (!btn) return;
    if (state.previewOriginal) {
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-pressed', 'false');
    }
  }

  function paintStageTools() {
    var undoBtn = $('btn-undo');
    var origBtn = $('btn-original');
    var resetBtn = $('btn-reset');
    var dyed = hasAnyDyed();
    if (dyed && !state.fromSnapshot) dismissHint();
    if (!dyed && state.previewOriginal) {
      state.previewOriginal = false;
      Paint.setPreviewOriginal(false);
    }
    if (undoBtn) undoBtn.disabled = state.history.length === 0;
    if (origBtn) origBtn.disabled = !dyed;
    if (resetBtn) resetBtn.disabled = !dyed;
    syncOriginalButton();
  }

  function updatePartIndicator() {
    var indicator = $('part-indicator');
    var active = $('parts') && $('parts').querySelector('.chip.is-on');
    var x;
    if (!indicator || !active || !active.offsetWidth) return;
    x = Math.round(active.offsetLeft + active.offsetWidth / 2 - 7);
    indicator.style.webkitTransform = 'translateX(' + x + 'px)';
    indicator.style.transform = 'translateX(' + x + 'px)';
    indicator.classList.add('is-ready');
  }

  function chip(partItem, on) {
    var btn = document.createElement('button');
    var dot = document.createElement('span');
    var label = document.createElement('span');
    var pick = pickOf(partItem.id);
    btn.type = 'button';
    btn.className = 'chip' + (on ? ' is-on' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('data-id', partItem.id);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
    dot.className = 'chip-dot' + (pick ? ' is-dyed' : '');
    if (pick) dot.style.background = pick.hex;
    label.textContent = partItem.name;
    btn.appendChild(dot);
    btn.appendChild(label);
    return btn;
  }

  function buildSwatchCard(item, current, isPoem) {
    var on = !!(current && item.hex.toLowerCase() === current.hex.toLowerCase());
    var card = document.createElement('button');
    var swatch = document.createElement('span');
    var nameEl = document.createElement('span');
    card.type = 'button';
    card.className = 'swatch-card ' + (isPoem ? 'is-poem' : 'is-base') + (on ? ' is-on' : '');
    card.setAttribute('data-hex', item.hex);
    card.setAttribute('aria-pressed', on ? 'true' : 'false');
    card.setAttribute('aria-label', item.name);

    swatch.className = 'swatch-chip';
    swatch.style.background = item.hex;

    nameEl.className = 'swatch-name';
    nameEl.textContent = item.name;

    card.appendChild(swatch);
    card.appendChild(nameEl);
    return card;
  }

  function syncPartNodes(partsEl) {
    var nodes = partsEl.children;
    var i;
    var btn;
    var dot;
    var partItem;
    var on;
    var pick;
    for (i = 0; i < PARTS.length; i++) {
      partItem = PARTS[i];
      btn = nodes[i];
      on = partItem.id === state.part;
      pick = pickOf(partItem.id);
      btn.className = 'chip' + (on ? ' is-on' : '');
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      dot = btn.querySelector('.chip-dot');
      if (dot) {
        dot.className = 'chip-dot' + (pick ? ' is-dyed' : '');
        dot.style.background = pick ? pick.hex : '';
      }
    }
  }

  function syncSwatchNodes(colorsEl, current) {
    var cards = colorsEl.querySelectorAll('.swatch-card');
    var curHex = current ? current.hex.toLowerCase() : '';
    var i;
    var card;
    var hex;
    var on;
    for (i = 0; i < cards.length; i++) {
      card = cards[i];
      hex = (card.getAttribute('data-hex') || '').toLowerCase();
      on = !!(curHex && hex === curHex);
      if (on) card.classList.add('is-on');
      else card.classList.remove('is-on');
      card.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function outfitSignature(poemId, picksObj) {
    var parts = [];
    var i;
    var p;
    for (i = 0; i < PARTS.length; i++) {
      p = picksObj[PARTS[i].id];
      parts.push(p ? p.hex.toUpperCase() : '-');
    }
    return (poemId || '') + '|' + parts.join(',');
  }

  function isCurrentInChest() {
    var sig = outfitSignature(state.poem ? state.poem.id : '', state.picks);
    var i;
    for (i = 0; i < state.chest.length; i++) {
      if (outfitSignature(state.chest[i].poemId, state.chest[i].picks) === sig) return true;
    }
    return false;
  }

  function syncChestMeta() {
    var countEl = $('chest-count');
    var topLabel = $('top-chest-label');
    var homeSaveBtn = $('btn-home-chest-save');
    var saveBtn = $('btn-chest-save');
    var openBtn = $('btn-open-chest');
    var saved = isCurrentInChest();
    if (countEl) countEl.textContent = state.chest.length + '/' + CHEST_MAX;
    if (topLabel) topLabel.textContent = state.chest.length > 0 ? '衣箱 ' + state.chest.length : '衣箱';
    if (homeSaveBtn) {
      homeSaveBtn.textContent = saved ? '✓ 已存' : '存衣箱';
      if (saved) homeSaveBtn.classList.add('is-saved');
      else homeSaveBtn.classList.remove('is-saved');
    }
    if (saveBtn) {
      saveBtn.textContent = saved ? '✓ 已存衣箱' : '+ 存衣箱';
      if (saved) saveBtn.classList.add('is-saved');
      else saveBtn.classList.remove('is-saved');
    }
    if (openBtn) {
      openBtn.textContent = state.chest.length >= 2 ? '双联 ' + state.chest.length : '双联对比';
    }
  }

  function paintControls() {
    var parts = $('parts');
    var colors = $('colors');
    var current = pickOf(state.part);
    var poemId = state.poem ? state.poem.id : '';
    var list;
    var i;
    var sep;
    if (parts.children.length !== PARTS.length) {
      clear(parts);
      for (i = 0; i < PARTS.length; i++) {
        parts.appendChild(chip(PARTS[i], PARTS[i].id === state.part));
      }
    } else {
      syncPartNodes(parts);
    }
    if (state.renderedPoemId !== poemId || !colors.children.length) {
      clear(colors);
      list = state.poem ? state.poem.colors : [];
      for (i = 0; i < list.length; i++) {
        colors.appendChild(buildSwatchCard(list[i], current, true));
      }
      sep = document.createElement('span');
      sep.className = 'swatch-sep';
      sep.setAttribute('aria-hidden', 'true');
      colors.appendChild(sep);
      for (i = 0; i < BASE_COLORS.length; i++) {
        colors.appendChild(buildSwatchCard(BASE_COLORS[i], current, false));
      }
      state.renderedPoemId = poemId;
    } else {
      syncSwatchNodes(colors, current);
    }
    paintCopy();
    paintStageTools();
    updatePartIndicator();
    syncChestMeta();
  }

  function pushHistory() {
    state.history.push(clonePicks(state.picks));
    if (state.history.length > 20) state.history.shift();
  }

  function saveState() {
    Platform.setData(STORAGE_KEY, {
      poemId: state.poem ? state.poem.id : '',
      picks: state.picks,
      introDate: state.introDate || ''
    });
  }

  function saveChest() {
    Platform.setData(CHEST_KEY, state.chest);
  }

  function setOriginalPreview(flag, announce) {
    if (flag && !hasAnyDyed()) flag = false;
    state.previewOriginal = !!flag;
    Paint.setPreviewOriginal(state.previewOriginal);
    syncOriginalButton();
    if (announce) {
      showStageBadge(state.previewOriginal ? '原画对照（再点恢复）' : '已恢复当前配色');
      Platform.vibrateLight();
    }
  }

  function applyColors(animate) {
    state.canvas = null;
    setOriginalPreview(false, false);
    Paint.setColors(colorMap(), !!animate && !state.reduce);
    paintControls();
    saveState();
  }

  function idFrom(event, attr) {
    var node = event.target;
    while (node && node !== event.currentTarget) {
      if (node.getAttribute && node.getAttribute(attr)) {
        return { value: node.getAttribute(attr), node: node };
      }
      node = node.parentNode;
    }
    return null;
  }

  function onPart(event) {
    var hit = idFrom(event, 'data-id');
    if (!hit || hit.value === state.part) return;
    state.part = hit.value;
    paintControls();
  }

  function onColor(event) {
    var hit = idFrom(event, 'data-hex');
    var hex;
    var current;
    if (!hit) return;
    hex = hit.value;
    state.fromSnapshot = false;
    dismissHint();
    current = pickOf(state.part);
    pushHistory();
    if (current && current.hex.toLowerCase() === hex.toLowerCase()) {
      state.picks[state.part] = null;
      applyColors(true);
      Platform.vibrateLight();
      return;
    }
    state.picks[state.part] = {
      hex: hex,
      name: hit.node.getAttribute('aria-label') || '选色'
    };
    applyColors(true);
    Platform.vibrateLight();
  }

  function onClearPart() {
    if (!pickOf(state.part)) return;
    state.fromSnapshot = false;
    dismissHint();
    pushHistory();
    state.picks[state.part] = null;
    applyColors(true);
    toast(partName(state.part) + '已还原本色');
    Platform.vibrateLight();
  }

  function onApplySet() {
    var list = state.poem ? state.poem.colors : [];
    var setTargets = ['beizi', 'inner', 'skirt', 'waist'];
    var offset;
    var usedIndex = -1;
    var pattern;
    var i;
    var color;
    var diff;
    var candidate;
    var nextPicks = null;
    if (list.length < setTargets.length) return;
    state.fromSnapshot = false;
    dismissHint();
    for (offset = 0; offset < SET_PATTERNS.length; offset++) {
      usedIndex = (state.setPatternIndex + offset) % SET_PATTERNS.length;
      pattern = SET_PATTERNS[usedIndex];
      candidate = clonePicks(state.picks);
      diff = false;
      for (i = 0; i < setTargets.length; i++) {
        color = list[pattern[i] % list.length];
        candidate[setTargets[i]] = { hex: color.hex, name: color.name };
        if (!state.picks[setTargets[i]] || state.picks[setTargets[i]].hex !== color.hex) {
          diff = true;
        }
      }
      if (diff) {
        nextPicks = candidate;
        break;
      }
    }
    if (!nextPicks) return;
    state.setPatternIndex = (usedIndex + 1) % SET_PATTERNS.length;
    pushHistory();
    state.picks = nextPicks;
    applyColors(true);
    Platform.vibrateLight();
    toast('已依「' + state.poem.tune + '」套色（' + (usedIndex + 1) + '/' + SET_PATTERNS.length + '）');
  }

  function onUndo() {
    if (!state.history.length) return;
    state.picks = state.history.pop();
    applyColors(true);
    Platform.vibrateLight();
    toast('已撤回上一步');
  }

  function applyPoemPalette(poem, toastText) {
    var nextPicks;
    var curPoemId;
    if (!poem) return;
    nextPicks = buildMoodPicks(poem);
    curPoemId = state.poem ? state.poem.id : '';
    state.fromSnapshot = false;
    dismissHint();
    if (outfitSignature(curPoemId, state.picks) !== outfitSignature(poem.id, nextPicks)) {
      pushHistory();
    }
    state.poem = poem;
    state.picks = nextPicks;
    state.setPatternIndex = 0;
    applyColors(true);
    playPoemEnter();
    Platform.vibrateLight();
    if (toastText) toast(toastText);
  }

  function onShuffle() {
    var nextPoem;
    if (!state.bag.length) shuffleBag();
    nextPoem = POEMS.ci[state.bag.shift()];
    if (!nextPoem) return;
    applyPoemPalette(nextPoem, '已换「' + nextPoem.tune + '」套色');
  }

  function onReset() {
    if (!hasAnyDyed()) return;
    state.fromSnapshot = false;
    pushHistory();
    state.picks = { beizi: null, inner: null, zhongyi: null, skirt: null, waist: null, shoes: null };
    state.part = 'beizi';
    applyColors(true);
    Platform.vibrateLight();
    toast('已还原本画衣色');
  }

  function onCanvasClick(event) {
    var wrap = $('canvas-wrap');
    var rect;
    var x;
    var y;
    var part;
    var pick;
    if (state.introMode || state.exportMode || !wrap || !wrap.clientWidth || !wrap.clientHeight) return;
    rect = wrap.getBoundingClientRect();
    x = ((event.clientX - rect.left) / rect.width) * Paint.width;
    y = ((event.clientY - rect.top) / rect.height) * Paint.height;
    part = Paint.hitTest(x, y);
    if (!part) return;
    state.fromSnapshot = false;
    dismissHint();
    playRipple(event.clientX - rect.left, event.clientY - rect.top);
    if (part !== state.part) {
      state.part = part;
      paintControls();
    }
    pick = pickOf(part);
    showStageBadge(partName(part) + ' · ' + (pick ? pick.name : '原色'));
    Platform.vibrateLight();
  }

  function onToggleOriginal() {
    if (!hasAnyDyed()) return;
    setOriginalPreview(!state.previewOriginal, true);
  }

  /* 前置态：心境起衣 */
  function renderMoodGrid() {
    var grid = $('mood-grid');
    var i;
    var j;
    var mood;
    var cell;
    var btn;
    var dotsEl;
    var dotEl;
    var textEl;
    if (!grid) return;
    clear(grid);
    for (i = 0; i < MOODS.length; i++) {
      mood = MOODS[i];
      cell = document.createElement('div');
      cell.className = 'mood-cell';
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mood-pill';
      btn.setAttribute('data-mood', mood.id);

      dotsEl = document.createElement('span');
      dotsEl.className = 'mood-dots';
      dotsEl.setAttribute('aria-hidden', 'true');
      for (j = 0; j < mood.dots.length; j++) {
        dotEl = document.createElement('span');
        dotEl.className = 'mood-dot';
        dotEl.style.background = mood.dots[j];
        dotsEl.appendChild(dotEl);
      }

      textEl = document.createElement('span');
      textEl.textContent = mood.name;

      btn.appendChild(dotsEl);
      btn.appendChild(textEl);
      cell.appendChild(btn);
      grid.appendChild(cell);
    }
  }

  function setIntroMode(on, fromEdit) {
    var app = $('app');
    var topIntro = $('top-intro');
    var topEdit = $('top-edit');
    var dockIntro = $('dock-intro');
    var dockEdit = $('dock-edit');
    var skipBtn = $('btn-intro-skip');
    state.introMode = !!on;
    state.introFromEdit = !!(on && fromEdit);
    if (app) {
      if (state.introMode) {
        app.classList.remove('is-export');
        state.exportMode = false;
        app.classList.add('is-intro');
      } else {
        app.classList.remove('is-intro');
      }
    }
    if (topIntro) topIntro.setAttribute('aria-hidden', state.introMode ? 'false' : 'true');
    if (dockIntro) dockIntro.setAttribute('aria-hidden', state.introMode ? 'false' : 'true');
    if (topEdit) topEdit.setAttribute('aria-hidden', state.introMode ? 'true' : 'false');
    if (dockEdit) dockEdit.setAttribute('aria-hidden', state.introMode ? 'true' : 'false');
    if (skipBtn) skipBtn.textContent = state.introFromEdit ? '‹ 返回设色' : '直接设色 ›';
    updatePartIndicator();
  }

  function applyMood(moodId, fromRandom) {
    var mood = findMood(moodId) || MOODS[0];
    var candidates = [];
    var i;
    var p;
    var chosen;
    for (i = 0; i < mood.poemIds.length; i++) {
      p = findPoem(mood.poemIds[i]);
      if (p) candidates.push(p);
    }
    if (!candidates.length && POEMS.ci.length) candidates.push(POEMS.ci[0]);
    if (candidates.length > 1 && state.poem) {
      candidates = candidates.filter(function (item) { return item.id !== state.poem.id; });
      if (!candidates.length) candidates = [state.poem];
    }
    chosen = candidates[Math.floor(Math.random() * candidates.length)];
    pushHistory();
    state.fromSnapshot = false;
    state.poem = chosen;
    state.setPatternIndex = 0;
    state.introDate = todayKey();
    state.picks = buildMoodPicks(chosen);
    setIntroMode(false, false);
    applyColors(true);
    playPoemEnter();
    Platform.vibrateLight();
    toast((fromRandom ? '今日起衣·「' : '心境「') + mood.name + '」· 今日宜着【' + computeLookName(state.picks) + '】');
  }

  function onMoodGridClick(event) {
    var hit = idFrom(event, 'data-mood');
    if (!hit) return;
    applyMood(hit.value, false);
  }

  function onIntroRandom() {
    var idx = Math.floor(Math.random() * MOODS.length);
    applyMood(MOODS[idx].id, true);
  }

  function onIntroSkip() {
    if (!state.introMode) return;
    state.introDate = todayKey();
    setIntroMode(false, false);
    saveState();
    Platform.vibrateLight();
  }

  function onOpenMood() {
    closeDrawer();
    setIntroMode(true, true);
    Platform.vibrateLight();
  }

  /* 词笺抽屉：宋词色笺 + 我的衣箱 */
  function poetList() {
    var seen = {};
    var out = [];
    var i;
    var p;
    for (i = 0; i < POEMS.ci.length; i++) {
      p = POEMS.ci[i].poet;
      if (!seen[p]) {
        seen[p] = true;
        out.push(p);
      }
    }
    return out;
  }

  function syncDrawerPoetTab(poet, smoothTab) {
    var poetsEl = $('drawer-poets');
    var tabs;
    var i;
    var tab;
    var activeTab = null;
    var targetLeft;
    if (!poetsEl) return;
    state.drawerPoet = poet;
    tabs = poetsEl.querySelectorAll('.poet-tab');
    for (i = 0; i < tabs.length; i++) {
      tab = tabs[i];
      if (tab.getAttribute('data-poet') === poet) {
        tab.classList.add('is-on');
        tab.setAttribute('aria-selected', 'true');
        activeTab = tab;
      } else {
        tab.classList.remove('is-on');
        tab.setAttribute('aria-selected', 'false');
      }
    }
    if (activeTab && poetsEl.clientWidth) {
      targetLeft = Math.max(0, activeTab.offsetLeft - Math.round((poetsEl.clientWidth - activeTab.offsetWidth) / 2));
      if (smoothTab && !state.reduce && typeof poetsEl.scrollTo === 'function') {
        try {
          poetsEl.scrollTo({ left: targetLeft, behavior: 'smooth' });
        } catch (err) {
          poetsEl.scrollLeft = targetLeft;
        }
      } else {
        poetsEl.scrollLeft = targetLeft;
      }
    }
  }

  function syncDrawerSelection() {
    var listEl = $('drawer-list');
    var curId = state.poem ? state.poem.id : '';
    var rows;
    var i;
    var row;
    var on;
    if (!listEl) return;
    rows = listEl.querySelectorAll('.poem-item');
    for (i = 0; i < rows.length; i++) {
      row = rows[i];
      on = !!(curId && row.getAttribute('data-poem-id') === curId);
      if (on) row.classList.add('is-on');
      else row.classList.remove('is-on');
    }
  }

  function renderDrawerPoems() {
    var poetsEl = $('drawer-poets');
    var listEl = $('drawer-list');
    var countEl = $('drawer-count');
    var poets = poetList();
    var activePoet = (state.poem && state.poem.poet) || poets[0] || '';
    var i;
    var j;
    var btn;
    var item;
    var lastPoet = '';
    var headEl;
    if (state.drawerRendered) {
      syncDrawerSelection();
      return;
    }
    clear(poetsEl);
    clear(listEl);

    for (i = 0; i < poets.length; i++) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'poet-tab' + (poets[i] === activePoet ? ' is-on' : '');
      btn.setAttribute('data-poet', poets[i]);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', poets[i] === activePoet ? 'true' : 'false');
      btn.textContent = poets[i];
      poetsEl.appendChild(btn);
    }

    if (countEl) countEl.textContent = String(POEMS.ci.length);

    for (i = 0; i < POEMS.ci.length; i++) {
      item = POEMS.ci[i];
      if (item.poet !== lastPoet) {
        lastPoet = item.poet;
        headEl = document.createElement('div');
        headEl.className = 'poem-group-head';
        headEl.setAttribute('data-poet-anchor', item.poet);
        headEl.textContent = item.poet;
        listEl.appendChild(headEl);
      }
      var row = document.createElement('button');
      var lineEl = document.createElement('p');
      var footEl = document.createElement('div');
      var metaEl = document.createElement('span');
      var pillsEl = document.createElement('span');
      var isCurrent = state.poem && state.poem.id === item.id;

      row.type = 'button';
      row.className = 'poem-item' + (isCurrent ? ' is-on' : '');
      row.setAttribute('data-poem-id', item.id);
      row.setAttribute('data-poet', item.poet);

      lineEl.className = 'poem-item-line';
      lineEl.textContent = item.line;

      footEl.className = 'poem-item-foot';
      metaEl.className = 'poem-item-meta';
      metaEl.textContent = item.poet + '《' + item.tune + '》';

      pillsEl.className = 'poem-item-colors';
      for (j = 0; j < item.colors.length; j++) {
        var pill = document.createElement('span');
        pill.className = 'mini-pill';
        pill.style.background = item.colors[j].hex;
        pillsEl.appendChild(pill);
      }

      footEl.appendChild(metaEl);
      footEl.appendChild(pillsEl);
      row.appendChild(lineEl);
      row.appendChild(footEl);
      listEl.appendChild(row);
    }
    state.drawerRendered = true;
    state.drawerPoet = activePoet;
  }

  function updateChestFooter() {
    var tipEl = $('chest-pick-tip');
    var btnDiptych = $('btn-diptych');
    if (tipEl) {
      if (state.chest.length === 0) tipEl.textContent = '收存至少 2 套可生成双联画卷';
      else if (state.chest.length < 2) tipEl.textContent = '再收存 1 套即可生成双联画卷';
      else if (state.chestSelected.length === 2) tipEl.textContent = '已选 2 套 · 可生成双联画卷';
      else if (state.chestSelected.length === 1) tipEl.textContent = '已选 1 套 · 再勾 1 套即可对比';
      else tipEl.textContent = '勾选 2 套开启对比';
    }
    if (btnDiptych) btnDiptych.disabled = state.chestSelected.length !== 2;
  }

  function syncChestSelection() {
    var listEl = $('chest-list');
    var cards;
    var i;
    var card;
    var id;
    var picked;
    var chk;
    if (listEl) {
      cards = listEl.querySelectorAll('.chest-card');
      for (i = 0; i < cards.length; i++) {
        card = cards[i];
        id = card.getAttribute('data-chest-id');
        picked = state.chestSelected.indexOf(id) !== -1;
        if (picked) card.classList.add('is-picked');
        else card.classList.remove('is-picked');
        chk = card.querySelector('.chest-check');
        if (chk) chk.setAttribute('aria-pressed', picked ? 'true' : 'false');
      }
    }
    updateChestFooter();
  }

  function renderChestList() {
    var listEl = $('chest-list');
    var validSel = [];
    var i;
    var j;
    var item;
    var poem;
    var card;
    var checkBtn;
    var mainBtn;
    var nameRow;
    var nameEl;
    var pillsEl;
    var pill;
    var pick;
    var metaEl;
    var delBtn;
    var picked;

    if (!listEl) return;
    for (i = 0; i < state.chestSelected.length; i++) {
      for (j = 0; j < state.chest.length; j++) {
        if (state.chest[j].id === state.chestSelected[i]) {
          validSel.push(state.chestSelected[i]);
          break;
        }
      }
    }
    state.chestSelected = validSel.slice(0, 2);
    if (state.chest.length >= 2 && state.chestSelected.length === 0) {
      state.chestSelected = [state.chest[0].id, state.chest[1].id];
    }
    syncChestMeta();
    clear(listEl);

    if (!state.chest.length) {
      var empty = document.createElement('p');
      empty.className = 'chest-empty';
      empty.textContent = '衣箱还是空的。\n设好两套搭配收进衣箱，即可拼出 3:4「双联试衣画卷」对比投票～';
      listEl.appendChild(empty);
    } else {
      for (i = 0; i < state.chest.length; i++) {
        item = state.chest[i];
        picked = state.chestSelected.indexOf(item.id) !== -1;
        poem = findPoem(item.poemId);

        card = document.createElement('div');
        card.className = 'chest-card' + (picked ? ' is-picked' : '');
        card.setAttribute('data-chest-id', item.id);

        checkBtn = document.createElement('button');
        checkBtn.type = 'button';
        checkBtn.className = 'chest-check';
        checkBtn.setAttribute('data-chest-check', item.id);
        checkBtn.setAttribute('aria-label', '勾选对比 ' + item.name);
        checkBtn.setAttribute('aria-pressed', picked ? 'true' : 'false');
        checkBtn.textContent = '✓';

        mainBtn = document.createElement('button');
        mainBtn.type = 'button';
        mainBtn.className = 'chest-main';
        mainBtn.setAttribute('data-chest-wear', item.id);

        nameRow = document.createElement('div');
        nameRow.className = 'chest-name-row';

        nameEl = document.createElement('span');
        nameEl.className = 'chest-name';
        nameEl.textContent = item.name || '宣纸素本';

        pillsEl = document.createElement('span');
        pillsEl.className = 'chest-pills';
        for (j = 0; j < PARTS.length; j++) {
          pick = item.picks && item.picks[PARTS[j].id];
          if (pick && pick.hex) {
            pill = document.createElement('span');
            pill.className = 'mini-pill';
            pill.style.background = pick.hex;
            pillsEl.appendChild(pill);
          }
        }
        nameRow.appendChild(nameEl);
        nameRow.appendChild(pillsEl);

        metaEl = document.createElement('p');
        metaEl.className = 'chest-meta';
        metaEl.textContent = (poem ? poem.poet + '《' + poem.tune + '》· ' : '') + summary(item.picks);

        mainBtn.appendChild(nameRow);
        mainBtn.appendChild(metaEl);

        delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'chest-del';
        delBtn.setAttribute('data-chest-del', item.id);
        delBtn.textContent = '删';

        card.appendChild(checkBtn);
        card.appendChild(mainBtn);
        card.appendChild(delBtn);
        listEl.appendChild(card);
      }
    }

    updateChestFooter();
  }

  function setDrawerTab(tab) {
    var poemsTab = $('tab-poems');
    var chestTab = $('tab-chest');
    var poemsPane = $('drawer-poems-pane');
    var chestPane = $('drawer-chest-pane');
    state.drawerTab = tab === 'chest' ? 'chest' : 'poems';
    if (poemsTab) {
      if (state.drawerTab === 'poems') poemsTab.classList.add('is-on');
      else poemsTab.classList.remove('is-on');
      poemsTab.setAttribute('aria-selected', state.drawerTab === 'poems' ? 'true' : 'false');
    }
    if (chestTab) {
      if (state.drawerTab === 'chest') chestTab.classList.add('is-on');
      else chestTab.classList.remove('is-on');
      chestTab.setAttribute('aria-selected', state.drawerTab === 'chest' ? 'true' : 'false');
    }
    if (poemsPane) poemsPane.hidden = state.drawerTab !== 'poems';
    if (chestPane) chestPane.hidden = state.drawerTab !== 'chest';
    if (state.drawerTab === 'chest') renderChestList();
  }

  function openDrawer(tabName) {
    var drawer = $('poem-drawer');
    var listEl;
    var activeItem;
    var currentPoet;
    if (!drawer) return;
    window.clearTimeout(state.drawerTimer);
    renderDrawerPoems();
    setDrawerTab(tabName || 'poems');
    if (state.drawerOpen) return;
    state.drawerOpen = true;
    listEl = $('drawer-list');
    currentPoet = (state.poem && state.poem.poet) || (poetList()[0] || '');
    state.drawerScrollLockUntil = Date.now() + 200;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    syncDrawerPoetTab(currentPoet, false);
    activeItem = listEl && listEl.querySelector('.poem-item.is-on');
    if (listEl && activeItem) {
      listEl.scrollTop = Math.max(0, activeItem.offsetTop - 52);
    }
    if (state.reduce) {
      drawer.classList.add('is-visible');
      return;
    }
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (state.drawerOpen) drawer.classList.add('is-visible');
      });
    });
  }

  function closeDrawer() {
    var drawer = $('poem-drawer');
    if (!drawer || !state.drawerOpen) return;
    state.drawerOpen = false;
    drawer.classList.remove('is-visible');
    drawer.setAttribute('aria-hidden', 'true');
    if (state.reduce) {
      drawer.classList.remove('is-open');
      return;
    }
    window.clearTimeout(state.drawerTimer);
    state.drawerTimer = window.setTimeout(function () {
      if (!state.drawerOpen) drawer.classList.remove('is-open');
    }, 420);
  }

  function findPoetAnchor(listEl, poet) {
    var anchors = listEl ? listEl.querySelectorAll('[data-poet-anchor]') : [];
    var i;
    for (i = 0; i < anchors.length; i++) {
      if (anchors[i].getAttribute('data-poet-anchor') === poet) return anchors[i];
    }
    return null;
  }

  function onDrawerPoet(event) {
    var hit = idFrom(event, 'data-poet');
    var listEl = $('drawer-list');
    var anchor;
    var targetTop;
    if (!hit || !listEl) return;
    syncDrawerPoetTab(hit.value, true);
    anchor = findPoetAnchor(listEl, hit.value);
    if (!anchor) return;
    targetTop = Math.max(0, anchor.offsetTop);
    state.drawerScrollLockUntil = Date.now() + 450;
    if (!state.reduce && typeof listEl.scrollTo === 'function') {
      try {
        listEl.scrollTo({ top: targetTop, behavior: 'smooth' });
      } catch (err) {
        listEl.scrollTop = targetTop;
      }
    } else {
      listEl.scrollTop = targetTop;
    }
  }

  function syncDrawerByScroll() {
    var listEl = $('drawer-list');
    var anchors;
    var activePoet = '';
    var i;
    var top;
    if (!listEl || !state.drawerOpen || state.drawerTab !== 'poems') return;
    if (Date.now() < state.drawerScrollLockUntil) return;
    anchors = listEl.querySelectorAll('[data-poet-anchor]');
    if (!anchors.length) return;
    if (listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 4) {
      activePoet = anchors[anchors.length - 1].getAttribute('data-poet-anchor') || '';
    } else {
      top = listEl.scrollTop + 28;
      activePoet = anchors[0].getAttribute('data-poet-anchor') || '';
      for (i = 0; i < anchors.length; i++) {
        if (anchors[i].offsetTop <= top) {
          activePoet = anchors[i].getAttribute('data-poet-anchor') || activePoet;
        } else {
          break;
        }
      }
    }
    if (activePoet && activePoet !== state.drawerPoet) {
      syncDrawerPoetTab(activePoet, true);
    }
  }

  function onDrawerScroll() {
    if (!state.drawerOpen || state.drawerTab !== 'poems') return;
    if (state.drawerScrollRaf) return;
    if (!window.requestAnimationFrame) {
      syncDrawerByScroll();
      return;
    }
    state.drawerScrollRaf = window.requestAnimationFrame(function () {
      state.drawerScrollRaf = 0;
      syncDrawerByScroll();
    });
  }

  function onDrawerPick(event) {
    var hit = idFrom(event, 'data-poem-id');
    var found;
    if (!hit) return;
    found = findPoem(hit.value);
    if (!found) return;
    state.introDate = todayKey();
    setIntroMode(false, false);
    if (state.exportMode) setExportMode(false);
    applyPoemPalette(found, '已换「' + found.tune + '」套色');
    closeDrawer();
  }

  function saveToChest() {
    var poemId = state.poem ? state.poem.id : '';
    var sig = outfitSignature(poemId, state.picks);
    var entry;
    var i;
    for (i = 0; i < state.chest.length; i++) {
      if (outfitSignature(state.chest[i].poemId, state.chest[i].picks) === sig) {
        toast('衣箱里已有这套搭配');
        return false;
      }
    }
    if (state.chest.length >= CHEST_MAX) {
      toast('衣箱已满 ' + CHEST_MAX + ' 套，请先删 1 套再收存');
      return false;
    }
    entry = {
      id: 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      name: computeLookName(state.picks),
      poemId: poemId,
      picks: clonePicks(state.picks),
      savedAt: Date.now()
    };
    state.chest.unshift(entry);
    saveChest();
    syncChestMeta();
    if (state.drawerOpen && state.drawerTab === 'chest') renderChestList();
    Platform.vibrateLight();
    toast('已收进衣箱【' + entry.name + '】（' + state.chest.length + '/' + CHEST_MAX + '）');
    return entry;
  }

  function findChestEntry(id) {
    var i;
    for (i = 0; i < state.chest.length; i++) {
      if (state.chest[i].id === id) return state.chest[i];
    }
    return null;
  }

  function onChestListClick(event) {
    var checkHit = idFrom(event, 'data-chest-check');
    var delHit = idFrom(event, 'data-chest-del');
    var wearHit = idFrom(event, 'data-chest-wear');
    var idx;
    var id;
    var entry;
    var poem;
    if (checkHit) {
      id = checkHit.value;
      idx = state.chestSelected.indexOf(id);
      if (idx !== -1) {
        state.chestSelected.splice(idx, 1);
      } else {
        if (state.chestSelected.length >= 2) state.chestSelected.shift();
        state.chestSelected.push(id);
      }
      syncChestSelection();
      Platform.vibrateLight();
      return;
    }
    if (delHit) {
      id = delHit.value;
      state.chest = state.chest.filter(function (c) { return c.id !== id; });
      state.chestSelected = state.chestSelected.filter(function (sid) { return sid !== id; });
      saveChest();
      renderChestList();
      Platform.vibrateLight();
      toast('已从衣箱移除');
      return;
    }
    if (wearHit) {
      entry = findChestEntry(wearHit.value);
      if (!entry) return;
      pushHistory();
      poem = findPoem(entry.poemId);
      if (poem) state.poem = poem;
      state.picks = clonePicks(entry.picks);
      state.fromSnapshot = false;
      state.introDate = todayKey();
      setIntroMode(false, false);
      if (state.exportMode) setExportMode(false);
      applyColors(true);
      playPoemEnter();
      closeDrawer();
      Platform.vibrateLight();
      toast('已换回衣箱搭配【' + entry.name + '】');
    }
  }

  function metaOf(poem, picksObj) {
    return {
      lookName: computeLookName(picksObj),
      line: poem ? poem.line : '',
      source: poem ? (poem.poet + '·' + poem.tune) : '',
      colors: summary(picksObj),
      items: colorItems(picksObj),
      disclaimer: '意象取色，非文物实测 · 插画着色，非文物复原'
    };
  }

  function meta() {
    return metaOf(state.poem, state.picks);
  }

  function openDiptych(idA, idB) {
    var entryA;
    var entryB;
    var poemA;
    var poemB;
    var srcA;
    var srcB;
    var canvas;
    var overlay = $('diptych-overlay');
    var envNote = $('diptych-env-note');
    var ids = (idA && idB) ? [idA, idB] : state.chestSelected;
    if (!ids || ids.length !== 2) {
      toast('请在衣箱勾选 2 套搭配');
      return;
    }
    entryA = findChestEntry(ids[0]);
    entryB = findChestEntry(ids[1]);
    if (!entryA || !entryB) return;
    poemA = findPoem(entryA.poemId) || state.poem;
    poemB = findPoem(entryB.poemId) || state.poem;
    srcA = Paint.renderOffscreen(colorMap(entryA.picks));
    srcB = Paint.renderOffscreen(colorMap(entryB.picks));
    try {
      canvas = Poster.renderDiptych(srcA, metaOf(poemA, entryA.picks), srcB, metaOf(poemB, entryB.picks));
    } catch (err) {
      toast('双联画卷没有生成');
      return;
    }
    state.diptychCanvas = canvas;
    state.diptychPair = { a: entryA, b: entryB, poemA: poemA, poemB: poemB };
    state.diptychOpen = true;
    $('diptych-img').src = canvas.toDataURL('image/png');
    if (envNote) {
      if (Platform.inContainer()) {
        envNote.hidden = true;
        envNote.textContent = '';
      } else {
        envNote.hidden = false;
        envNote.textContent = '浏览器预览仅下载本地文件，不会写入相册。';
      }
    }
    closeDrawer();
    if (overlay) {
      overlay.classList.add('is-on');
      overlay.setAttribute('aria-hidden', 'false');
    }
    Platform.vibrateLight();
  }

  function closeDiptych() {
    var overlay = $('diptych-overlay');
    state.diptychOpen = false;
    state.diptychCanvas = null;
    if (overlay) {
      overlay.classList.remove('is-on');
      overlay.setAttribute('aria-hidden', 'true');
    }
    $('toast').classList.remove('is-diptych');
  }

  function ensurePosterCanvas() {
    if (state.canvas) return state.canvas;
    if (typeof Paint.flush === 'function') Paint.flush();
    try {
      state.canvas = Poster.render(Paint.canvas(), meta());
    } catch (err) {
      state.canvas = null;
      toast('画册没有生成');
    }
    return state.canvas;
  }

  function setExportMode(on) {
    var app = $('app');
    var topEdit = $('top-edit');
    var topExport = $('top-export');
    var dockEdit = $('dock-edit');
    var dockExport = $('dock-export');
    var titleEl = $('export-look-title');
    var envNote = $('env-note');
    var toastEl = $('toast');
    state.exportMode = !!on;
    if (titleEl && state.exportMode) {
      titleEl.textContent = '宋式衣橱 · ' + computeLookName(state.picks);
    }
    if (app) {
      if (state.exportMode) {
        app.classList.remove('is-intro');
        state.introMode = false;
        app.classList.add('is-export');
      } else {
        app.classList.remove('is-export');
      }
    }
    if (topEdit) topEdit.setAttribute('aria-hidden', state.exportMode ? 'true' : 'false');
    if (topExport) topExport.setAttribute('aria-hidden', state.exportMode ? 'false' : 'true');
    if (dockEdit) dockEdit.setAttribute('aria-hidden', state.exportMode ? 'true' : 'false');
    if (dockExport) dockExport.setAttribute('aria-hidden', state.exportMode ? 'false' : 'true');
    if (state.exportMode && envNote) {
      if (Platform.inContainer()) {
        envNote.hidden = true;
        envNote.textContent = '';
      } else {
        envNote.hidden = false;
        envNote.textContent = '浏览器预览仅下载本地文件，不会写入相册。';
      }
    }
    syncChestMeta();
    if (toastEl) {
      if (state.exportMode && toastEl.classList.contains('is-on')) {
        toastEl.classList.add('is-result');
      } else if (!state.exportMode) {
        toastEl.classList.remove('is-result');
      }
    }
  }

  function onPoster() {
    if (state.exportMode) return;
    if (state.introMode) setIntroMode(false, false);
    closeDrawer();
    setOriginalPreview(false, false);
    if (typeof Paint.flush === 'function') Paint.flush();
    state.canvas = null;
    window.clearTimeout(state.posterWarmTimer);
    setExportMode(true);
    Platform.vibrateLight();
    state.posterWarmTimer = window.setTimeout(function () {
      state.posterWarmTimer = 0;
      if (state.exportMode && !state.canvas) ensurePosterCanvas();
    }, state.reduce ? 0 : 380);
  }

  function onBack() {
    if (!state.exportMode) return;
    window.clearTimeout(state.posterWarmTimer);
    state.posterWarmTimer = 0;
    state.canvas = null;
    setExportMode(false);
    Platform.vibrateLight();
  }

  function canvasToUrl(canvasObj) {
    return canvasObj ? canvasObj.toDataURL('image/png') : '';
  }

  function downloadUrl(url, filename) {
    var a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename || 'song-wardrobe.png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast('已开始下载，这是浏览器文件，没有写入相册');
  }

  async function saveTargetCanvas(canvasObj, filename) {
    var url;
    var res;
    if (!canvasObj || state.exportBusy) return;
    url = canvasToUrl(canvasObj);
    if (!Platform.inContainer()) {
      downloadUrl(url, filename);
      return;
    }
    state.exportBusy = true;
    try {
      res = await Platform.saveImage(url);
      if (res.ok) toast('已保存到相册');
      else if (res.reason === 'unavailable') toast('当前容器暂不支持保存到相册');
      else toast('没有保存到相册');
    } finally {
      state.exportBusy = false;
    }
  }

  async function postNoteTarget(canvasObj, title, content) {
    var res;
    if (!canvasObj || state.exportBusy) return;
    if (!Platform.inContainer()) {
      toast('浏览器预览无法打开发布页');
      return;
    }
    state.exportBusy = true;
    try {
      res = await Platform.postNote({
        dataUrl: canvasToUrl(canvasObj),
        title: title,
        content: content
      });
      if (res.ok) toast('已打开发布页');
      else toast('没有打开发布页');
    } finally {
      state.exportBusy = false;
    }
  }

  async function postCommentTarget(canvasObj, content, snapshot) {
    var res;
    var album = '';
    if (!canvasObj || state.exportBusy) return;
    if (!Platform.inContainer()) {
      toast('浏览器预览无法打开评论区');
      return;
    }
    state.exportBusy = true;
    try {
      res = await Platform.postComment({
        dataUrl: canvasToUrl(canvasObj),
        content: content,
        snapshot: snapshot
      });
      if (res.reason === 'no-handle') {
        toast('未拿到容器里的本地图片句柄，无法调用评论');
        return;
      }
      if (!res.ok) {
        toast('评论区没有打开');
        return;
      }
      if (res.raw && res.raw.savedToAlbum === false) album = '（相册未同时保存）';
      toast('已打开评论区' + album);
    } finally {
      state.exportBusy = false;
    }
  }

  async function shareTarget(canvasObj) {
    var res;
    if (!canvasObj || state.exportBusy) return;
    if (!Platform.inContainer()) {
      toast('浏览器预览无法拉起分享');
      return;
    }
    state.exportBusy = true;
    try {
      res = await Platform.shareImage(canvasToUrl(canvasObj));
      if (res.ok) {
        toast('已拉起分享（全屏每日限 10 次）');
        return;
      }
      if (res.code === 15502) {
        toast('需全屏容器，或上次分享尚未结束');
        return;
      }
      if (res.code === 15503) {
        toast('今日分享已达上限（每日最多 10 次）');
        return;
      }
      toast('没有拉起分享');
    } finally {
      state.exportBusy = false;
    }
  }

  function onSave() {
    var c = ensurePosterCanvas();
    if (c) saveTargetCanvas(c, 'song-wardrobe.png');
  }

  function onNote() {
    var c = ensurePosterCanvas();
    var m;
    if (!c) return;
    m = meta();
    postNoteTarget(
      c,
      '宋式衣橱｜' + m.lookName,
      '「' + m.line + '」——' + m.source + '\n今日为宋朝姑娘配了一身【' + m.lookName + '】（' + m.colors + '）\n这套配色你打几分？点下方小工具也能给宋朝姑娘试新衣～\n#宋式美学 #宋朝姑娘 #宋式衣橱'
    );
  }

  function onComment() {
    var c = ensurePosterCanvas();
    var m;
    if (!c) return;
    m = meta();
    postCommentTarget(
      c,
      '「' + m.line + '」给宋朝姑娘配了一身【' + m.lookName + '】，点卡片来试同款，或改个色接龙～',
      { v: 2, poemId: state.poem ? state.poem.id : '', picks: state.picks, lookName: m.lookName }
    );
  }

  function onShare() {
    var c = ensurePosterCanvas();
    if (c) shareTarget(c);
  }

  function onDiptychSave() {
    if (state.diptychCanvas) saveTargetCanvas(state.diptychCanvas, 'song-wardrobe-diptych.png');
  }

  function onDiptychNote() {
    var pair = state.diptychPair;
    var nameA;
    var nameB;
    var srcA;
    var srcB;
    if (!state.diptychCanvas || !pair) return;
    nameA = pair.a.name || '宣纸素本';
    nameB = pair.b.name || '宣纸素本';
    srcA = pair.poemA ? (pair.poemA.poet + '·' + pair.poemA.tune) : '';
    srcB = pair.poemB ? (pair.poemB.poet + '·' + pair.poemB.tune) : '';
    postNoteTarget(
      state.diptychCanvas,
      '宋式衣橱｜左' + nameA + '右' + nameB,
      '左【' + nameA + '】还是右【' + nameB + '】？\n左：' + (pair.poemA ? pair.poemA.line : '') + (srcA ? '（' + srcA + '）' : '') +
        '\n右：' + (pair.poemB ? pair.poemB.line : '') + (srcB ? '（' + srcB + '）' : '') +
        '\n姐妹们帮宋朝姑娘选一套，评论区投票～\n#宋式美学 #宋朝姑娘 #宋式衣橱'
    );
  }

  function onDiptychComment() {
    var pair = state.diptychPair;
    var nameA;
    var nameB;
    if (!state.diptychCanvas || !pair) return;
    nameA = pair.a.name || '宣纸素本';
    nameB = pair.b.name || '宣纸素本';
    postCommentTarget(
      state.diptychCanvas,
      '左【' + nameA + '】还是右【' + nameB + '】？姐妹们帮宋朝姑娘选一套～',
      { v: 2, poemId: pair.a.poemId || '', picks: pair.a.picks, lookName: nameA }
    );
  }

  function onDiptychShare() {
    if (state.diptychCanvas) shareTarget(state.diptychCanvas);
  }

  function fit() {
    var stage = $('stage');
    var wrap = $('canvas-wrap');
    var sw = stage.clientWidth;
    var sh = stage.clientHeight;
    var padW = Math.max(0, sw - 24);
    var padH = Math.max(0, sh - 20);
    var scale;
    if (!padW || !padH || !wrap) return;
    scale = Math.min(padW / 720, padH / 1280);
    wrap.style.width = Math.round(720 * scale) + 'px';
    wrap.style.height = Math.round(1280 * scale) + 'px';
  }

  function bind() {
    $('parts').addEventListener('click', onPart);
    $('colors').addEventListener('click', onColor);
    $('btn-clear-part').addEventListener('click', onClearPart);
    $('btn-apply-set').addEventListener('click', onApplySet);
    $('btn-undo').addEventListener('click', onUndo);
    $('btn-reset').addEventListener('click', onReset);
    $('btn-mood').addEventListener('click', onOpenMood);
    $('btn-intro-skip').addEventListener('click', onIntroSkip);
    $('btn-intro-random').addEventListener('click', onIntroRandom);
    $('mood-grid').addEventListener('click', onMoodGridClick);
    $('btn-shuffle').addEventListener('click', onShuffle);
    $('btn-poster').addEventListener('click', onPoster);
    $('btn-back').addEventListener('click', onBack);
    $('btn-home-chest-save').addEventListener('click', function () { saveToChest(); });
    $('btn-chest-save').addEventListener('click', function () { saveToChest(); });
    $('btn-open-chest').addEventListener('click', function () { openDrawer('chest'); });
    $('btn-chest-add-inline').addEventListener('click', function () { saveToChest(); });
    $('btn-save').addEventListener('click', onSave);
    $('btn-note').addEventListener('click', onNote);
    $('btn-comment').addEventListener('click', onComment);
    $('btn-share').addEventListener('click', onShare);
    $('canvas-wrap').addEventListener('click', onCanvasClick);
    $('btn-drawer').addEventListener('click', function () { openDrawer('poems'); });
    $('btn-chest').addEventListener('click', function () { openDrawer('chest'); });
    $('tab-poems').addEventListener('click', function () { setDrawerTab('poems'); });
    $('tab-chest').addEventListener('click', function () { setDrawerTab('chest'); });
    $('btn-drawer-close').addEventListener('click', closeDrawer);
    $('drawer-backdrop').addEventListener('click', closeDrawer);
    $('drawer-poets').addEventListener('click', onDrawerPoet);
    $('drawer-list').addEventListener('click', onDrawerPick);
    $('drawer-list').addEventListener('scroll', onDrawerScroll);
    $('chest-list').addEventListener('click', onChestListClick);
    $('btn-diptych').addEventListener('click', function () { openDiptych(); });
    $('btn-diptych-back').addEventListener('click', function () {
      closeDiptych();
      openDrawer('chest');
      Platform.vibrateLight();
    });
    $('btn-diptych-save').addEventListener('click', onDiptychSave);
    $('btn-diptych-note').addEventListener('click', onDiptychNote);
    $('btn-diptych-comment').addEventListener('click', onDiptychComment);
    $('btn-diptych-share').addEventListener('click', onDiptychShare);
    $('btn-original').addEventListener('click', onToggleOriginal);

    if (typeof Platform.onInsetsChange === 'function') {
      Platform.onInsetsChange(function () {
        fit();
        updatePartIndicator();
      });
    }

    window.addEventListener('resize', function () {
      Platform.syncFrame();
      fit();
      updatePartIndicator();
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', function () {
        Platform.syncFrame();
        fit();
        updatePartIndicator();
      });
    }
  }

  function parseSnapshot(raw) {
    var parsed;
    if (!raw || typeof raw !== 'string') return null;
    try { parsed = JSON.parse(raw); } catch (err) { return null; }
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  }

  function sanitizeChest(raw) {
    var out = [];
    var i;
    var item;
    var picks;
    if (!Array.isArray(raw)) return out;
    for (i = 0; i < raw.length && out.length < CHEST_MAX; i++) {
      item = raw[i];
      if (!item || typeof item !== 'object') continue;
      picks = sanitizePicks(item.picks);
      out.push({
        id: typeof item.id === 'string' && item.id ? item.id.slice(0, 32) : ('c-' + i),
        name: typeof item.name === 'string' && item.name ? item.name.slice(0, 8) : computeLookName(picks),
        poemId: typeof item.poemId === 'string' ? item.poemId : '',
        picks: picks,
        savedAt: typeof item.savedAt === 'number' ? item.savedAt : Date.now()
      });
    }
    return out;
  }

  async function restore() {
    var snapshotRaw = null;
    var snapshot = null;
    var stored = null;
    var chestStored = null;
    var poem = null;
    var source = null;

    try { snapshotRaw = await Platform.readSnapshot(); } catch (err0) { snapshotRaw = null; }
    snapshot = parseSnapshot(snapshotRaw);

    if (snapshot) {
      source = snapshot;
      if (snapshot.poemId && findPoem(snapshot.poemId) && snapshot.picks && typeof snapshot.picks === 'object') {
        state.fromSnapshot = true;
      }
    }

    try { stored = await Platform.getData(STORAGE_KEY); } catch (err1) { stored = null; }
    if (!source && stored && typeof stored === 'object') source = stored;
    if (stored && typeof stored.introDate === 'string') {
      state.introDate = stored.introDate;
    }

    try { chestStored = await Platform.getData(CHEST_KEY); } catch (err2) { chestStored = null; }
    state.chest = sanitizeChest(chestStored);

    if (source && source.poemId) poem = findPoem(source.poemId);
    if (!poem) drawPoem();
    else state.poem = poem;

    if (source && source.picks) {
      state.picks = sanitizePicks(source.picks);
    }
  }

  function syncReduceMotion(media) {
    state.reduce = !!(media && media.matches);
    if (state.reduce) document.documentElement.classList.add('reduce-motion');
    else document.documentElement.classList.remove('reduce-motion');
  }

  function boot() {
    var media = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    var shouldShowIntro;
    syncReduceMotion(media);
    if (media) {
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', function () { syncReduceMotion(media); });
      } else if (typeof media.addListener === 'function') {
        media.addListener(function () { syncReduceMotion(media); });
      }
    }
    if (!Platform.inContainer()) {
      $('btn-save').textContent = '下载画册';
      if ($('btn-diptych-save')) $('btn-diptych-save').textContent = '下载画册';
    }
    renderMoodGrid();
    bind();
    Platform.syncFrame();
    Platform.applyWindow();

    var ready = Paint.ready.then(function () {
      return restore();
    }).then(function () {
      $('loading').hidden = true;
      $('canvas-wrap').hidden = false;
      $('app').classList.add('is-ready');
      shouldShowIntro = !state.fromSnapshot && state.introDate !== todayKey();
      setIntroMode(shouldShowIntro, false);
      Paint.setColors(colorMap(), false);
      paintControls();
      fit();
      if (state.fromSnapshot) {
        if ($('stage-hint')) {
          $('stage-hint').textContent = '正在试穿评论区同款 · 改一处即可接龙晒图';
          $('stage-hint').classList.remove('is-gone');
        }
        toast('已试穿 Ta 的【' + computeLookName(state.picks) + '】· 轻点衣物改色接龙');
      }
      return true;
    }).catch(function () {
      $('loading').textContent = '画卷没有展开。';
      return false;
    });

    window.SONG_WARDROBE = {
      ready: ready,
      isIntro: function () { return state.introMode; },
      lookName: function () { return computeLookName(state.picks); },
      chest: function () { return state.chest.slice(); },
      getColors: function () { return colorMap(); },
      setPart: function (id) {
        if (partName(id)) {
          state.part = id;
          paintControls();
        }
      },
      setHex: function (hex, name) {
        if (hex) {
          pushHistory();
          state.picks[state.part] = { hex: hex, name: name || hex };
        } else {
          if (state.picks[state.part]) pushHistory();
          state.picks[state.part] = null;
        }
        applyColors(false);
      },
      applyMood: function (id) { applyMood(id, false); },
      skipIntro: onIntroSkip,
      saveToChest: saveToChest,
      openDiptych: openDiptych,
      applyPoemSet: onApplySet,
      undo: onUndo,
      hitPart: function (x, y) { return Paint.hitTest(x, y); },
      openDrawer: openDrawer,
      closeDrawer: closeDrawer,
      poem: function () { return state.poem; },
      redraw: onShuffle,
      reset: onReset,
      sample: function (part) { return Paint.sample(part); },
      renderPoster: function () { return Poster.render(Paint.canvas(), meta()); }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
