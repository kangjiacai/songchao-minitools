(function () {
  var CAT = window.WARDROBE_CATALOG;
  var Platform = window.WardrobePlatform;
  var Figure = window.WardrobeFigure;
  var Poster = window.WardrobePoster;

  var state = {
    look: CAT.sanitize(CAT.defaultLook),
    cat: 'shirt',
    svg: null,
    canvas: null,
    toastTimer: 0,
    reduce: false
  };

  var CATS = [
    { id: 'shirt', name: '衫' },
    { id: 'beizi', name: '褙子' },
    { id: 'skirt', name: '裙' },
    { id: 'head', name: '头面' },
    { id: 'winter', name: '冬衣' }
  ];

  var DYE_LABEL = {
    shirt: '衫的颜色',
    beizi: '褙子的颜色',
    skirt: '裙的颜色',
    head: '头面的颜色',
    winter: '棉披的颜色'
  };

  function $(id) { return document.getElementById(id); }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function toast(text) {
    var node = $('toast');
    window.clearTimeout(state.toastTimer);
    node.textContent = text;
    node.className = 'toast is-on';
    state.toastTimer = window.setTimeout(function () {
      node.className = 'toast';
    }, state.reduce ? 1600 : 2200);
  }

  function pulse() {
    var stage = $('stage');
    if (state.reduce) return;
    stage.classList.remove('is-pulse');
    void stage.offsetWidth;
    stage.classList.add('is-pulse');
  }

  function optionsFor(cat) {
    if (cat === 'shirt') return CAT.shirts;
    if (cat === 'beizi') return CAT.beizi;
    if (cat === 'skirt') return CAT.skirts;
    if (cat === 'head') return CAT.heads;
    return CAT.winters;
  }

  function selectedOption() {
    var look = state.look;
    if (state.cat === 'shirt') return look.shirt;
    if (state.cat === 'beizi') return look.beizi;
    if (state.cat === 'skirt') return look.skirt;
    if (state.cat === 'head') return look.head;
    return look.winter;
  }

  function selectedColor() {
    var look = state.look;
    if (state.cat === 'shirt') return look.shirtColor;
    if (state.cat === 'beizi') return look.beiziColor;
    if (state.cat === 'skirt') return look.skirtColor;
    if (state.cat === 'head') return look.headColor;
    return look.winterColor;
  }

  function setSelectedColor(id) {
    if (state.cat === 'shirt') state.look.shirtColor = id;
    else if (state.cat === 'beizi') state.look.beiziColor = id;
    else if (state.cat === 'skirt') state.look.skirtColor = id;
    else if (state.cat === 'head') state.look.headColor = id;
    else state.look.winterColor = id;
  }

  function makeChip(label, id, on) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip' + (on ? ' is-on' : '');
    btn.setAttribute('data-id', id);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.textContent = label;
    return btn;
  }

  function paintControls() {
    var scenes = $('scenes');
    var cats = $('cats');
    var opts = $('opts');
    var colors = $('colors');
    var list;
    var i;
    var item;
    var on;
    var swatch;
    clear(scenes);
    clear(cats);
    clear(opts);
    clear(colors);
    for (i = 0; i < CAT.scenes.length; i++) {
      item = CAT.scenes[i];
      scenes.appendChild(makeChip(item.name, item.id, item.id === state.look.scene));
    }
    for (i = 0; i < CATS.length; i++) {
      item = CATS[i];
      cats.appendChild(makeChip(item.name, item.id, item.id === state.cat));
    }
    list = optionsFor(state.cat);
    for (i = 0; i < list.length; i++) {
      item = list[i];
      opts.appendChild(makeChip(item.name, item.id, item.id === selectedOption()));
    }
    $('dye-label').textContent = DYE_LABEL[state.cat];
    for (i = 0; i < CAT.colors.length; i++) {
      item = CAT.colors[i];
      on = item.id === selectedColor();
      swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'swatch' + (on ? ' is-on' : '');
      swatch.setAttribute('data-id', item.id);
      swatch.setAttribute('aria-pressed', on ? 'true' : 'false');
      swatch.setAttribute('aria-label', item.name);
      swatch.style.background = item.hex;
      colors.appendChild(swatch);
    }
  }

  function paintCopy() {
    var desc = CAT.describe(state.look);
    $('look-name').textContent = desc.title;
    $('look-pieces').textContent = desc.caption;
  }

  function render(doPulse) {
    state.look = CAT.sanitize(state.look);
    Figure.update(state.svg, state.look);
    paintControls();
    paintCopy();
    if (doPulse) pulse();
    Platform.setData('songWardrobe.look.v1', state.look);
  }

  function chipId(event) {
    var node = event.target;
    while (node && node !== event.currentTarget) {
      if (node.getAttribute && node.getAttribute('data-id')) return node.getAttribute('data-id');
      node = node.parentNode;
    }
    return '';
  }

  function onScene(event) {
    var id = chipId(event);
    if (!id || id === state.look.scene) return;
    state.look.scene = id;
    if (id === 'winter' && state.look.winter !== 'on') {
      state.look.winter = 'on';
      toast('已加上棉披。不想穿可以在冬衣里去掉。');
    }
    render(true);
  }

  function onCat(event) {
    var id = chipId(event);
    if (!id || id === state.cat) return;
    state.cat = id;
    render(false);
  }

  function onOpt(event) {
    var id = chipId(event);
    if (!id || id === selectedOption()) return;
    if (state.cat === 'shirt') state.look.shirt = id;
    else if (state.cat === 'beizi') state.look.beizi = id;
    else if (state.cat === 'skirt') state.look.skirt = id;
    else if (state.cat === 'head') state.look.head = id;
    else state.look.winter = id;
    render(true);
  }

  function onColor(event) {
    var id = chipId(event);
    if (!id) return;
    if (state.cat === 'winter' && state.look.winter !== 'on') {
      toast('先加上棉披，再给它换色。');
      return;
    }
    if (state.cat === 'beizi' && state.look.beizi === 'none') {
      setSelectedColor(id);
      render(false);
      toast('颜色已记下。选一件褙子就会穿上。');
      return;
    }
    if (id === selectedColor()) return;
    setSelectedColor(id);
    render(true);
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)].id;
  }

  function sameLook(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function onShuffle() {
    var prev = JSON.stringify(state.look);
    var i;
    for (i = 0; i < 4; i++) {
      state.look = CAT.sanitize({
        scene: state.look.scene,
        shirt: pick(CAT.shirts),
        shirtColor: pick(CAT.colors),
        beizi: pick(CAT.beizi),
        beiziColor: pick(CAT.colors),
        skirt: pick(CAT.skirts),
        skirtColor: pick(CAT.colors),
        head: pick(CAT.heads),
        headColor: pick(CAT.colors),
        winter: state.look.scene === 'winter' ? 'on' : 'off',
        winterColor: pick(CAT.colors)
      });
      if (!sameLook(JSON.parse(prev), state.look)) break;
    }
    render(true);
  }

  function onReset() {
    state.look = CAT.sanitize(CAT.defaultLook);
    state.cat = 'shirt';
    render(true);
  }

  function noteText() {
    if (Platform.inContainer()) {
      return '点击后才会调用。分享只在全屏里可用，每天最多 10 次；拉起成功不等于对方已经收到。';
    }
    return '现在是浏览器预览。点下面的按钮不会写入相册、笔记或分享，也不会显示成已经成功。';
  }

  async function onPoster() {
    var meta = CAT.describe(state.look);
    var canvas;
    try {
      canvas = await Poster.render(state.svg, meta);
    } catch (err) {
      toast('竖图没有生成，没有保存。');
      return;
    }
    state.canvas = canvas;
    $('result-img').src = canvas.toDataURL('image/png');
    $('result-img').alt = meta.title + '。' + meta.caption;
    $('env-note').textContent = noteText();
    $('result').className = 'result is-on';
    $('result').setAttribute('aria-hidden', 'false');
  }

  function onBack() {
    $('result').className = 'result';
    $('result').setAttribute('aria-hidden', 'true');
  }

  function dataUrl() {
    return state.canvas ? state.canvas.toDataURL('image/png') : '';
  }

  function contentText(meta) {
    return meta.title + '\n' + meta.caption + '\n' + meta.note + '\n' + meta.disclaimer + '\n\n在宋式衣橱里自己搭配，不是测验。';
  }

  async function onSave() {
    var res;
    if (!state.canvas) return;
    res = await Platform.saveImage(dataUrl());
    if (res.ok) toast('已保存到相册。');
    else if (res.reason === 'unavailable') toast('当前是浏览器预览，没有写入相册，不能当成已保存。');
    else toast('没有保存到相册。');
  }

  async function onNote() {
    var meta;
    var res;
    if (!state.canvas) return;
    meta = CAT.describe(state.look);
    res = await Platform.postNote({
      dataUrl: dataUrl(),
      title: meta.title,
      content: contentText(meta)
    });
    if (res.ok) toast('已打开发布页。笔记要你在下一页确认后才会发出。');
    else if (res.reason === 'unavailable') toast('当前是浏览器预览，没有打开发布页。');
    else toast('没有打开发布页。');
  }

  async function onComment() {
    var meta;
    var res;
    var albumNote;
    if (!state.canvas) return;
    meta = CAT.describe(state.look);
    res = await Platform.postComment({
      dataUrl: dataUrl(),
      content: meta.title + '。' + meta.caption,
      snapshot: { v: 1, look: state.look }
    });
    if (res.reason === 'unavailable') {
      toast('当前是浏览器预览，没有打开评论区。');
      return;
    }
    if (res.reason === 'no-handle') {
      toast('没有拿到容器里的本地图片句柄，所以没有调用评论，也不会改用 data 地址凑数。');
      return;
    }
    if (!res.ok) {
      toast('评论区没有打开。');
      return;
    }
    albumNote = '';
    if (res.raw && res.raw.savedToAlbum === false) {
      albumNote = '相册没有一起保存。';
      if (res.raw.albumFailReason) albumNote += String(res.raw.albumFailReason);
    }
    toast('已打开评论区。是否发出由你决定。' + albumNote);
  }

  async function onShare() {
    var res;
    if (!state.canvas) return;
    res = await Platform.shareImage(dataUrl());
    if (res.ok) {
      toast('已拉起分享。这只表示你触发了分享，不代表对方已经收到。全屏每天最多 10 次。');
      return;
    }
    if (res.reason === 'unavailable') {
      toast('当前环境没有分享。需要小红书 9.53 及以上的全屏容器。浏览器预览不会假装已经分享。');
      return;
    }
    if (res.code === 15502) {
      toast('分享没有拉起。需要全屏容器，或上一次分享还没结束。');
      return;
    }
    if (res.code === 15503) {
      toast('今天的分享次数已到上限，每个小工具每天最多 10 次。');
      return;
    }
    toast('没有拉起分享。');
  }

  async function restore() {
    var stored = null;
    var snap = null;
    var parsed = null;
    try { stored = await Platform.getData('songWardrobe.look.v1'); } catch (err) { stored = null; }
    try { snap = await Platform.readSnapshot(); } catch (err2) { snap = null; }
    if (snap) {
      try { parsed = JSON.parse(snap); } catch (err3) { parsed = null; }
      if (parsed && parsed.look) return CAT.sanitize(parsed.look);
    }
    if (stored) return CAT.sanitize(stored);
    return CAT.sanitize(CAT.defaultLook);
  }

  function bind() {
    $('scenes').addEventListener('click', onScene);
    $('cats').addEventListener('click', onCat);
    $('opts').addEventListener('click', onOpt);
    $('colors').addEventListener('click', onColor);
    $('btn-reset').addEventListener('click', onReset);
    $('btn-shuffle').addEventListener('click', onShuffle);
    $('btn-poster').addEventListener('click', function () { onPoster(); });
    $('btn-back').addEventListener('click', onBack);
    $('btn-save').addEventListener('click', function () { onSave(); });
    $('btn-note').addEventListener('click', function () { onNote(); });
    $('btn-comment').addEventListener('click', function () { onComment(); });
    $('btn-share').addEventListener('click', function () { onShare(); });
    window.addEventListener('resize', function () { Platform.syncFrame(); });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', function () { Platform.syncFrame(); });
    }
  }

  function boot() {
    var media = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    state.reduce = !!(media && media.matches);
    if (state.reduce) document.documentElement.className += ' reduce-motion';
    state.svg = Figure.mount($('stage'));
    bind();
    render(false);
    Platform.syncFrame();
    Platform.applyWindow();
    var ready = restore().then(function (look) {
      state.look = look;
      render(false);
      return true;
    });
    window.SONG_WARDROBE = {
      ready: ready,
      getLook: function () { return CAT.sanitize(state.look); },
      setLook: function (look) {
        state.look = CAT.sanitize(look);
        render(false);
      },
      setCat: function (cat) { state.cat = cat; render(false); },
      renderPoster: function () { return Poster.render(state.svg, CAT.describe(state.look)); },
      describe: function () { return CAT.describe(state.look); },
      poster: Poster,
      reset: onReset,
      shuffle: onShuffle
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
