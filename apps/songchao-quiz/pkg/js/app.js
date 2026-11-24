(function () {
  var DATA = window.SCG_DATA;
  var P = window.SCG_P;
  var CARD = window.SCG_CARD;
  var HISTORY_KEY = 'scg_quiz_history_v1';
  var HISTORY_MAX = 8;
  var LETTERS = DATA.LABELS;
  var STAGGER = 28;
  var VIEWS = ['v-home', 'v-quiz', 'v-calc', 'v-result'];

  function $(id) { return document.getElementById(id); }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) el.setAttribute('hidden', '');
    else el.removeAttribute('hidden');
  }

  function reduceMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      || document.documentElement.classList.contains('reduce-motion');
  }

  function syncReduceClass() {
    var on = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    document.documentElement.classList.toggle('reduce-motion', on);
  }

  function tokenMs(name, fallback) {
    var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return isNaN(v) ? fallback : v;
  }

  function motionMs(name, fallback) {
    return reduceMotion() ? 0 : tokenMs(name, fallback);
  }

  function afterMotion(name, fallback, fn) {
    var t = motionMs(name, fallback);
    if (t <= 0) {
      fn();
      return 0;
    }
    return setTimeout(fn, t);
  }

  function restartEnter(el, className) {
    if (!el) return;
    el.classList.remove(className);
    if (reduceMotion()) return;
    // 强制回流后重播
    void el.offsetWidth;
    el.classList.add(className);
  }

  function flashOk(el) {
    if (!el || reduceMotion()) return;
    el.classList.remove('is-ok');
    void el.offsetWidth;
    el.classList.add('is-ok');
  }

  var toastTimer = 0;
  var toastHideTimer = 0;

  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.className = 'toast on';
    if (toastTimer) clearTimeout(toastTimer);
    if (toastHideTimer) clearTimeout(toastHideTimer);
    toastTimer = setTimeout(function () {
      el.className = 'toast';
      toastHideTimer = setTimeout(function () {
        if (!el.classList.contains('on')) el.textContent = '';
      }, motionMs('--t-fast', 160) + 20);
    }, tokenMs('--t-toast', 1800));
  }

  function syncAppHeight() {
    var h = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    if (h) document.documentElement.style.setProperty('--app-height', h + 'px');
    quizMaxH = 0;
    fit();
  }

  var quizMaxH = 0;

  function cssPx(name, fallback) {
    var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return isNaN(v) ? fallback : v;
  }

  /* 垂直居中 + 一屏放下：
   * 高度够时上下对称留白（真居中）；不够时贴安全区居中；仍放不下则整体等比缩小，绝不出现滚动。 */
  function fit() {
    var shell = $('shell');
    var view = $(currentView);
    if (!shell || !view) return;
    var appH = $('app').clientHeight || window.innerHeight;
    var baseT = cssPx('--shell-pad-top', 88);
    var baseB = cssPx('--shell-pad-bottom', 24);
    view.style.transform = '';
    shell.style.paddingTop = baseT + 'px';
    shell.style.paddingBottom = baseB + 'px';
    var h = view.offsetHeight;
    if (currentView === 'v-quiz' && quizMaxH > h) h = quizMaxH;
    var padB = Math.max(baseB, Math.min(baseT, appH - baseT - h));
    shell.style.paddingBottom = padB + 'px';
    var avail = appH - baseT - padB;
    var scale = h > avail ? Math.max(0.6, avail / h) : 1;
    if (scale < 1) view.style.transform = 'scale(' + scale.toFixed(4) + ')';
  }

  function measureQuizMax() {
    if (quizMaxH || !game) return;
    var saved = game.index;
    var maxH = 0;
    var view = $('v-quiz');
    var root = document.documentElement;
    root.classList.add('measuring');
    view.style.minHeight = '';
    view.style.transform = '';
    for (var i = 0; i < DATA.QUESTIONS.length; i++) {
      game.index = i;
      renderQuestion(true);
      if (view.offsetHeight > maxH) maxH = view.offsetHeight;
    }
    game.index = saved;
    renderQuestion(true);
    root.classList.remove('measuring');
    quizMaxH = maxH;
  }

  var currentView = 'v-home';

  function clearMotion(el) {
    if (!el) return;
    el.classList.remove('is-enter', 'is-leave', 'on');
  }

  function showView(id, opts) {
    opts = opts || {};
    var i, el;
    for (i = 0; i < VIEWS.length; i++) {
      el = $(VIEWS[i]);
      var on = VIEWS[i] === id;
      clearMotion(el);
      el.className = 'view' + (on ? ' on' : '');
      setHidden(el, !on);
      if (on && opts.enter && !reduceMotion()) {
        el.classList.add('is-enter');
      }
    }
    currentView = id;
    if (id !== 'v-quiz') {
      var quiz = $('v-quiz');
      if (quiz) quiz.style.minHeight = '';
    }
    fit();
  }

  var historyData = { last: null, list: [] };
  var game = null;
  var resultType = null;
  var resultImage = '';
  var followStatus = -1;
  var followAvailable = false;
  var followPending = false;
  var actionBusy = false;
  var sheetClosing = false;

  function loadHistory() {
    return P.getData(HISTORY_KEY, null).then(function (data) {
      if (data && typeof data === 'object') {
        historyData.last = data.last || null;
        historyData.list = Array.isArray(data.list) ? data.list.slice(0, HISTORY_MAX) : [];
      }
    });
  }

  async function saveHistory(typeId) {
    var item = { typeId: typeId, ts: Date.now() };
    historyData.last = item;
    var list = historyData.list.filter(function (row) { return row && row.ts !== item.ts; });
    list.unshift(item);
    historyData.list = list.slice(0, HISTORY_MAX);
    return P.setData(HISTORY_KEY, historyData);
  }

  function renderHome() {
    var hint = $('home-last');
    if (historyData.last && historyData.last.typeId) {
      var typ = DATA.typeById(historyData.last.typeId);
      hint.textContent = '你上次的结果是「' + typ.name + '」';
      setHidden(hint, false);
    } else {
      hint.textContent = '';
      setHidden(hint, true);
    }
  }

  function playHomeEnter() {
    var frame = $('v-home') && $('v-home').querySelector('.frame');
    if (!frame) return;
    frame.classList.remove('is-leave');
    restartEnter(frame, 'is-enter');
  }

  function startGame() {
    game = { index: 0, picks: [] };
    resultType = null;
    resultImage = '';
    P.setCloseRetention(false);
    closePreview(true);
    showQuiz({ first: true });
  }

  function beginFromHome() {
    if (game && game.locked) return;
    P.vibrate('light');
    var frame = $('v-home').querySelector('.frame');
    if (reduceMotion() || !frame) {
      startGame();
      return;
    }
    game = { index: 0, picks: [], locked: true };
    frame.classList.remove('is-enter');
    void frame.offsetWidth;
    frame.classList.add('is-leave');
    afterMotion('--t-base', 280, function () {
      frame.classList.remove('is-leave');
      if (game) game.locked = false;
      startGame();
    });
  }

  function showQuiz(opts) {
    opts = opts || {};
    showView('v-quiz', { enter: !!opts.first });
    renderQuestion(true);
    measureQuizMax();
    $('v-quiz').style.minHeight = quizMaxH ? quizMaxH + 'px' : '';
    renderQuestion(true, { enter: true });
    fit();
  }

  function setOptDelays(container) {
    var buttons = container.querySelectorAll('.opt');
    var i, delay;
    for (i = 0; i < buttons.length; i++) {
      delay = 80 + Math.min(i, 12) * STAGGER;
      buttons[i].style.animationDelay = reduceMotion() ? '0ms' : (delay + 'ms');
    }
  }

  function renderQuestion(silent, opts) {
    opts = opts || {};
    var total = DATA.QUESTIONS.length;
    var i = game.index;
    var q = DATA.QUESTIONS[i];
    $('q-progress').textContent = pad2(i + 1) + ' / ' + pad2(total);
    $('q-title').textContent = q.text;

    var dots = '';
    var d;
    for (d = 0; d < total; d++) {
      var cls = 'dot';
      if (d < i) cls += ' done';
      if (d === i) cls += ' now';
      dots += '<span class="' + cls + '"></span>';
    }
    $('q-dots').innerHTML = dots;
    if (!silent && i > 0) {
      var nowDot = $('q-dots').querySelector('.dot.now');
      if (nowDot && !reduceMotion()) nowDot.classList.add('is-advance');
    }

    var html = '';
    var o;
    for (o = 0; o < q.options.length; o++) {
      html += '<button class="opt" type="button" data-i="' + o + '">' +
        '<span class="lab">' + LETTERS[o] + '</span>' +
        esc(q.options[o].text) +
        '</button>';
    }
    $('q-opts').innerHTML = html;
    var buttons = $('q-opts').querySelectorAll('.opt');
    var b;
    for (b = 0; b < buttons.length; b++) {
      buttons[b].addEventListener('click', onPick);
    }

    var block = $('q-block');
    block.classList.remove('is-exit');
    if (opts.enter && !reduceMotion() && !document.documentElement.classList.contains('measuring')) {
      restartEnter(block, 'is-enter');
      setOptDelays(block);
    } else {
      block.classList.remove('is-enter');
    }

    if (!silent) fit();
  }

  function nextQuestion() {
    game.locked = false;
    game.index += 1;
    if (game.index >= DATA.QUESTIONS.length) {
      finish();
      return;
    }
    renderQuestion(false, { enter: true });
  }

  function onPick(ev) {
    if (!game || game.locked) return;
    var btn = ev.currentTarget;
    var idx = Number(btn.getAttribute('data-i'));
    var q = DATA.QUESTIONS[game.index];
    if (!q || !q.options[idx]) return;
    game.locked = true;

    var buttons = $('q-opts').querySelectorAll('.opt');
    var i;
    for (i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
      if (Number(buttons[i].getAttribute('data-i')) === idx) {
        buttons[i].className = 'opt picked';
        if (!reduceMotion()) {
          buttons[i].classList.add('is-pop');
        }
      }
    }
    game.picks.push(q.options[idx].type);
    P.vibrate('light');

    var last = game.index >= DATA.QUESTIONS.length - 1;
    afterMotion('--t-hold', 260, function () {
      if (last || reduceMotion()) {
        nextQuestion();
        return;
      }
      var block = $('q-block');
      block.classList.remove('is-enter');
      void block.offsetWidth;
      block.classList.add('is-exit');
      afterMotion('--t-fast', 160, nextQuestion);
    });
  }

  async function finish() {
    var scored = DATA.scoreAnswers(game.picks);
    resultType = DATA.typeById(scored.id);
    await saveHistory(resultType.id);
    showCalculating(resultType);
  }

  function showCalculating(type) {
    showView('v-calc', { enter: !reduceMotion() });
    afterMotion('--t-calc', 800, function () {
      showResult(type, { enter: true });
    });
  }

  function renderMotif(type) {
    $('r-art').innerHTML = DATA.MOTIFS[type.id] || '';
    $('r-name').textContent = type.name;
    $('r-desc').textContent = type.desc;
    $('result-card').style.borderColor = type.colors.accent || type.colors.wash;
  }

  async function showResult(type, opts) {
    opts = opts || {};
    renderMotif(type);
    showView('v-result', { enter: opts.enter !== false && !reduceMotion() });
    P.setCloseRetention(true);
    await bindResultActions();
    fit();
    afterMotion('--t-slow', 420, fit);
  }

  async function bindResultActions() {
    var canSave = await P.canSaveImage();
    var canPost = await P.canPostNote();
    var canShare = await P.canShare();
    var canFollow = await P.canFollow();

    setHidden($('btn-save'), false);
    $('btn-save').textContent = canSave ? '保存结果卡' : '查看结果卡';

    setHidden($('btn-note'), !canPost);
    setHidden($('btn-share'), !canShare);
    setHidden($('btn-comment'), false);
    var row = document.querySelector('#v-result .action-row');
    if (row) {
      if (canPost) row.classList.remove('is-single');
      else row.classList.add('is-single');
    }
    /* 关注作者按钮始终显示；能力不可用时点击给出提示 */
    followAvailable = canFollow;
    setHidden($('btn-follow'), false);
    renderFollow();

    var hints = [];
    if (!P.inXhs()) {
      hints.push('在普通浏览器里可以测完并查看结果；保存到相册、发笔记和关注需要在小红书里打开。');
    }
    $('action-hint').textContent = hints.join('');

    fit();
    if (canFollow) refreshFollow();
  }

  function followLabel(status) {
    if (status === 1) return '已关注';
    if (status === 2) return '关注作者（你就是作者）';
    return '关注作者';
  }

  function renderFollow() {
    var btn = $('btn-follow');
    btn.textContent = followLabel(followAvailable ? followStatus : -1);
    btn.disabled = followPending || followStatus === 1 || followStatus === 2;
    if (!followAvailable) btn.disabled = false;
  }

  async function refreshFollow() {
    var status = await P.getFollowStatus();
    if (typeof status === 'number') followStatus = status;
    renderFollow();
  }

  async function ensureImage() {
    if (resultImage) return resultImage;
    if (!resultType) return '';
    await CARD.prepare(resultType);
    resultImage = CARD.drawCard(resultType) || '';
    return resultImage;
  }

  function openPreview(dataUrl) {
    var sheet = $('preview-sheet');
    $('preview-img').src = dataUrl;
    sheet.classList.remove('is-open');
    setHidden(sheet, false);
    if (reduceMotion()) {
      sheet.classList.add('is-open');
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        sheet.classList.add('is-open');
      });
    });
  }

  function closePreview(immediate) {
    var sheet = $('preview-sheet');
    if (!sheet || sheet.hasAttribute('hidden')) {
      $('preview-img').removeAttribute('src');
      return;
    }
    function hide() {
      sheetClosing = false;
      sheet.classList.remove('is-open');
      setHidden(sheet, true);
      $('preview-img').removeAttribute('src');
    }
    if (immediate || reduceMotion()) {
      hide();
      return;
    }
    if (sheetClosing) return;
    sheetClosing = true;
    sheet.classList.remove('is-open');
    var panel = $('preview-panel');
    var done = false;
    function finishClose() {
      if (done) return;
      done = true;
      if (panel) panel.removeEventListener('transitionend', onEnd);
      hide();
    }
    function onEnd(ev) {
      if (ev && ev.target !== panel) return;
      finishClose();
    }
    if (panel) panel.addEventListener('transitionend', onEnd);
    setTimeout(finishClose, motionMs('--t-slow', 420) + 40);
  }

  async function onSave() {
    if (actionBusy) return;
    var url = await ensureImage();
    if (!url) { toast('结果卡生成失败'); return; }
    if (!(await P.canSaveImage())) {
      openPreview(url);
      return;
    }
    actionBusy = true;
    $('btn-save').disabled = true;
    var res = await P.saveImage(url);
    actionBusy = false;
    $('btn-save').disabled = false;
    if (res.ok) {
      toast('已保存到相册');
      flashOk($('btn-save'));
      P.vibrate('light');
    } else {
      toast('暂时无法保存，可改用截图');
      openPreview(url);
    }
  }

  async function onPost() {
    if (actionBusy || !resultType) return;
    var url = await ensureImage();
    if (!url) { toast('结果卡生成失败'); return; }
    actionBusy = true;
    $('btn-note').disabled = true;
    var title = '我是「' + resultType.name + '」';
    if (title.length > 20) title = resultType.name;
    var content = '今天测了一下，结果是「' + resultType.name + '」。\n' +
      resultType.desc + '\n\n' +
      '这是娱乐测验，不是历史分类。\n' +
      '来自小工具「测测你是宋朝哪种女子」。';
    var res = await P.postNote({
      title: title,
      content: content,
      imageUrl: url
    });
    actionBusy = false;
    $('btn-note').disabled = false;
    if (res.ok) {
      toast('已打开笔记发布页');
      flashOk($('btn-note'));
    } else {
      toast('暂时无法发笔记');
    }
  }

  function commentDraft(type) {
    var hook = type.brief || type.desc || '';
    return '我测出来是宋朝的「' + type.name + '」，' + hook + ' 你也来测测？';
  }

  async function onComment() {
    if (actionBusy || !resultType) return;
    if (!(await P.canPostComment())) {
      toast('当前版本还不能晒到评论区');
      return;
    }
    actionBusy = true;
    $('btn-comment').disabled = true;
    var filePath = '';
    var url = await ensureImage();
    if (url && typeof P.writeTemp === 'function') {
      var written = await P.writeTemp(url);
      if (written && written.ok) filePath = written.filePath;
    }
    var res = await P.postComment({
      content: commentDraft(resultType),
      filePath: filePath,
      snapshot: { v: 1, page: 'result', typeId: resultType.id },
      saveToAlbum: false
    });
    actionBusy = false;
    $('btn-comment').disabled = false;
    if (res && res.ok) {
      flashOk($('btn-comment'));
    } else {
      toast('暂时无法打开评论区');
    }
  }

  async function onShare() {
    if (actionBusy || !resultType) return;
    var url = await ensureImage();
    if (!url) { toast('结果卡生成失败'); return; }
    actionBusy = true;
    $('btn-share').disabled = true;
    var res = await P.shareImage(url);
    actionBusy = false;
    $('btn-share').disabled = false;
    if (res.ok) {
      flashOk($('btn-share'));
      return;
    }
    if (res.code === 15502) {
      toast('当前容器暂不支持分享');
      setHidden($('btn-share'), true);
      return;
    }
    if (res.code === 15503) {
      toast('今日分享次数已用完');
      return;
    }
    toast('暂时无法分享');
  }

  async function onFollow() {
    if (!followAvailable) {
      toast('请在最新版小红书里打开，再点关注');
      return;
    }
    if (followPending || followStatus === 1 || followStatus === 2) return;
    followPending = true;
    renderFollow();
    var res = await P.followAuthor();
    followPending = false;
    if (res.ok) {
      followStatus = res.status;
      renderFollow();
      if (followStatus === 1) {
        toast('已关注');
        flashOk($('btn-follow'));
      } else if (followStatus === -1) toast('暂时无法关注');
      return;
    }
    renderFollow();
    if (res.code === 20002 || res.code === 10003) return;
    if (res.code === 15404) toast('今日关注引导次数已达上限');
    else toast('暂时无法关注');
  }

  function onAgain() {
    closePreview(true);
    resultImage = '';
    resultType = null;
    startGame();
  }

  async function restoreSnapshot() {
    if (!P || typeof P.readSnapshot !== 'function') return false;
    try {
      var snap = await P.readSnapshot();
      if (!snap || !snap.typeId) return false;
      var typ = DATA.typeById(snap.typeId);
      if (!typ || typ.id !== snap.typeId) return false;
      resultType = typ;
      resultImage = '';
      await showResult(typ, { enter: true });
      return true;
    } catch (err) {
      return false;
    }
  }

  function bind() {
    $('btn-start').addEventListener('click', beginFromHome);
    $('btn-save').addEventListener('click', onSave);
    $('btn-note').addEventListener('click', onPost);
    $('btn-comment').addEventListener('click', onComment);
    $('btn-share').addEventListener('click', onShare);
    $('btn-follow').addEventListener('click', onFollow);
    $('btn-again').addEventListener('click', onAgain);
    $('preview-close').addEventListener('click', function () { closePreview(); });
    $('preview-mask').addEventListener('click', function () { closePreview(); });
  }

  function detectFlexGap() {
    var flex = document.createElement('div');
    flex.style.position = 'absolute';
    flex.style.visibility = 'hidden';
    flex.style.display = 'flex';
    flex.style.flexDirection = 'column';
    flex.style.rowGap = '1px';
    flex.appendChild(document.createElement('div'));
    flex.appendChild(document.createElement('div'));
    document.body.appendChild(flex);
    var supported = flex.scrollHeight === 1;
    flex.parentNode.removeChild(flex);
    if (supported) document.documentElement.classList.add('supports-flex-gap');
  }

  async function boot() {
    detectFlexGap();
    syncReduceClass();
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq.addEventListener) mq.addEventListener('change', syncReduceClass);
      else if (mq.addListener) mq.addListener(syncReduceClass);
    }
    syncAppHeight();
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncAppHeight);
    }
    window.addEventListener('resize', syncAppHeight);
    await P.applySafeArea();
    await loadHistory();
    renderHome();
    $('hero-art').innerHTML = (window.SCG_MOTIFS && window.SCG_MOTIFS.hero) || '';
    bind();
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    var restored = await restoreSnapshot();
    if (!restored) playHomeEnter();

    if (/[?&]preview=1/.test(location.search)) {
      window.__SCG_DEBUG__ = {
        home: function () {
          showView('v-home');
          renderHome();
          playHomeEnter();
        },
        quiz: function (index) {
          if (!game) game = { index: 0, picks: [] };
          game.index = Math.max(0, Math.min(DATA.QUESTIONS.length - 1, index || 0));
          showQuiz({ first: true });
        },
        calc: function () {
          showView('v-calc', { enter: true });
        },
        result: function (typeId) {
          resultType = DATA.typeById(typeId || 'cha');
          resultImage = '';
          return showResult(resultType, { enter: true });
        },
        toast: toast,
        reduceMotion: function (on) {
          document.documentElement.classList.toggle('reduce-motion', !!on);
        },
        settleMs: function () {
          return reduceMotion() ? 0 : 700;
        }
      };
    }
  }

  boot();
})();
