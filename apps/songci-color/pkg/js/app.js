(function () {
  var P = window.SCC_P;
  var DATA = window.SCC_DATA;
  var CI = (DATA && DATA.ci) || [];
  var COLORS = (DATA && DATA.colors) || [];
  var VIEWS = ['home', 'card', 'poets', 'colors'];

  var state = {
    view: 'home',
    current: null,
    bag: [],
    poet: '全部',
    query: '',
    followStatus: null,
    canFollow: false,
    canSave: false,
    canShare: false
  };

  var toastTimer = 0;
  var searchTimer = 0;
  var leaveTimer = 0;
  var sheetTimer = 0;
  var reduceMotion = false;
  var actionLock = false;
  var followPending = false;

  function $(id) { return document.getElementById(id); }

  function on(el, ev, fn) {
    if (el) el.addEventListener(ev, fn);
  }

  function readReduce() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  reduceMotion = readReduce();
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.addEventListener) {
      mq.addEventListener('change', function () { reduceMotion = readReduce(); });
    } else if (mq.addListener) {
      mq.addListener(function () { reduceMotion = readReduce(); });
    }
  }

  function motionMs(name) {
    if (reduceMotion) return 0;
    if (name === 'slow') return 420;
    if (name === 'fast') return 160;
    return 280;
  }

  function viewIndex(name) {
    var i;
    for (i = 0; i < VIEWS.length; i++) {
      if (VIEWS[i] === name) return i;
    }
    return 0;
  }

  function toast(msg) {
    var el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast on';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.className = 'toast';
    }, 1800);
  }

  function shuffleBag() {
    var ids = [];
    var i, j, t;
    for (i = 0; i < CI.length; i++) ids.push(i);
    for (i = ids.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = ids[i];
      ids[i] = ids[j];
      ids[j] = t;
    }
    if (state.current) {
      for (i = 0; i < ids.length; i++) {
        if (CI[ids[i]].id === state.current.id) {
          ids.splice(i, 1);
          break;
        }
      }
    }
    state.bag = ids;
  }

  function drawOne() {
    if (!state.bag.length) shuffleBag();
    var idx = state.bag.shift();
    return CI[idx];
  }

  function findCi(id) {
    var i;
    for (i = 0; i < CI.length; i++) {
      if (CI[i].id === id) return CI[i];
    }
    return null;
  }

  function uniquePoets() {
    var list = ['全部'];
    var seen = { '全部': 1 };
    var i, p;
    for (i = 0; i < CI.length; i++) {
      p = CI[i].poet;
      if (!seen[p]) {
        seen[p] = 1;
        list.push(p);
      }
    }
    return list;
  }

  function metaText(ci) {
    if (!ci) return '';
    return ci.poet + '《' + ci.tune + '》';
  }

  function contrastInk(hex) {
    if (window.SCC_CARD && window.SCC_CARD.contrastInk) {
      return window.SCC_CARD.contrastInk(hex);
    }
    return '#3A3732';
  }

  function isPale(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length !== 6) return false;
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    var dist = Math.abs(r - 247) + Math.abs(g - 242) + Math.abs(b - 234);
    return dist < 90;
  }

  function restartEnter(el, className) {
    if (!el) return;
    el.classList.remove(className);
    if (reduceMotion) return;
    void el.offsetWidth;
    el.classList.add(className);
  }

  function stagger(children, cap) {
    var i;
    var limit = typeof cap === 'number' ? cap : 12;
    var delay;
    for (i = 0; i < children.length; i++) {
      delay = (i < limit ? i * 28 : limit * 28) + 'ms';
      children[i].style.webkitAnimationDelay = delay;
      children[i].style.animationDelay = delay;
    }
  }

  function setView(name, opts) {
    var views = document.querySelectorAll('.view');
    var tabs = document.querySelectorAll('.tab');
    var from = state.view;
    var i;
    var forward = viewIndex(name) >= viewIndex(from);
    var enterView = null;

    if (leaveTimer) {
      clearTimeout(leaveTimer);
      leaveTimer = 0;
    }

    state.view = name;

    for (i = 0; i < views.length; i++) {
      var viewName = views[i].getAttribute('data-view');
      views[i].classList.remove('from-left', 'leave', 'to-left', 'to-right');
      if (viewName === name) {
        views[i].classList.add('on');
        if (!forward) views[i].classList.add('from-left');
        views[i].removeAttribute('hidden');
        views[i].setAttribute('aria-hidden', 'false');
        views[i].scrollTop = 0;
        enterView = views[i];
        if (!reduceMotion && from !== name) {
          void views[i].offsetWidth;
          views[i].classList.remove('from-left');
        }
      } else if (viewName === from && from !== name) {
        views[i].classList.add('leave');
        views[i].classList.add(forward ? 'to-left' : 'to-right');
        views[i].classList.remove('on');
        views[i].setAttribute('aria-hidden', 'true');
      } else {
        views[i].classList.remove('on');
        views[i].setAttribute('hidden', '');
        views[i].setAttribute('aria-hidden', 'true');
      }
    }

    if (from !== name) {
      var leaving = document.querySelector('.view.leave');
      leaveTimer = setTimeout(function () {
        var gone = document.querySelectorAll('.view.leave');
        var k;
        for (k = 0; k < gone.length; k++) {
          gone[k].classList.remove('leave', 'to-left', 'to-right');
          gone[k].setAttribute('hidden', '');
        }
        leaveTimer = 0;
      }, motionMs('base'));
    }

    for (i = 0; i < tabs.length; i++) {
      var tabName = tabs[i].getAttribute('data-tab');
      tabs[i].className = tabName === name ? 'tab on' : 'tab';
    }

    if (name === 'card') playCardEnter();
    if (name === 'poets' || name === 'colors') {
      if (opts && opts.stagger && enterView) {
        restartEnter(enterView, 'list-enter');
        stagger(
          enterView.querySelectorAll(name === 'poets' ? '.ci-item' : '.color-item'),
          12
        );
      }
    }
  }

  function playCardEnter() {
    restartEnter($('palette-card'), 'is-enter');
  }

  function showSwatch(color) {
    var field = $('hex-swatch');
    var name = $('hex-name');
    var value = $('hex-value');
    field.style.background = color.hex;
    name.textContent = color.name;
    value.textContent = color.hex;
    openSheet('hex-sheet');
    if (P && P.vibrate) P.vibrate('light');
  }

  function openSheet(id) {
    var el = $(id);
    if (!el) return;
    if (sheetTimer) {
      clearTimeout(sheetTimer);
      sheetTimer = 0;
    }
    el.removeAttribute('hidden');
    void el.offsetWidth;
    el.classList.add('on');
  }

  function hideSheet(id) {
    var el = $(id);
    if (!el) return;
    el.classList.remove('on');
    if (reduceMotion) {
      el.setAttribute('hidden', '');
      return;
    }
    if (sheetTimer) clearTimeout(sheetTimer);
    sheetTimer = setTimeout(function () {
      el.setAttribute('hidden', '');
      sheetTimer = 0;
    }, motionMs('slow'));
  }

  function splitLine(text) {
    var s = String(text || '');
    var i;
    var best = -1;
    var strong = '？！。；';
    for (i = 0; i < s.length - 1; i++) {
      if (strong.indexOf(s.charAt(i)) === -1) continue;
      if (i >= 4 && (s.length - i - 1) >= 4) {
        best = i;
        break;
      }
    }
    if (best >= 0) return [s.slice(0, best + 1), s.slice(best + 1)];
    var mid = s.length / 2;
    for (i = 0; i < s.length - 1; i++) {
      if (s.charAt(i) !== '，') continue;
      if (i < 4 || (s.length - i - 1) < 4) continue;
      if (best < 0 || Math.abs(i - mid) < Math.abs(best - mid)) best = i;
    }
    if (best >= 0) return [s.slice(0, best + 1), s.slice(best + 1)];
    return [s];
  }

  function fillLine(el, text) {
    if (!el) return;
    el.textContent = '';
    var parts = splitLine(text);
    var i;
    for (i = 0; i < parts.length; i++) {
      if (i) el.appendChild(document.createElement('br'));
      el.appendChild(document.createTextNode(parts[i]));
    }
  }

  function renderCard(ci, opts) {
    if (!ci) return;
    state.current = ci;
    $('card-meta').textContent = metaText(ci);
    fillLine($('card-line'), ci.line);
    var note = $('card-note');
    if (ci.note) {
      note.textContent = ci.note;
      note.removeAttribute('hidden');
    } else {
      note.textContent = '';
      note.setAttribute('hidden', '');
    }
    var box = $('card-swatches');
    box.innerHTML = '';
    var i;
    for (i = 0; i < ci.colors.length; i++) {
      (function (color) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'swatch' + (isPale(color.hex) ? ' is-pale' : '');
        btn.setAttribute('aria-label', color.name + ' ' + color.hex);
        var ink = contrastInk(color.hex);
        btn.style.color = ink;
        var chip = document.createElement('span');
        chip.className = 'swatch-chip';
        chip.style.background = color.hex;
        var nm = document.createElement('span');
        nm.className = 'swatch-name';
        nm.textContent = color.name;
        var hx = document.createElement('span');
        hx.className = 'swatch-hex';
        hx.textContent = color.hex;
        btn.appendChild(chip);
        btn.appendChild(nm);
        btn.appendChild(hx);
        on(btn, 'click', function () { showSwatch(color); });
        box.appendChild(btn);
      })(ci.colors[i]);
    }
    updateActionButtons();
    if (!opts || opts.animate !== false) playCardEnter();
  }

  function updateActionButtons() {
    var save = $('btn-save');
    var share = $('btn-share');
    var saveRow = $('actions-row-save');
    if (save) {
      if (state.canSave) save.removeAttribute('hidden');
      else save.setAttribute('hidden', '');
    }
    if (share) {
      if (state.canShare) share.removeAttribute('hidden');
      else share.setAttribute('hidden', '');
    }
    if (saveRow) {
      if (state.canSave || state.canShare) saveRow.removeAttribute('hidden');
      else saveRow.setAttribute('hidden', '');
    }
    syncFollowButtons();
  }

  function setActionBusy(busy) {
    var ids = ['btn-post', 'btn-comment', 'btn-save', 'btn-share', 'btn-redraw'];
    var i, el;
    for (i = 0; i < ids.length; i++) {
      el = $(ids[i]);
      if (el) el.disabled = !!busy;
    }
  }

  function hexList(ci, sep) {
    var parts = [];
    var colors = (ci && ci.colors) || [];
    var i;
    for (i = 0; i < colors.length; i++) {
      parts.push(colors[i].name + ' ' + colors[i].hex);
    }
    return parts.join(sep);
  }

  function noteDraft(ci) {
    var title = '我抽到的宋词配色';
    var content = '我抽到的宋词配色：「' + ci.line + '」——' + ci.poet + '《' + ci.tune + '》\n\n' +
      hexList(ci, '\n') + '\n\n意象取色，非文物实测\n#宋词配色 #宋朝配色';
    if (content.length > 1000) content = content.slice(0, 1000);
    return { title: title, content: content };
  }

  function commentDraft(ci) {
    return '我抽到了「' + ci.line + '」\n' + hexList(ci, ' · ');
  }

  async function withLock(fn) {
    if (actionLock) return;
    actionLock = true;
    setActionBusy(true);
    try {
      await fn();
    } finally {
      actionLock = false;
      setActionBusy(false);
    }
  }

  async function postNoteCard() {
    await withLock(async function () {
      if (!state.current || !window.SCC_CARD) return;
      var dataUrl = window.SCC_CARD.render(state.current);
      if (!dataUrl) {
        toast('生成色卡失败');
        return;
      }
      if (!P || typeof P.canPostNote !== 'function' || !(await P.canPostNote())) {
        toast('请在小红书 App 中发成笔记');
        return;
      }
      var draft = noteDraft(state.current);
      var res = await P.postNote({
        title: draft.title,
        content: draft.content,
        imageUrl: dataUrl
      });
      if (!(res && res.ok)) toast('暂时无法发成笔记');
    });
  }

  async function commentCard() {
    await withLock(async function () {
      if (!state.current) return;
      if (!P || typeof P.canPostComment !== 'function' || !(await P.canPostComment())) {
        toast('当前版本还不能晒到评论区');
        return;
      }
      var filePath = '';
      if (window.SCC_CARD) {
        var dataUrl = window.SCC_CARD.render(state.current);
        if (dataUrl && typeof P.writeTemp === 'function') {
          var written = await P.writeTemp(dataUrl);
          if (written && written.ok) filePath = written.filePath;
        }
      }
      var res = await P.postComment({
        content: commentDraft(state.current),
        filePath: filePath,
        snapshot: { v: 1, id: state.current.id },
        saveToAlbum: false
      });
      if (!(res && res.ok)) toast('暂时无法打开评论区');
    });
  }

  async function restoreSnapshot() {
    if (!P || typeof P.readSnapshot !== 'function') return;
    try {
      var snap = await P.readSnapshot();
      if (!snap || !snap.id) return;
      var ci = findCi(snap.id);
      if (!ci) return;
      renderCard(ci, { animate: false });
      setView('card', { stagger: false });
    } catch (err) { /* 忽略无效快照 */ }
  }

  function syncFollowButtons() {
    var buttons = [$('btn-follow-home'), $('btn-follow-card')];
    var i, btn;
    for (i = 0; i < buttons.length; i++) {
      btn = buttons[i];
      if (!btn) continue;
      if (!state.canFollow) {
        btn.setAttribute('hidden', '');
        continue;
      }
      btn.removeAttribute('hidden');
      if (state.followStatus === 1) {
        btn.textContent = '已关注';
        btn.disabled = true;
      } else if (state.followStatus === 2) {
        btn.textContent = '我的小工具';
        btn.disabled = true;
      } else {
        btn.textContent = '关注作者';
        btn.disabled = false;
      }
    }
  }

  async function follow() {
    if (!P || !state.canFollow || followPending) return;
    followPending = true;
    syncFollowButtons();
    var homeBtn = $('btn-follow-home');
    var cardBtn = $('btn-follow-card');
    if (homeBtn) homeBtn.disabled = true;
    if (cardBtn) cardBtn.disabled = true;
    try {
      var res = await P.followAuthor();
      if (res && res.ok) {
        state.followStatus = res.status;
        if (res.status === 1) toast('已关注');
        else if (res.status === 2) toast('这是作者本人');
        else toast('暂时无法关注');
      } else if (res && res.code === 20002) {
        toast('已取消');
      } else if (res && res.code === 15404) {
        toast('今天已经提醒过了');
      } else if (res && res.code === 10003) {
        toast('请稍后再试');
      } else {
        toast('暂时无法关注');
      }
    } finally {
      followPending = false;
      syncFollowButtons();
    }
  }

  async function saveCard() {
    if (!state.current || !window.SCC_CARD) return;
    var dataUrl = window.SCC_CARD.render(state.current);
    if (!dataUrl) {
      toast('生成色卡失败');
      return;
    }
    if (state.canSave && P) {
      var res = await P.saveImage(dataUrl);
      if (res && res.ok) {
        toast('已保存到相册');
        return;
      }
      toast('保存失败，可再试一次');
      return;
    }
    var img = $('preview-img');
    if (img) img.src = dataUrl;
    openSheet('preview-sheet');
  }

  async function shareCard() {
    if (!state.current || !window.SCC_CARD || !P) return;
    var dataUrl = window.SCC_CARD.render(state.current);
    if (!dataUrl) {
      toast('生成色卡失败');
      return;
    }
    var res = await P.shareImage(dataUrl);
    if (!(res && res.ok)) toast('暂时无法分享');
  }

  function renderPoets() {
    var wrap = $('poet-chips');
    if (!wrap) return;
    wrap.innerHTML = '';
    var poets = uniquePoets();
    var i;
    for (i = 0; i < poets.length; i++) {
      (function (name) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'poet-chip' + (state.poet === name ? ' on' : '');
        btn.textContent = name;
        on(btn, 'click', function () {
          state.poet = name;
          renderPoets();
          renderCiList({ stagger: false });
        });
        wrap.appendChild(btn);
      })(poets[i]);
    }
  }

  function renderCiList(opts) {
    var wrap = $('ci-list');
    if (!wrap) return;
    wrap.innerHTML = '';
    var q = (state.query || '').replace(/^\s+|\s+$/g, '');
    var i, ci, hit, j;
    var n = 0;
    for (i = 0; i < CI.length; i++) {
      ci = CI[i];
      if (state.poet !== '全部' && ci.poet !== state.poet) continue;
      if (q) {
        hit = ci.poet.indexOf(q) !== -1 || ci.tune.indexOf(q) !== -1 || ci.line.indexOf(q) !== -1;
        if (!hit) continue;
      }
      n += 1;
      (function (item) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ci-item';
        var poet = document.createElement('span');
        poet.className = 'ci-item-poet';
        poet.textContent = metaText(item);
        var line = document.createElement('span');
        line.className = 'ci-item-line';
        line.textContent = item.line;
        var mini = document.createElement('span');
        mini.className = 'ci-mini';
        for (j = 0; j < item.colors.length; j++) {
          var sw = document.createElement('i');
          sw.style.background = item.colors[j].hex;
          mini.appendChild(sw);
        }
        btn.appendChild(poet);
        btn.appendChild(line);
        btn.appendChild(mini);
        on(btn, 'click', function () {
          renderCard(item);
          setView('card', { stagger: false });
        });
        wrap.appendChild(btn);
      })(ci);
    }
    if (!n) {
      var empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = '没有找到相符的词句。';
      wrap.appendChild(empty);
    }
    if (opts && opts.stagger) {
      var page = $('v-poets');
      restartEnter(page, 'list-enter');
      stagger(wrap.querySelectorAll('.ci-item'), 12);
    }
  }

  function renderColors(opts) {
    var wrap = $('color-list');
    if (!wrap) return;
    wrap.innerHTML = '';
    var i;
    for (i = 0; i < COLORS.length; i++) {
      (function (color) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'color-item' + (isPale(color.hex) ? ' is-pale' : '');
        var ink = contrastInk(color.hex);
        var chip = document.createElement('span');
        chip.className = 'color-chip';
        chip.style.background = color.hex;
        var body = document.createElement('span');
        body.className = 'color-body';
        body.style.color = ink;
        var nm = document.createElement('span');
        nm.className = 'color-name';
        nm.textContent = color.name;
        var hx = document.createElement('span');
        hx.className = 'color-hex';
        hx.textContent = color.hex;
        var src = document.createElement('span');
        src.className = 'color-src';
        src.textContent = color.src;
        body.appendChild(nm);
        body.appendChild(hx);
        chip.appendChild(body);
        btn.appendChild(chip);
        btn.appendChild(src);
        on(btn, 'click', function () { showSwatch(color); });
        wrap.appendChild(btn);
      })(COLORS[i]);
    }
    if (opts && opts.stagger) {
      var page = $('v-colors');
      restartEnter(page, 'list-enter');
      stagger(wrap.querySelectorAll('.color-item'), 12);
    }
  }

  function bind() {
    on($('btn-draw'), 'click', function () {
      renderCard(drawOne());
      setView('card', { stagger: false });
    });
    on($('btn-redraw'), 'click', function () {
      renderCard(drawOne());
    });
    on($('btn-save'), 'click', function () { saveCard(); });
    on($('btn-share'), 'click', function () { shareCard(); });
    on($('btn-post'), 'click', function () { postNoteCard(); });
    on($('btn-comment'), 'click', function () { commentCard(); });
    on($('btn-follow-home'), 'click', function () { follow(); });
    on($('btn-follow-card'), 'click', function () { follow(); });
    on($('hex-close'), 'click', function () { hideSheet('hex-sheet'); });
    on($('hex-mask'), 'click', function () { hideSheet('hex-sheet'); });
    on($('preview-close'), 'click', function () { hideSheet('preview-sheet'); });
    on($('preview-mask'), 'click', function () { hideSheet('preview-sheet'); });

    var tabs = document.querySelectorAll('.tab');
    var i;
    for (i = 0; i < tabs.length; i++) {
      on(tabs[i], 'click', function (ev) {
        var name = ev.currentTarget.getAttribute('data-tab');
        if (name === 'card' && !state.current) {
          renderCard(drawOne());
        }
        if (name === 'poets') {
          renderPoets();
          renderCiList({ stagger: true });
        }
        if (name === 'colors') {
          renderColors({ stagger: true });
        }
        setView(name, { stagger: name === 'poets' || name === 'colors' });
      });
    }

    on($('poet-q'), 'input', function (ev) {
      var value = ev.target.value;
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        state.query = value;
        renderCiList({ stagger: false });
      }, 180);
    });
  }

  async function initPlatform() {
    if (!P) return;
    try { await P.applySafeArea(); } catch (err) {}
    try { state.canSave = !!(await P.canSaveImage()); } catch (err) { state.canSave = false; }
    try { state.canShare = !!(await P.canShare()); } catch (err) { state.canShare = false; }
    try { state.canFollow = !!(await P.canFollow()); } catch (err) { state.canFollow = false; }
    if (state.canFollow) {
      try { state.followStatus = await P.getFollowStatus(); } catch (err) { state.followStatus = -1; }
    }
    try { await restoreSnapshot(); } catch (err) {}
    updateActionButtons();
  }

  window.SCC_APP = {
    show: function (id) {
      var ci = findCi(id);
      if (!ci) return false;
      renderCard(ci);
      setView('card', { stagger: false });
      return true;
    },
    goto: function (name) {
      if (name === 'poets') {
        renderPoets();
        renderCiList({ stagger: true });
      }
      if (name === 'colors') {
        renderColors({ stagger: true });
      }
      setView(name, { stagger: name === 'poets' || name === 'colors' });
    }
  };

  function init() {
    renderColors({ stagger: false });
    renderPoets();
    renderCiList({ stagger: false });
    bind();
    initPlatform();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
