/* 只调用 2026-11-25 在线文档里写明对外开放的方法。不调用关注弹窗、定位、陀螺仪、内测 AI、云存储、成绩榜、赞赏。 */
(function () {
  var P = {};
  var cachedBuild;
  var lastWindowInfo = null;
  var resizeBound = false;
  var insetListeners = [];
  var lastInsetKey = '';
  var WINDOW_MIN = 9490;
  var STORAGE_MIN = 9460;
  var COMMENT_MIN = 9490;
  var VIBRATE_MIN = 9500;
  var SHARE_MIN = 9530;

  function mt() {
    return (window.xhs && window.xhs.miniTool) || null;
  }

  function has(name) {
    var tool = mt();
    return !!(tool && typeof tool[name] === 'function');
  }

  function readBuildVersion(launchOptions) {
    var env = launchOptions && launchOptions.miniToolEnv;
    var n = Number(env && env.buildVersion);
    return n > 0 && isFinite(n) ? n : null;
  }

  function clientVersion(buildVersion) {
    return Math.floor((Number(buildVersion) || 0) / 1000);
  }

  async function getBuildVersion() {
    var xhs;
    var version;
    if (cachedBuild !== undefined) return cachedBuild;
    xhs = window.xhs;
    version = readBuildVersion(xhs && xhs.launchOptions);
    if (version === null && has('getLaunchOptions')) {
      try {
        version = readBuildVersion(await mt().getLaunchOptions());
      } catch (err) {
        version = null;
      }
    }
    cachedBuild = version;
    return cachedBuild;
  }

  async function isAtLeast(minimum) {
    var build = await getBuildVersion();
    return build !== null && clientVersion(build) >= minimum;
  }

  function errText(err) {
    if (!err) return '';
    return String(err.errMsg || err.message || '');
  }

  function errCode(err) {
    return err && (err.errCode || err.errCode === 0) ? err.errCode : '';
  }

  function readRootPx(name) {
    var value;
    var n;
    try {
      value = window.getComputedStyle(document.documentElement).getPropertyValue(name);
    } catch (err) {
      return 0;
    }
    n = parseFloat(value);
    return n === n ? n : 0;
  }

  function visibleRect(rect) {
    return !!(rect && typeof rect.width === 'number' && typeof rect.height === 'number' && rect.width > 0 && rect.height > 0 && typeof rect.bottom === 'number');
  }

  function applyInsets(info) {
    var root = document.documentElement;
    var safe;
    var menu;
    var rects = [];
    var contentTop = 0;
    var i;
    var winH;
    var safeBottom = 0;
    var key;
    var j;
    if (!info) return;
    lastWindowInfo = info;
    safe = info.safeArea || {};
    menu = info.menuButtons || {};
    if (typeof safe.top === 'number') contentTop = safe.top;
    if (visibleRect(menu.capsule)) rects.push(menu.capsule);
    if (visibleRect(menu.back)) rects.push(menu.back);
    if (visibleRect(menu.me)) rects.push(menu.me);
    if (visibleRect(menu.share)) rects.push(menu.share);
    for (i = 0; i < rects.length; i++) {
      if (rects[i].bottom > contentTop) contentTop = rects[i].bottom;
    }
    root.style.setProperty('--content-top', Math.ceil(contentTop + 12) + 'px');
    winH = typeof info.windowHeight === 'number' ? info.windowHeight : 0;
    if (winH && typeof safe.bottom === 'number') safeBottom = Math.max(0, winH - safe.bottom);
    root.style.setProperty('--safe-bottom', Math.ceil(safeBottom) + 'px');
    key = Math.ceil(contentTop + 12) + '|' + Math.ceil(safeBottom);
    if (key !== lastInsetKey) {
      lastInsetKey = key;
      for (j = 0; j < insetListeners.length; j++) {
        try { insetListeners[j](); } catch (e) { /* ignore */ }
      }
    }
  }

  P.inContainer = function () {
    return !!mt();
  };

  P.syncFrame = function () {
    var h = window.innerHeight || 0;
    var top;
    var bottom;
    if (window.visualViewport && window.visualViewport.height) h = window.visualViewport.height;
    if (h) document.documentElement.style.setProperty('--app-height', h + 'px');
    if (lastWindowInfo) {
      applyInsets(lastWindowInfo);
      return;
    }
    top = readRootPx('--safe-area-inset-top');
    bottom = readRootPx('--safe-area-inset-bottom');
    if (P.inContainer()) {
      document.documentElement.style.setProperty('--content-top', Math.max(Math.ceil(top + 12), 102) + 'px');
    } else if (top) {
      document.documentElement.style.setProperty('--content-top', Math.ceil(top + 10) + 'px');
    }
    if (bottom) document.documentElement.style.setProperty('--safe-bottom', Math.ceil(bottom) + 'px');
  };

  P.applyWindow = async function () {
    var xhs = window.xhs;
    var syncInfo = xhs && xhs.launchOptions && xhs.launchOptions.miniToolEnv && xhs.launchOptions.miniToolEnv.windowInfo;
    P.syncFrame();
    if (syncInfo) applyInsets(syncInfo);
    if (!resizeBound && has('onWindowResize')) {
      resizeBound = true;
      try {
        mt().onWindowResize(function () { P.applyWindow(); });
      } catch (err0) { /* ignore */ }
    }
    if (!has('getWindowInfo') || !(await isAtLeast(WINDOW_MIN))) return;
    try {
      applyInsets(await mt().getWindowInfo());
    } catch (err) {
      /* 保留 CSS 与启动快照 */
    }
  };

  P.vibrateLight = async function () {
    if (!has('vibrateShort') || !(await isAtLeast(VIBRATE_MIN))) return;
    try {
      await mt().vibrateShort({ type: 'light' });
    } catch (err) {
      /* 触感反馈为增强能力，失败静默忽略 */
    }
  };

  async function canUseStorage() {
    return has('setStorage') && has('getStorage') && (await isAtLeast(STORAGE_MIN));
  }

  P.setData = async function (key, data) {
    var serialized;
    var res;
    try {
      serialized = JSON.stringify(data);
    } catch (err) {
      return false;
    }
    if (typeof serialized !== 'string') return false;
    if (!(await canUseStorage())) return false;
    try {
      res = await mt().setStorage({ key: key, data: serialized });
      return !res || !res.errMsg || res.errMsg === 'setStorage:ok';
    } catch (err2) {
      return false;
    }
  };

  P.getData = async function (key) {
    var res;
    var raw = null;
    if (!(await canUseStorage())) return null;
    try {
      res = await mt().getStorage({ key: key });
      raw = res ? res.data : null;
    } catch (err) {
      return null;
    }
    if (!raw || typeof raw !== 'string') return null;
    try { return JSON.parse(raw); } catch (err2) { return null; }
  };

  function findSnapshot(node, depth) {
    var keys = ['query', 'extraData', 'referrerInfo', 'miniToolEnv'];
    var i;
    var found;
    if (!node || typeof node !== 'object' || depth > 4) return null;
    if (typeof node.miniToolSnapshotInfo === 'string' && node.miniToolSnapshotInfo) {
      return node.miniToolSnapshotInfo;
    }
    for (i = 0; i < keys.length; i++) {
      if (node[keys[i]]) {
        found = findSnapshot(node[keys[i]], depth + 1);
        if (found) return found;
      }
    }
    return null;
  }

  P.readSnapshot = async function () {
    var xhs = window.xhs;
    var sync = findSnapshot(xhs && xhs.launchOptions, 0);
    var options;
    if (sync) return sync;
    if (!has('getLaunchOptions')) return null;
    try {
      options = await mt().getLaunchOptions();
    } catch (err) {
      return null;
    }
    return findSnapshot(options, 0);
  };

  P.writeTemp = async function (dataUrl) {
    var written;
    if (!has('writeTempFile')) return { ok: false, reason: 'unavailable' };
    try {
      written = await mt().writeTempFile({ data: dataUrl });
    } catch (err) {
      return { ok: false, reason: 'fail', msg: errText(err), code: errCode(err) };
    }
    if (written && typeof written.filePath === 'string' && written.filePath) {
      return { ok: true, filePath: written.filePath };
    }
    return { ok: false, reason: 'fail' };
  };

  function isSimulatorSandboxHandle(lower) {
    return lower.indexOf('/_xhsfile_/') !== -1 &&
      (lower.indexOf('https://miniapp-sandbox.xiaohongshu.com/') === 0 ||
       lower.indexOf('https://miniapp-sandbox.beta.xiaohongshu.com/') === 0 ||
       lower.indexOf('http://127.0.0.1:') === 0 ||
       lower.indexOf('http://localhost:') === 0);
  }

  function commentHandle(filePath) {
    var lower;
    if (typeof filePath !== 'string' || !filePath) return false;
    lower = filePath.toLowerCase();
    if (lower.indexOf('data:') === 0) return false;
    if (lower.indexOf('blob:') === 0) return false;
    if (lower.indexOf('http://') === 0 || lower.indexOf('https://') === 0) {
      return isSimulatorSandboxHandle(lower);
    }
    return true;
  }

  async function fileOrData(dataUrl) {
    var written = await P.writeTemp(dataUrl);
    if (written.ok && commentHandle(written.filePath)) return written.filePath;
    return dataUrl;
  }

  P.saveImage = async function (dataUrl) {
    var filePath;
    if (!has('saveImageToPhotosAlbum')) return { ok: false, reason: 'unavailable' };
    filePath = await fileOrData(dataUrl);
    try {
      await mt().saveImageToPhotosAlbum({ filePath: filePath });
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: 'fail', msg: errText(err), code: errCode(err) };
    }
  };

  P.postNote = async function (opts) {
    var filePath;
    var content;
    if (!has('postNote')) return { ok: false, reason: 'unavailable' };
    filePath = await fileOrData(opts.dataUrl);
    content = opts.content || '';
    if (content.length > 1000) content = content.slice(0, 1000);
    try {
      await mt().postNote({
        title: (opts.title || '').slice(0, 20),
        content: content,
        pageType: 'photo_publish',
        mediaInfo: { image_resources: [{ url: filePath }] }
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: 'fail', msg: errText(err), code: errCode(err) };
    }
  };

  P.postComment = async function (opts) {
    var written;
    var payload;
    var raw;
    var res;
    if (!has('interactionOpenApi') || !(await isAtLeast(COMMENT_MIN))) {
      return { ok: false, reason: 'unavailable' };
    }
    written = await P.writeTemp(opts.dataUrl);
    if (!written.ok || !commentHandle(written.filePath)) {
      return { ok: false, reason: 'no-handle' };
    }
    payload = {
      action: 'post_comment',
      content: opts.content || '',
      media_bean: [{ media_type: 'image', cover_image_url: written.filePath }]
    };
    if (opts.snapshot) {
      raw = JSON.stringify(opts.snapshot);
      if (raw.length <= 2048) payload.miniToolSnapshotInfo = raw;
    }
    try {
      res = await mt().interactionOpenApi({ payload: payload, saveToAlbum: true });
    } catch (err) {
      return { ok: false, reason: 'fail', msg: errText(err), code: errCode(err) };
    }
    if (res && res.routed === false) {
      return { ok: false, reason: 'fail', msg: 'not routed', raw: res };
    }
    return { ok: true, raw: res || {} };
  };

  P.shareImage = async function (dataUrl) {
    var filePath;
    if (!has('share') || !(await isAtLeast(SHARE_MIN))) {
      return { ok: false, reason: 'unavailable' };
    }
    filePath = await fileOrData(dataUrl);
    try {
      await mt().share({ type: 'image', image_resource: filePath });
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: 'fail', msg: errText(err), code: errCode(err) };
    }
  };

  P.onInsetsChange = function (fn) {
    if (typeof fn === 'function') insetListeners.push(fn);
  };

  window.WardrobePlatform = P;
})();
