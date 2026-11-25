(function () {
  var POEMS = window.WARDROBE_POEMS;
  var Platform = window.WardrobePlatform;
  var Paint = window.WardrobePaint;
  var Poster = window.WardrobePoster;

  var PARTS = [
    { id: 'beizi', name: '褙子' },
    { id: 'inner', name: '内衫' },
    { id: 'skirt', name: '裙' },
    { id: 'waist', name: '腰带' }
  ];

  var state = {
    poem: null,
    bag: [],
    part: 'beizi',
    picks: { beizi: null, inner: null, skirt: null, waist: null },
    canvas: null,
    toastTimer: 0,
    reduce: false
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

  function summary() {
    var bits = [];
    var i;
    var pick;
    for (i = 0; i < PARTS.length; i++) {
      pick = pickOf(PARTS[i].id);
      bits.push(PARTS[i].name + (pick ? pick.name : '原色'));
    }
    return bits.join(' · ');
  }

  function colorMap() {
    return {
      beizi: pickOf('beizi') ? pickOf('beizi').hex : null,
      inner: pickOf('inner') ? pickOf('inner').hex : null,
      skirt: pickOf('skirt') ? pickOf('skirt').hex : null,
      waist: pickOf('waist') ? pickOf('waist').hex : null
    };
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

  function paintCopy() {
    var line = state.poem ? state.poem.line : '';
    var meta = state.poem ? (state.poem.poet + '《' + state.poem.tune + '》') : '';
    $('poem-line').textContent = line;
    $('poem-meta').textContent = meta + ' · ' + POEMS.disclaimer;
    $('dye-label').textContent = '给' + partName(state.part) + '用这组里的颜色';
  }

  function chip(label, id, on) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip' + (on ? ' is-on' : '');
    btn.setAttribute('data-id', id);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.textContent = label;
    return btn;
  }

  function paintControls() {
    var parts = $('parts');
    var colors = $('colors');
    var current = pickOf(state.part);
    var list;
    var i;
    var item;
    var swatch;
    var on;
    clear(parts);
    clear(colors);
    for (i = 0; i < PARTS.length; i++) {
      parts.appendChild(chip(PARTS[i].name, PARTS[i].id, PARTS[i].id === state.part));
    }
    list = state.poem ? state.poem.colors : [];
    for (i = 0; i < list.length; i++) {
      item = list[i];
      on = !!(current && item.hex.toLowerCase() === current.hex.toLowerCase());
      swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'swatch' + (on ? ' is-on' : '');
      swatch.setAttribute('data-hex', item.hex);
      swatch.setAttribute('aria-pressed', on ? 'true' : 'false');
      swatch.setAttribute('aria-label', item.name);
      swatch.style.background = item.hex;
      colors.appendChild(swatch);
    }
    paintCopy();
  }

  function applyColors(doPulse) {
    Paint.setColors(colorMap());
    paintControls();
    if (doPulse) pulse();
    Platform.setData('songWardrobe.mvp.v1', {
      poemId: state.poem ? state.poem.id : '',
      picks: state.picks
    });
  }

  function idFrom(event) {
    var node = event.target;
    while (node && node !== event.currentTarget) {
      if (node.getAttribute && node.getAttribute('data-id')) return node.getAttribute('data-id');
      node = node.parentNode;
    }
    return '';
  }

  function onPart(event) {
    var id = idFrom(event);
    if (!id || id === state.part) return;
    state.part = id;
    paintControls();
  }

  function onColor(event) {
    var node = event.target;
    var hex = '';
    while (node && node !== event.currentTarget) {
      if (node.getAttribute && node.getAttribute('data-hex')) {
        hex = node.getAttribute('data-hex');
        break;
      }
      node = node.parentNode;
    }
    if (!hex) return;
    if (pickOf(state.part) && pickOf(state.part).hex.toLowerCase() === hex.toLowerCase()) return;
    state.picks[state.part] = { hex: hex, name: (node.getAttribute('aria-label') || '选色') };
    applyColors(true);
  }

  function onShuffle() {
    drawPoem();
    paintControls();
    toast('换了一句。衣服还是你现在这套，选色才会改。');
    Platform.setData('songWardrobe.mvp.v1', {
      poemId: state.poem.id,
      picks: state.picks
    });
  }

  function onReset() {
    state.picks = { beizi: null, inner: null, skirt: null, waist: null };
    state.part = 'beizi';
    applyColors(true);
    toast('已经回到画上原来的颜色。');
  }

  function meta() {
    return {
      line: state.poem ? state.poem.line : '',
      source: state.poem ? (state.poem.poet + '《' + state.poem.tune + '》') : '',
      colors: summary(),
      disclaimer: '意象取色，非文物实测。这一身是一幅插画，不是文物复原。'
    };
  }

  function noteText() {
    if (Platform.inContainer()) {
      return '点击后才会调用。分享只在全屏里可用，每天最多 10 次；拉起成功不等于对方已经收到。';
    }
    return '现在是浏览器预览。下载只发生在这台浏览器里，不会写入相册，也不会发出笔记。';
  }

  function onPoster() {
    var painted;
    try {
      painted = Poster.render(Paint.canvas(), meta());
    } catch (err) {
      toast('竖图没有生成。');
      return;
    }
    state.canvas = painted;
    $('result-img').src = painted.toDataURL('image/png');
    $('result-img').alt = (state.poem ? state.poem.line : '搭配') + '。' + summary();
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

  function downloadInBrowser() {
    var url = dataUrl();
    var a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'song-wardrobe.png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast('已开始下载。这只是浏览器里的文件，没有写入相册。');
  }

  async function onSave() {
    var res;
    if (!state.canvas) return;
    if (!Platform.inContainer()) {
      downloadInBrowser();
      return;
    }
    res = await Platform.saveImage(dataUrl());
    if (res.ok) toast('已保存到相册。');
    else if (res.reason === 'unavailable') downloadInBrowser();
    else toast('没有保存到相册。');
  }

  async function onNote() {
    var text;
    var res;
    if (!state.canvas) return;
    if (!Platform.inContainer()) {
      toast('当前是浏览器预览，没有打开发布页。');
      return;
    }
    text = meta();
    res = await Platform.postNote({
      dataUrl: dataUrl(),
      title: '宋式衣橱',
      content: text.line + '\n' + text.source + '\n' + text.colors + '\n' + text.disclaimer
    });
    if (res.ok) toast('已打开发布页。笔记要你在下一页确认后才会发出。');
    else toast('没有打开发布页。');
  }

  async function onComment() {
    var res;
    var album = '';
    if (!state.canvas) return;
    if (!Platform.inContainer()) {
      toast('当前是浏览器预览，没有打开评论区。');
      return;
    }
    res = await Platform.postComment({
      dataUrl: dataUrl(),
      content: (state.poem ? state.poem.line : '') + ' ' + summary(),
      snapshot: { v: 2, poemId: state.poem ? state.poem.id : '', colors: state.colors }
    });
    if (res.reason === 'no-handle') {
      toast('没有拿到容器里的本地图片句柄，所以没有调用评论。');
      return;
    }
    if (!res.ok) {
      toast('评论区没有打开。');
      return;
    }
    if (res.raw && res.raw.savedToAlbum === false) album = '相册没有一起保存。';
    toast('已打开评论区。是否发出由你决定。' + album);
  }

  async function onShare() {
    var res;
    if (!state.canvas) return;
    if (!Platform.inContainer()) {
      toast('当前是浏览器预览，没有拉起分享，也不会假装已经分享。');
      return;
    }
    res = await Platform.shareImage(dataUrl());
    if (res.ok) {
      toast('已拉起分享。这只表示你触发了分享，不代表对方已经收到。全屏每天最多 10 次。');
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

  function fit() {
    var stage = $('stage');
    var canvas = $('figure');
    var sw = stage.clientWidth;
    var sh = stage.clientHeight;
    var scale;
    if (!sw || !sh) return;
    scale = Math.min(sw / 720, sh / 1280);
    canvas.style.width = Math.round(720 * scale) + 'px';
    canvas.style.height = Math.round(1280 * scale) + 'px';
  }

  function bind() {
    $('parts').addEventListener('click', onPart);
    $('colors').addEventListener('click', onColor);
    $('btn-reset').addEventListener('click', onReset);
    $('btn-shuffle').addEventListener('click', onShuffle);
    $('btn-poster').addEventListener('click', onPoster);
    $('btn-back').addEventListener('click', onBack);
    $('btn-save').addEventListener('click', function () { onSave(); });
    $('btn-note').addEventListener('click', function () { onNote(); });
    $('btn-comment').addEventListener('click', function () { onComment(); });
    $('btn-share').addEventListener('click', function () { onShare(); });
    window.addEventListener('resize', fit);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', function () {
        Platform.syncFrame();
        fit();
      });
    }
  }

  async function restore() {
    var stored = null;
    var poem;
    try { stored = await Platform.getData('songWardrobe.mvp.v1'); } catch (err) { stored = null; }
    if (stored && stored.poemId) poem = findPoem(stored.poemId);
    if (!poem) drawPoem();
    else state.poem = poem;
    if (stored && stored.picks) {
      state.picks = {
        beizi: stored.picks.beizi || null,
        inner: stored.picks.inner || null,
        skirt: stored.picks.skirt || null,
        waist: stored.picks.waist || null
      };
    }
  }

  function boot() {
    var media = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    state.reduce = !!(media && media.matches);
    if (state.reduce) document.documentElement.className += ' reduce-motion';
    if (!Platform.inContainer()) $('btn-save').textContent = '下载这张图';
    bind();
    Platform.syncFrame();
    Platform.applyWindow();
    var ready = Paint.ready.then(function () {
      return restore();
    }).then(function () {
      $('loading').hidden = true;
      $('figure').hidden = false;
      applyColors(false);
      fit();
      return true;
    }).catch(function () {
      $('loading').textContent = '画卷没有展开。';
      return false;
    });
    window.SONG_WARDROBE = {
      ready: ready,
      getColors: function () { return colorMap(); },
      setPart: function (id) { state.part = id; paintControls(); },
      setHex: function (hex, name) {
        state.picks[state.part] = hex ? { hex: hex, name: name || hex } : null;
        applyColors(false);
      },
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
