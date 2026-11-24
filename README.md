# 宋朝小工具

三款离线小红书小工具放在同一个仓库里，各自分目录，各自打包。互不改入口。

| 目录 | 工具 | 说明 |
| --- | --- | --- |
| `apps/songci-color` | 宋朝配色 | 交接来的 v1.1 功能工作树，原样 |
| `apps/songchao-quiz` | 测测你是宋朝哪种女子 | 交接来的 v1.1 功能工作树，原样 |
| `apps/song-wardrobe` | 宋式衣橱 | 新做的可试玩 v1，自己搭配 |

旧两款**不能**写成已经核对过的线上包。交接时没有 v1.1 原始 zip，也没有「审核通过」回执。细节在各自的 `来源.md` 和 `docs/handoff/INVENTORY.md`。

## 本地打开

任意静态文件服务都可以。在仓库根目录：

```bash
python3 -m http.server 8765
```

然后打开：

- http://127.0.0.1:8765/apps/songci-color/pkg/index.html
- http://127.0.0.1:8765/apps/songchao-quiz/pkg/index.html
- http://127.0.0.1:8765/apps/song-wardrobe/pkg/index.html

衣橱在普通浏览器里能换装、生成竖图。保存、发笔记、评论和分享只在小红书小工具容器里、并且由点击触发。浏览器里会写明这是预览，不会假装已经成功。

## 打包

```bash
sh tools/pack.sh
```

每个 zip 的根目录就是该工具的 `pkg/`，里面直接有 `index.html`。产物在 `dist/`，不进 git。上传用的是这个 zip，不是整个仓库。

旧两款 zip 是用当前工作树重新打包的，不是线上版本的复原包。

## 最低支持与还没做的验证

- 直接交付的脚本按 ES2017 写，样式按 Chrome 61 能独立排版来写。本环境没有跑 Android 8.1 / Chrome 61，也没有上创服模拟器、Android 真机、iOS 真机。
- 浏览器里的换装、窄屏和导出像素检查，不能当成容器验收。

矩阵和契约限制见 `docs/开发与打包.md`、`docs/验证矩阵.md`。
