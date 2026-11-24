# 在线契约 vs 随包基线（js-api.md 2026-09-23）

比较对象：
- 基线：minitool-zip-builder/references/js-api.md（2026-09-23 快照，不是当前契约）
- 在线：https://miniapp-sandbox.xiaohongshu.com/minitool/doc ，本次于 2026-11-24 18:57 Asia/Shanghai 取得；页面写「最后更新 2026-11-23」；响应 Last-Modified 为 2026-11-24 10:54 Asia/Shanghai

实现必须以在线文档明确对外且提供完整使用说明的内容为唯一 API 契约。内测、预留、未明确对外的能力不得当开放能力使用，也不得向用户播报为可接入。

## 基线已有（仍在在线文档中）

- `postNote`
- `saveImageToPhotosAlbum`
- `writeTempFile`
- `getLaunchOptions` / `window.xhs.launchOptions`
- Storage：`setStorage` / `getStorage` / `getStorageInfo` / `removeStorage` / `clearStorage`（9.46+）
- 文件系统：`saveFile` / `writeFile` / `appendFile` / `readFile` / `readDir` / `statFile` / `unlink` / `mkdir` / `getFileStorageInfo`（9.49+）
- `interactionOpenApi`（9.49+）

## 新增公开能力（须先向用户播报，再开始实现）

这些在 2026-09-23 基线 API 一览中不存在，且当前在线文档有完整对外说明、未标「内测」：

1. `getWindowInfo`（9.49+）：窗口尺寸、安全区、顶部按钮位置，用于布局避让。仅当客户端 9.55+（版本值 9550）且使用胶囊新容器时，才返回 `menuButtons.capsule`。9.55+ 胶囊新容器默认禁用左边缘侧滑关闭；此时 `gestureArea` 各字段为 0，不必为该手势预留左侧空间，顶部仍按胶囊避让。
2. `getLocation`（9.49+）：单次定位；可选 `type`: `wgs84` / `gcj02`。不要使用已禁用的 `navigator.geolocation`。
3. `vibrateShort` / `vibrateLong`（9.50+）：触感反馈。`vibrateShort` 必传 `type`。
4. 陀螺仪（9.50+）：`startGyroscope` / `stopGyroscope` / `onGyroscopeChange` / `offGyroscopeChange`。先注册监听再开始采集；结束时停止采集并解除监听。不要使用已禁用的 Web 设备方向 / 运动 API。
5. `share`（9.53+，版本值 9530）：`type=card` 分享小工具卡片，或 `type=image` 分享指定图片（`image_resource` 为 Data URI 或本地路径，不接受网络 URL）。仅全屏容器可用；每天每用户每小工具最多拉起 10 次；回调成功只表示用户触发了分享，不代表送达。
6. `setKeepScreenOn`（9.55+）：设置当前小工具屏幕常亮。

相关容器说明（不是新的 JS API 方法，但是对实现有约束的能力更新）：

- classic Dedicated Worker：客户端 9.53+ 可用；SharedWorker / Service Worker 仍禁用。
- OffscreenCanvas / 相关 WebGL 路径：文档写明需 9.53+，且须单独判断内核能力；Android 产物仍须兼容 Chrome / WebView 61。

## 已有能力的说明更新（一并告知，不要把文案微调当新能力）

- `interactionOpenApi` 仍为 9.49+。当前文档细化：媒体仅支持图片 `{ media_type: "image", cover_image_url }`，路径必须是容器可访问的本地文件句柄，**不接受网络 URL、data: URI 和绝对路径**；可选 `miniToolSnapshotInfo`（JSON 字符串，最大 2KB）；`saveToAlbum` 默认 true；结果含 `routed` / `savedToAlbum` / 可选 `albumFailReason`。
- `getWindowInfo` 的胶囊矩形与侧滑手势行为见上（9.55+）。

## 当前在线文档未声明、不得当作可用能力

- `followAuthor` / `getFollowStatus`：本机两款 v1.1 源码和《宋朝配色》NOTES.md（记 2026-11-10 在线文档曾提供，9.51+）仍有调用，但 **2026-11-23 当前在线文档全文未出现这两个方法或「关注作者」**。新实现不得依赖它们。不要向用户把它播报成新增开放 API。

## 在线文档标明「内测」——不得对用户说已开放，新工具默认不要接入

以下章节在当前文档中明确标为内测，或写明需加白 / 开通。此处只作契约记录，避免 CloudAgent 误用：

- §3.10 AI 文本生成（内测）：`window.xhs.AI` / `createModel` / `generateText`；需群内提交 uid、按 appId 加白，未加白返回 `AI_NOT_ALLOWED`。文档还写：若小工具需要使用正在内测的 AI 接口，尚无法通过第三方 Agent 上传。
- §3.15 云存储（内测，9.51+）：`addCloudStorage` / `updateCloudStorage` / `queryCloudStorage` / `removeCloudStorage`
- §3.16 排行榜（内测，9.51+）：`submitScore` / `getRankList` / `getMyRank`
- §3.18 赞赏（内测）：`rewardAuthor`（文档写 9.53.3+，需已开通；方法存在不代表客户端已支持）
- §3.19 赞赏挽留开关（内测）：`setCloseRetentionEnabled`

## 对「宋式衣橱」实现的提醒

开始写衣橱前，主线程须先把上面「新增公开能力」和「已有能力的说明更新」播报给用户。衣橱如需保存搭配图或发笔记，优先用文档已有的 `writeTempFile`、`saveImageToPhotosAlbum`、`postNote`；分享可评估 9.53+ 的 `share`。不要接入内测能力，也不要继续把 `followAuthor` 当契约内 API。
