/* 平台能力封装。以在线文档 https://miniapp-sandbox.xiaohongshu.com/minitool/doc
 * （最后更新 2026-11-10）为唯一 API 契约。调用前探测方法，并按版本降级。 */
(function () {
  var P = {};
  var cachedBuild = null;
  var SAVE_MIN = 9420;
  var STORAGE_MIN = 9460;
  var WINDOW_MIN = 9490;
  var VIBRATE_MIN = 9500;
  var COMMENT_MIN = 9490;
  var FOLLOW_MIN = 9510;
  var SHARE_MIN = 9530;
  var RETAIN_MIN = 9533;

  function mt() {
    return (window.xhs && window.xhs.miniTool) || null;
  }

  function has(name) {
    var m = mt();
    return !!(m && typeof m[name] === 'function');
  }

  function readBuildVersion(launchOptions) {
    var env = launchOptions && launchOptions.miniToolEnv;
    return Number(env && env.buildVersion) || 0;
  }

  async function getBuildVersion() {
    if (cachedBuild !== null) return cachedBuild;
    var xhs = window.xhs;
    var version = readBuildVersion(xhs && xhs.launchOptions);
    if (!version && has('getLaunchOptions')) {
      try {
        version = readBuildVersion(await mt().getLaunchOptions());
      } catch (err) {
        version = 0;
      }
    }
    cachedBuild = version;
    return version;
  }

  function isClientVersionAtLeast(buildVersion, minimumClientVersion) {
    return Math.floor((Number(buildVersion) || 0) / 1000) >= minimumClientVersion;
  }

  async function atLeast(minimumClientVersion) {
    return isClientVersionAtLeast(await getBuildVersion(), minimumClientVersion);
  }

  P.inXhs = function () { return !!mt(); };
  P.has = has;
  P.getBuildVersion = getBuildVersion;
  P.atLeast = atLeast;

  async function knownAndBelow(minClient) {
    var build = await getBuildVersion();
    return build > 0 && !isClientVersionAtLeast(build, minClient);
  }

  /* ---------- 存储：9.46+ 用 Storage API；否则 localStorage；再不行用内存 ---------- */
  var mem = {};

  async function useXhsStorage() {
    return has('setStorage') && has('getStorage') && (await atLeast(STORAGE_MIN));
  }

  P.setData = async function (key, data) {
    var serialized;
    try {
      serialized = JSON.stringify(data);
    } catch (err) {
      return false;
    }
    if (typeof serialized !== 'string') return false;
    mem[key] = serialized;
    if (await useXhsStorage()) {
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
    } catch (err) {
      return false;
    }
  };

  P.getData = async function (key, fallback) {
    var raw = null;
    if (await useXhsStorage()) {
      try {
        var res = await mt().getStorage({ key: key });
        raw = res ? res.data : null;
      } catch (err) {
        raw = null;
      }
      if (raw === null || raw === undefined) {
        try { raw = window.localStorage.getItem(key); } catch (err2) { raw = null; }
      }
    } else {
      try { raw = window.localStorage.getItem(key); } catch (err) { raw = null; }
    }
    if (raw === null || raw === undefined) raw = mem[key] || null;
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  };

  /* ---------- 临时文件 + 存相册 / 发笔记 / 分享 ---------- */
  async function toFilePath(dataUrl) {
    var path = dataUrl;
    if (has('writeTempFile')) {
      try {
        var written = await mt().writeTempFile({ data: dataUrl });
        if (written && written.filePath) path = written.filePath;
      } catch (err) {
        path = dataUrl;
      }
    }
    return path;
  }

  P.canSaveImage = async function () {
    if (!has('saveImageToPhotosAlbum')) return false;
    if (await knownAndBelow(SAVE_MIN)) return false;
    return true;
  };

  P.saveImage = async function (dataUrl) {
    if (!(await P.canSaveImage())) return { ok: false, reason: 'unavailable' };
    var filePath = await toFilePath(dataUrl);
    try {
      await mt().saveImageToPhotosAlbum({ filePath: filePath });
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        reason: 'fail',
        msg: (err && (err.errMsg || err.message)) || ''
      };
    }
  };

  P.canPostNote = async function () {
    return has('postNote');
  };

  P.postNote = async function (opts) {
    if (!has('postNote')) return { ok: false, reason: 'unavailable' };
    var imageUrl = opts.imageUrl;
    if (imageUrl && imageUrl.indexOf('data:') === 0) {
      imageUrl = await toFilePath(imageUrl);
    }
    try {
      await mt().postNote({
        title: opts.title,
        content: opts.content,
        pageType: 'photo_publish',
        mediaInfo: {
          image_resources: [{ url: imageUrl }]
        }
      });
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        reason: 'fail',
        msg: (err && (err.errMsg || err.message)) || ''
      };
    }
  };

  P.canShare = async function () {
    if (!has('share')) return false;
    if (await knownAndBelow(SHARE_MIN)) return false;
    return true;
  };

  P.shareImage = async function (dataUrl) {
    if (!(await P.canShare())) return { ok: false, reason: 'unavailable' };
    try {
      await mt().share({
        type: 'image',
        image_resource: dataUrl
      });
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        reason: 'fail',
        code: err && err.errCode,
        msg: (err && (err.errMsg || err.message)) || ''
      };
    }
  };

  /* ---------- 关注作者：9.51+ ---------- */
  P.canFollow = async function () {
    if (!has('followAuthor') || !has('getFollowStatus')) return false;
    if (await knownAndBelow(FOLLOW_MIN)) return false;
    return true;
  };

  P.getFollowStatus = async function () {
    if (!(await P.canFollow())) return null;
    try {
      var res = await mt().getFollowStatus();
      return res && typeof res.follow_status === 'number' ? res.follow_status : -1;
    } catch (err) {
      return -1;
    }
  };

  P.followAuthor = async function () {
    if (!(await P.canFollow())) return { ok: false, reason: 'unavailable' };
    try {
      var res = await mt().followAuthor();
      return {
        ok: true,
        status: res && typeof res.follow_status === 'number' ? res.follow_status : -1
      };
    } catch (err) {
      return {
        ok: false,
        reason: 'fail',
        code: err && err.errCode,
        msg: (err && (err.errMsg || err.message)) || ''
      };
    }
  };

  /* ---------- 窗口信息：9.49+，用于避让官方胶囊 ---------- */
  P.applySafeArea = async function () {
    var root = document.documentElement;
    var fallbackTop = 88;
    var fallbackBottom = 24;
    var top = fallbackTop;
    var bottom = fallbackBottom;

    if (has('getWindowInfo') && !(await knownAndBelow(WINDOW_MIN))) {
      try {
        var info = await mt().getWindowInfo();
        var safe = info && info.safeArea;
        var menu = info && info.menuButtons;
        var safeTop = safe && typeof safe.top === 'number' ? safe.top : 0;
        var winH = info && info.windowHeight;
        var safeBottomEdge = safe && typeof safe.bottom === 'number' ? safe.bottom : 0;
        var safeBottom = 0;
        if (winH && safeBottomEdge) {
          safeBottom = Math.max(0, winH - safeBottomEdge);
        }

        var capsuleBottom = 0;
        if (menu) {
          var names = ['back', 'me', 'share'];
          for (var i = 0; i < names.length; i++) {
            var box = menu[names[i]];
            if (box && typeof box.bottom === 'number') {
              if (box.bottom > capsuleBottom) capsuleBottom = box.bottom;
            }
          }
        }
        top = Math.max(fallbackTop, capsuleBottom + 8, safeTop + 52);
        bottom = Math.max(fallbackBottom, safeBottom + 16);
      } catch (err) {
        /* 保留 CSS 回退 */
      }
    }

    root.style.setProperty('--shell-pad-top', top + 'px');
    root.style.setProperty('--shell-pad-bottom', bottom + 'px');

    if (window.visualViewport && window.visualViewport.height) {
      root.style.setProperty('--app-height', window.visualViewport.height + 'px');
    } else if (window.innerHeight) {
      root.style.setProperty('--app-height', window.innerHeight + 'px');
    }
  };

  /* ---------- 振动：9.50+，失败忽略 ---------- */
  P.vibrate = function (type) {
    if (!has('vibrateShort')) return;
    atLeast(VIBRATE_MIN).then(function (ok) {
      if (!ok) return;
      try {
        var ret = mt().vibrateShort({ type: type || 'light' });
        if (ret && typeof ret.catch === 'function') ret.catch(function () {});
      } catch (err) { /* 忽略 */ }
    });
  };

  /* ---------- 评论区：9.49+；图片必须是本地文件句柄，不能传 data: 或网络地址 ---------- */
  P.writeTemp = async function (dataUrl) {
    if (!has('writeTempFile')) return { ok: false, reason: 'unavailable' };
    try {
      var written = await mt().writeTempFile({ data: dataUrl });
      if (written && written.filePath) {
        return { ok: true, filePath: written.filePath };
      }
      return { ok: false, reason: 'fail' };
    } catch (err) {
      return {
        ok: false,
        reason: 'fail',
        msg: (err && (err.errMsg || err.message)) || ''
      };
    }
  };

  P.canPostComment = async function () {
    if (!has('interactionOpenApi')) return false;
    if (await knownAndBelow(COMMENT_MIN)) return false;
    return true;
  };

  P.postComment = async function (opts) {
    if (!(await P.canPostComment())) return { ok: false, reason: 'unavailable' };
    var payload = {
      action: 'post_comment',
      content: (opts && opts.content) || ''
    };
    if (opts && opts.filePath) {
      payload.media_bean = [{
        media_type: 'image',
        cover_image_url: opts.filePath
      }];
    }
    if (opts && opts.snapshot) {
      var raw = typeof opts.snapshot === 'string'
        ? opts.snapshot
        : JSON.stringify(opts.snapshot);
      if (raw.length <= 2048) payload.miniToolSnapshotInfo = raw;
    }
    try {
      var res = await mt().interactionOpenApi({
        payload: payload,
        saveToAlbum: !!(opts && opts.saveToAlbum)
      });
      if (res && res.routed === false) {
        return { ok: false, reason: 'fail', msg: 'not routed', raw: res };
      }
      return { ok: true, raw: res };
    } catch (err) {
      return {
        ok: false,
        reason: 'fail',
        msg: (err && (err.errMsg || err.message)) || ''
      };
    }
  };

  /* 文档未写明重新打开时 snapshot 的字段路径，按常见位置逐级查找。 */
  function pickSnapshot(obj, depth) {
    if (!obj || typeof obj !== 'object' || depth > 3) return null;
    var info = obj.miniToolSnapshotInfo;
    if (typeof info === 'string' && info) return info;
    if (info && typeof info === 'object') {
      try { return JSON.stringify(info); } catch (err) { return null; }
    }
    var keys = ['query', 'queryPath', 'extraData', 'referrerInfo', 'refererInfo', 'miniToolEnv'];
    var i, found;
    for (i = 0; i < keys.length; i++) {
      if (obj[keys[i]]) {
        found = pickSnapshot(obj[keys[i]], depth + 1);
        if (found) return found;
      }
    }
    return null;
  }

  P.readSnapshot = async function () {
    var raw = pickSnapshot(window.xhs && window.xhs.launchOptions, 0);
    if (!raw && has('getLaunchOptions')) {
      try {
        raw = pickSnapshot(await mt().getLaunchOptions(), 0);
      } catch (err) {
        raw = null;
      }
    }
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  };

  /* ---------- 关闭挽留：9.53.3+，结果页开启 ---------- */
  P.setCloseRetention = async function (enabled) {
    if (!has('setCloseRetentionEnabled')) return false;
    if (await knownAndBelow(RETAIN_MIN)) return false;
    try {
      await mt().setCloseRetentionEnabled({ enabled: !!enabled });
      return true;
    } catch (err) {
      return false;
    }
  };

  window.SCG_P = P;
})();
