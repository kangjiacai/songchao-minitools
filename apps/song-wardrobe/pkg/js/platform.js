/* 只调用 2026-11-24 在线文档里写明对外开放的方法。不调用关注、定位、陀螺仪、内测 AI、云存储、成绩榜、赞赏。 */
(function () {
  var P = {};
  var cachedBuild = null;
  var WINDOW_MIN = 9490;
  var STORAGE_MIN = 9460;
  var COMMENT_MIN = 9490;
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
    return Number(env && env.buildVersion) || 0;
  }

  function clientVersion(buildVersion) {
    return Math.floor((Number(buildVersion) || 0) / 1000);
  }

  async function getBuildVersion() {
    var xhs;
    var version;
    if (cachedBuild !== null) return cachedBuild;
    xhs = window.xhs;
    version = readBuildVersion(xhs && xhs.launchOptions);
    if (!version && has('getLaunchOptions')) {
      try {
        version = readBuildVersion(await mt().getLaunchOptions());
      } catch (err) {
        version = 0;
      }
    }
    cachedBuild = version || 0;
    return cachedBuild;
  }

  async function knownAndBelow(minimum) {
    var build = await getBuildVersion();
    return build > 0 && clientVersion(build) < minimum;
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
    var gesture;
    var left = 0;
    if (!info) return;
    safe = info.safeArea || {};
    menu = info.menuButtons || {};
    if (typeof safe.top === 'number') contentTop = safe.top;
    if (visibleRect(menu.capsule)) rects.push(menu.capsule);
    else {
      if (visibleRect(menu.back)) rects.push(menu.back);
      if (visibleRect(menu.me)) rects.push(menu.me);
      if (visibleRect(menu.share)) rects.push(menu.share);
    }
    for (i = 0; i < rects.length; i++) {
      if (rects[i].bottom > contentTop) contentTop = rects[i].bottom;
    }
    root.style.setProperty('--content-top', (contentTop + 8) + 'px');
    winH = typeof info.windowHeight === 'number' ? info.windowHeight : 0;
    if (winH && typeof safe.bottom === 'number') safeBottom = Math.max(0, winH - safe.bottom);
    root.style.setProperty('--safe-bottom', safeBottom + 'px');
    gesture = info.gestureArea || {};
    if (typeof gesture.width === 'number' && gesture.width > 0 && typeof gesture.height === 'number' && gesture.height > 0) {
      left = gesture.width;
    }
    root.style.setProperty('--gesture-left', left + 'px');
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
    top = readRootPx('--safe-area-inset-top');
    bottom = readRootPx('--safe-area-inset-bottom');
    if (P.inContainer() && top < 48) top = 64;
    if (top) document.documentElement.style.setProperty('--content-top', (top + 8) + 'px');
    if (bottom) document.documentElement.style.setProperty('--safe-bottom', bottom + 'px');
  };

  P.applyWindow = async function () {
    var xhs = window.xhs;
    var syncInfo = xhs && xhs.launchOptions && xhs.launchOptions.miniToolEnv && xhs.launchOptions.miniToolEnv.windowInfo;
    P.syncFrame();
    if (syncInfo) applyInsets(syncInfo);
    if (!has('getWindowInfo') || (await knownAndBelow(WINDOW_MIN))) return;
    try {
      applyInsets(await mt().getWindowInfo());
    } catch (err) {
      /* 保留 CSS 与启动快照 */
    }
  };

  async function useStorage() {
    return has('setStorage') && has('getStorage') && !(await knownAndBelow(STORAGE_MIN));
  }

  P.setData = async function (key, data) {
    var serialized;
    try {
      serialized = JSON.stringify(data);
    } catch (err) {
      return false;
    }
    if (typeof serialized !== 'string') return false;
    if (await useStorage()) {
      try {
        await mt().setStorage({ key: key, data: serialized });
        return true;
      } catch (err) {
        return false;
      }
    }
    try {
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (err2) {
      return false;
    }
  };

  P.getData = async function (key) {
    var raw = null;
    if (await useStorage()) {
      try {
        var res = await mt().getStorage({ key: key });
        raw = res ? res.data : null;
      } catch (err) {
        raw = null;
      }
    }
    if (raw === null || raw === undefined) {
      try { raw = window.localStorage.getItem(key); } catch (err2) { raw = null; }
    }
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (err3) { return null; }
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

  function commentHandle(filePath) {
    var lower;
    if (typeof filePath !== 'string' || !filePath) return false;
    lower = filePath.toLowerCase();
    if (lower.indexOf('data:') === 0) return false;
    if (lower.indexOf('http://') === 0 || lower.indexOf('https://') === 0) return false;
    if (lower.indexOf('blob:') === 0) return false;
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
    if (!has('interactionOpenApi') || (await knownAndBelow(COMMENT_MIN))) {
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
    if (!has('share') || (await knownAndBelow(SHARE_MIN))) {
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

  window.WardrobePlatform = P;
})();
