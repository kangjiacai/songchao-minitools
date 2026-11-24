# 本机盘点：两款已有小工具（只读，未改源码）

盘点时间：2026-11-24 19:01 Asia/Shanghai。只检查本机已有文件，未克隆、未拉取、未登录、未送审、未开始做衣橱。

## 结论（给 CloudAgent 整合用）

- 本机有两款工具的源码工作树，位于 `/workspace/xhs/minitool/songci-color` 与 `/workspace/xhs/minitool/songchao-quiz`。
- **当前 `pkg/` 是本地 v1.1 功能工作树**（含「发成笔记 / 晒到评论区 / interactionOpenApi」等 v1.1 记录中的能力），`pkg-v1.0.0/` 是更早的 v1.0 归档，未打进交接 zip。
- **不能仅凭本机文件证明 v1.1 已审核通过并正在线上。** 本地送审回执停在「审核中」或「请勿重复提交」，没有「审核通过 / 已上线」快照。原始 v1.1 离线 zip 也不在磁盘上，因此无法用历史 md5 复核 `pkg/` 是否与当时上传包逐字节一致。下面按「最新已提交 / 现用工作树」交付，并保留这条限制。
- `/workspace/wardrobe-handoff/existing-minitools.zip` 只含两款工具必要源码、说明和代表预览图，不含 `.env` / token / cookie / 二维码 / 账号数据 / `node_modules` / `.git` / 过时 v1 包。

## 目录与版本依据

### 1. 宋朝配色（songci-color）

| 项 | 本机位置与依据 |
| --- | --- |
| 现用源码（v1.1 功能树） | `/workspace/xhs/minitool/songci-color/pkg/`（`index.html`、`css/app.css`、`js/{app,card,data,platform}.js`、`mini_tool.json`） |
| v1.0 归档（未打包） | `/workspace/xhs/minitool/songci-color/pkg-v1.0.0/` |
| 说明 | `NOTES.md`、`DESIGN.md`、`MOTION.md`。`styles/README.md` 是已弃用的五种古风样张，且自写「未上传、未送审」，不要当现行版 |
| 发布 appId | `6af5b0273894b30015018e5b`（来自送审 JSON，非密钥） |
| v1.0.0 | `submit/submit.json` md5 `037a521a3f9ca5c6d9de8c87c31b4040`；`submit-result.json`：`submittedAt=2026-11-12T20:25:11+08:00`（Asia/Shanghai），`status=1`「审核中」。该 md5 与 `NOTES.md` 2026-11-12 自测修复后 zip 一致。原始 zip 现已不在磁盘 |
| v1.1.0 | `NOTES.md` 2026-11-12 先记「预览，未送审」，后记关注按钮与「宋」图标、「代码包仍待预览通过后再送审」（笔记可能过时）。`submit/v11/submit.json` version `1.1.0`，pkg md5 `8f774874ff096f5e664618e20c5e14ee`；更早一版预览 md5 `4c8354cce5265c1c4ace707234bcc882`。`submit/v11/preview-follow-result.json` 与后一枚 md5 对应。`submit/v11/submit-result.txt` 为 `API_REJECTED`「请勿重复提交」，说明此前至少有过一次提交，但本机没有成功回执，也没有原始 zip |
| 代表截图 | `preview-v11/00-home-390x844.png`、`01-card-390x844.png`（已复制到交接目录；不含预览二维码） |

功能对照：现行 `pkg/` 有「发成笔记」「晒到评论区」和 `interactionOpenApi`；`pkg-v1.0.0/` 没有后两项文案与评论 API。两棵树都有 `followAuthor` / `getFollowStatus`（见契约说明：当前在线文档已不再列出）。

### 2. 测测你是宋朝哪种女子（songchao-quiz）

| 项 | 本机位置与依据 |
| --- | --- |
| 现用源码（v1.1 功能树） | `/workspace/xhs/minitool/songchao-quiz/pkg/`（另有 `js/motifs.js`） |
| v1.0 归档（未打包） | `/workspace/xhs/minitool/songchao-quiz/pkg-v1.0.0/` |
| 说明 | `MOTION.md` 标题写「运动系统（v1.1）」；无单独 README / NOTES |
| 发布 appId | `6af2ded08eb4360015266598`（`submit/v11/preview-result.json` 中的 `publishedAppId`） |
| v1.0.0 | `submit/submit.json` md5 `66aba8878901cc6169be4b5a5ee46dc5`，与本机完整离线包 `/workspace/xhs/minitool/session/songchao-quiz-v2.zip`（29251 字节）一致。zip 内文件时间戳为 2026-11-10。`submit-result.json`：version `1.0.0`，`status=1`「审核中」。更早的 `session/songchao-quiz-v1.zip`（md5 `64a91f64406f5d496bd2f470aa89cd5a`）是过时包，不要用 |
| v1.1.0 | `submit/v11/submit.json` md5 `769d86c9742b25735e7217534911d962`；`submit/v11/submit-result.txt`：version `1.1.0`，`status=1`「审核中」。本机没有该 md5 的原始 zip，也没有后续「审核通过」记录。该提交 JSON 里没有时间戳；目录 mtime 均为箱体恢复日 2026-11-24，不能当发布日期 |
| 代表截图 | `previews/01-home.png`、`previews/03-result-diancha.png` |

功能对照：现行 `pkg/` 有「晒到评论区」和 `interactionOpenApi`；`pkg-v1.0.0/` 没有。`work/pkg-v1-backup/` 是更早备份，不要用。

## 仓库线索（只读 .git/config，已去掉任何凭证）

- `/workspace/xhs/minitool/` 及其两款工具目录 **没有 `.git`**，本机未见把「宋朝配色 + 测验」收在一起的汇总仓库。
- 本机唯一与用户 GitHub `kangjiacai` 对应、且名称带 minitool 的远程是：`https://github.com/kangjiacai/ykbd-minitool.git`，路径 `/workspace/xhs_ai/minitool/redapp-session-v1.7/repo/`。这是另一款已上线工具「你可能不知道」v1.7，README 与文件结构均无关宋朝两款。本地最近一次 commit 说明为「v1.7：下摆锁在同一高度，去掉裤腰色块」（git 记录 2026-11-10 13:40:22 +0000 = 2026-11-10 21:40 Asia/Shanghai）。远程 URL 无嵌入凭证。
- 其他本机 git 远程与这两款工具或 kangjiacai 账户无关（研究用第三方 skill、图片库等）。
- 因此：把三款宋朝小工具推进同一个新仓库是可行的，但需要新建（或用户指定已有空仓库）；不要误推到 `ykbd-minitool`。本次未创建仓库、未推送。

## 明确未打入 zip 的内容

- 过时包：`pkg-v1.0.0/`、`session/songchao-quiz-v1.zip`、`work/pkg-v1-backup/`、`styles/` 古风样张、preview-v2/v3
- 凭证与会话：`/workspace/xhs/minitool/login.log`、`auth-qr.png`、`session/*`、各 `submit/**/session.json`、预览二维码、`/home/box/.skillhub-upload-songchao/credentials.json`
- 构建依赖：各 `tools/node_modules`、`.git`
- 另一产品：`/workspace/xhs_ai/minitool/**`（「你可能不知道」）

## 交接 zip 内应有

见同目录 `existing-minitools.zip` 与包内 `README-HANDOFF.md`。
